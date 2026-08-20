import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Calendar, Check, Phone, Sparkles, BadgePoundSterling } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { StackedBenefits } from "@/components/site/StackedBenefits";
import { fetchTreatmentBySlug, fetchTreatments, type Treatment } from "@/lib/content/queries";
import { getTreatmentTheme, type SectionKey } from "@/lib/content/treatmentTheme";

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
        ...(((loaderData.treatment.faqs ?? []).length > 0)
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: (loaderData.treatment.faqs ?? []).map((f) => ({
                    "@type": "Question",
                    name: f.question,
                    acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
                }),
              },
            ]
          : []),
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
  const theme = getTreatmentTheme(t.category);

  const related: Treatment[] = (all as Treatment[])
    .filter((x: Treatment) => x.slug !== t.slug && x.category === t.category)
    .slice(0, 3)
    .concat((all as Treatment[]).filter((x: Treatment) => x.slug !== t.slug && x.category !== t.category))
    .slice(0, 3);

  const paragraphs: string[] = (t.longDescription || "")
    .split(/\n{2,}|\n/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  const steps: string[] = (t.whatToExpect || "")
    .split(/(?<=\.)\s+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  const fromPrice = t.priceOptions?.length ? t.priceOptions[0].price : t.price || "On consultation";

  const bookButtons = (
    <div className="space-y-2">
      <Link
        to="/book/$slug"
        params={{ slug: t.slug }}
        className="w-full inline-flex items-center justify-center bg-tone text-tone-foreground py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity"
      >
        Book Treatment
      </Link>
      <a
        href="tel:07503959285"
        className="w-full inline-flex items-center justify-center gap-2 border border-primary text-primary py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Phone className="h-3.5 w-3.5" /> Call to Book
      </a>
    </div>
  );

  const backLink = (tone: "light" | "dark") => (
    <Link
      to="/treatments"
      className={`inline-flex items-center gap-2 text-sm mb-5 transition-colors ${
        tone === "dark" ? "text-white/90 hover:text-gold-soft" : "text-muted-foreground hover:text-tone"
      }`}
    >
      <ArrowLeft className="h-4 w-4" /> Back to Treatments
    </Link>
  );

  /* ---------- Hero variants ---------- */
  const hero =
    theme.hero === "split" ? (
      <section className="bg-tone-surface border-b border-border">
        <div className="container mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            {backLink("light")}
            <div className="text-[11px] tracking-[0.35em] uppercase text-tone mb-3">{t.category}</div>
            <h1 className="font-serif text-4xl md:text-5xl text-primary mb-5">{t.name}</h1>
            <p className="text-lg text-foreground/75 leading-relaxed max-w-xl">{t.description}</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 bg-tone/15 hidden md:block" aria-hidden />
            <img src={t.image} alt={t.name} className="relative w-full h-[300px] md:h-[420px] object-cover" />
          </div>
        </div>
      </section>
    ) : theme.hero === "editorial" ? (
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-12 md:py-20 max-w-4xl text-center">
          {backLink("light")}
          <div className="text-[11px] tracking-[0.35em] uppercase text-tone mb-4">{t.category}</div>
          <h1 className="font-serif text-4xl md:text-6xl text-primary mb-6">{t.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">{t.description}</p>
          <img src={t.image} alt={t.name} className="w-full h-[240px] md:h-[340px] object-cover" />
        </div>
      </section>
    ) : (
      <section className="relative h-[420px] md:h-[460px] overflow-hidden">
        <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-end pb-16">
          {backLink("dark")}
          <div className="text-gold-soft text-[11px] tracking-[0.35em] uppercase mb-3">{t.category}</div>
          <h1 className="font-serif text-4xl md:text-6xl text-white">{t.name}</h1>
        </div>
      </section>
    );

  /* ---------- Sections ---------- */
  const sections: Record<SectionKey, React.ReactNode> = {
    overview: (
      <section key="overview" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4 text-tone">{theme.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl mb-6">{theme.overviewHeading}</h2>
              {theme.hero === "immersive" && (
                <p className="text-lg text-foreground/80 leading-relaxed mb-6">{t.description}</p>
              )}
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="bg-card border border-border p-5 lg:sticky lg:top-28">
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">Investment</div>
                <div className="text-2xl text-tone font-medium mb-4">{t.price}</div>
                {t.priceOptions?.length > 0 && (
                  <div className="mb-4 border-t border-border pt-3 space-y-1">
                    {t.priceOptions.map((o) => (
                      <div key={o.label + o.price} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{o.label}</span>
                        <span className="font-semibold text-foreground">{o.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                {bookButtons}
              </div>
            </aside>
          </div>
        </div>
      </section>
    ),
    results: t.beforeAfter.length > 0 ? (
      <section key="results" className={`py-16 md:py-24 ${theme.altSurface ? "bg-tone-surface" : "bg-background"}`}>
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-4 text-tone">{theme.resultsLabel}</p>
            <h2 className="text-3xl md:text-4xl mb-5">Before &amp; after</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Slide across each image to see the difference. Every plan is designed around your own anatomy and skin, so
              outcomes are subtle, proportionate and unique to you.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Assessed and treated by our doctor and nurse-led team",
                "Photography taken in the same lighting and position",
                "Results shown once initial swelling has settled",
              ].map((x) => (
                <li key={x} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-tone shrink-0 mt-0.5" /> <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <BeforeAfterSlider pairs={t.beforeAfter} />
        </div>
      </section>
    ) : null,
    benefits: t.benefits.length > 0 ? (
      <section key="benefits" className="py-16 md:py-20 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <p className="eyebrow mb-4 text-tone">{theme.benefitsLabel}</p>
          <StackedBenefits benefits={t.benefits} />
        </div>
      </section>
    ) : null,
    journey: steps.length > 0 ? (
      <section key="journey" className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold-soft mb-4">{theme.journeyLabel}</p>
            <h2 className="text-3xl md:text-4xl">{theme.journeyHeading}</h2>
          </div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <li key={i} className="border-t border-white/15 pt-5">
                <div className="text-gold-soft text-sm mb-3">Step {i + 1}</div>
                <p className="text-sm text-primary-foreground/80 leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    ) : null,
    pricing: t.priceOptions?.length > 0 ? (
      <section key="pricing" className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="eyebrow mb-4 text-tone">Pricing</p>
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
            className="mt-10 inline-flex items-center justify-center bg-tone text-tone-foreground px-10 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity"
          >
            Book {t.name}
          </Link>
        </div>
      </section>
    ) : null,
    faqs: (t.faqs ?? []).length > 0 ? (
      <section key="faqs" className="py-16 border-t border-border" aria-labelledby="treatment-faqs">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-[10px] tracking-[0.25em] uppercase text-tone mb-3 text-center">Good to know</div>
          <h2 id="treatment-faqs" className="font-serif text-3xl text-primary text-center mb-10">
            {t.name} — Frequently Asked Questions
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {(t.faqs ?? []).map((f, i) => (
              <details key={i} className="group py-5" open={i === 0}>
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                  <h3 className="font-medium text-base text-foreground">{f.question}</h3>
                  <span className="mt-1 shrink-0 text-tone transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    ) : null,
  };

  return (
    <div className={`min-h-screen bg-background ${theme.toneClass}`}>
      <AnnouncementBar />
      <Header />
      <main>
        {hero}

        {/* Quick facts strip */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { icon: Clock, label: "Treatment time", value: t.duration || "Varies" },
              { icon: Sparkles, label: "Results", value: theme.resultsSpeed },
              { icon: Calendar, label: "Sessions", value: t.sessions || "Tailored to you" },
              { icon: BadgePoundSterling, label: "From", value: fromPrice },
            ].map((f, i) => (
              <div key={f.label} className={`py-7 px-5 ${i > 1 ? "border-t md:border-t-0 border-white/10" : ""}`}>
                <f.icon className="h-4 w-4 text-tone-soft mb-3" />
                <div className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/60 mb-1">{f.label}</div>
                <div className="text-sm font-semibold">{f.value}</div>
              </div>
            ))}
          </div>
        </section>

        {theme.order.map((key) => sections[key])}

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
                    <div className="text-[10px] tracking-[0.25em] uppercase text-tone mb-2">{r.category}</div>
                    <h3 className="font-serif text-xl text-primary group-hover:text-tone transition-colors">{r.name}</h3>
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
