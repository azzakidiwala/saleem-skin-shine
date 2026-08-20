import { Check, ShieldCheck, Stethoscope, CalendarCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Props = {
  benefits: string[];
  label?: string;
  treatmentName?: string;
  slug?: string;
  intro?: string;
};

export function StackedBenefits({ benefits, label, treatmentName, slug, intro }: Props) {
  const assurances = [
    { icon: Stethoscope, title: "Doctor & nurse-led", text: "Every plan is assessed and delivered by our clinical team." },
    { icon: ShieldCheck, title: "Honest advice", text: "If a treatment isn't right for you, we'll tell you and suggest an alternative." },
    { icon: CalendarCheck, title: "Aftercare included", text: "Written aftercare and a review appointment whenever it's needed." },
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      <div className="lg:col-span-5 lg:sticky lg:top-28">
        {label && <p className="eyebrow mb-4">{label}</p>}
        <h2 className="text-3xl md:text-4xl mb-5">Key benefits</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {intro ||
            `What ${treatmentName ?? "this treatment"} can do for you — assessed in clinic and tailored to your skin, anatomy and goals.`}
        </p>

        <ul className="space-y-5 border-t border-border pt-6">
          {assurances.map((a) => (
            <li key={a.title} className="flex gap-4">
              <a.icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground mb-1">{a.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {slug && (
          <Link
            to="/book/$slug"
            params={{ slug }}
            className="mt-8 inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity"
          >
            Book {treatmentName ?? "Treatment"}
          </Link>
        )}
      </div>

      <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
        {benefits.map((b, i) => (
          <div key={b} className="bg-card border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-6 w-6 rounded-full bg-gold text-gold-foreground flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div className="text-gold text-xs tracking-[0.25em]">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
