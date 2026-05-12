GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "Public can view active treatments" ON public.treatments;
CREATE POLICY "Public can view active treatments"
ON public.treatments
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active team" ON public.team_members;
CREATE POLICY "Public can view active team"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (is_active = true);