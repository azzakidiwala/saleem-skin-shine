import facial from "@/assets/treatment-facial.jpg";
import deluxeHydrafacial from "@/assets/treatment-deluxe-hydrafacial.jpg";
import rejuvenation from "@/assets/treatment-rejuvenation.jpg";
import prpFacial from "@/assets/treatment-prp-facial.jpg";
import antiWrinkle from "@/assets/treatment-anti-wrinkle.jpg";
import traptox from "@/assets/treatment-traptox.jpg";
import jawlineSlimming from "@/assets/treatment-jawline-slimming.jpg";
import fillers from "@/assets/treatment-fillers.jpg";
import laser from "@/assets/treatment-laser.jpg";
import body from "@/assets/treatment-body.jpg";
import clinic from "@/assets/about-clinic.jpg";
import promoitaliaLipBooster from "@/assets/treatment-promoitalia-lip-booster.jpg";
import wetDiamond from "@/assets/treatment-wet-diamond.jpg";
import vtechMicroneedling from "@/assets/treatment-vtech-microneedling.jpg";
import prpHair from "@/assets/treatment-prp-hair.jpg";
import hayFever from "@/assets/treatment-hay-fever.jpg";
import b12Single from "@/assets/treatment-b12-single.jpg";
import b12Course from "@/assets/treatment-b12-course.jpg";

export type Treatment = {
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  price: string;
  duration: string;
  sessions: string;
  benefits: string[];
  whatToExpect: string;
  image: string;
};

