
CREATE OR REPLACE FUNCTION public.get_active_promos()
RETURNS TABLE (code text, discount_pennies integer, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT v.code, v.discount_pennies, v.expires_at
  FROM public.voucher_codes v
  WHERE v.kind = 'promo'
    AND v.is_active = true
    AND v.used_count < v.max_uses
    AND (v.expires_at IS NULL OR v.expires_at > now())
  ORDER BY v.discount_pennies DESC, v.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_promos() TO anon, authenticated;
