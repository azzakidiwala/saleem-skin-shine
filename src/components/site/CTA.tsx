import { Phone, Mail } from "lucide-react";
import bg from "@/assets/cta-bg.jpg";
import { WhatsAppIcon, whatsappHref } from "@/components/site/WhatsAppButton";
import { useSiteContent, getString } from "@/lib/content/queries";

export function CTA() {
  const { data: content } = useSiteContent();
  const eyebrow = getString(content, "cta.eyebrow", "Start Your Journey");
  const line1 = getString(content, "cta.title_line1", "Book Your Free Skin");
  const emph = getString(content, "cta.title_emphasis", "Consultation");
  const line2 = getString(content, "cta.title_line2", "Today");
  const body = getString(content, "cta.body", "Speak to one of our award-winning specialists and discover the right treatment for you.");
  const phone = getString(content, "cta.phone", "07503959285");
  const phoneDisplay = getString(content, "cta.phone_display", "07503 959285");
  const email = getString(content, "cta.email", "hello@saleemskin.co.uk");

  return (
    <section id="book" className="relative py-24 md:py-28 overflow-hidden">
      <img src={bg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative z-10 container mx-auto px-6 text-center text-primary-foreground max-w-3xl">
        <p id="c-cta-eyebrow" className="eyebrow mb-4">{eyebrow}</p>
        <h2 id="c-cta-title" className="text-4xl md:text-6xl mb-6 text-primary-foreground leading-tight">
          <span id="c-cta-title-line1">{line1}</span> <em id="c-cta-title-emphasis" className="text-gold not-italic italic">{emph}</em> <span id="c-cta-title-line2">{line2}</span>
        </h2>
        <p id="c-cta-body" className="text-lg text-primary-foreground/85 mb-10">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a id="c-cta-phone" href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
            <Phone className="h-4 w-4" /> {phoneDisplay}
          </a>
          <a id="c-cta-email" href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 border border-gold text-primary-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold hover:text-gold-foreground transition-colors">
            <Mail className="h-4 w-4" /> Email the Clinic
          </a>
        </div>
      </div>
    </section>
  );
}