export const treatments: Treatment[] = [
  {
    slug: "new-consultation",
    name: "New Consultation",
    category: "Consultation",
    description:
      "Your journey to better skin begins with a thorough consultation with one of our expert practitioners to discuss your goals and tailor a bespoke treatment plan.",
    longDescription:
      "Your journey to better skin begins with a thorough consultation with one of our expert practitioners. We'll assess your skin concerns, medical history and goals in order to design a bespoke treatment plan tailored to you.",
    price: "£60",
    duration: "30 mins",
    sessions: "1 session",
    benefits: [
      "Comprehensive skin and health assessment",
      "Personalised treatment plan",
      "Expert advice from qualified practitioners",
      "No obligation to proceed",
    ],
    whatToExpect:
      "Your consultation will last approximately 30 minutes. We'll discuss your concerns, examine your skin and walk you through the treatment options best suited to your needs and goals.",
    image: clinic,
  },
  {
    slug: "deluxe-hydrafacial",
    name: "Deluxe HydraFacial",
    category: "HydraFacial",
    description:
      "The Deluxe HydraFacial is a deeply cleansing, hydrating and rejuvenating treatment that uses patented vortex technology to leave skin glowing.",
    longDescription:
      "The Deluxe HydraFacial is a deeply cleansing, hydrating and rejuvenating treatment that uses patented Vortex-Fusion technology to cleanse, extract and infuse the skin with powerful serums. Suitable for all skin types.",
    price: "£145",
    duration: "45 mins",
    sessions: "Monthly for best results",
    benefits: [
      "Deep cleansing and exfoliation",
      "Intense hydration",
      "Improved skin texture and tone",
      "Reduction in fine lines and congestion",
      "Immediate, visible glow with no downtime",
    ],
    whatToExpect:
      "The treatment involves a multi-step process: cleanse, exfoliate, extract, and hydrate. You'll leave with visibly brighter, smoother skin. There is zero downtime.",
    image: deluxeHydrafacial,
  },
  {
    slug: "wet-diamond-hydrafacial",
    name: "Wet Diamond HydraFacial",
    category: "HydraFacial",
    description:
      "Our premium HydraFacial experience combines diamond-tip microdermabrasion with the powerful HydraFacial system for unmatched radiance.",
    longDescription:
      "Our premium HydraFacial experience combines diamond-tip microdermabrasion with the powerful HydraFacial serums for a deeper level of skin renewal. Ideal for those seeking maximum radiance and skin transformation.",
    price: "£200",
    duration: "1 hr",
    sessions: "Monthly for best results",
    benefits: [
      "Diamond-tip exfoliation for deeper resurfacing",
      "Intensive serum infusion",
      "Brightening and anti-ageing benefits",
      "Suitable for dull, congested or ageing skin",
    ],
    whatToExpect:
      "Expect a deeply satisfying, relaxing treatment lasting one hour. You may experience mild redness that subsides within a few hours. Most clients describe the result as a 'glass skin' effect.",
    image: wetDiamond,
  },
  {
    slug: "promoitalia-lip-booster",
    name: "Promoitalia Lip Booster",
    category: "Injectables",
    description:
      "A bio-revitalising lip treatment that hydrates, plumps and improves lip texture using premium Italian-formulated injectables.",
    longDescription:
      "The Promoitalia Lip Booster uses an advanced biorevitalisation technique to hydrate, plump and define the lips without adding artificial volume. It's a natural-looking enhancement perfect for those wanting subtle results.",
    price: "£160",
    duration: "30 mins",
    sessions: "2–3 sessions recommended",
    benefits: [
      "Natural-looking lip enhancement",
      "Deep hydration and plumping",
      "Improved lip texture and definition",
      "Minimal discomfort with topical anaesthetic",
    ],
    whatToExpect:
      "A topical numbing cream is applied before treatment. The injections take around 15 minutes. Mild swelling may occur and resolves within 24–48 hours.",
    image: promoitaliaLipBooster,
  },
  {
    slug: "traptox",
    name: "TrapTox",
    category: "Injectables",
    description:
      "Anti-wrinkle treatment for the trapezius muscles to relieve tension, improve posture and elegantly slim the neck and shoulder line.",
    longDescription:
      "TrapTox involves injecting botulinum toxin into the trapezius muscles to slim the neck and shoulder profile, relieve chronic muscle tension and create a more elegant silhouette. A popular treatment for both aesthetics and wellness.",
    price: "£300",
    duration: "45 mins",
    sessions: "Every 3–4 months",
    benefits: [
      "Slimmer neck and shoulder appearance",
      "Relief from muscle tension and pain",
      "Improved posture over time",
      "Results last 3–4 months",
    ],
    whatToExpect:
      "Injections are placed into the trapezius muscles. You may feel mild discomfort. Results become visible within 1–2 weeks and last 3–4 months on average.",
    image: traptox,
  },
  {
    slug: "jawline-slimming-anti-wrinkle",
    name: "Jawline Slimming Anti-Wrinkle Treatment",
    category: "Injectables",
    description:
      "Targeted anti-wrinkle injections to relax the masseter muscles, slim the jawline and create a softer, more defined facial contour.",
    longDescription:
      "This treatment uses botulinum toxin injections to relax the masseter muscles, creating a slimmer, more contoured jawline. It is also effective for teeth grinding (bruxism) and jaw tension.",
    price: "£190",
    duration: "45 mins",
    sessions: "Every 4–6 months",
    benefits: [
      "Slimmer, more defined jawline",
      "Reduction in teeth grinding",
      "Relief from jaw tension and headaches",
      "Natural-looking results",
    ],
    whatToExpect:
      "Treatment takes around 15–20 minutes. Results begin to show after 2 weeks and reach full effect at 4–6 weeks. Top-ups are typically needed every 4–6 months.",
    image: jawlineSlimming,
  },
  {
    slug: "vtech-microneedling-led",
    name: "VTECH Microneedling with LED Face Mask",
    category: "Skin Rejuvenation",
    description:
      "Advanced microneedling combined with LED light therapy to stimulate collagen, improve texture and reduce fine lines and scarring.",
    longDescription:
      "This advanced treatment combines VTECH microneedling with LED light therapy to stimulate the skin's natural collagen production, reduce scarring and improve overall skin texture and tone.",
    price: "£180",
    duration: "1 hr 30 mins",
    sessions: "Course of 3–6 recommended",
    benefits: [
      "Stimulates collagen and elastin production",
      "Reduces acne scarring and hyperpigmentation",
      "Improves skin texture and firmness",
      "LED light therapy enhances healing and results",
    ],
    whatToExpect:
      "A numbing cream is applied prior to treatment. Mild redness and sensitivity may last 24–48 hours. A course of treatments is recommended for optimal results.",
    image: vtechMicroneedling,
  },
  {
    slug: "prp-hair-scalp",
    name: "PRP Hair & Scalp Treatment",
    category: "PRP",
    description:
      "Platelet-rich plasma injections to stimulate hair follicles, promote regrowth and improve scalp health using your body's own healing factors.",
    longDescription:
      "Platelet-Rich Plasma (PRP) therapy uses your own blood's growth factors to stimulate hair follicles, promote natural hair regrowth and improve overall scalp health. An effective, natural solution for hair thinning.",
    price: "From £POA",
    duration: "1 hr",
    sessions: "Course of 3 recommended",
    benefits: [
      "Stimulates natural hair regrowth",
      "Thickens existing hair",
      "Improves scalp health",
      "Uses your body's own growth factors — no synthetic chemicals",
    ],
    whatToExpect:
      "A small amount of blood is drawn, processed to extract PRP, then injected into the scalp. Mild tenderness may follow. A course of 3 sessions is recommended for best results.",
    image: prpHair,
  },
  {
    slug: "prp-facial-vampire",
    name: "PRP Facial (Vampire Facial)",
    category: "PRP",
    description:
      "The famous Vampire Facial uses platelet-rich plasma to rejuvenate skin, improve tone and texture, and promote a youthful glow.",
    longDescription:
      "The PRP Facial — also known as the Vampire Facial — uses your own platelet-rich plasma combined with microneedling to rejuvenate the skin, improve tone and texture, and promote a youthful, radiant glow.",
    price: "£295",
    duration: "1 hr",
    sessions: "Course of 3 recommended",
    benefits: [
      "Natural skin rejuvenation",
      "Improved tone and texture",
      "Reduction in fine lines",
      "Uses your body's own healing factors",
    ],
    whatToExpect:
      "Blood is drawn and processed to extract PRP, which is then applied with microneedling. Mild redness may last 24–48 hours. Results develop over weeks.",
    image: prpFacial,
  },
  {
    slug: "hay-fever-treatment",
    name: "Hay Fever Treatment",
    category: "Hay Fever Treatment",
    description:
      "Our injectable hay fever treatment provides effective, season-long relief from hay fever symptoms. A simple in-clinic appointment.",
    longDescription:
      "Our injectable hay fever treatment provides effective, season-long relief from hay fever symptoms with a simple in-clinic appointment. Ideal for sufferers who haven't found relief from over-the-counter options.",
    price: "From £POA",
    duration: "30 mins",
    sessions: "Once per season",
    benefits: [
      "Season-long symptom relief",
      "Quick in-clinic appointment",
      "Effective when antihistamines have failed",
      "Administered by qualified medical professionals",
    ],
    whatToExpect:
      "A consultation is performed to assess suitability. The injection takes only minutes. Relief is typically experienced for the duration of the hay fever season.",
    image: hayFever,
  },
  {
    slug: "vitamin-b12-single",
    name: "Vitamin B12 Injection (Single)",
    category: "Wellness",
    description:
      "A single Vitamin B12 injection delivers a fast, effective boost to energy levels, mood and metabolism.",
    longDescription:
      "A single Vitamin B12 injection delivers a fast, effective boost to energy levels, mood and metabolism. Ideal for those experiencing fatigue or low energy.",
    price: "£25",
    duration: "30 mins",
    sessions: "1 session",
    benefits: [
      "Boosts energy and mood",
      "Supports healthy metabolism",
      "Quick, simple appointment",
      "Suitable for vegans and vegetarians",
    ],
    whatToExpect:
      "A quick injection is administered into the upper arm. Effects are typically felt within 24–72 hours and last several weeks.",
    image: b12Single,
  },
  {
    slug: "vitamin-b12-course",
    name: "Vitamin B12 Injection (Course of 6)",
    category: "Wellness",
    description:
      "A course of six Vitamin B12 injections for sustained energy, improved metabolism and enhanced vitality.",
    longDescription:
      "A course of six Vitamin B12 injections for sustained energy, improved metabolism and enhanced vitality. Ideal for ongoing support of energy and wellbeing.",
    price: "£120",
    duration: "30 mins",
    sessions: "Course of 6",
    benefits: [
      "Sustained energy boost",
      "Supports long-term metabolism and vitality",
      "Better value than single sessions",
      "Suitable for vegans and vegetarians",
    ],
    whatToExpect:
      "Six injections are administered over a recommended schedule. Each appointment is quick and simple, with cumulative benefits over the course.",
    image: b12Course,
  },
];

export const categories = [
  "All",
  "Consultation",
  "HydraFacial",
  "Injectables",
  "Skin Rejuvenation",
  "PRP",
  "Hay Fever Treatment",
  "Wellness",
];

export function getTreatment(slug: string) {
  return treatments.find((t) => t.slug === slug);
}
