import antiWrinkle from "@/assets/treatment-anti-wrinkle.jpg";
import fillers from "@/assets/treatment-fillers.jpg";
import rejuvenation from "@/assets/treatment-rejuvenation.jpg";
import laser from "@/assets/treatment-laser.jpg";
import body from "@/assets/treatment-body.jpg";
import facial from "@/assets/treatment-facial.jpg";

const items = [
  {
    img: antiWrinkle,
    title: "Anti-Wrinkle Injections",
    desc: "Reduce the appearance of fine lines and wrinkles with precision-targeted injections for a refreshed, youthful look.",
    tags: ["Fine Lines", "Crow's Feet", "Forehead Lines"],
  },
  {
    img: fillers,
    title: "Dermal Fillers",
    desc: "Restore lost volume and enhance facial contours with advanced hyaluronic acid fillers tailored to your features.",
    tags: ["Lip Enhancement", "Cheek Contouring", "Jawline"],
  },
  {
    img: rejuvenation,
    title: "Skin Rejuvenation",
    desc: "Transform your complexion with our cutting-edge skin rejuvenation treatments including chemical peels and microneedling.",
    tags: ["Acne Scars", "Pigmentation", "Texture"],
  },
  {
    img: laser,
    title: "Laser Treatments",
    desc: "State-of-the-art laser therapy for hair removal, vascular lesions and skin resurfacing with proven results.",
    tags: ["Hair Removal", "Resurfacing", "Pigment"],
  },
  {
    img: body,
    title: "Body Contouring",
    desc: "Sculpt and refine your silhouette with non-surgical body contouring backed by clinical evidence.",
    tags: ["Fat Reduction", "Skin Tightening", "Cellulite"],
  },
  {
    img: facial,
    title: "Advanced Facials",
    desc: "Bespoke facial treatments combining medical-grade products with expert techniques for radiant skin.",
    tags: ["Hydrafacial", "Dermaplaning", "LED Therapy"],
  },
];

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
            <article key={t.title} className="bg-card border border-border group">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={t.img} alt={t.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-7">
                <h3 className="text-xl font-semibold text-foreground mb-3">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-gold border border-gold/40 px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
