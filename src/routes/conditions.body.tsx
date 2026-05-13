import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
import { bodyConditions } from "@/data/conditions";

export const Route = createFileRoute("/conditions/body")({
  head: () => ({
    meta: [
      { title: "Body Conditions — Saleem Skin Manchester" },
      { name: "description", content: "Body condition treatments including stubborn fat, cellulite, loose skin, spider veins and more at Saleem Skin Manchester." },
      { property: "og:title", content: "Body Conditions — Saleem Skin Manchester" },
      { property: "og:description", content: "Targeted body treatments tailored to your goals at our award-winning Manchester clinic." },
      { property: "og:url", content: "https://saleemskin.co.uk/conditions/body" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/conditions/body" }],
  }),
  component: () => (
    <ConditionsPage
      area="Body"
      intro="Targeted treatments for the body — from stubborn fat and cellulite to loose skin and spider veins — designed around your goals."
      conditions={bodyConditions}
    />
  ),
});
