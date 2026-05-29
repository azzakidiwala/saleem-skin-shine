// Maps slug/name → bundled fallback image. Used when DB image_url is empty.
import facial from "@/assets/treatment-facial.jpg";
import deluxeHydrafacial from "@/assets/treatment-deluxe-hydrafacial.jpg";
import rejuvenation from "@/assets/treatment-rejuvenation.jpg";
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
import drSaleem from "@/assets/team-dr-saleem.jpg";
import rnSaleem from "@/assets/team-rn-saleem.jpg";
import hSaleem from "@/assets/team-h-saleem.jpg";
import hero from "@/assets/hero-facial.jpg";
import ctaBg from "@/assets/cta-bg.jpg";

export const treatmentImageFallback: Record<string, string> = {
  "new-consultation": clinic,
  "deluxe-hydrafacial": deluxeHydrafacial,
  "wet-diamond-hydrafacial": wetDiamond,
  "promoitalia-lip-booster": promoitaliaLipBooster,
  "traptox": traptox,
  "jawline-slimming-anti-wrinkle": jawlineSlimming,
  "vtech-microneedling-led": vtechMicroneedling,
  "prp-hair-scalp": prpHair,
  "prp-facial-vampire": rejuvenation,
  "hay-fever-treatment": hayFever,
  "vitamin-b12-single": body,
  "vitamin-b12-course": body,
};

export const teamImageFallback: Record<string, string> = {
  "Dr. Saleem": drSaleem,
  "RN Saleem": rnSaleem,
  "H. Saleem": hSaleem,
};

export const defaultImages = {
  facial,
  fillers,
  rejuvenation,
  antiWrinkle,
  laser,
  body,
  clinic,
  hero,
  ctaBg,
};

export function resolveTreatmentImage(slug: string, image_url?: string | null): string {
  if (image_url && image_url.length > 0) return image_url;
  return treatmentImageFallback[slug] ?? clinic;
}

export function resolveTeamImage(name: string, image_url?: string | null): string {
  if (image_url && image_url.length > 0) return image_url;
  return teamImageFallback[name] ?? clinic;
}
