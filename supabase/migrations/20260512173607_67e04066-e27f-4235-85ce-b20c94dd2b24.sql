
-- ============================================
-- 1. ROLES
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. TREATMENTS
-- ============================================
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  sessions TEXT NOT NULL DEFAULT '',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  what_to_expect TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active treatments"
ON public.treatments FOR SELECT TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage treatments"
ON public.treatments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER treatments_updated_at
BEFORE UPDATE ON public.treatments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. TEAM MEMBERS
-- ============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  credentials TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT 'Stethoscope',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active team"
ON public.team_members FOR SELECT TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage team"
ON public.team_members FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. SITE CONTENT (key/value)
-- ============================================
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  label TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site content"
ON public.site_content FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. BOOKINGS — admin policies
-- ============================================
CREATE POLICY "Admins can view bookings"
ON public.bookings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 8. SEED TREATMENTS
-- ============================================
INSERT INTO public.treatments (slug, name, category, description, long_description, price, duration, sessions, benefits, what_to_expect, sort_order) VALUES
('new-consultation','New Consultation','Consultation',
 'Your journey to better skin begins with a thorough consultation with one of our expert practitioners to discuss your goals and tailor a bespoke treatment plan.',
 'Your journey to better skin begins with a thorough consultation with one of our expert practitioners. We''ll assess your skin concerns, medical history and goals in order to design a bespoke treatment plan tailored to you.',
 '£60','30 mins','1 session',
 ARRAY['Comprehensive skin and health assessment','Personalised treatment plan','Expert advice from qualified practitioners','No obligation to proceed'],
 'Your consultation will last approximately 30 minutes. We''ll discuss your concerns, examine your skin and walk you through the treatment options best suited to your needs and goals.',
 10),
('deluxe-hydrafacial','Deluxe HydraFacial','HydraFacial',
 'The Deluxe HydraFacial is a deeply cleansing, hydrating and rejuvenating treatment that uses patented vortex technology to leave skin glowing.',
 'The Deluxe HydraFacial is a deeply cleansing, hydrating and rejuvenating treatment that uses patented Vortex-Fusion technology to cleanse, extract and infuse the skin with powerful serums. Suitable for all skin types.',
 '£145','45 mins','Monthly for best results',
 ARRAY['Deep cleansing and exfoliation','Intense hydration','Improved skin texture and tone','Reduction in fine lines and congestion','Immediate, visible glow with no downtime'],
 'The treatment involves a multi-step process: cleanse, exfoliate, extract, and hydrate. You''ll leave with visibly brighter, smoother skin. There is zero downtime.',
 20),
('wet-diamond-hydrafacial','Wet Diamond HydraFacial','HydraFacial',
 'Our premium HydraFacial experience combines diamond-tip microdermabrasion with the powerful HydraFacial system for unmatched radiance.',
 'Our premium HydraFacial experience combines diamond-tip microdermabrasion with the powerful HydraFacial serums for a deeper level of skin renewal. Ideal for those seeking maximum radiance and skin transformation.',
 '£200','1 hr','Monthly for best results',
 ARRAY['Diamond-tip exfoliation for deeper resurfacing','Intensive serum infusion','Brightening and anti-ageing benefits','Suitable for dull, congested or ageing skin'],
 'Expect a deeply satisfying, relaxing treatment lasting one hour. You may experience mild redness that subsides within a few hours. Most clients describe the result as a ''glass skin'' effect.',
 30),
('promoitalia-lip-booster','Promoitalia Lip Booster','Injectables',
 'A bio-revitalising lip treatment that hydrates, plumps and improves lip texture using premium Italian-formulated injectables.',
 'The Promoitalia Lip Booster uses an advanced biorevitalisation technique to hydrate, plump and define the lips without adding artificial volume. It''s a natural-looking enhancement perfect for those wanting subtle results.',
 '£160','30 mins','2–3 sessions recommended',
 ARRAY['Natural-looking lip enhancement','Deep hydration and plumping','Improved lip texture and definition','Minimal discomfort with topical anaesthetic'],
 'A topical numbing cream is applied before treatment. The injections take around 15 minutes. Mild swelling may occur and resolves within 24–48 hours.',
 40),
('traptox','TrapTox','Injectables',
 'Anti-wrinkle treatment for the trapezius muscles to relieve tension, improve posture and elegantly slim the neck and shoulder line.',
 'TrapTox involves injecting botulinum toxin into the trapezius muscles to slim the neck and shoulder profile, relieve chronic muscle tension and create a more elegant silhouette. A popular treatment for both aesthetics and wellness.',
 '£300','45 mins','Every 3–4 months',
 ARRAY['Slimmer neck and shoulder appearance','Relief from muscle tension and pain','Improved posture over time','Results last 3–4 months'],
 'Injections are placed into the trapezius muscles. You may feel mild discomfort. Results become visible within 1–2 weeks and last 3–4 months on average.',
 50),
