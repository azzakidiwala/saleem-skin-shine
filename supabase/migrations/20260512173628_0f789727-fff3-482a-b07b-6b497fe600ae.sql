
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;

-- Anyone can read individual files via signed/public URL (this policy permits row reads;
-- but listing is rare and we still want public reading of file objects)
CREATE POLICY "Public can read site images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-images');
