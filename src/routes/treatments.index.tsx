import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useTreatments, treatmentCategories } from "@/lib/content/queries";

export const Route = createFileRoute("/treatments/")({
  head: () => ({
    meta: [
      { title: "Aesthetic Treatments in Manchester — Saleem Skin" },
      { name: "description", content: "Explore our full range of award-winning aesthetic treatments at Saleem Skin Manchester — HydraFacial, injectables, PRP, skin rejuvenation and wellness." },
      { property: "og:title", content: "Aesthetic Treatments in Manchester — Saleem Skin" },
      { property: "og:description", content: "From advanced injectables to skin rejuvenation, HydraFacial and wellness treatments — all by award-winning specialists in Manchester." },
      { property: "og:url", content: "https://saleemskin.co.uk/treatments" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/treatments" }],
  }),
  component: TreatmentsPage,
});

function slugifyCat(c: string) {
  return "cat-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function TreatmentsPage() {
  const { data: treatments = [], isLoading } = useTreatments();

  // Ordered category list: base order first, then any extra categories from data
  const dynamicCats = Array.from(new Set(treatments.map((t) => t.category)));
  const ordered = Array.from(new Set([...treatmentCategories.slice(1), ...dynamicCats]));
  const groups = ordered
    .map((c) => ({ category: c, items: treatments.filter((t) => t.category === c) }))
    .filter((g) => g.items.length > 0);

  const [active, setActive] = useState<string>("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [groups.length]);

  // Scroll spy: highlight the category section currently in view
  useEffect(() => {
    if (groups.length === 0) return;
    const onScroll = () => {
      let current = groups[0].category;
      for (const g of groups) {
        const el = document.getElementById(slugifyCat(g.category));
        if (!el) continue;
        if (el.getBoundingClientRect().top - 140 <= 0) current = g.category;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [groups.map((g) => g.category).join("|")]);

  // Keep the active chip visible inside the pinned bar
  useEffect(() => {
    if (!active) return;
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const scrollCats = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const handleSelect = (c: string) => {
    setActive(c);
    document.getElementById(slugifyCat(c))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
              From advanced injectables to skin rejuvenation, HydraFacial and wellness treatments — all performed by our award-winning specialists.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-card sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4 relative">
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scrollCats(-1)}
              className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center h-10 w-10 rounded-full bg-background border border-border shadow-md hover:border-gold hover:text-gold transition-all ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth justify-start md:justify-center md:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {groups.map((g) => (
                <button
                  key={g.category}
                  data-cat={g.category}
                  onClick={() => handleSelect(g.category)}
                  className={`shrink-0 px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                    active === g.category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  {g.category}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scrollCats(1)}
              className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center h-10 w-10 rounded-full bg-background border border-border shadow-md hover:border-gold hover:text-gold transition-all ${canRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-20">
                {groups.map((g) => (
                  <div key={g.category} id={slugifyCat(g.category)} className="scroll-mt-28">
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="font-serif text-3xl md:text-4xl text-primary whitespace-nowrap">{g.category}</h2>
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">{g.items.length} treatment{g.items.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {g.items.map((t) => (
                        <Link
                          to="/treatments/$slug"
                          params={{ slug: t.slug }}
                          key={t.slug}
                          className="group bg-card border border-border overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="font-serif text-2xl text-primary mb-3 group-hover:text-gold transition-colors">{t.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.description}</p>
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
                  </div>
                ))}
              </div>
            )}
            {!isLoading && groups.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No treatments yet.</p>
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

