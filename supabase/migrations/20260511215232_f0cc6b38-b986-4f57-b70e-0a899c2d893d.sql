
DROP POLICY IF EXISTS "Anyone can read booked slots" ON public.bookings;

CREATE OR REPLACE FUNCTION public.get_booked_times(p_date date)
RETURNS TABLE (appointment_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT appointment_time FROM public.bookings
  WHERE appointment_date = p_date AND status <> 'cancelled';
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_times(date) TO anon, authenticated;
