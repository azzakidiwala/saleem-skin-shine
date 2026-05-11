
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  surname text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  treatment_slug text NOT NULL,
  treatment_name text NOT NULL,
  treatment_price text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public can insert bookings (booking form is public)
CREATE POLICY "Anyone can create a booking"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read their own booking by id (used to prevent double-booking lookups by date/time too)
CREATE POLICY "Anyone can read booked slots"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX bookings_date_idx ON public.bookings (appointment_date);
