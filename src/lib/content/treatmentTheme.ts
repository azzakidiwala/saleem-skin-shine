export type HeroVariant = "immersive" | "split" | "editorial";
export type SectionKey =
  | "overview"
  | "results"
  | "benefits"
  | "journey"
  | "pricing"
  | "faqs";

export type TreatmentTheme = {
  toneClass: string;
  hero: HeroVariant;
  order: SectionKey[];
  eyebrow: string;
  overviewHeading: string;
  resultsLabel: string;
  benefitsLabel: string;
  journeyLabel: string;
  journeyHeading: string;
  resultsSpeed: string;
  altSurface: boolean;
};

const DEFAULT_THEME: TreatmentTheme = {
  toneClass: "tone-gold",
  hero: "immersive",
  order: ["overview", "benefits", "results", "journey", "pricing", "faqs"],
  eyebrow: "Overview",
  overviewHeading: "What this treatment does",
  resultsLabel: "Real results",
  benefitsLabel: "Key benefits",
  journeyLabel: "Your appointment",
  journeyHeading: "What to expect, step by step",
  resultsSpeed: "Immediate, settles in 2 weeks",
  altSurface: false,
};

const THEMES: Record<string, Partial<TreatmentTheme>> = {
  Injectables: {
    toneClass: "tone-gold",
    hero: "immersive",
    order: ["overview", "benefits", "results", "journey", "pricing", "faqs"],
    eyebrow: "The treatment",
    overviewHeading: "Refined, anatomy-led results",
    resultsSpeed: "Softens from day 3, full effect at 2 weeks",
  },
  HydraFacial: {
    toneClass: "tone-aqua",
    hero: "split",
    order: ["overview", "results", "journey", "benefits", "pricing", "faqs"],
    eyebrow: "The facial",
    overviewHeading: "A deep cleanse your skin can feel",
    resultsLabel: "Skin in focus",
    benefitsLabel: "Why clients love it",
    journeyLabel: "The ritual",
    journeyHeading: "Your facial, step by step",
    resultsSpeed: "Visible glow the same day",
    altSurface: true,
  },
  "Skin Rejuvenation": {
    toneClass: "tone-rose",
    hero: "editorial",
    order: ["overview", "benefits", "results", "journey", "pricing", "faqs"],
    eyebrow: "Skin renewal",
    overviewHeading: "Rebuilding skin from within",
    resultsLabel: "The transformation",
    benefitsLabel: "What it improves",
    journeyLabel: "Your programme",
    journeyHeading: "How your course of treatment runs",
    resultsSpeed: "Builds over 4–6 weeks",
  },
  "Scalp Health": {
    toneClass: "tone-forest",
    hero: "split",
    order: ["overview", "results", "journey", "benefits", "pricing", "faqs"],
    eyebrow: "Scalp care",
    overviewHeading: "Healthy hair starts at the scalp",
    resultsLabel: "Scalp results",
    benefitsLabel: "What it does for your scalp",
    journeyLabel: "In the chair",
    journeyHeading: "Your scalp session, step by step",
    resultsSpeed: "Fresher scalp immediately",
    altSurface: true,
  },
  PRP: {
    toneClass: "tone-plum",
    hero: "editorial",
    order: ["overview", "results", "journey", "benefits", "pricing", "faqs"],
    eyebrow: "Regenerative",
    overviewHeading: "Your own biology, put to work",
    resultsLabel: "Regeneration in pictures",
    benefitsLabel: "Why regenerative works",
    journeyLabel: "The process",
    journeyHeading: "From blood draw to recovery",
    resultsSpeed: "Progressive over 8–12 weeks",
  },
  Wellness: {
    toneClass: "tone-amber",
    hero: "split",
    order: ["overview", "benefits", "results", "journey", "pricing", "faqs"],
    eyebrow: "Wellbeing",
    overviewHeading: "Small appointment, big difference",
    benefitsLabel: "How you may feel",
    journeyLabel: "Your visit",
    journeyHeading: "A quick, straightforward appointment",
    resultsSpeed: "Typically felt within days",
    altSurface: true,
  },
  "Hay Fever Treatment": {
    toneClass: "tone-sky",
    hero: "split",
    order: ["overview", "benefits", "results", "journey", "faqs", "pricing"],
    eyebrow: "Seasonal relief",
    overviewHeading: "Relief for a full hay fever season",
    benefitsLabel: "What relief looks like",
    journeyLabel: "Your visit",
    journeyHeading: "A single, simple appointment",
    resultsSpeed: "Relief within 1–3 days",
    altSurface: true,
  },
  "Hair Removal": {
    toneClass: "tone-aqua",
    hero: "split",
    order: ["overview", "benefits", "results", "journey", "pricing", "faqs"],
    eyebrow: "Smooth skin",
    overviewHeading: "Permanent, hair-by-hair removal",
    resultsLabel: "The difference",
    benefitsLabel: "Why clients choose it",
    journeyLabel: "Your session",
    journeyHeading: "How a session runs, step by step",
    resultsSpeed: "Permanent once the follicle is treated",
    altSurface: true,
  },
  Consultation: {
    toneClass: "tone-forest",
    hero: "editorial",
    order: ["overview", "results", "journey", "benefits", "faqs", "pricing"],
    eyebrow: "Before we begin",
    overviewHeading: "Advice first, treatment second",
    benefitsLabel: "What you'll come away with",
    journeyLabel: "Your consultation",
    journeyHeading: "How the appointment runs",
    resultsSpeed: "A clear plan the same day",
  },
};

export function getTreatmentTheme(category: string): TreatmentTheme {
  return { ...DEFAULT_THEME, ...(THEMES[category] ?? {}) };
}
