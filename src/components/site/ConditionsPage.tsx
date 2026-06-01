import { Link } from "@tanstack/react-router";
import { Sparkles, Check } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import type { Condition } from "@/data/conditions";
import { useSiteContent, getString } from "@/lib/content/queries";

type Props = {
  area: string;
  intro: string;
  conditions: Condition[];
  /** Content key prefix, e.g. "conditions.face" — used to override area/intro from site_content */
  contentKey?: string;
};

export function ConditionsPage({ area, intro, conditions, contentKey }: Props) {
  const { data: content } = useSiteContent();
  const eyebrow = contentKey
    ? getString(content, `${contentKey}.eyebrow`, `CONDITIONS · ${area.toUpperCase()}`)
    : `CONDITIONS · ${area.toUpperCase()}`;
  const title = contentKey
    ? getString(content, `${contentKey}.title`, `${area} Conditions`)
    : `${area} Conditions`;
  const introText = contentKey ? getString(content, `${contentKey}.intro`, intro) : intro;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <section className="py-20 md:py-28 bg-background text-center">
          <div className="container mx-auto px-4">
            <div className="text-gold text-[11px] tracking-[0.35em] mb-5">{eyebrow}</div>
            <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6">{title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{introText}</p>
          </div>
        </section>

        <section className="pb-20 md:pb-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {conditions.map((c) => (
                <article key={c.name} className="border border-border bg-card p-8 flex flex-col">
                  <h2 className="font-serif text-2xl text-primary flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-gold" />
                    {c.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.description}</p>
                  <div className="mt-auto">
                    <div className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium mb-3">
                      Treatment Options
                    </div>
                    <ul className="space-y-2">
                      {c.treatments.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-6">Not sure which treatment is right for you?</p>
              <Link
                to="/treatments"
                className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors"
              >
                View All Treatments
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
