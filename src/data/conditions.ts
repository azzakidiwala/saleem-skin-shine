export type Condition = {
  name: string;
  description: string;
  treatments: string[];
};

export const faceConditions: Condition[] = [
  {
    name: "Acne",
    description:
      "Acne is a complex condition which can be caused by hormonal or environmental factors. It is usually caused by pores becoming blocked by dead skin cells, bacteria and oil. There are different types and severities which we can assess during your skin consultation with one of our Skin Health Practitioners, and devise a bespoke treatment plan to banish those spots.",
    treatments: [
      "At home topical Skincare (Zo Skin Health/Skinceauticals)",
      "Chemical Peels",
      "Hydrafacial",
      "M22 IPL",
    ],
  },
  {
    name: "Acne Scarring",
    description:
      "Acne Scarring is a common complication developing from Acne. This is caused by excess collagen production while the body tried to heal the deep layers of the skin from Acne, resulting is excess collagen. The treatment type for acne scarring is dependent on the type of scarring which has developed, which can be assessed during consultation with one of our Skin Health Practitioners.",
    treatments: ["Microneedling", "Blue Radience Peel", "ResurFX"],
  },
  {
    name: "Dark Circles",
    description:
      "Dark circles can develop for a multitude of reasons such as age, genetics and seasonal allergies. It can be caused by hyperpigmentation in the area or thinning skin, making the blood vessels underneath more visible. The most appropriate treatment option is dependent on the cause, which can be discussed during your consultation.",
    treatments: ["Tear Trough Dermal Filler", "Hydrafacial", "Topical Skin Care"],
  },
  {
    name: "Double Chin",
    description:
      "A double chin is a layer of submental fat that has formed underneath the chin and can be caused by genetics, ageing, weight gain or hormonal changes. At Skin Doctor Clinics, we have multiple treatments available which can help dependant on how invasive you wish to go.",
    treatments: ["Jawtite", "Morpheus8"],
  },
];

