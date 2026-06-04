-- Conditions table (face/body/skin)
CREATE TABLE public.conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL CHECK (area IN ('face','body','skin')),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  treatments text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.conditions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditions TO authenticated;
GRANT ALL ON public.conditions TO service_role;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active conditions" ON public.conditions
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage conditions" ON public.conditions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER conditions_updated_at BEFORE UPDATE ON public.conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed conditions (face)
INSERT INTO public.conditions (area, name, description, treatments, sort_order) VALUES
('face','Acne','Acne is a complex condition which can be caused by hormonal or environmental factors. It is usually caused by pores becoming blocked by dead skin cells, bacteria and oil. There are different types and severities which we can assess during your skin consultation with one of our Skin Health Practitioners, and devise a bespoke treatment plan to banish those spots.', ARRAY['At home topical Skincare (Zo Skin Health/Skinceauticals)','Chemical Peels','Hydrafacial','M22 IPL'],10),
('face','Acne Scarring','Acne Scarring is a common complication developing from Acne. This is caused by excess collagen production while the body tried to heal the deep layers of the skin from Acne, resulting is excess collagen. The treatment type for acne scarring is dependent on the type of scarring which has developed, which can be assessed during consultation with one of our Skin Health Practitioners.', ARRAY['Microneedling','Blue Radience Peel','ResurFX'],20),
('face','Dark Circles','Dark circles can develop for a multitude of reasons such as age, genetics and seasonal allergies. It can be caused by hyperpigmentation in the area or thinning skin, making the blood vessels underneath more visible. The most appropriate treatment option is dependent on the cause, which can be discussed during your consultation.', ARRAY['Tear Trough Dermal Filler','Hydrafacial','Topical Skin Care'],30),
('face','Double Chin','A double chin is a layer of submental fat that has formed underneath the chin and can be caused by genetics, ageing, weight gain or hormonal changes. At Skin Doctor Clinics, we have multiple treatments available which can help dependant on how invasive you wish to go.', ARRAY['Jawtite','Morpheus8'],40);

-- Seed conditions (body)
INSERT INTO public.conditions (area, name, description, treatments, sort_order) VALUES
('body','Age Spots','Age Spots, or Sun Spots, are pigmented lesions and are usually flat to the skin. Most common in those aged over 50, they are caused by overactive pigment cells and can be exacerbated by excess sun exposure over a long period of time. Most commonly seen on the hands and face.', ARRAY['M22 IPL','Lumecca','Chemical Peel','Prescription topical skincare'],10),
('body','Belly Fat','Causes include genetics, hormones, medication, poor diet, lack of exercise and short or low-quality sleep. A healthy diet and active lifestyle can help people lose excess belly fat and lower the risk of problems associated with it.', ARRAY['Radiofrequency Skin Tightening and Lifting'],20),
('body','Cellulite','As fat cells increase, they push up against the skin. Tough, long connective cords pull down. This creates an uneven surface or dimpling, often referred to as cellulite. Cellulite is a very common, harmless skin condition that causes lumpy, dimpled flesh on the thighs, hips, buttocks and abdomen.', ARRAY['Radiofrequency Skin Tightening and Lifting'],30),
('body','Excessive Sweating','Excessive sweating, or Hyperhydrosis, is a condition whereby the person sweats excessively when the body does not need to cool down. It can affect the whole body, however common areas include the armpits, hands and feet. Botulinum Toxin can be injected into the skin, which helps prevent the signals from the nervous system reaching the sweat glands, this in turns stops them working too hard and producing sweat.', ARRAY['Anti-wrinkle Injections'],40),
('body','Excessive Hair Growth','Excessive Hair Growth, or Hirsutism, is caused by an over production of androgens, leading to extra hair growth. While hormones are one of the leading causes, medications and some conditions can also contribute. Skin Doctor Clinics offers the latest Laser Hair Removal technology to help slow regrowth and reduce the overall appearance of hair growth.', ARRAY['Laser Hair Removal'],50),
('body','Loose Skin','Despite the natural elasticity of skin, one of the biggest causes of sagging is rapid weight loss. When we gain weight, our skin has to stretch in order to accommodate any excess fat. If we suddenly lose all of that fat through intense exercise and dieting, it''s not uncommon for our skin to be loose afterwards. Depending on things like your age, skin health, genetics and how long you were overweight for, it can take time for skin to spring back. In some cases, it might always look a little saggy.', ARRAY['Morpheus8','Radiofrequency Skin Tightening and Lifting','JawTite'],60),
('body','Love Handles','"Love handles" are areas of skin that extend outward from the hips. When combined with tight clothing, love handles can become more pronounced, but they aren''t caused by tight clothes alone. They indicate excess fat accumulation around the hips and abdominal area.', ARRAY['Radiofrequency Skin Tightening and Lifting'],70),
('body','Mum Tum','Many women, even if they were healthy and had a toned body before pregnancy, fall victim to the mummy tummy which is also known as ''mum tum''. The term ''mummy tummy'' dreaded by all mothers is used to describe a bulge in the abdominal area that is caused by the separation of the Rectus Abdominis muscles during pregnancy. Most women are desperately trying to get their pre-baby body back with diet, exercise and yoga. Unfortunately, the mummy tummy is an enemy that is hard to get rid of with just health and fitness choices alone.', ARRAY['Morpheus8','Radiofrequency Skin Tightening and Lifting'],80),
('body','Spider Veins','Spider veins (also known as telangiectasias) occur due to weakness or damage in the veins. These veins can be purple or red (differing to blue varicose veins) and may appear in the form of thin lines, webs or branches. People sometimes also refer to them as thread veins and they commonly appear on the legs. Typically, they are not painful or harmful, but some people may wish to treat them for cosmetic reasons.', ARRAY['M22','Lumecca','Diathermy'],90),
('body','Stubborn Fat','Stubborn fat is by definition, fat that you find almost impossible to lose through diet and exercise even if you are doing the right things. These areas of stubborn fat are scientifically more resistant to fat burning.', ARRAY['Radiofrequency Skin Tightening and Lifting'],100),
('body','Wrinkly Chest','Often called the décolletage, the chest commonly develops wrinkles and thin, crepey skin over time. This is caused by a decrease in collagen production and less elasticity. Lines and wrinkles on the chest are especially common in women as a result of breast tissue pulling the skin.', ARRAY['Morpheus8','Microneedling','Dermal fillers'],110),
('body','Wrinkly Hands','As you age, your hands lose fat and elasticity and your skin loses volume. This reduced volume and decreased elasticity produces translucent skin that wrinkles and develops age spots.', ARRAY['Morpheus8','Profhilo','Dermal Filler'],120);

