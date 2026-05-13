import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
import { skinConditions } from "@/data/conditions";

export const Route = createFileRoute("/conditions/skin")({
  head: () => ({
    meta: [
      { title: "Skin Conditions — Saleem Skin Manchester" },
      { name: "description", content: "Treatments for skin conditions including rosacea, hyperpigmentation, sun damage, wrinkles and more at Saleem Skin Manchester." },
      { property: "og:title", content: "Skin Conditions — Saleem Skin Manchester" },
      { property: "og:description", content: "Expert care for skin conditions at our award-winning Manchester clinic." },
      { property: "og:url", content: "https://saleemskin.co.uk/conditions/skin" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/conditions/skin" }],
  }),
  component: () => (
    <ConditionsPage
      area="Skin"
      intro="From rosacea and hyperpigmentation to wrinkles and sun damage — bespoke skincare and clinical treatments to restore healthy, glowing skin."
      conditions={skinConditions}
    />
  ),
});
