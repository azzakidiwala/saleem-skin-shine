import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

type Search = {
  name?: string;
  treatment?: string;
  date?: string;
  time?: string;
};

export const Route = createFileRoute("/book-confirmed")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    name: typeof s.name === "string" ? s.name : undefined,
    treatment: typeof s.treatment === "string" ? s.treatment : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
    time: typeof s.time === "string" ? s.time : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Booking confirmed — Saleem Skin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ConfirmedPage,
});

function ConfirmedPage() {
  const { name, treatment, date, time } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-6 max-w-xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold mb-6">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="font-serif text-4xl text-primary mb-4">Your appointment is booked</h1>
          {name && (
            <p className="text-muted-foreground mb-2">
              Thank you, <span className="text-foreground font-semibold">{name}</span>.
            </p>
          )}
          {treatment && date && time && (
            <p className="text-muted-foreground mb-8">
              We'll see you for your <span className="text-foreground font-semibold">{treatment}</span> on{" "}
              <span className="text-foreground font-semibold">{date}</span> at{" "}
              <span className="text-foreground font-semibold">{time}</span>.
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-10">
            A confirmation email is on its way. If you need to make any changes, please call us on{" "}
            <a href="tel:07503959285" className="text-gold hover:underline">07503 959285</a>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/treatments"
              className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 transition-colors"
            >
              Browse Treatments
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-primary text-primary px-8 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
