import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Calendar, Check, Phone } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { fetchTreatmentBySlug, fetchTreatments } from "@/lib/content/queries";

export const Route = createFileRoute("/treatments/$slug")({
  loader: async ({ params }) => {
    const treatment = await fetchTreatmentBySlug(params.slug);
    if (!treatment || !treatment.is_active) throw notFound();
    const all = await fetchTreatments();
    return { treatment, all };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.treatment.name} — Saleem Skin` },
          { name: "description", content: loaderData.treatment.description },
          { property: "og:title", content: `${loaderData.treatment.name} — Saleem Skin` },
          { property: "og:description", content: loaderData.treatment.description },
          { property: "og:image", content: loaderData.treatment.image },
        ]
      : [],
  }),
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

  const related = all
    .filter((x) => x.slug !== t.slug && x.category === t.category)
    .slice(0, 3)
    .concat(all.filter((x) => x.slug !== t.slug && x.category !== t.category))
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

        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">About This Treatment</h2>
                <p className="text-muted-foreground leading-relaxed">{t.longDescription}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {t.benefits.map((b: string) => (
                    <li key={b} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">What to Expect</h3>
                <p className="text-muted-foreground leading-relaxed">{t.whatToExpect}</p>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-card border border-border p-7 lg:sticky lg:top-28">
                <div className="text-2xl text-gold font-medium mb-6">{t.price}</div>
                <div className="space-y-4 pb-6 border-b border-border">
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground">Duration: </span>
                      <span className="text-muted-foreground">{t.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Recommended sessions:</div>
                      <div className="text-muted-foreground">{t.sessions}</div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 space-y-3">
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
        </section>

        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-6">
            <h2 className="font-serif text-3xl text-primary text-center mb-10">Other Treatments You May Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
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
