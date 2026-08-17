import { Link } from "@tanstack/react-router";
import { useTreatments } from "@/lib/content/queries";

const FEATURED: { slug: string; tags: string[] }[] = [
  { slug: "deluxe-hydrafacial", tags: ["Cleanse", "Hydrate", "Glow"] },
  { slug: "wet-diamond-hydrafacial", tags: ["Diamond Tip", "Brightening", "Glass Skin"] },
  { slug: "promoitalia-lip-booster", tags: ["Lip Hydration", "Natural Plump", "Definition"] },
  { slug: "jawline-slimming-anti-wrinkle", tags: ["Jaw Slimming", "Bruxism", "Contour"] },
  { slug: "vtech-microneedling-led", tags: ["Collagen", "Scarring", "LED Therapy"] },
  { slug: "prp-facial-vampire", tags: ["Rejuvenation", "Tone", "Texture"] },
];

export function Treatments() {
  const { data: all } = useTreatments();
  const list = all ?? [];
  const featured = FEATURED.map(({ slug, tags }) => {
    const t = list.find((x) => x.slug === slug);
    return t ? { slug: t.slug, img: t.image, title: t.name, desc: t.description, tags } : null;
  }).filter(Boolean) as { slug: string; img: string; title: string; desc: string; tags: string[] }[];

  const items = featured.length
    ? featured
    : list.slice(0, 6).map((t) => ({ slug: t.slug, img: t.image, title: t.name, desc: t.description, tags: [t.category] }));

  return (
    <section id="treatments" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-4">Our Expertise</p>
          <h2 className="text-4xl md:text-5xl mb-5">Featured Treatments</h2>
          <p className="text-muted-foreground">
            From anti-wrinkle injections to advanced skin rejuvenation, our clinic offers the full spectrum of aesthetic dermatology treatments.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <Link to="/treatments/$slug" params={{ slug: t.slug }} key={t.slug} className="bg-card border border-border group block overflow-hidden transition-all duration-300 hover:border-gold/50 hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={t.img} alt={t.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
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
        <div className="mt-12">
          <Link to="/treatments" className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
            View All Treatments
          </Link>
        </div>
      </div>
    </section>
  );
}
