
-- 1. Bookings: stricter INSERT validation
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND confirmed_at IS NULL
  AND length(first_name) BETWEEN 1 AND 100
  AND length(surname) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(mobile) BETWEEN 5 AND 30
  AND length(treatment_slug) BETWEEN 1 AND 100
  AND length(treatment_name) BETWEEN 1 AND 200
  AND (treatment_price IS NULL OR length(treatment_price) <= 50)
  AND length(appointment_time) BETWEEN 1 AND 20
  AND appointment_date >= CURRENT_DATE
  AND appointment_date <= CURRENT_DATE + INTERVAL '2 years'
);

-- 2. booking_notification_recipients: explicit admin SELECT policy for clarity
CREATE POLICY "Admins can view notification recipients"
ON public.booking_notification_recipients
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. user_roles: explicit deny policies for non-service-role mutations
CREATE POLICY "No client inserts to user_roles"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No client updates to user_roles"
ON public.user_roles
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No client deletes to user_roles"
ON public.user_roles
FOR DELETE
TO anon, authenticated
USING (false);

-- 4. Email queue helper functions: pin search_path and restrict EXECUTE
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;

-- 5. site-images storage: restrict listing to admins (public CDN URLs still work)
DROP POLICY IF EXISTS "Public can read site images" ON storage.objects;
CREATE POLICY "Admins can list site images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));