export const bodyConditions: Condition[] = [
  {
    name: "Age Spots",
    description:
      "Age Spots, or Sun Spots, are pigmented lesions and are usually flat to the skin. Most common in those aged over 50, they are caused by overactive pigment cells and can be exacerbated by excess sun exposure over a long period of time. Most commonly seen on the hands and face.",
    treatments: ["M22 IPL", "Lumecca", "Chemical Peel", "Prescription topical skincare"],
  },
  {
    name: "Belly Fat",
    description:
      "Causes include genetics, hormones, medication, poor diet, lack of exercise and short or low-quality sleep. A healthy diet and active lifestyle can help people lose excess belly fat and lower the risk of problems associated with it.",
    treatments: ["Radiofrequency Skin Tightening and Lifting"],
  },
  {
    name: "Cellulite",
    description:
      "As fat cells increase, they push up against the skin. Tough, long connective cords pull down. This creates an uneven surface or dimpling, often referred to as cellulite. Cellulite is a very common, harmless skin condition that causes lumpy, dimpled flesh on the thighs, hips, buttocks and abdomen.",
    treatments: ["Radiofrequency Skin Tightening and Lifting"],
  },
  {
    name: "Excessive Sweating",
    description:
      "Excessive sweating, or Hyperhydrosis, is a condition whereby the person sweats excessively when the body does not need to cool down. It can affect the whole body, however common areas include the armpits, hands and feet. Botulinum Toxin can be injected into the skin, which helps prevent the signals from the nervous system reaching the sweat glands, this in turns stops them working too hard and producing sweat.",
    treatments: ["Anti-wrinkle Injections"],
  },
  {
    name: "Excessive Hair Growth",
    description:
      "Excessive Hair Growth, or Hirsutism, is caused by an over production of androgens, leading to extra hair growth. While hormones are one of the leading causes, medications and some conditions can also contribute. Skin Doctor Clinics offers the latest Laser Hair Removal technology to help slow regrowth and reduce the overall appearance of hair growth.",
    treatments: ["Laser Hair Removal"],
  },
  {
    name: "Loose Skin",
    description:
      "Despite the natural elasticity of skin, one of the biggest causes of sagging is rapid weight loss. When we gain weight, our skin has to stretch in order to accommodate any excess fat. If we suddenly lose all of that fat through intense exercise and dieting, it’s not uncommon for our skin to be loose afterwards. Depending on things like your age, skin health, genetics and how long you were overweight for, it can take time for skin to spring back. In some cases, it might always look a little saggy.",
    treatments: ["Morpheus8", "Radiofrequency Skin Tightening and Lifting", "JawTite"],
  },
  {
    name: "Love Handles",
    description:
      "“Love handles” are areas of skin that extend outward from the hips. When combined with tight clothing, love handles can become more pronounced, but they aren’t caused by tight clothes alone. They indicate excess fat accumulation around the hips and abdominal area.",
    treatments: ["Radiofrequency Skin Tightening and Lifting"],
  },
  {
    name: "Mum Tum",
    description:
      "Many women, even if they were healthy and had a toned body before pregnancy, fall victim to the mummy tummy which is also known as ‘mum tum’. The term ‘mummy tummy’ dreaded by all mothers is used to describe a bulge in the abdominal area that is caused by the separation of the Rectus Abdominis muscles during pregnancy. Most women are desperately trying to get their pre-baby body back with diet, exercise and yoga. Unfortunately, the mummy tummy is an enemy that is hard to get rid of with just health and fitness choices alone.",
    treatments: ["Morpheus8", "Radiofrequency Skin Tightening and Lifting"],
  },
  {
    name: "Spider Veins",
    description:
      "Spider veins (also known as telangiectasias) occur due to weakness or damage in the veins. These veins can be purple or red (differing to blue varicose veins) and may appear in the form of thin lines, webs or branches. People sometimes also refer to them as thread veins and they commonly appear on the legs. Typically, they are not painful or harmful, but some people may wish to treat them for cosmetic reasons.",
    treatments: ["M22", "Lumecca", "Diathermy"],
  },
  {
    name: "Stubborn Fat",
    description:
      "Stubborn fat is by definition, fat that you find almost impossible to lose through diet and exercise even if you are doing the right things. These areas of stubborn fat are scientifically more resistant to fat burning.",
    treatments: ["Radiofrequency Skin Tightening and Lifting"],
  },
  {
    name: "Wrinkly Chest",
    description:
      "Often called the décolletage, the chest commonly develops wrinkles and thin, crepey skin over time. This is caused by a decrease in collagen production and less elasticity. Lines and wrinkles on the chest are especially common in women as a result of breast tissue pulling the skin.",
    treatments: ["Morpheus8", "Microneedling", "Dermal fillers"],
  },
  {
    name: "Wrinkly Hands",
    description:
      "As you age, your hands lose fat and elasticity and your skin loses volume. This reduced volume and decreased elasticity produces translucent skin that wrinkles and develops age spots.",
    treatments: ["Morpheus8", "Profhilo", "Dermal Filler"],
  },
];

