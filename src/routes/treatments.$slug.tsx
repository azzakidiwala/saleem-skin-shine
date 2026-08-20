import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Calendar, Check, Phone, Sparkles, BadgePoundSterling } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { fetchTreatmentBySlug, fetchTreatments, type Treatment } from "@/lib/content/queries";


export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const treatment = await fetchTreatmentBySlug(params.slug);
    if (!treatment || !treatment.is_active) throw notFound();
    const all = await fetchTreatments();
    return { treatment, all };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const url = `https://saleemskin.co.uk/treatments/${params.slug}`;
    return {
      meta: [
        { title: `${loaderData.treatment.name} — Saleem Skin` },
        { name: "description", content: loaderData.treatment.description },
        { property: "og:title", content: `${loaderData.treatment.name} — Saleem Skin` },
        { property: "og:description", content: loaderData.treatment.description },
        { property: "og:image", content: loaderData.treatment.image },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: loaderData.treatment.image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.treatment.name,
            description: loaderData.treatment.description,
            image: loaderData.treatment.image,
            category: loaderData.treatment.category,
            url,
            provider: {
              "@type": "HealthAndBeautyBusiness",
              name: "Saleem Skin",
              url: "https://saleemskin.co.uk/",
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-primary mb-4">Treatment not found</h1>
        <Link to="/treatments" className="text-gold underline">Back to Treatments</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: TreatmentDetailPage,
});

function TreatmentDetailPage() {
  const { treatment: t, all } = Route.useLoaderData();

  const related: Treatment[] = (all as Treatment[])
    .filter((x: Treatment) => x.slug !== t.slug && x.category === t.category)
    .slice(0, 3)
    .concat((all as Treatment[]).filter((x: Treatment) => x.slug !== t.slug && x.category !== t.category))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <section className="relative h-[420px] md:h-[460px] overflow-hidden">
          <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-16">
            <Link to="/treatments" className="inline-flex items-center gap-2 text-white/90 hover:text-gold text-sm mb-5 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Treatments
            </Link>
            <div className="text-gold text-[11px] tracking-[0.35em] uppercase mb-3">{t.category}</div>
            <h1 className="font-serif text-4xl md:text-6xl text-white">{t.name}</h1>
          </div>
        </section>

        {/* Quick facts strip */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { icon: Clock, label: "Treatment time", value: t.duration || "Varies" },
              { icon: Sparkles, label: "Results", value: "Immediate, settles in 2 weeks" },
              { icon: Calendar, label: "Sessions", value: t.sessions || "Tailored to you" },
              { icon: BadgePoundSterling, label: "From", value: fromPrice },
            ].map((f, i) => (
              <div key={f.label} className={`py-7 px-5 ${i > 1 ? "border-t md:border-t-0 border-white/10" : ""}`}>
                <f.icon className="h-4 w-4 text-gold mb-3" />
                <div className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/60 mb-1">{f.label}</div>
                <div className="text-sm font-semibold">{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Overview */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-4">Overview</p>
                <h2 className="text-3xl md:text-4xl mb-6">{t.description ? "What this treatment does" : "About this treatment"}</h2>
                <p className="text-lg text-foreground/80 leading-relaxed mb-6">{t.description}</p>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
              <aside className="lg:col-span-5">
                <div className="bg-card border border-border p-7 lg:sticky lg:top-28">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">Investment</div>
                  <div className="text-3xl text-gold font-medium mb-6">{t.price}</div>
                  {t.priceOptions?.length > 0 && (
                    <div className="mb-6 border-t border-border pt-5 space-y-2 max-h-64 overflow-y-auto pr-1">
                      {t.priceOptions.map((o) => (
                        <div key={o.label + o.price} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">{o.label}</span>
                          <span className="font-semibold text-foreground">{o.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    <Link
                      to="/book/$slug"
                      params={{ slug: t.slug }}
                      className="w-full inline-flex items-center justify-center bg-gold text-gold-foreground py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-colors"
                    >
                      Book Treatment
                    </Link>
                    <a
                      href="tel:07503959285"
                      className="w-full inline-flex items-center justify-center gap-2 border border-primary text-primary py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call to Book
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Benefits */}
        {t.benefits.length > 0 && (
          <section className="py-16 md:py-20 bg-card border-y border-border">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mb-10">
                <p className="eyebrow mb-4">Why patients choose it</p>
                <h2 className="text-3xl md:text-4xl">Key benefits</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {t.benefits.map((b: string, i: number) => (
                  <div key={b} className="bg-background border border-border p-6 hover:border-gold/50 transition-colors">
                    <div className="text-gold text-xs tracking-[0.25em] mb-3">{String(i + 1).padStart(2, "0")}</div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Before & after */}
        {t.beforeAfter.length > 0 && (
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <p className="eyebrow mb-4">Real results</p>
                <h2 className="text-3xl md:text-4xl mb-5">Before &amp; after</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Slide across each image to see the difference. Every plan is designed around your own facial anatomy, so
                  outcomes are subtle, proportionate and unique to you.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {["Assessed and treated by our doctor and nurse-led team", "Photography taken in the same lighting and position", "Results shown once initial swelling has settled"].map((x) => (
                    <li key={x} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" /> <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <BeforeAfterSlider pairs={t.beforeAfter} />
            </div>
          </section>
        )}

        {/* Journey */}
        {steps.length > 0 && (
          <section className="py-16 md:py-24 bg-primary text-primary-foreground">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mb-12">
                <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-4">Your appointment</p>
                <h2 className="text-3xl md:text-4xl">What to expect, step by step</h2>
              </div>
              <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((s, i) => (
                  <li key={i} className="border-t border-white/15 pt-5">
                    <div className="text-gold text-sm mb-3">Step {i + 1}</div>
                    <p className="text-sm text-primary-foreground/80 leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Pricing */}
        {t.priceOptions?.length > 0 && (
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mb-10">
                <p className="eyebrow mb-4">Pricing</p>
                <h2 className="text-3xl md:text-4xl">Transparent, per-treatment pricing</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {t.priceOptions.map((o) => (
                  <div key={o.label + o.price} className="flex items-baseline justify-between gap-4 border border-border bg-card px-6 py-5">
                    <span className="text-sm text-muted-foreground">{o.label}</span>
                    <span className="text-lg font-semibold text-foreground">{o.price}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/book/$slug"
                params={{ slug: t.slug }}
                className="mt-10 inline-flex items-center justify-center bg-gold text-gold-foreground px-10 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-colors"
              >
                Book {t.name}
              </Link>
            </div>
          </section>
        )}

        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-6">
            <h2 className="font-serif text-3xl text-primary text-center mb-10">Other Treatments You May Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r: Treatment) => (
                <Link
                  to="/treatments/$slug"
                  params={{ slug: r.slug }}
                  key={r.slug}
                  className="group bg-background border border-border overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] tracking-[0.25em] uppercase text-gold mb-2">{r.category}</div>
                    <h3 className="font-serif text-xl text-primary group-hover:text-gold transition-colors">{r.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        <CTA />
      </main>
      <Footer />
    </div>
  );
}
