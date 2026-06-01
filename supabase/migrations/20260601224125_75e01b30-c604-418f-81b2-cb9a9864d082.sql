
-- Voucher codes table: covers both individual signup vouchers and shareable promo codes
CREATE TABLE public.voucher_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('signup','promo')),
  discount_pennies integer NOT NULL DEFAULT 1000,
  email text,
  first_name text,
  surname text,
  mobile text,
  expires_at timestamptz,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_codes TO authenticated;
GRANT ALL ON public.voucher_codes TO service_role;

ALTER TABLE public.voucher_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage vouchers" ON public.voucher_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX voucher_codes_email_idx ON public.voucher_codes (lower(email)) WHERE kind = 'signup';
CREATE UNIQUE INDEX voucher_codes_code_upper_idx ON public.voucher_codes (upper(code));

CREATE TRIGGER update_voucher_codes_updated_at
  BEFORE UPDATE ON public.voucher_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-site discount settings (single row)
CREATE TABLE public.discount_settings (
  id integer PRIMARY KEY DEFAULT 1,
  signup_enabled boolean NOT NULL DEFAULT true,
  signup_discount_pennies integer NOT NULL DEFAULT 1000,
  signup_expiry_hours integer NOT NULL DEFAULT 24,
  signup_headline text NOT NULL DEFAULT 'Get £10 off your first booking',
  signup_subtext text NOT NULL DEFAULT 'Drop your email and we''ll send a voucher code valid for 24 hours.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT SELECT ON public.discount_settings TO anon, authenticated;
GRANT UPDATE ON public.discount_settings TO authenticated;
GRANT ALL ON public.discount_settings TO service_role;

ALTER TABLE public.discount_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read discount settings" ON public.discount_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins update discount settings" ON public.discount_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_discount_settings_updated_at
  BEFORE UPDATE ON public.discount_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.discount_settings (id) VALUES (1);

-- Bookings: track voucher used and discount applied
ALTER TABLE public.bookings
  ADD COLUMN voucher_code text,
  ADD COLUMN discount_pennies integer NOT NULL DEFAULT 0;

-- Public lookup: detect existing signup voucher by email
CREATE OR REPLACE FUNCTION public.signup_voucher_exists_for_email(p_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.voucher_codes
    WHERE kind = 'signup' AND lower(email) = lower(p_email)
  );
$$;

-- Public lookup: detect existing customer with same first+surname+mobile (different email scenario)
CREATE OR REPLACE FUNCTION public.signup_voucher_exists_for_identity(p_first text, p_surname text, p_mobile text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.voucher_codes v
    WHERE v.kind = 'signup'
      AND lower(v.first_name) = lower(p_first)
      AND lower(v.surname) = lower(p_surname)
      AND regexp_replace(coalesce(v.mobile,''), '[^0-9]', '', 'g') = regexp_replace(p_mobile, '[^0-9]', '', 'g')
      AND regexp_replace(p_mobile, '[^0-9]', '', 'g') <> ''
  );
$$;

-- Atomic voucher redemption helper
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_code text, p_email text DEFAULT NULL)
RETURNS TABLE (id uuid, code text, discount_pennies integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.voucher_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.voucher_codes
  WHERE upper(code) = upper(p_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher code not found' USING ERRCODE = 'P0001';
  END IF;
  IF NOT v_row.is_active THEN
    RAISE EXCEPTION 'Voucher is no longer active' USING ERRCODE = 'P0001';
  END IF;
  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < now() THEN
    RAISE EXCEPTION 'Voucher has expired' USING ERRCODE = 'P0001';
  END IF;
  IF v_row.used_count >= v_row.max_uses THEN
    RAISE EXCEPTION 'Voucher has already been used' USING ERRCODE = 'P0001';
  END IF;
  IF v_row.kind = 'signup' AND v_row.email IS NOT NULL AND p_email IS NOT NULL
     AND lower(v_row.email) <> lower(p_email) THEN
    RAISE EXCEPTION 'Voucher belongs to a different email address' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.voucher_codes
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = v_row.id;

  RETURN QUERY SELECT v_row.id, v_row.code, v_row.discount_pennies;
END;
$$;
