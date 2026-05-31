
CREATE TABLE public.booking_notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_notification_recipients TO authenticated;
GRANT ALL ON public.booking_notification_recipients TO service_role;

ALTER TABLE public.booking_notification_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notification recipients"
  ON public.booking_notification_recipients
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER booking_notification_recipients_updated_at
  BEFORE UPDATE ON public.booking_notification_recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.booking_notification_recipients (email, enabled) VALUES
  ('info@saleemskin.co.uk', true),
  ('info@techwala.co.uk', true)
ON CONFLICT (email) DO NOTHING;
