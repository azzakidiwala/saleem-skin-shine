import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/admin/discounts")({
  component: DiscountsPage,
});

type Voucher = {
  id: string;
  code: string;
  kind: "signup" | "promo";
  discount_pennies: number;
  email: string | null;
  first_name: string | null;
  surname: string | null;
  mobile: string | null;
  expires_at: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  notes: string;
  treatment_slug: string | null;
  created_at: string;
};

type TreatmentOption = { slug: string; name: string };

type Settings = {
  signup_enabled: boolean;
  signup_discount_pennies: number;
  signup_expiry_hours: number;
  signup_headline: string;
  signup_subtext: string;
};

function formatPence(p: number) {
  return `£${(p / 100).toFixed(2).replace(/\.00$/, "")}`;
}

function DiscountsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "signup" | "promo">("all");

  const { data: settings } = useQuery({
    queryKey: ["admin", "discount-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discount_settings")
        .select("signup_enabled, signup_discount_pennies, signup_expiry_hours, signup_headline, signup_subtext")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data as Settings;
    },
  });

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ["admin", "vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voucher_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Voucher[];
    },
  });

  const { data: treatmentOptions } = useQuery({
    queryKey: ["admin", "treatments-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treatments")
        .select("slug, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as TreatmentOption[];
    },
  });

  const treatmentNameBySlug = new Map((treatmentOptions ?? []).map((t) => [t.slug, t.name]));

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("voucher_codes").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("voucher_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Voucher deleted"); qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateSettings = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const { error } = await supabase.from("discount_settings").update(patch).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin", "discount-settings"] }); qc.invalidateQueries({ queryKey: ["discount-settings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (vouchers ?? []).filter((v) => tab === "all" ? true : v.kind === tab);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Discounts</h1>
          <p className="text-muted-foreground mt-1">Manage signup vouchers and shareable promo codes.</p>
        </div>
        <NewPromoDialog treatments={treatmentOptions ?? []} onCreated={() => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] })} />
      </div>

      {/* Signup voucher settings */}
      {settings && (
        <SettingsCard settings={settings} onSave={(patch) => updateSettings.mutate(patch)} />
      )}

      <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
        {[
          { v: "all", l: "All" },
          { v: "signup", l: "Signup vouchers" },
          { v: "promo", l: "Promo codes" },
        ].map((o) => (
          <Button key={o.v} size="sm" variant={tab === o.v ? "default" : "ghost"} onClick={() => setTab(o.v as any)}>
            {o.l}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Recipient / Notes</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No vouchers yet.</TableCell></TableRow>}
            {filtered.map((v) => {
              const expired = v.expires_at ? new Date(v.expires_at) < new Date() : false;
              const usedUp = v.used_count >= v.max_uses;
              return (
                <TableRow key={v.id}>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      {v.code}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(v.code); toast.success("Copied"); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{v.kind}</Badge></TableCell>
                  <TableCell>{formatPence(v.discount_pennies)}</TableCell>
                  <TableCell className="text-sm">
                    {v.treatment_slug
                      ? <Badge variant="secondary">{treatmentNameBySlug.get(v.treatment_slug) ?? v.treatment_slug}</Badge>
                      : <span className="text-muted-foreground">All treatments</span>}
                  </TableCell>
                  <TableCell className="text-sm max-w-[260px]">
                    {v.kind === "signup" ? (
                      <>
                        <div>{v.first_name} {v.surname}</div>
                        <div className="text-muted-foreground text-xs truncate">{v.email}</div>
                      </>
                    ) : (
                      <div className="text-muted-foreground truncate">{v.notes || "—"}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{v.used_count} / {v.max_uses}</TableCell>
                  <TableCell className="text-sm">
                    {v.expires_at ? (
                      <span className={expired ? "text-destructive" : ""}>
                        {new Date(v.expires_at).toLocaleString("en-GB")}
                      </span>
                    ) : <span className="text-muted-foreground">Never</span>}
                  </TableCell>
                  <TableCell>
                    <Switch checked={v.is_active && !expired && !usedUp} disabled={expired || usedUp} onCheckedChange={(c) => toggleActive.mutate({ id: v.id, active: c })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this voucher?")) remove.mutate(v.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SettingsCard({ settings, onSave }: { settings: Settings; onSave: (patch: Partial<Settings>) => void }) {
  const [enabled, setEnabled] = useState(settings.signup_enabled);
  const [amount, setAmount] = useState((settings.signup_discount_pennies / 100).toString());
  const [hours, setHours] = useState(settings.signup_expiry_hours.toString());
  const [headline, setHeadline] = useState(settings.signup_headline);
  const [subtext, setSubtext] = useState(settings.signup_subtext);

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Signup voucher</h2>
          <p className="text-sm text-muted-foreground">Visitors who submit the form on the homepage receive this voucher.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="enabled" className="text-sm">Enabled</Label>
          <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Discount amount (£)</Label>
          <Input type="number" min={1} step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Validity (hours)</Label>
          <Input type="number" min={1} max={720} value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Subtext</Label>
          <Textarea value={subtext} onChange={(e) => setSubtext(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() =>
            onSave({
              signup_enabled: enabled,
              signup_discount_pennies: Math.round(parseFloat(amount || "0") * 100),
              signup_expiry_hours: parseInt(hours || "24", 10),
              signup_headline: headline,
              signup_subtext: subtext,
            })
          }
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}

function NewPromoDialog({ treatments, onCreated }: { treatments: TreatmentOption[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("10");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresDays, setExpiresDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [treatmentSlug, setTreatmentSlug] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    try {
      const expiresAt = expiresDays
        ? new Date(Date.now() + parseInt(expiresDays, 10) * 86400 * 1000).toISOString()
        : null;
      const { error } = await supabase.from("voucher_codes").insert({
        code: code.trim().toUpperCase(),
        kind: "promo",
        discount_pennies: Math.round(parseFloat(amount || "0") * 100),
        max_uses: parseInt(maxUses || "1", 10),
        expires_at: expiresAt,
        notes: notes.trim(),
        treatment_slug: treatmentSlug === "all" ? null : treatmentSlug,
        is_active: true,
      });
      if (error) throw error;
      toast.success("Promo code created");
      setOpen(false);
      setCode(""); setAmount("10"); setMaxUses("100"); setExpiresDays("30"); setNotes(""); setTreatmentSlug("all");
      onCreated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  const valid = code.trim().length >= 3 && parseFloat(amount) > 0 && parseInt(maxUses, 10) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />New promo code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create a promo code</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Discount (£)</Label>
              <Input type="number" min={1} step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Max uses</Label>
              <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Applies to</Label>
            <Select value={treatmentSlug} onValueChange={setTreatmentSlug}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a treatment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All treatments</SelectItem>
                {treatments.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Restrict this code to a single treatment, or leave as "All treatments".
            </p>
          </div>
          <div>
            <Label className="text-xs">Expires in (days, leave blank for never)</Label>
            <Input type="number" min={0} value={expiresDays} onChange={(e) => setExpiresDays(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Notes (e.g. Instagram campaign)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!valid || saving}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
