import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Gift, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestSignupVoucher } from "@/lib/vouchers.functions";

type Issued = {
  code: string;
  discount_pennies: number;
  expires_at: string;
};

export function SignupVoucher({ variant = "section" }: { variant?: "section" | "compact" } = {}) {
  const request = useServerFn(requestSignupVoucher);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<Issued | null>(null);

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

  const valid =
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    mobile.trim().replace(/[^\d+]/g, "").length >= 7;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        setIssued({ code: res.code, discount_pennies: res.discount_pennies, expires_at: res.expires_at ?? "" });
        toast.success("Voucher sent!", { description: `Your code is ${res.code}` });
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
  const subtext = settings?.signup_subtext ?? "Drop your details and we'll generate a voucher code valid for 24 hours.";

  if (issued) {
    const pounds = (issued.discount_pennies / 100).toFixed(2).replace(/\.00$/, "");
    return (
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <Check className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">
            You've unlocked £{pounds} off
          </h2>
          <p className="text-muted-foreground mb-6">
            Use this code at checkout. It's valid for 24 hours and can only be used once.
          </p>
          <div className="inline-flex items-center gap-3 border-2 border-dashed border-gold px-6 py-4 bg-background">
            <span className="font-mono text-2xl tracking-[0.3em] text-foreground">{issued.code}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(issued.code);
                toast.success("Copied");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Expires {new Date(issued.expires_at).toLocaleString("en-GB")}
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
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
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
            <Input id="sv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sv-mobile">Mobile</Label>
            <Input id="sv-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={20} className="mt-1" />
          </div>
          <div className="sm:col-span-2 flex justify-center mt-2">
            <Button
              type="submit"
              disabled={!valid || submitting}
              className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-10 py-6 text-xs tracking-[0.25em] uppercase"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim my voucher"}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          One voucher per person. By submitting you agree to receive your discount code.
        </p>
      </div>
    </section>
  );
}
