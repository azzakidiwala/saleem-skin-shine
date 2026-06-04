import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useSiteContent, getString, useFaqs } from "@/lib/content/queries";

const fallbackFaqs = [
  { question: "What do Hydrafacials do to your face?", answer: "HydraFacial deeply cleanses, exfoliates, extracts impurities, and hydrates the skin." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Saleem Skin" },
      { name: "description", content: "Frequently asked questions about HydraFacial and other treatments at Saleem Skin." },
      { property: "og:title", content: "FAQ — Saleem Skin" },
      { property: "og:description", content: "Answers to common questions about HydraFacial and our skin treatments." },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/faq" }],
  }),
  component: FAQPage,
});

function FAQPage() {
  const { data: content } = useSiteContent();
  const { data: dbFaqs } = useFaqs();
  const faqs = (dbFaqs && dbFaqs.length > 0 ? dbFaqs : fallbackFaqs).map(f => ({ q: f.question, a: f.answer }));
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-gold text-[11px] tracking-[0.3em] mb-3">{getString(content, "faq.eyebrow", "SUPPORT")}</div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">{getString(content, "faq.title", "Frequently Asked Questions")}</h1>
            <p className="text-muted-foreground">{getString(content, "faq.subtitle", "Everything you need to know before your treatment.")}</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-base md:text-lg font-medium py-5">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-3 text-xs tracking-[0.2em] font-semibold uppercase hover:bg-gold/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
