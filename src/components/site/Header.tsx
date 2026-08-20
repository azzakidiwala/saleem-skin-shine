import { Link } from "@tanstack/react-router";
import { Phone, ChevronDown, Menu, Search } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { WhatsAppButton, WhatsAppIcon, whatsappHref } from "@/components/site/WhatsAppButton";
import { useTreatments, treatmentCategories } from "@/lib/content/queries";

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: treatments = [] } = useTreatments();

  const dynamicCats = Array.from(new Set(treatments.map((t) => t.category)));
  const ordered = Array.from(new Set([...treatmentCategories.slice(1), ...dynamicCats]));
  const groups = ordered
    .map((c) => ({ category: c, items: treatments.filter((t) => t.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center py-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(o => !o)} className="md:hidden text-primary">
              <Menu className="h-6 w-6" />
            </button>
            <Link
              to="/book/$slug"
              params={{ slug: "new-consultation" }}
              className="hidden md:inline-flex items-center justify-center bg-gold text-gold-foreground px-6 py-3 text-xs tracking-[0.2em] font-semibold uppercase hover:bg-gold/90 transition-colors"
            >
              Book Consultation
            </Link>
          </div>
          <div className="flex justify-center">
            <Link to="/" className="block">
              <img src={logo} alt="Saleem Skin" className="h-[104px] w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-end gap-5">
            <button
              aria-label="Search"
              className="group inline-flex items-center gap-2 text-primary hover:text-gold transition-colors text-[11px] tracking-[0.25em] uppercase font-medium"
            >
              <Search className="h-4 w-4 text-gold transition-transform group-hover:scale-110" />
              <span>Search</span>
            </button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <a href="tel:07503959285" className="flex items-center gap-2 text-primary font-medium tracking-wide whitespace-nowrap">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">07503 959285</span>
            </a>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="group inline-flex items-center gap-2 text-primary hover:text-gold transition-colors text-[11px] tracking-[0.25em] uppercase font-medium"
            >
              <WhatsAppIcon className="h-4 w-4 text-gold transition-transform group-hover:scale-110" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-12 border-t border-border py-4 text-xs tracking-[0.25em] uppercase font-medium">
          <Link to="/" activeProps={{ className: "text-gold" }} className="hover:text-gold transition-colors">Home</Link>
          <div className="relative group">
            <Link to="/treatments" activeProps={{ className: "text-gold" }} className="flex items-center gap-1 hover:text-gold transition-colors">
              Treatments <ChevronDown className="h-3 w-3" />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-[560px]">
              <div className="bg-card border border-border shadow-xl p-6 max-h-[78vh] overflow-y-auto">
                <div className="text-gold text-[11px] tracking-[0.3em] mb-4">TREATMENTS</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <Link to="/treatments" className="col-span-2 flex items-start gap-2 py-2 text-[12px] tracking-[0.05em] normal-case font-semibold text-foreground hover:text-gold transition-colors border-b border-border mb-2">
                    <span className="text-gold mt-1.5">•</span>
                    <span>All Treatments</span>
                  </Link>
                  {groups.map((g) => (
                    <div key={g.category} className="col-span-2">
                      <div className="text-gold text-[10px] tracking-[0.3em] uppercase font-semibold pt-3 pb-1">
                        {g.category}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {g.items.map((t) => (
                          <Link
                            key={t.slug}
                            to="/treatments/$slug"
                            params={{ slug: t.slug }}
                            className="flex items-start gap-2 py-1.5 text-[12px] tracking-[0.05em] normal-case font-normal text-foreground hover:text-gold transition-colors"
                          >
                            <span className="text-gold mt-1.5">•</span>
                            <span>{t.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-gold transition-colors uppercase tracking-[0.25em] text-xs font-medium">
              Conditions <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-[240px]">
              <div className="bg-card border border-border shadow-xl p-6">
                <div className="text-gold text-[11px] tracking-[0.3em] mb-4">CONDITIONS</div>
                <div className="flex flex-col gap-2">
                  <Link to="/conditions/face" className="flex items-start gap-2 py-1.5 text-[12px] tracking-[0.05em] normal-case font-normal text-foreground hover:text-gold transition-colors">
                    <span className="text-gold mt-1.5">•</span><span>Face</span>
                  </Link>
                  <Link to="/conditions/body" className="flex items-start gap-2 py-1.5 text-[12px] tracking-[0.05em] normal-case font-normal text-foreground hover:text-gold transition-colors">
                    <span className="text-gold mt-1.5">•</span><span>Body</span>
                  </Link>
                  <Link to="/conditions/skin" className="flex items-start gap-2 py-1.5 text-[12px] tracking-[0.05em] normal-case font-normal text-foreground hover:text-gold transition-colors">
                    <span className="text-gold mt-1.5">•</span><span>Skin</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Link to="/team" activeProps={{ className: "text-gold" }} className="hover:text-gold transition-colors">Meet the Team</Link>
          <Link to="/faq" activeProps={{ className: "text-gold" }} className="hover:text-gold transition-colors">FAQ</Link>
          <Link to="/contact" activeProps={{ className: "text-gold" }} className="hover:text-gold transition-colors">Contact</Link>
        </nav>
        {open && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link to="/" className="block text-xs tracking-[0.25em] uppercase">Home</Link>
            <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Treatments</div>
            <Link to="/treatments" className="block pl-4 text-xs tracking-[0.15em] normal-case font-semibold">All Treatments</Link>
            {groups.map((g) => (
              <div key={g.category} className="pl-4">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-semibold mb-1">{g.category}</div>
                <div className="space-y-1">
                  {g.items.map((t) => (
                    <Link key={t.slug} to="/treatments/$slug" params={{ slug: t.slug }} className="block pl-4 text-xs tracking-[0.15em] normal-case">
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Conditions</div>
            <Link to="/conditions/face" className="block pl-4 text-xs tracking-[0.15em] normal-case">Face</Link>
            <Link to="/conditions/body" className="block pl-4 text-xs tracking-[0.15em] normal-case">Body</Link>
            <Link to="/conditions/skin" className="block pl-4 text-xs tracking-[0.15em] normal-case">Skin</Link>
            <Link to="/team" className="block text-xs tracking-[0.25em] uppercase">Meet the Team</Link>
            <Link to="/faq" className="block text-xs tracking-[0.25em] uppercase">FAQ</Link>
            <Link to="/contact" className="block text-xs tracking-[0.25em] uppercase">Contact</Link>
            <a href="tel:07503959285" className="flex items-center gap-2 text-primary"><Phone className="h-4 w-4" />07503 959285</a>
            <WhatsAppButton className="w-full py-3 text-xs tracking-[0.2em] uppercase font-semibold" label="Chat on WhatsApp">
              WhatsApp
            </WhatsAppButton>
            <Link to="/book/$slug" params={{ slug: "new-consultation" }} className="block bg-gold text-gold-foreground text-center py-3 text-xs tracking-[0.2em] uppercase font-semibold">Book Consultation</Link>
          </div>
        )}
      </div>
    </header>
  );
}
