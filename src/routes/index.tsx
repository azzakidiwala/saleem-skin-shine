import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Treatments } from "@/components/site/Treatments";
import { About } from "@/components/site/About";
import { SignupVoucher } from "@/components/site/SignupVoucher";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saleem Skin — Award-Winning Aesthetic Clinic in Manchester" },
      { name: "description", content: "Premium skin, health and wellness treatments by award-winning specialists at Saleem Skin Manchester. Book a free consultation today." },
      { property: "og:title", content: "Saleem Skin — Award-Winning Aesthetic Clinic in Manchester" },
      { property: "og:description", content: "Advanced aesthetic treatments — HydraFacial, injectables, PRP and wellness — delivered by award-winning specialists in Manchester." },
      { property: "og:url", content: "https://saleemskin.co.uk/" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HealthAndBeautyBusiness",
          name: "Saleem Skin",
          description: "Award-winning aesthetic clinic offering premium skin, health and wellness treatments.",
          url: "https://saleemskin.co.uk/",
          telephone: "+44 7503 959285",
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 Wellness Avenue",
            addressLocality: "Manchester",
            addressCountry: "GB",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "18:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "10:00",
              closes: "16:00",
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <StatsStrip />
        <Treatments />
        <SignupVoucher />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
