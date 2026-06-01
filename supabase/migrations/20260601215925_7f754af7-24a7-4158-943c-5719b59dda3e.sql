-- Customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  surname text NOT NULL DEFAULT '',
  email text NOT NULL,
  mobile text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_email_unique ON public.customers (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage customers"
  ON public.customers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link bookings to customers
ALTER TABLE public.bookings
  ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
CREATE INDEX bookings_customer_id_idx ON public.bookings(customer_id);

-- Trigger: ensure customer exists on booking insert
CREATE OR REPLACE FUNCTION public.link_booking_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
  norm_email text := lower(NEW.email);
BEGIN
  SELECT id INTO cid FROM public.customers WHERE lower(email) = norm_email LIMIT 1;
  IF cid IS NULL THEN
    INSERT INTO public.customers (first_name, surname, email, mobile)
    VALUES (NEW.first_name, NEW.surname, NEW.email, NEW.mobile)
    RETURNING id INTO cid;
  ELSE
    UPDATE public.customers
    SET first_name = NEW.first_name,
        surname    = NEW.surname,
        mobile     = NEW.mobile,
        updated_at = now()
    WHERE id = cid;
  END IF;
  NEW.customer_id := cid;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_link_customer
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.link_booking_customer();

-- Backfill customers from existing bookings
INSERT INTO public.customers (first_name, surname, email, mobile, created_at)
SELECT first_name, surname, email, mobile, created_at
FROM (
  SELECT DISTINCT ON (lower(email))
    first_name, surname, email, mobile, created_at
  FROM public.bookings
  WHERE email IS NOT NULL AND email <> ''
  ORDER BY lower(email), created_at DESC
) latest
ON CONFLICT DO NOTHING;

UPDATE public.bookings b
SET customer_id = c.id
FROM public.customers c
WHERE lower(b.email) = lower(c.email) AND b.customer_id IS NULL;

-- Public RPC for returning customer greeting (returns first name only)
CREATE OR REPLACE FUNCTION public.lookup_customer_by_email(p_email text)
RETURNS TABLE(first_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT first_name FROM public.customers WHERE lower(email) = lower(p_email) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_customer_by_email(text) TO anon, authenticated;