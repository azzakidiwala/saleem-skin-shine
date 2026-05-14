import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CalendarCheck } from "lucide-react";
import { z } from "zod";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import clinicImage from "@/assets/contact-clinic.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Saleem Skin — Manchester Aesthetic Clinic" },
      { name: "description", content: "Get in touch with Saleem Skin in Manchester. Call, email or send us a message about treatments, consultations and bookings." },
      { property: "og:title", content: "Contact Saleem Skin — Manchester Aesthetic Clinic" },
      { property: "og:description", content: "Call, email or message Saleem Skin Manchester to book a consultation or ask about treatments." },
      { property: "og:url", content: "https://saleemskin.co.uk/contact" },
    ],
    links: [{ rel: "canonical", href: "https://saleemskin.co.uk/contact" }],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  surname: z.string().trim().min(1, "Surname is required").max(100),
  mobile: z.string().trim().min(7, "Enter a valid mobile number").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Please describe your query").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ firstName: "", surname: "", mobile: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const fullName = `${parsed.data.firstName} ${parsed.data.surname}`;
    const subject = encodeURIComponent(`Website enquiry from ${fullName}`);
    const body = encodeURIComponent(
      `First name: ${parsed.data.firstName}\nSurname: ${parsed.data.surname}\nMobile: ${parsed.data.mobile}\nEmail: ${parsed.data.email}\n\nQuery:\n${parsed.data.message}`,
    );
    window.location.href = `mailto:info@saleemskin.co.uk?subject=${subject}&body=${body}`;
    toast.success("Opening your email app to send the message");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <section className="bg-deep-green text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">Contact Us</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mt-4">
            We'd love to hear from you. Reach out about treatments, consultations or to book your appointment.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <h2 className="text-2xl font-light mb-2">Visit, Call or Email</h2>
              <p className="text-sm text-muted-foreground">Our Manchester clinic welcomes you for consultations and treatments six days a week.</p>
            </div>

            <div className="bg-card border border-border p-5 flex gap-4">
              <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">Address</div>
                123 Wellness Avenue,<br />Manchester, M1 2AB
              </div>
            </div>
            <div className="bg-card border border-border p-5 flex gap-4">
              <Phone className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">Telephone</div>
                <a href="tel:07503959285" className="hover:text-gold">07503 959285</a>
              </div>
            </div>
            <div className="bg-card border border-border p-5 flex gap-4">
              <Mail className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">Email</div>
                <a href="mailto:info@saleemskin.co.uk" className="hover:text-gold break-all">info@saleemskin.co.uk</a>
              </div>
            </div>
            <div className="bg-card border border-border p-5 flex gap-4">
              <Clock className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">Opening Hours</div>
                Mon – Fri: 9 – 19<br />
                Sat: 10 – 17 · Sun: Closed
              </div>
            </div>

            <div className="sm:col-span-2 bg-deep-green text-primary-foreground p-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-light">Ready to book?</h3>
                <p className="text-sm text-primary-foreground/75">Browse treatments and book online.</p>
              </div>
              <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-[0.2em] text-xs">
                <Link to="/treatments"><CalendarCheck className="h-4 w-4 mr-2" /> Book In Now</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <img
              src={clinicImage}
              alt="Saleem Skin Manchester treatment room"
              loading="lazy"
              width={1024}
              height={1280}
              className="w-full h-full object-cover min-h-[400px]"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="bg-card border border-border p-8 max-w-3xl mx-auto space-y-5">
          <div>
            <h2 className="text-2xl font-light">Send us a message</h2>
            <p className="text-sm text-muted-foreground mt-1">All fields are required.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} maxLength={100} />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="surname">Surname *</Label>
              <Input id="surname" required value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} maxLength={100} />
              {errors.surname && <p className="text-xs text-destructive mt-1">{errors.surname}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="mobile">Mobile number *</Label>
              <Input id="mobile" type="tel" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} maxLength={20} />
              {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Description of your query *</Label>
            <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} />
            {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-[0.2em] text-xs">
            <Send className="h-4 w-4 mr-2" /> Send Message
          </Button>
        </form>
      </section>

      <Footer />
    </div>
  );
}