-- Seed conditions (skin)
INSERT INTO public.conditions (area, name, description, treatments, sort_order) VALUES
('skin','Acne Scarring','Acne Scarring is a common complication developing from Acne. This is caused by excess collagen production while the body tried to heal the deep layers of the skin from Acne, resulting is excess collagen. The treatment type for acne scarring is dependent on the type of scarring which has developed, which can be assessed during consultation with one of our Skin Health Practitioners.', ARRAY['Microneedling','Blue Radiance Peel','ResurFX'],10),
('skin','Dry Skin','Dry skin is there from birth, unlike dehydrated skin which is caused from a trigger. This is skin that doesn''t have enough moisture in it to keep it feeling soft. The medical term for dry skin is Xeroderma and the term Xerosis is given to severely dry skin. Dry skin feels like rough patches of your skin that can flake or look scaly.', ARRAY['SkinCeuticals or ZO tailored facial','Hydrafacial'],20),
('skin','Excessive Sweating','Excessive sweating, or Hyperhydrosis, is a condition whereby the person sweats excessively when the body does not need to cool down. It can affect the whole body, however common areas include the armpits, hands and feet. Botulinum Toxin can be injected into the skin, which helps prevent the signals from the nervous system reaching the sweat glands, this in turns stops them working too hard and producing sweat.', ARRAY['Anti-wrinkle Injections'],30),
('skin','Hyperpigmentation','There are several types of hyperpigmentation, the common ones being melasma, sunspots, and post-inflammatory hyperpigmentation. Melasma is believed to be caused by hormonal changes and may develop during pregnancy. Areas of hyperpigmentation can appear on any area of the body, but they appear most commonly on the stomach and face. Also called liver spots or solar lentigines, sunspots are common — related to excess sun exposure over time. Post-inflammatory hyperpigmentation is a result of injury or inflammation to the skin, with acne being a common cause.', ARRAY['M22','Lumecca','Chemical Peels','Microneedling','Morpheus8','Prescribed Topical Skin Care'],40);

-- Seed FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
('What do Hydrafacials do to your face?','HydraFacial deeply cleanses, exfoliates, extracts impurities, and hydrates the skin. It removes dead skin cells, unclogs pores, and infuses antioxidants and peptides, leaving your skin smoother. It can also target specific concerns such as acne, pigmentation, and uneven texture.',10),
('How long will HydraFacial results last?','Hydrafacial results are visible immediately after treatment, with skin appearing brighter, plumper, and more hydrated. For long-lasting benefits, it''s recommended to have HydraFacial treatments regularly, depending on your skin type and concerns.',20),
('What are the side effects of Hydrafacial?','HydraFacial is generally safe with minimal side effects. Some patients may experience slight redness or sensitivity immediately after treatment, which typically subsides within a few hours. Those with a shellfish allergy should avoid this treatment due to certain ingredient formulations.',30),
('Does Hydrafacial help with wrinkles?','Yes, HydraFacial helps reduce the appearance of fine lines and wrinkles by hydrating the skin, stimulating collagen production, and improving overall skin elasticity and texture.',40),
('Are Hydrafacials safe?','Absolutely. HydraFacial is a non-invasive, gentle treatment suitable for most skin types. It''s safe for regular use, has no downtime, and is performed by trained professionals to ensure optimal results.',50);