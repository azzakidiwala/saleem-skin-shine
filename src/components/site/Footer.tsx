import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { WhatsAppIcon, whatsappHref } from "@/components/site/WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-deep-green text-primary-foreground">
      <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <img src={logo} alt="Saleem Skin" className="h-20 w-auto mb-4 brightness-0 invert opacity-90" />
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Award-winning aesthetic clinic delivering exceptional skin, health and wellness treatments in the North.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.25em] uppercase text-gold mb-5 font-semibold">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-gold transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/treatments" className="hover:text-gold transition-colors">
                Treatments
              </Link>
            </li>
            <li>
              <Link to="/team" className="hover:text-gold transition-colors">
                Meet the Team
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/book/$slug"
                params={{ slug: "new-consultation" }}
                className="hover:text-gold transition-colors"
              >
                Book Consultation
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.25em] uppercase text-gold mb-5 font-semibold">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-3">
              <MapPin className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" /> 151 Wellington Rd,
              <br />
              Oldham, OL8 4DD
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />{" "}
              <a href="tel:07503959285" className="hover:text-gold">
                07503 959285
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />{" "}
              <a href="mailto:info@saleemskin.co.uk" className="hover:text-gold">
                info@saleemskin.co.uk
              </a>
            </li>
            <li className="flex gap-3">
              <WhatsAppIcon className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />{" "}
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.25em] uppercase text-gold mb-5 font-semibold flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Opening Hours
          </h4>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            <li className="flex justify-between">
              <span>Mon – Fri</span>
              <span>9:00 – 19:00</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday</span>
              <span>10:00 – 17:00</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Saleem Skin. All rights reserved.</p>
          <Link to="/login" className="hover:text-gold transition-colors tracking-wider uppercase">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
