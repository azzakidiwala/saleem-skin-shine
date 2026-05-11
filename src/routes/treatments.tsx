import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { treatments, categories } from "@/data/treatments";

export const Route = createFileRoute("/treatments")({
  head: () => ({
    meta: [
      { title: "Our Treatments — Saleem Skin" },
      {
        name: "description",
        content:
          "Explore our full range of award-winning aesthetic treatments — HydraFacial, injectables, PRP, skin rejuvenation and wellness.",
      },
      { property: "og:title", content: "Our Treatments — Saleem Skin" },
      {
        property: "og:description",
        content:
          "From advanced injectables to skin rejuvenation, HydraFacial and wellness treatments — all by award-winning specialists.",
      },
    ],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? treatments : treatments.filter((t) => t.category === active);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <section className="py-20 md:py-28 bg-background text-center">
          <div className="container mx-auto px-4">
            <div className="text-gold text-[11px] tracking-[0.35em] mb-5">SALEEM SKIN</div>
            <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6">Our Treatments</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From advanced injectables to skin rejuvenation, HydraFacial and wellness
              treatments — all performed by our award-winning specialists.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-card sticky top-0 z-30">
          <div className="container mx-auto px-4 py-5">
            <div className="flex gap-3 overflow-x-auto justify-start md:justify-center">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`shrink-0 px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                    active === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((t) => (
                <Link
                  to="/treatments/$slug"
                  params={{ slug: t.slug }}
                  key={t.slug}
                  className="group bg-card border border-border overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                      {t.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="font-serif text-2xl text-primary mb-3 group-hover:text-gold transition-colors">{t.name}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {t.description}
                    </p>
                    <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                      <span className="text-gold font-medium">{t.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t.duration}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No treatments in this category yet.
              </p>
            )}
            <div className="text-center mt-16">
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
