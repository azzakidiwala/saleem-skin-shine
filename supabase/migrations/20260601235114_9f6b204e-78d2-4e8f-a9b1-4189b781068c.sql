ALTER TABLE public.voucher_codes ADD COLUMN IF NOT EXISTS treatment_slug text;
CREATE INDEX IF NOT EXISTS idx_voucher_codes_treatment_slug ON public.voucher_codes(treatment_slug);

DROP FUNCTION IF EXISTS public.get_active_promos();
CREATE FUNCTION public.get_active_promos()
 RETURNS TABLE(code text, discount_pennies integer, expires_at timestamp with time zone, treatment_slug text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT v.code, v.discount_pennies, v.expires_at, v.treatment_slug
  FROM public.voucher_codes v
  WHERE v.kind = 'promo'
    AND v.is_active = true
    AND v.used_count < v.max_uses
    AND (v.expires_at IS NULL OR v.expires_at > now())
  ORDER BY v.discount_pennies DESC, v.created_at DESC;
$function$;