('jawline-slimming-anti-wrinkle','Jawline Slimming Anti-Wrinkle Treatment','Injectables',
 'Targeted anti-wrinkle injections to relax the masseter muscles, slim the jawline and create a softer, more defined facial contour.',
 'This treatment uses botulinum toxin injections to relax the masseter muscles, creating a slimmer, more contoured jawline. It is also effective for teeth grinding (bruxism) and jaw tension.',
 '£190','45 mins','Every 4–6 months',
 ARRAY['Slimmer, more defined jawline','Reduction in teeth grinding','Relief from jaw tension and headaches','Natural-looking results'],
 'Treatment takes around 15–20 minutes. Results begin to show after 2 weeks and reach full effect at 4–6 weeks. Top-ups are typically needed every 4–6 months.',
 60),
('vtech-microneedling-led','VTECH Microneedling with LED Face Mask','Skin Rejuvenation',
 'Advanced microneedling combined with LED light therapy to stimulate collagen, improve texture and reduce fine lines and scarring.',
 'This advanced treatment combines VTECH microneedling with LED light therapy to stimulate the skin''s natural collagen production, reduce scarring and improve overall skin texture and tone.',
 '£180','1 hr 30 mins','Course of 3–6 recommended',
 ARRAY['Stimulates collagen and elastin production','Reduces acne scarring and hyperpigmentation','Improves skin texture and firmness','LED light therapy enhances healing and results'],
 'A numbing cream is applied prior to treatment. Mild redness and sensitivity may last 24–48 hours. A course of treatments is recommended for optimal results.',
 70),
('prp-hair-scalp','PRP Hair & Scalp Treatment','PRP',
 'Platelet-rich plasma injections to stimulate hair follicles, promote regrowth and improve scalp health using your body''s own healing factors.',
 'Platelet-Rich Plasma (PRP) therapy uses your own blood''s growth factors to stimulate hair follicles, promote natural hair regrowth and improve overall scalp health. An effective, natural solution for hair thinning.',
 'From £POA','1 hr','Course of 3 recommended',
 ARRAY['Stimulates natural hair regrowth','Thickens existing hair','Improves scalp health','Uses your body''s own growth factors — no synthetic chemicals'],
 'A small amount of blood is drawn, processed to extract PRP, then injected into the scalp. Mild tenderness may follow. A course of 3 sessions is recommended for best results.',
 80),
('prp-facial-vampire','PRP Facial (Vampire Facial)','PRP',
 'The famous Vampire Facial uses platelet-rich plasma to rejuvenate skin, improve tone and texture, and promote a youthful glow.',
 'The PRP Facial — also known as the Vampire Facial — uses your own platelet-rich plasma combined with microneedling to rejuvenate the skin, improve tone and texture, and promote a youthful, radiant glow.',
 '£295','1 hr','Course of 3 recommended',
 ARRAY['Natural skin rejuvenation','Improved tone and texture','Reduction in fine lines','Uses your body''s own healing factors'],
 'Blood is drawn and processed to extract PRP, which is then applied with microneedling. Mild redness may last 24–48 hours. Results develop over weeks.',
 90),
('hay-fever-treatment','Hay Fever Treatment','Hay Fever Treatment',
 'Our injectable hay fever treatment provides effective, season-long relief from hay fever symptoms. A simple in-clinic appointment.',
 'Our injectable hay fever treatment provides effective, season-long relief from hay fever symptoms with a simple in-clinic appointment. Ideal for sufferers who haven''t found relief from over-the-counter options.',
 'From £POA','30 mins','Once per season',
 ARRAY['Season-long symptom relief','Quick in-clinic appointment','Effective when antihistamines have failed','Administered by qualified medical professionals'],
 'A consultation is performed to assess suitability. The injection takes only minutes. Relief is typically experienced for the duration of the hay fever season.',
 100),
('vitamin-b12-single','Vitamin B12 Injection (Single)','Wellness',
 'A single Vitamin B12 injection delivers a fast, effective boost to energy levels, mood and metabolism.',
 'A single Vitamin B12 injection delivers a fast, effective boost to energy levels, mood and metabolism. Ideal for those experiencing fatigue or low energy.',
 '£25','30 mins','1 session',
 ARRAY['Boosts energy and mood','Supports healthy metabolism','Quick, simple appointment','Suitable for vegans and vegetarians'],
 'A quick injection is administered into the upper arm. Effects are typically felt within 24–72 hours and last several weeks.',
 110),
('vitamin-b12-course','Vitamin B12 Injection (Course of 6)','Wellness',
 'A course of six Vitamin B12 injections for sustained energy, improved metabolism and enhanced vitality.',
 'A course of six Vitamin B12 injections for sustained energy, improved metabolism and enhanced vitality. Ideal for ongoing support of energy and wellbeing.',
 '£120','30 mins','Course of 6',
 ARRAY['Sustained energy boost','Supports long-term metabolism and vitality','Better value than single sessions','Suitable for vegans and vegetarians'],
 'Six injections are administered over a recommended schedule. Each appointment is quick and simple, with cumulative benefits over the course.',
 120);

