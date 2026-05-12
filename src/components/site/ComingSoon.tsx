import { Link } from "@tanstack/react-router";

export function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="text-gold text-[11px] tracking-[0.4em] uppercase mb-6">
        Saleem Skin
      </div>
      <h1 className="font-serif text-5xl md:text-7xl text-primary mb-6">
        Coming Soon
      </h1>
      <p className="max-w-md text-muted-foreground mb-10">
        Our award-winning aesthetic clinic is preparing something special.
        Please check back shortly.
      </p>
      <div className="h-px w-24 bg-gold/40 mb-10" />
      <Link
        to="/login"
        className="text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors"
      >
        Staff sign in
      </Link>
    </div>
  );
}
