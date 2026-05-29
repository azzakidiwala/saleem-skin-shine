import { Link } from "@tanstack/react-router";
import { treatments } from "@/data/treatments";

const FEATURED_SLUGS = [
  "deluxe-hydrafacial",
  "wet-diamond-hydrafacial",
  "promoitalia-lip-booster",
  "jawline-slimming-anti-wrinkle",
  "vtech-microneedling-led",
  "prp-facial-vampire",
];

const items = FEATURED_SLUGS.map((slug) => {
  const t = treatments.find((x) => x.slug === slug)!;
  return {
    slug: t.slug,
    img: t.image,
    title: t.name,
    desc: t.description,
    tags: t.benefits.slice(0, 3).map((b) => b.split(" ").slice(0, 3).join(" ")),
  };
});

export function Treatments() {
  return (
    <section id="treatments" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-4">Our Expertise</p>
          <h2 className="text-4xl md:text-5xl mb-5">Featured Treatments</h2>
          <p className="text-muted-foreground">
            From anti-wrinkle injections to advanced skin rejuvenation, our clinic offers the full spectrum of aesthetic dermatology treatments.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((t) => (
            <Link to="/treatments" key={t.title} className="bg-card border border-border group block hover:shadow-xl transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={t.img} alt={t.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-7">
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-gold transition-colors">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-gold border border-gold/40 px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-14">
          <Link to="/treatments" className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
            View All Treatments
          </Link>
        </div>
      </div>
    </section>
  );
}
