import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Copy, Check, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Promo = { code: string; discount_pennies: number; expires_at: string | null; treatment_slug: string | null };



export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: promo } = useQuery({
    queryKey: ["active-promos"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_active_promos");
      const list = (data ?? []) as Promo[];
      return list.length > 0 ? list[0] : null;
    },
    staleTime: 60_000,
  });

  const { data: treatmentName } = useQuery({
    queryKey: ["promo-treatment-name", promo?.treatment_slug],
    enabled: !!promo?.treatment_slug,
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("name")
        .eq("slug", promo!.treatment_slug!)
        .maybeSingle();
      return data?.name ?? null;
    },
    staleTime: 5 * 60_000,
  });

  // Show after delay, then auto-minimize after 5s
  useEffect(() => {
    if (!promo) return;
    const show = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(show);
  }, [promo]);

  useEffect(() => {
    if (!open || minimized) return;
    const hide = window.setTimeout(() => {
      setOpen(false);
      setMinimized(true);
    }, 5000);
    return () => window.clearTimeout(hide);
  }, [open, minimized]);

  if (!promo) return null;

  const pounds = (promo.discount_pennies / 100).toFixed(2).replace(/\.00$/, "");

  function minimizePopup() {
    setOpen(false);
    setMinimized(true);
  }

  function expandPopup() {
    setOpen(true);
    setMinimized(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(promo!.code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy code");
    }
  }

  // Minimized tab
  if (minimized) {
    return (
      <button
        type="button"
        onClick={expandPopup}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-deep-green text-primary-foreground shadow-2xl border border-gold/30 px-4 py-2.5 animate-in slide-in-from-bottom-4 fade-in hover:bg-deep-green/90 transition-colors"
      >
        <Sparkles className="h-4 w-4 text-gold" />
        <span className="text-xs font-medium">Click for discount code</span>
        <ChevronUp className="h-3 w-3 text-gold" />
      </button>
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in"
      role="dialog"
      aria-label="Discount code available"
    >
      <div className="relative bg-deep-green text-primary-foreground shadow-2xl border border-gold/30">
        <div className="flex items-center justify-end gap-1 absolute top-2 right-2">
          <button
            type="button"
            onClick={minimizePopup}
            aria-label="Minimize"
            className="p-1 text-primary-foreground/60 hover:text-gold transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">
              Limited offer
            </span>
          </div>
          <h3 className="font-serif text-xl leading-tight mb-1">
            £{pounds} off your booking
          </h3>
          <p className="text-xs text-primary-foreground/70 mb-3">
            {promo.treatment_slug
              ? `Valid on ${treatmentName ?? "a selected treatment"} when you book online.`
              : "Use this code at checkout when you book any treatment."}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="w-full flex items-center justify-between gap-2 border-2 border-dashed border-gold/60 bg-background/5 px-3 py-2.5 hover:bg-background/10 transition-colors"
          >
            <span className="font-mono text-sm tracking-[0.2em]">{promo.code}</span>
            {copied ? (
              <Check className="h-4 w-4 text-gold" />
            ) : (
              <Copy className="h-4 w-4 text-gold" />
            )}
          </button>
          {promo.expires_at && (
            <p className="text-[10px] text-primary-foreground/50 mt-2 text-center">
              Expires {new Date(promo.expires_at).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
