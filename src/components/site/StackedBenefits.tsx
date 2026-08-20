import { Check } from "lucide-react";

export function StackedBenefits({ benefits }: { benefits: string[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      <div>
        <p className="eyebrow mb-4">Why patients choose it</p>
        <h2 className="text-3xl md:text-4xl">Key benefits</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {benefits.map((b, i) => (
          <div
            key={b}
            className="bg-card border border-border p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-6 w-6 rounded-full bg-gold text-gold-foreground flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div className="text-gold text-xs tracking-[0.25em]">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              {b}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
