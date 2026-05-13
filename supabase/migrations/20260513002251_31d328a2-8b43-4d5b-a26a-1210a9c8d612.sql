
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_token text;

CREATE INDEX IF NOT EXISTS bookings_confirmation_token_idx
  ON public.bookings (confirmation_token);
