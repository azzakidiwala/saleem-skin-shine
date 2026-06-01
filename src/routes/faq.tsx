import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useSiteContent, getString } from "@/lib/content/queries";

const faqs = [
  {
    q: "What do Hydrafacials do to your face?",
    a: "HydraFacial deeply cleanses, exfoliates, extracts impurities, and hydrates the skin. It removes dead skin cells, unclogs pores, and infuses antioxidants and peptides, leaving your skin smoother. It can also target specific concerns such as acne, pigmentation, and uneven texture.",
  },
  {
    q: "How long will HydraFacial results last?",
    a: "Hydrafacial results are visible immediately after treatment, with skin appearing brighter, plumper, and more hydrated. For long-lasting benefits, it's recommended to have HydraFacial treatments regularly, depending on your skin type and concerns.",
  },
  {
    q: "What are the side effects of Hydrafacial?",
    a: "HydraFacial is generally safe with minimal side effects. Some patients may experience slight redness or sensitivity immediately after treatment, which typically subsides within a few hours. Those with a shellfish allergy should avoid this treatment due to certain ingredient formulations.",
  },
  {
    q: "Does Hydrafacial help with wrinkles?",
    a: "Yes, HydraFacial helps reduce the appearance of fine lines and wrinkles by hydrating the skin, stimulating collagen production, and improving overall skin elasticity and texture.",
  },
  {
    q: "Are Hydrafacials safe?",
    a: "Absolutely. HydraFacial is a non-invasive, gentle treatment suitable for most skin types. It's safe for regular use, has no downtime, and is performed by trained professionals to ensure optimal results.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Saleem Skin" },
      { name: "description", content: "Frequently asked questions about HydraFacial and other treatments at Saleem Skin." },
      { property: "og:title", content: "FAQ — Saleem Skin" },
      { property: "og:description", content: "Answers to common questions about HydraFacial and our skin treatments." },
      { tagName: "link", rel: "canonical", href: "https://saleemskin.co.uk/faq" },
      {
        tagName: "script",
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(f => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-gold text-[11px] tracking-[0.3em] mb-3">SUPPORT</div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">Everything you need to know before your treatment.</p>
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
