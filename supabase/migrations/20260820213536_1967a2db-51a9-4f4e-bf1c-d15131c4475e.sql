UPDATE public.treatments SET faqs = '[
 {"question":"Is electrolysis permanent hair removal really permanent?","answer":"Yes. Electrolysis is the only method recognised as permanent hair removal. A fine probe treats each follicle individually so, once destroyed, that hair will not grow back. A course of sessions is needed to catch every follicle in its active growth phase."},
 {"question":"How many sessions will I need?","answer":"It depends on the area, hair density and your hormones. Small areas such as the upper lip or chin often need a series of short sessions over several months, while larger areas take longer. We will give you a realistic plan at your first appointment."},
 {"question":"Does electrolysis hurt?","answer":"Most clients describe a brief warm pinch as each follicle is treated. It is very tolerable, and we can apply numbing cream beforehand for sensitive areas."},
 {"question":"Does it work on grey, blonde or red hair?","answer":"Yes. Unlike laser, electrolysis does not rely on pigment, so it works on all hair colours and all skin tones."},
 {"question":"What should I expect afterwards?","answer":"Slight redness and small bumps for a few hours are normal. Avoid make-up, heat, swimming and sunbeds for 24 hours, and keep the area clean. We will give you full aftercare advice."}
]'::jsonb WHERE slug = 'electrolysis-permanent-hair-removal';

UPDATE public.treatments SET faqs = '[
 {"question":"What is filler dissolving treatment?","answer":"An enzyme called hyaluronidase is injected into the area to break down hyaluronic acid dermal filler. It is used to correct lumps, migration, overfilling or an unwanted result, or to reset an area before new filler."},
 {"question":"How quickly does it work?","answer":"Dissolving begins within minutes and most of the change is visible within 24 to 48 hours. The area is reviewed at around two weeks, and a second session is sometimes needed for stubborn or long-standing filler."},
 {"question":"Do I need a patch test?","answer":"Yes. A patch test is carried out before treatment to check for sensitivity to hyaluronidase, usually at least 20–30 minutes beforehand or at a separate appointment."},
 {"question":"Will it dissolve my own natural hyaluronic acid?","answer":"It can temporarily affect the natural hyaluronic acid nearby, but your body replaces this within days, so the effect on your own tissue is short-lived."},
 {"question":"When can I have new filler afterwards?","answer":"We usually recommend waiting at least two weeks so swelling settles and the area fully returns to baseline before any new filler is placed."}
]'::jsonb WHERE slug = 'filler-dissolving-treatment';