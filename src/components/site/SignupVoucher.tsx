import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Gift, Check, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestSignupVoucher } from "@/lib/vouchers.functions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function mobileDigits(v: string) {
  return v.replace(/\D/g, "");
}
function isValidMobile(v: string) {
  return mobileDigits(v).length === 11;
}
function isValidEmail(v: string) {
  return EMAIL_RE.test(v.trim());
}

export function SignupVoucher({ variant = "section" }: { variant?: "section" | "compact" } = {}) {
  const request = useServerFn(requestSignupVoucher);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; mobile?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["discount-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("discount_settings")
        .select("signup_enabled, signup_discount_pennies, signup_expiry_hours, signup_headline, signup_subtext")
        .eq("id", 1)
        .maybeSingle();
      return data;
    },
  });

  if (settings && !settings.signup_enabled) return null;

  const emailValid = isValidEmail(email);
  const mobileValid = isValidMobile(mobile);
  const valid =
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    emailValid &&
    mobileValid;

  const emailError = touched.email && email.length > 0 && !emailValid
    ? "Please enter a valid email address"
    : null;
  const mobileError = touched.mobile && mobile.length > 0 && !mobileValid
    ? "Mobile number must be 11 digits"
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, mobile: true });
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await request({
        data: {
          first_name: firstName.trim(),
          surname: surname.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
        },
      });
      if (res.status === "issued") {
        setSentToEmail(email.trim());
        toast.success("Voucher sent!", { description: `Check ${email.trim()}` });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const headline = settings?.signup_headline ?? "Get £10 off your first booking";
  const subtext = settings?.signup_subtext ?? "Drop your details and we'll email you a voucher code valid for 24 hours.";

  // ============ COMPACT VARIANT (e.g. in footer) ============
  if (variant === "compact") {
    if (sentToEmail) {
      return (
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-gold" />
            <span className="text-gold font-semibold">Voucher sent</span>
          </div>
          <p className="text-primary-foreground/70 text-xs">
            Check <span className="text-primary-foreground">{sentToEmail}</span> for your discount code.
          </p>
        </div>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-2" noValidate>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={100}
            className="h-9 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
          />
          <Input
            placeholder="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            maxLength={100}
            className="h-9 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
          />
        </div>
        <div>
          <Input
            type="email"
            inputMode="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            maxLength={255}
            aria-invalid={!!emailError}
            className="h-9 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
          />
          {emailError && <p className="text-[11px] text-red-300 mt-1">{emailError}</p>}
        </div>
        <div>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Mobile (11 digits)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
            maxLength={20}
            aria-invalid={!!mobileError}
            className="h-9 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
          />
          {mobileError && <p className="text-[11px] text-red-300 mt-1">{mobileError}</p>}
        </div>
        <Button
          type="submit"
          disabled={!valid || submitting}
          className="w-full bg-gold text-gold-foreground hover:bg-gold/90 rounded-none text-[10px] tracking-[0.25em] uppercase h-9"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Email me my voucher"}
        </Button>
      </form>
    );
  }

  // ============ FULL SECTION VARIANT ============

  if (sentToEmail) {
    return (
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <Mail className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">
            Check your inbox
          </h2>
          <p className="text-muted-foreground mb-2">
            We've just emailed your voucher code to
          </p>
          <p className="text-foreground font-medium mb-6">{sentToEmail}</p>
          <p className="text-xs text-muted-foreground">
            Don't see it? Check your spam folder. The code is valid for 24 hours and can only be used once.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <Gift className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">{headline}</h2>
          <p className="text-muted-foreground">{subtext}</p>
        </div>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4" noValidate>
          <div>
            <Label htmlFor="sv-first">First name</Label>
            <Input id="sv-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sv-surname">Surname</Label>
            <Input id="sv-surname" value={surname} onChange={(e) => setSurname(e.target.value)} maxLength={100} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sv-email">Email</Label>
            <Input
              id="sv-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              maxLength={255}
              aria-invalid={!!emailError}
              className="mt-1"
            />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>
          <div>
            <Label htmlFor="sv-mobile">Mobile (11 digits)</Label>
            <Input
              id="sv-mobile"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
              maxLength={20}
              aria-invalid={!!mobileError}
              className="mt-1"
            />
            {mobileError && <p className="text-xs text-destructive mt-1">{mobileError}</p>}
          </div>
          <div className="sm:col-span-2 flex justify-center mt-2">
            <Button
              type="submit"
              disabled={!valid || submitting}
              className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-10 py-6 text-xs tracking-[0.25em] uppercase"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Email me my voucher"}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          One voucher per person. By submitting you agree to receive your discount code by email.
        </p>
      </div>
    </section>
  );
}