export const skinConditions: Condition[] = [
  {
    name: "Acne Scarring",
    description:
      "Acne Scarring is a common complication developing from Acne. This is caused by excess collagen production while the body tried to heal the deep layers of the skin from Acne, resulting is excess collagen. The treatment type for acne scarring is dependent on the type of scarring which has developed, which can be assessed during consultation with one of our Skin Health Practitioners.",
    treatments: ["Microneedling", "Blue Radiance Peel", "ResurFX"],
  },
  {
    name: "Dry Skin",
    description:
      "Dry skin is there from birth, unlike dehydrated skin which is caused from a trigger. This is skin that doesn’t have enough moisture in it to keep it feeling soft. The medical term for dry skin is Xeroderma and the term Xerosis is given to severely dry skin. Dry skin feels like rough patches of your skin that can flake or look scaly.",
    treatments: ["SkinCeuticals or ZO tailored facial", "Hydrafacial"],
  },
  {
    name: "Excessive Sweating",
    description:
      "Excessive sweating, or Hyperhydrosis, is a condition whereby the person sweats excessively when the body does not need to cool down. It can affect the whole body, however common areas include the armpits, hands and feet. Botulinum Toxin can be injected into the skin, which helps prevent the signals from the nervous system reaching the sweat glands, this in turns stops them working too hard and producing sweat.",
    treatments: ["Anti-wrinkle Injections"],
  },
  {
    name: "Hyperpigmentation",
    description:
      "There are several types of hyperpigmentation, the common ones being melasma, sunspots, and post-inflammatory hyperpigmentation. Melasma is believed to be caused by hormonal changes and may develop during pregnancy. Areas of hyperpigmentation can appear on any area of the body, but they appear most commonly on the stomach and face. Also called liver spots or solar lentigines, sunspots are common — related to excess sun exposure over time. Post-inflammatory hyperpigmentation is a result of injury or inflammation to the skin, with acne being a common cause.",
    treatments: [
      "M22",
      "Lumecca",
      "Chemical Peels",
      "Microneedling",
      "Morpheus8",
      "Prescribed Topical Skin Care",
    ],
  },
  {
    name: "Large Pores",
    description:
      "“Large” pores are the ones you can see without a microscope. They can look like small dots on the skin of your face and can be caused by oil production in the pores, a loss of firmness in the skin due to ageing, genetics, sun damage or clogged pores.",
    treatments: ["Hydrafacial", "Microneedling", "Prescribed Topical Skin Care"],
  },
  {
    name: "Loose Skin",
    description:
      "Despite the natural elasticity of skin, one of the biggest causes of sagging is rapid weight loss. When we gain weight, our skin has to stretch in order to accommodate any excess fat. If we suddenly lose all of that fat through intense exercise and dieting, it’s not uncommon for our skin to be loose afterwards.",
    treatments: ["Morpheus8", "Skin Tightening radio frequency", "JawTite"],
  },
  {
    name: "Rosacea",
    description:
      "Rosacea is a chronic skin condition usually characterised by flushing of the skin, visible broken blood vessels and pink or red spots. There is no known cause, however triggers for the condition can include alcohol consumption, spicy food and changes in temperature. Here at Skin Doctor Clinics, we can help alleviate the symptoms of rosacea using IPL treatments which can reduce the redness, pimples and veins. Alongside this, our Skin Health Practitioners can offer a tailored skin care regime to help calm and smooth skin sensitivities associated with the condition.",
    treatments: ["M22", "Lumecca", "Prescribed Topical Skincare", "Hydrafacial or tailored facial"],
  },
  {
    name: "Spider Veins",
    description:
      "Spider veins (also known as telangiectasias) occur due to weakness or damage in the veins. These veins can be purple or red (differing to blue varicose veins) and may appear in the form of thin lines, webs or branches. People sometimes also refer to them as thread veins and they commonly appear on the legs. Typically, they are not painful or harmful, but some people may wish to treat them for cosmetic reasons.",
    treatments: ["M22", "Splendor X", "Sclerotherapy"],
  },
  {
    name: "Stretch Marks",
    description:
      "Stretch marks are often caused by sudden growth or weight gain. These marks look like lines or streaks across the skin and can be pink, red, brown, black, silver or purple. They usually start off darker and fade over time. Stretch marks are most common on the tummy, breasts, chest, upper arms, legs, bottom, hips or back.",
    treatments: ["Microneedling", "Morpheus8", "Prescribed Topical Skin Care"],
  },
  {
    name: "Sun Damage",
    description:
      "We refer to the damage the sun does to skin by several names, including photoaging, photodamage, solar damage or sun damage. Photoaging is the premature aging of your skin due to ongoing exposure to ultraviolet A (UVA) and ultraviolet B (UVB) radiation. UV exposure not only ages your skin more quickly than it naturally would, but can also increase your risk for skin cancer.",
    treatments: ["M22", "Lumecca", "Chemical Peels", "Cryotherapy", "Prescribed Topical Skincare"],
  },
  {
    name: "Wrinkles",
    description:
      "Wrinkles, a natural part of aging, are most prominent on sun-exposed skin, such as the face, neck, hands and forearms. Although genetics mainly determine skin structure and texture, sun exposure is a major cause of wrinkles, especially for people with light skin. Pollutants and smoking also contribute to wrinkling.",
    treatments: ["Morpheus8", "Anti-wrinkle injections", "Dermal filler"],
  },
];
