import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
import { faceConditions } from "@/data/conditions";

export const Route = createFileRoute("/conditions/face")({
  head: () => ({
    meta: [
      { title: "Face Conditions — Saleem Skin Manchester" },
      { name: "description", content: "Treatments for common face conditions including acne, acne scarring, dark circles and double chin at Saleem Skin Manchester." },
      { property: "og:title", content: "Face Conditions — Saleem Skin Manchester" },
      { property: "og:description", content: "Bespoke treatment plans for face conditions at our award-winning Manchester clinic." },
      { property: "og:url", content: "https://saleemskin.co.uk/conditions/face" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/conditions/face" }],
  }),
  component: () => (
    <ConditionsPage
      area="Face"
      intro="From acne to dark circles, our Skin Health Practitioners assess each concern and design a bespoke treatment plan tailored to your skin."
      conditions={faceConditions}
      contentKey="conditions.face"
    />
  ),
});
