import { Phone, Mail } from "lucide-react";
import bg from "@/assets/cta-bg.jpg";

export function CTA() {
  return (
    <section id="book" className="relative py-28 md:py-40 overflow-hidden">
      <img src={bg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative z-10 container mx-auto px-6 text-center text-primary-foreground max-w-3xl">
        <p className="eyebrow mb-4">Start Your Journey</p>
        <h2 className="text-4xl md:text-6xl mb-6 text-primary-foreground leading-tight">
          Book Your Free Skin <em className="text-gold not-italic italic">Consultation</em> Today
        </h2>
        <p className="text-lg text-primary-foreground/85 mb-12">
          Speak to one of our award-winning specialists and discover the right treatment for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a href="tel:07503959285" className="inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
            <Phone className="h-4 w-4" /> 07503 959285
          </a>
          <a href="mailto:hello@saleemskin.co.uk" className="inline-flex items-center justify-center gap-2 border border-gold text-primary-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold hover:text-gold-foreground transition-colors">
            <Mail className="h-4 w-4" /> Email the Clinic
          </a>
        </div>
      </div>
    </section>
  );
}
