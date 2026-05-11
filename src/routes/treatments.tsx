import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import facial from "@/assets/treatment-facial.jpg";
import rejuvenation from "@/assets/treatment-rejuvenation.jpg";
import antiWrinkle from "@/assets/treatment-anti-wrinkle.jpg";
import fillers from "@/assets/treatment-fillers.jpg";
import laser from "@/assets/treatment-laser.jpg";
import body from "@/assets/treatment-body.jpg";
import clinic from "@/assets/about-clinic.jpg";

type Treatment = {
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
};

const treatments: Treatment[] = [
  {
    name: "New Consultation",
    category: "Consultation",
    description:
      "Your journey to better skin begins with a thorough consultation with one of our expert practitioners to discuss your goals and tailor a bespoke treatment plan.",
    price: "£60",
    duration: "30 mins",
    image: clinic,
  },
  {
    name: "Deluxe HydraFacial",
    category: "HydraFacial",
    description:
      "The Deluxe HydraFacial is a deeply cleansing, hydrating and rejuvenating treatment that uses patented vortex technology to leave skin glowing.",
    price: "£145",
    duration: "45 mins",
    image: facial,
  },
  {
    name: "Wet Diamond HydraFacial",
    category: "HydraFacial",
    description:
      "Our premium HydraFacial experience combines diamond-tip microdermabrasion with the powerful HydraFacial system for unmatched radiance.",
    price: "£200",
    duration: "1 hr",
    image: rejuvenation,
  },
  {
    name: "Promoitalia Lip Booster",
    category: "Injectables",
    description:
      "A bio-revitalising lip treatment that hydrates, plumps and improves lip texture using premium Italian-formulated injectables.",
    price: "£180",
    duration: "30 mins",
    image: fillers,
  },
  {
    name: "TrapTox",
    category: "Injectables",
    description:
      "Anti-wrinkle treatment for the trapezius muscles to relieve tension, improve posture and elegantly slim the neck and shoulder line.",
    price: "£350",
    duration: "30 mins",
    image: antiWrinkle,
  },
  {
    name: "Jawline Slimming Anti-Wrinkle Treatment",
    category: "Injectables",
    description:
      "Targeted anti-wrinkle injections to relax the masseter muscles, slim the jawline and create a softer, more defined facial contour.",
    price: "£300",
    duration: "30 mins",
    image: antiWrinkle,
  },
  {
    name: "VTECH Microneedling with LED Face Mask",
    category: "Skin Rejuvenation",
    description:
      "Advanced microneedling combined with LED light therapy to stimulate collagen, improve texture and reduce fine lines and scarring.",
    price: "£195",
    duration: "1 hr",
    image: laser,
  },
  {
    name: "PRP Hair & Scalp Treatment",
    category: "PRP",
    description:
      "Platelet-rich plasma injections to stimulate hair follicles, promote regrowth and improve scalp health using your body's own healing factors.",
    price: "£295",
    duration: "1 hr",
    image: body,
  },
  {
    name: "PRP Facial (Vampire Facial)",
    category: "PRP",
    description:
      "The famous Vampire Facial uses platelet-rich plasma to rejuvenate skin, improve tone and texture, and promote a youthful glow.",
    price: "£295",
    duration: "1 hr",
    image: rejuvenation,
  },
  {
    name: "Hay Fever Treatment",
    category: "Hay Fever Treatment",
    description:
      "Our injectable hay fever treatment provides effective, season-long relief from hay fever symptoms. A simple in-clinic appointment.",
    price: "From £POA",
    duration: "30 mins",
    image: clinic,
  },
  {
    name: "Vitamin B12 Injection (Single)",
    category: "Wellness",
    description:
      "A single Vitamin B12 injection delivers a fast, effective boost to energy levels, mood and metabolism.",
    price: "£25",
    duration: "30 mins",
    image: body,
  },
  {
    name: "Vitamin B12 Injection (Course of 6)",
    category: "Wellness",
    description:
      "A course of six Vitamin B12 injections for sustained energy, improved metabolism and enhanced vitality.",
    price: "£120",
    duration: "30 mins",
    image: body,
  },
];

const categories = [
  "All",
  "Consultation",
  "HydraFacial",
  "Injectables",
  "Skin Rejuvenation",
  "PRP",
  "Hay Fever Treatment",
  "Wellness",
];

export const Route = createFileRoute("/treatments")({
  head: () => ({
    meta: [
      { title: "Our Treatments — Saleem Skin" },
      {
        name: "description",
        content:
          "Explore our full range of award-winning aesthetic treatments — HydraFacial, injectables, PRP, skin rejuvenation and wellness.",
      },
      { property: "og:title", content: "Our Treatments — Saleem Skin" },
      {
        property: "og:description",
        content:
          "From advanced injectables to skin rejuvenation, HydraFacial and wellness treatments — all by award-winning specialists.",
      },
    ],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? treatments : treatments.filter((t) => t.category === active);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Page Header */}
        <section className="py-20 md:py-28 bg-background text-center">
          <div className="container mx-auto px-4">
            <div className="text-gold text-[11px] tracking-[0.35em] mb-5">SALEEM SKIN</div>
            <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6">Our Treatments</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From advanced injectables to skin rejuvenation, HydraFacial and wellness
              treatments — all performed by our award-winning specialists.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-y border-border bg-card sticky top-0 z-30">
          <div className="container mx-auto px-4 py-5">
            <div className="flex gap-3 overflow-x-auto justify-start md:justify-center">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`shrink-0 px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                    active === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((t) => (
                <article
                  key={t.name}
                  className="group bg-card border border-border overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                      {t.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="font-serif text-2xl text-primary mb-3">{t.name}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {t.description}
                    </p>
                    <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                      <span className="text-gold font-medium">{t.price}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t.duration}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No treatments in this category yet.
              </p>
            )}
            <div className="text-center mt-16">
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors"
              >
                Back to Home
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
