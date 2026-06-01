import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CalendarCheck } from "lucide-react";
import { z } from "zod";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton, WhatsAppIcon, whatsappHref } from "@/components/site/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSiteContent, getString } from "@/lib/content/queries";

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
  const { data: content } = useSiteContent();
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
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{getString(content, "contact.eyebrow", "Get in Touch")}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">{getString(content, "contact.title", "Contact Us")}</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mt-4">
            {getString(content, "contact.subtitle", "We'd love to hear from you. Reach out about treatments, consultations or to book your appointment.")}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-light mb-2">Visit, Call or Email</h2>
            <p className="text-sm text-muted-foreground">Our Manchester clinic welcomes you for consultations and treatments six days a week.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-card border border-border p-6 flex flex-col items-center text-center gap-3">
              <MapPin className="h-6 w-6 text-gold" />
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Address</div>
              <div className="whitespace-pre-line">{getString(content, "contact.address", "123 Wellness Avenue,\nManchester, M1 2AB")}</div>
            </div>
            <div className="bg-card border border-border p-6 flex flex-col items-center text-center gap-3">
              <Phone className="h-6 w-6 text-gold" />
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Telephone</div>
              <a href="tel:07503959285" className="hover:text-gold">07503 959285</a>
            </div>
            <div className="bg-card border border-border p-6 flex flex-col items-center text-center gap-3">
              <Mail className="h-6 w-6 text-gold" />
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Email</div>
              <a href="mailto:info@saleemskin.co.uk" className="hover:text-gold break-all">info@saleemskin.co.uk</a>
            </div>
            <div className="bg-card border border-border p-6 flex flex-col items-center text-center gap-3">
              <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">WhatsApp</div>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366]">07503 959285</a>
              <WhatsAppButton className="mt-1 px-4 py-2 text-xs tracking-wide rounded-sm" label="Chat on WhatsApp">
                Chat now
              </WhatsAppButton>
            </div>
          </div>

          <div className="bg-card border border-border p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-5">
              <Clock className="h-5 w-5 text-gold" />
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Opening Hours</div>
            </div>
            <ul className="grid sm:grid-cols-3 gap-4 text-sm max-w-2xl mx-auto">
              <li className="flex justify-between sm:flex-col sm:items-center sm:text-center gap-1 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4 last:border-0">
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Mon – Fri</span>
                <span className="font-medium">{getString(content, "contact.hours_weekday", "9:00 – 19:00")}</span>
              </li>
              <li className="flex justify-between sm:flex-col sm:items-center sm:text-center gap-1 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4 last:border-0">
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Saturday</span>
                <span className="font-medium">{getString(content, "contact.hours_saturday", "10:00 – 17:00")}</span>
              </li>
              <li className="flex justify-between sm:flex-col sm:items-center sm:text-center gap-1">
                <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Sunday</span>
                <span className="font-medium text-muted-foreground">{getString(content, "contact.hours_sunday", "Closed")}</span>
              </li>
            </ul>
          </div>

          <div className="bg-deep-green text-primary-foreground p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-light">Ready to book?</h3>
              <p className="text-sm text-primary-foreground/75">Browse treatments and book online.</p>
            </div>
            <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-[0.2em] text-xs">
              <Link to="/treatments"><CalendarCheck className="h-4 w-4 mr-2" /> Book In Now</Link>
            </Button>
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
