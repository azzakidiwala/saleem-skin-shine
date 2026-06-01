
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_code text, p_email text DEFAULT NULL)
RETURNS TABLE (id uuid, code text, discount_pennies integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.voucher_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.voucher_codes v
  WHERE upper(v.code) = upper(p_code)
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

  UPDATE public.voucher_codes vu
  SET used_count = vu.used_count + 1,
      updated_at = now()
  WHERE vu.id = v_row.id;

  RETURN QUERY SELECT v_row.id, v_row.code, v_row.discount_pennies;
END;
$$;
