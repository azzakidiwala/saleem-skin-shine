import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, GraduationCap, Award, Sparkles, Gem, Flower2 } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { useSiteContent, getString } from "@/lib/content/queries";
import drSaleem from "@/assets/team-dr-saleem.jpg";
import rnSaleem from "@/assets/team-rn-saleem.jpg";
import hSaleem from "@/assets/team-h-saleem.jpg";

const team = [
  {
    name: "Dr. Saleem",
    icon: Stethoscope,
    role: "Medical Director & Lead Aesthetic Physician",
    image: drSaleem,
    bio: "Dr. Saleem is the founder and medical director of Saleem Skin. With extensive expertise in aesthetic medicine, he is passionate about delivering natural, beautiful results tailored to every patient. His clinical precision and warm approach have earned Saleem Skin its award-winning reputation.",
    creds: "MBBS · Aesthetic Medicine Certified · Level 7 Injectables",
    tags: ["Anti-Ageing", "Skin Rejuvenation", "Facial Aesthetics"],
  },
  {
    name: "RN Saleem",
    icon: Stethoscope,
    role: "Registered Nurse & Aesthetic Practitioner",
    image: rnSaleem,
    bio: "RN Saleem combines a strong foundation in nursing with advanced aesthetic training to provide safe, effective and beautifully delivered treatments. Known for a gentle touch and exceptional patient care, RN Saleem is a trusted member of the Saleem Skin family.",
    creds: "RGN · BSc Nursing · PGDip Aesthetic Medicine",
    tags: ["Dermal Fillers", "Anti-Wrinkle Injections", "Skin Boosters"],
  },
  {
    name: "H. Saleem",
    icon: Sparkles,
    role: "Skin Therapist & Wellness Specialist",
    image: hSaleem,
    bio: "H. Saleem brings a holistic approach to skin health and wellness at Saleem Skin. Specialising in advanced facials including HydraFacial and AlumierMD treatments, H. Saleem is dedicated to helping every client achieve glowing, healthy skin.",
    creds: "VTCT Level 4 Aesthetics · HydraFacial Certified · AlumierMD Certified",
    tags: ["HydraFacial", "AlumierMD Peels", "Wellness Treatments"],
  },
];

const badges = [
  { icon: Award, label: "Best Aesthetics Clinic North 2025" },
  { icon: Gem, label: "AlumierMD Partner" },
  { icon: Sparkles, label: "HydraFacial Provider" },
  { icon: Flower2, label: "Skin · Health · Wellness" },
];

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Meet the Team — Saleem Skin Manchester" },
      { name: "description", content: "Meet the award-winning team of aesthetic practitioners and skin therapists at Saleem Skin Manchester — specialists in skin, health and wellness." },
      { property: "og:title", content: "Meet the Team — Saleem Skin Manchester" },
      { property: "og:description", content: "Our award-winning team of aesthetic practitioners and skin therapists in Manchester." },
      { property: "og:url", content: "https://saleemskin.co.uk/team" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/team" }],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Intro */}
        <section className="py-20 md:py-28 bg-background text-center">
          <div className="container mx-auto px-4">
            <div className="text-gold text-[11px] tracking-[0.35em] mb-5">OUR SPECIALISTS</div>
            <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6">Meet the Team</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Our award-winning team of aesthetic practitioners and skin therapists are dedicated to helping you achieve your best skin, health and wellness.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 border border-gold/40 bg-gold/5 text-primary px-5 py-2.5 text-sm">
                  <Icon className="h-4 w-4 text-gold" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team grid */}
        <section className="pb-20 md:pb-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map(({ name, role, bio, creds, tags, image, icon: Icon }) => (
                <article key={name} className="flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden bg-secondary mb-6">
                    <img src={image} alt={name} loading="lazy" width={768} height={896} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-serif text-2xl text-primary flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-gold" />
                    {name}
                  </h2>
                  <p className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium mb-5">
                    {role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {bio}
                  </p>
                  <div className="flex items-start gap-2 text-sm text-foreground mb-5">
                    <GraduationCap className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                    <span>{creds}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-gold mt-2 shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] tracking-[0.15em] uppercase text-gold border border-gold/40 px-3 py-1.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-6">Discover the treatments our specialists provide</p>
              <Link to="/treatments" className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
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
