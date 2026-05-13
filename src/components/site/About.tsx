import { Award, ShieldCheck, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import about from "@/assets/about-clinic.jpg";
import { useSiteContent, getString } from "@/lib/content/queries";

const pillars = [
  { icon: Award, title: "Expert Practitioners", desc: "Our team of qualified dermatologists and aesthetic specialists bring decades of combined experience." },
  { icon: ShieldCheck, title: "Clinically Proven", desc: "Every treatment we offer is backed by clinical evidence and performed to the highest medical standards." },
  { icon: Heart, title: "Personalised Care", desc: "We create bespoke treatment plans tailored to your unique skin type, concerns and goals." },
];

export function About() {
  const { data: content } = useSiteContent();
  const eyebrow = getString(content, "about.eyebrow", "About Saleem Skin");
  const title = getString(content, "about.title", "Your Trusted Skin Clinic for Advanced Dermatology & Aesthetic Treatments");
  const body = getString(content, "about.body", "Saleem Skin is a premium aesthetic clinic dedicated to delivering outstanding skin care results.");
  const years = getString(content, "about.years", "15+");
  const aboutImage = getString(content, "about.image_url", "") || about;

  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img src={aboutImage} alt="Saleem Skin clinic interior" loading="lazy" className="w-full aspect-[4/5] object-cover" />
            <div className="absolute -bottom-px right-8 bg-gold text-gold-foreground px-10 py-6 text-center">
              <div className="text-3xl font-display font-semibold">{years}</div>
              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold">Years Experience</div>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h2 className="text-3xl md:text-4xl mb-6 leading-tight">{title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-10">{body}</p>
            <div className="space-y-6 mb-10">
              {pillars.map(p => (
                <div key={p.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 border border-gold/40 flex items-center justify-center text-gold">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/team" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-primary/90 transition-colors">
              Meet Our Specialists
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
