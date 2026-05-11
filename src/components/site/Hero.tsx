import { Award, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero-facial.jpg";

export function Hero() {
  return (
    <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
      <img src={hero} alt="Luxury aesthetic treatment room" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      <div className="relative z-10 container mx-auto h-full px-6 flex flex-col items-center justify-center text-center text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          <span className="text-sm flex items-center gap-1.5">
            <Award className="h-4 w-4 text-gold" />
            Best Aesthetics Clinic North 2025
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl">
          Delivering <em className="text-gold not-italic font-display italic">Exceptional</em>
          <br />
          Skin, Health & Wellness
        </h1>
        <p className="mt-8 max-w-2xl text-base md:text-lg text-white/85">
          🪷 Skin · Health · Wellness — Advanced aesthetic treatments by award-winning specialists
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/treatments" className="inline-flex items-center justify-center bg-gold text-gold-foreground px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-gold/90 transition-colors">
            Browse Our Treatments
          </Link>
          <a href="#team" className="inline-flex items-center justify-center border border-white/80 text-white px-8 py-4 text-xs tracking-[0.25em] font-semibold uppercase hover:bg-white hover:text-primary transition-colors">
            Meet the Team
          </a>
        </div>
      </div>
    </section>
  );
}