-- ============================================
-- 9. SEED TEAM MEMBERS
-- ============================================
INSERT INTO public.team_members (name, role, bio, credentials, tags, icon, sort_order) VALUES
('Dr. Saleem','Medical Director & Lead Aesthetic Physician',
 'Dr. Saleem is the founder and medical director of Saleem Skin. With extensive expertise in aesthetic medicine, he is passionate about delivering natural, beautiful results tailored to every patient. His clinical precision and warm approach have earned Saleem Skin its award-winning reputation.',
 'MBBS · Aesthetic Medicine Certified · Level 7 Injectables',
 ARRAY['Anti-Ageing','Skin Rejuvenation','Facial Aesthetics'],
 'Stethoscope', 10),
('RN Saleem','Registered Nurse & Aesthetic Practitioner',
 'RN Saleem combines a strong foundation in nursing with advanced aesthetic training to provide safe, effective and beautifully delivered treatments. Known for a gentle touch and exceptional patient care, RN Saleem is a trusted member of the Saleem Skin family.',
 'RGN · BSc Nursing · PGDip Aesthetic Medicine',
 ARRAY['Dermal Fillers','Anti-Wrinkle Injections','Skin Boosters'],
 'Stethoscope', 20),
('H. Saleem','Skin Therapist & Wellness Specialist',
 'H. Saleem brings a holistic approach to skin health and wellness at Saleem Skin. Specialising in advanced facials including HydraFacial and AlumierMD treatments, H. Saleem is dedicated to helping every client achieve glowing, healthy skin.',
 'VTCT Level 4 Aesthetics · HydraFacial Certified · AlumierMD Certified',
 ARRAY['HydraFacial','AlumierMD Peels','Wellness Treatments'],
 'Sparkles', 30);

-- ============================================
-- 10. SEED SITE CONTENT
-- ============================================
INSERT INTO public.site_content (key, value, label, group_name) VALUES
('announcement.messages',
 '["Best Aesthetics Clinic North 2025","Award-Winning Specialists · 5★ Rated by 14+ Patients","Free Skin Consultation · Book Today"]'::jsonb,
 'Announcement bar messages (rotating)', 'announcement'),
('hero.eyebrow', '"Best Aesthetics Clinic North 2025"'::jsonb, 'Hero badge text', 'hero'),
('hero.title_line1', '"Delivering"'::jsonb, 'Hero title — line 1', 'hero'),
('hero.title_emphasis', '"Exceptional"'::jsonb, 'Hero title — emphasised word', 'hero'),
('hero.title_line2', '"Skin, Health & Wellness"'::jsonb, 'Hero title — line 2', 'hero'),
('hero.subtitle', '"🪷 Skin · Health · Wellness — Advanced aesthetic treatments by award-winning specialists"'::jsonb, 'Hero subtitle', 'hero'),
('hero.image_url', '""'::jsonb, 'Hero background image URL (leave blank for default)', 'hero'),
('about.eyebrow', '"About Saleem Skin"'::jsonb, 'About — eyebrow', 'about'),
('about.title', '"Your Trusted Skin Clinic for Advanced Dermatology & Aesthetic Treatments"'::jsonb, 'About — title', 'about'),
('about.body', '"Saleem Skin is a premium aesthetic clinic dedicated to delivering outstanding skin care results. Our experienced team of skin specialists uses the latest technology and clinically proven treatments to help you achieve healthy, radiant skin. Whether you''re looking for anti-ageing solutions, acne scar treatment, or complete skin rejuvenation, we provide a bespoke approach to every patient."'::jsonb, 'About — body text', 'about'),
('about.image_url', '""'::jsonb, 'About — image URL (leave blank for default)', 'about'),
('about.years', '"15+"'::jsonb, 'About — years experience badge', 'about'),
('cta.eyebrow', '"Start Your Journey"'::jsonb, 'CTA — eyebrow', 'cta'),
('cta.title_line1', '"Book Your Free Skin"'::jsonb, 'CTA — title line 1', 'cta'),
('cta.title_emphasis', '"Consultation"'::jsonb, 'CTA — emphasised word', 'cta'),
('cta.title_line2', '"Today"'::jsonb, 'CTA — title line 2', 'cta'),
('cta.body', '"Speak to one of our award-winning specialists and discover the right treatment for you."'::jsonb, 'CTA — body', 'cta'),
('cta.phone', '"07503959285"'::jsonb, 'Clinic phone number', 'cta'),
('cta.phone_display', '"07503 959285"'::jsonb, 'Clinic phone display format', 'cta'),
('cta.email', '"hello@saleemskin.co.uk"'::jsonb, 'Clinic email', 'cta');
