import { Award, Star, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero-facial.jpg";
import { useSiteContent, getString } from "@/lib/content/queries";

const trust = [
  { icon: Award, label: "Award-winning clinic" },
  { icon: ShieldCheck, label: "Medical-grade care" },
  { icon: Clock, label: "Same-week appointments" },
];

export function Hero() {
  const { data: content } = useSiteContent();
  const eyebrow = getString(content, "hero.eyebrow", "Best Aesthetics Clinic North 2025");
  const line1 = getString(content, "hero.title_line1", "Delivering");
  const emph = getString(content, "hero.title_emphasis", "Exceptional");
  const line2 = getString(content, "hero.title_line2", "Skin, Health & Wellness");
  const subtitle = getString(content, "hero.subtitle", "Advanced aesthetic treatments by award-winning specialists — personalised to your skin, delivered in a calm Manchester clinic.");
  const heroImage = getString(content, "hero.image_url", "") || hero;

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-background">
      <img
        id="c-hero-image"
        src={heroImage}
        alt="Luxury aesthetic treatment room at Saleem Skin"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-14 md:pt-28 md:pb-20 max-w-6xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3 border border-gold/40 bg-background/40 backdrop-blur-sm px-4 py-2 mb-8">
            <span className="flex gap-0.5 text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </span>
            <span className="h-3 w-px bg-gold/40" />
            <span id="c-hero-eyebrow" className="text-[11px] tracking-[0.2em] uppercase text-foreground/85">
              {eyebrow}
            </span>
          </div>

          <h1 id="c-hero-title" className="font-display text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight text-foreground">
            <span id="c-hero-title-line1">{line1}</span>{" "}
            <span id="c-hero-title-emphasis" className="text-gradient-gold">{emph}</span>
            <br />
            <span id="c-hero-title-line2">{line2}</span>
          </h1>

          <p id="c-hero-subtitle" className="mt-7 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link
              to="/book/$slug"
              params={{ slug: "new-consultation" }}
              className="group inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold-soft transition-colors"
            >
              Book Free Consultation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/treatments"
              className="inline-flex items-center justify-center border border-foreground/25 text-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:border-gold hover:text-gold transition-colors"
            >
              Browse Treatments
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground">
                <t.icon className="h-4 w-4 text-gold" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative z-10 h-px w-full hairline-gold" />
    </section>
  );
}
