import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const reviews = [
  { quote: "Absolutely incredible results — my skin has never looked better. The team is professional, kind and genuinely passionate about what they do.", name: "Mona H.", treatment: "Skin Rejuvenation" },
  { quote: "I was nervous about my first appointment but the consultation put me completely at ease. Natural, beautiful results.", name: "Sarah K.", treatment: "Dermal Fillers" },
  { quote: "Award-winning is an understatement. The attention to detail and aftercare is second to none.", name: "Priya R.", treatment: "Anti-Wrinkle" },
  { quote: "I've been a patient for 3 years and wouldn't trust anyone else with my skin. Truly exceptional clinic.", name: "Emma L.", treatment: "Advanced Facials" },
  { quote: "From the moment you walk in, the experience is luxurious yet medical-grade. Highly recommend.", name: "James M.", treatment: "Laser Treatment" },
];

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, []);
  const r = reviews[idx];
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <p className="eyebrow mb-4">Patient Reviews</p>
        <h2 className="text-4xl md:text-5xl mb-6 text-primary-foreground">What Our Patients Say</h2>
        <div className="flex items-center justify-center gap-3 mb-14">
          <div className="flex gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <span className="text-sm text-primary-foreground/80">5.0 · 14 reviews</span>
        </div>
        <div className="relative border border-gold/30 p-10 md:p-16">
          <Quote className="h-10 w-10 text-gold mx-auto mb-6" />
          <p className="font-display text-2xl md:text-3xl italic text-primary-foreground leading-relaxed mb-8 min-h-[120px]">
            "{r.quote}"
          </p>
          <p className="font-semibold">{r.name}</p>
          <p className="text-sm text-gold mt-1">{r.treatment}</p>

          <button onClick={() => setIdx((idx - 1 + reviews.length) % reviews.length)} className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-gold-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setIdx((idx + 1) % reviews.length)} className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-gold-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1 transition-all ${i === idx ? "w-8 bg-gold" : "w-2 bg-primary-foreground/30"}`} aria-label={`Go to review ${i+1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
