import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Treatments } from "@/components/site/Treatments";
import { About } from "@/components/site/About";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saleem Skin — Award-Winning Aesthetic Clinic" },
      { name: "description", content: "Premium skin, health and wellness treatments by award-winning specialists. Book a free consultation at Saleem Skin today." },
      { property: "og:title", content: "Saleem Skin — Award-Winning Aesthetic Clinic" },
      { property: "og:description", content: "Advanced aesthetic treatments delivered by award-winning specialists." },
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
        <Treatments />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
