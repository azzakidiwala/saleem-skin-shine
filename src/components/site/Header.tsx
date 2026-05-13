import { Link } from "@tanstack/react-router";
import { Phone, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const treatments = [
  "New Consultation",
  "Deluxe HydraFacial",
  "Wet Diamond HydraFacial",
  "Promoitalia Lip Booster",
  "TrapTox",
  "Jawline Slimming Anti-Wrinkle Treatment",
  "VTECH Microneedling with LED Face Mask",
  "PRP Hair & Scalp Treatment",
  "PRP Facial (Vampire Facial)",
  "Hay Fever Treatment",
  "Vitamin B12 Injection (Single)",
  "Vitamin B12 Injection (Course of 6)",
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center py-5">
          <a href="tel:07503959285" className="hidden md:flex items-center gap-2 text-primary font-medium tracking-wide">
            <Phone className="h-4 w-4" />
            <span>07503 959285</span>
          </a>
          <button onClick={() => setOpen(o => !o)} className="md:hidden text-primary">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex justify-center">
            <Link to="/" className="block">
              <img src={logo} alt="Saleem Skin" className="h-16 w-auto" />
            </Link>
          </div>
          <div className="flex justify-end">
            <a
              href="#book"
              className="hidden md:inline-flex items-center justify-center bg-gold text-gold-foreground px-6 py-3 text-xs tracking-[0.2em] font-semibold uppercase hover:bg-gold/90 transition-colors"
            >
              Book Consultation
            </a>
          </div>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-12 border-t border-border py-4 text-xs tracking-[0.25em] uppercase font-medium">
          <Link to="/" activeProps={{ className: "text-gold" }} className="hover:text-gold transition-colors">Home</Link>
          <div className="relative group">
            <Link to="/treatments" activeProps={{ className: "text-gold" }} className="flex items-center gap-1 hover:text-gold transition-colors">
              Treatments <ChevronDown className="h-3 w-3" />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-[520px]">
              <div className="bg-card border border-border shadow-xl p-6">
                <div className="text-gold text-[11px] tracking-[0.3em] mb-4">TREATMENTS</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {treatments.map(t => (
                    <Link key={t} to="/treatments" className="flex items-start gap-2 py-1.5 text-[12px] tracking-[0.05em] normal-case font-normal text-foreground hover:text-gold transition-colors">
                      <span className="text-gold mt-1.5">•</span>
                      <span>{t}</span>
                    </Link>
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
        </nav>
        {open && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link to="/" className="block text-xs tracking-[0.25em] uppercase">Home</Link>
            <Link to="/treatments" className="block text-xs tracking-[0.25em] uppercase">Treatments</Link>
            <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Conditions</div>
            <Link to="/conditions/face" className="block pl-4 text-xs tracking-[0.15em] normal-case">Face</Link>
            <Link to="/conditions/body" className="block pl-4 text-xs tracking-[0.15em] normal-case">Body</Link>
            <Link to="/conditions/skin" className="block pl-4 text-xs tracking-[0.15em] normal-case">Skin</Link>
            <Link to="/team" className="block text-xs tracking-[0.25em] uppercase">Meet the Team</Link>
            <a href="tel:07503959285" className="flex items-center gap-2 text-primary"><Phone className="h-4 w-4" />07503 959285</a>
            <a href="#book" className="block bg-gold text-gold-foreground text-center py-3 text-xs tracking-[0.2em] uppercase font-semibold">Book Consultation</a>
          </div>
        )}
      </div>
    </header>
  );
}
