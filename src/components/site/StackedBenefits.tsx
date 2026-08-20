import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export function StackedBenefits({ benefits }: { benefits: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(id);
  }, [benefits.length]);

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="relative h-[360px] sm:h-[320px]">
        {benefits.map((b, i) => {
          const offset = (i - active + benefits.length) % benefits.length;
          const isActive = offset === 0;
          return (
            <div
              key={b}
              className="absolute inset-x-0 top-0 bg-card border border-border p-7 sm:p-8 shadow-sm transition-all duration-500 ease-out"
              style={{
                transform: `translateY(${offset * 24}px) scale(${isActive ? 1 : 1 - offset * 0.04})`,
                zIndex: benefits.length - offset,
                opacity: isActive ? 1 : Math.max(0.25, 1 - offset * 0.28),
              }}
            >
              <div className="text-gold text-xs tracking-[0.25em] mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed">
                {b}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <p className="eyebrow mb-4">Why patients choose it</p>
        <h2 className="text-3xl md:text-4xl mb-8">Key benefits</h2>
        <ul className="space-y-4">
          {benefits.map((b, i) => (
            <li key={b} className="flex items-start gap-3">
              <div
                className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  i === active ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Check className="h-3 w-3" />
              </div>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`text-left text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                  i === active ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex gap-2">
          {benefits.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show benefit ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-gold" : "w-4 bg-border hover:bg-gold/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
