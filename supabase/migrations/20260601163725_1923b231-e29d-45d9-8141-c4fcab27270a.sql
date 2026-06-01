INSERT INTO public.site_content (key, value, group_name, label) VALUES
  ('team.eyebrow', '"OUR SPECIALISTS"'::jsonb, 'team', 'Team — eyebrow'),
  ('team.title', '"Meet the Team"'::jsonb, 'team', 'Team — title'),
  ('team.intro', '"Our award-winning team of aesthetic practitioners and skin therapists are dedicated to helping you achieve your best skin, health and wellness."'::jsonb, 'team', 'Team — intro paragraph'),

  ('conditions.face.eyebrow', '"CONDITIONS · FACE"'::jsonb, 'conditions_face', 'Face Conditions — eyebrow'),
  ('conditions.face.title', '"Face Conditions"'::jsonb, 'conditions_face', 'Face Conditions — title'),
  ('conditions.face.intro', '"From acne to dark circles, our Skin Health Practitioners assess each concern and design a bespoke treatment plan tailored to your skin."'::jsonb, 'conditions_face', 'Face Conditions — intro'),

  ('conditions.body.eyebrow', '"CONDITIONS · BODY"'::jsonb, 'conditions_body', 'Body Conditions — eyebrow'),
  ('conditions.body.title', '"Body Conditions"'::jsonb, 'conditions_body', 'Body Conditions — title'),
  ('conditions.body.intro', '"Targeted treatments for the body — from stubborn fat and cellulite to loose skin and spider veins — designed around your goals."'::jsonb, 'conditions_body', 'Body Conditions — intro'),

  ('conditions.skin.eyebrow', '"CONDITIONS · SKIN"'::jsonb, 'conditions_skin', 'Skin Conditions — eyebrow'),
  ('conditions.skin.title', '"Skin Conditions"'::jsonb, 'conditions_skin', 'Skin Conditions — title'),
  ('conditions.skin.intro', '"From rosacea and hyperpigmentation to wrinkles and sun damage — bespoke skincare and clinical treatments to restore healthy, glowing skin."'::jsonb, 'conditions_skin', 'Skin Conditions — intro'),

  ('faq.eyebrow', '"SUPPORT"'::jsonb, 'faq', 'FAQ — eyebrow'),
  ('faq.title', '"Frequently Asked Questions"'::jsonb, 'faq', 'FAQ — title'),
  ('faq.subtitle', '"Everything you need to know before your treatment."'::jsonb, 'faq', 'FAQ — subtitle'),

  ('contact.eyebrow', '"Get in Touch"'::jsonb, 'contact', 'Contact — eyebrow'),
  ('contact.title', '"Contact Us"'::jsonb, 'contact', 'Contact — title'),
  ('contact.subtitle', '"We''d love to hear from you. Reach out about treatments, consultations or to book your appointment."'::jsonb, 'contact', 'Contact — subtitle'),
  ('contact.address', '"123 Wellness Avenue, Manchester, M1 2AB"'::jsonb, 'contact', 'Contact — clinic address'),
  ('contact.hours_weekday', '"9:00 – 19:00"'::jsonb, 'contact', 'Contact — Mon–Fri hours'),
  ('contact.hours_saturday', '"10:00 – 17:00"'::jsonb, 'contact', 'Contact — Saturday hours'),
  ('contact.hours_sunday', '"Closed"'::jsonb, 'contact', 'Contact — Sunday hours')
ON CONFLICT (key) DO NOTHING;