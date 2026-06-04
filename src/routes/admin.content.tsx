import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ChevronRight, ArrowLeft, FileText, ExternalLink, HelpCircle, Stethoscope } from "lucide-react";
import { uploadSiteImage } from "@/lib/admin/storage";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

type Row = { key: string; value: any; label: string; group_name: string };

type PageDef = { id: string; label: string; description: string; groups: string[]; href: string };

const PAGES: PageDef[] = [
  { id: "home", label: "Home Page", description: "Hero, About, Call to Action and Announcement bar.", groups: ["hero", "about", "cta", "announcement"], href: "/" },
  { id: "team", label: "Meet the Team", description: "Intro shown above the team grid.", groups: ["team"], href: "/team" },
  { id: "conditions_face", label: "Conditions — Face", description: "Title and intro of the Face Conditions page.", groups: ["conditions_face"], href: "/conditions/face" },
  { id: "conditions_body", label: "Conditions — Body", description: "Title and intro of the Body Conditions page.", groups: ["conditions_body"], href: "/conditions/body" },
  { id: "conditions_skin", label: "Conditions — Skin", description: "Title and intro of the Skin Conditions page.", groups: ["conditions_skin"], href: "/conditions/skin" },
  { id: "faq", label: "FAQ", description: "Header text on the FAQ page.", groups: ["faq"], href: "/faq" },
  { id: "contact", label: "Contact", description: "Header text, address and opening hours.", groups: ["contact"], href: "/contact" },
];

const GROUP_LABEL: Record<string, string> = {
  hero: "Homepage Hero",
  about: "About Section",
  cta: "Call to Action / Contact",
  announcement: "Announcement Bar",
  team: "Meet the Team",
  conditions_face: "Face Conditions",
  conditions_body: "Body Conditions",
  conditions_skin: "Skin Conditions",
  faq: "FAQ",
  contact: "Contact",
};

function ContentPage() {
  const qc = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").order("group_name").order("key");
      if (error) throw error;
      return data as Row[];
    },
  });

  const [draft, setDraft] = useState<Record<string, any>>({});
  useEffect(() => {
    if (data) {
      const m: Record<string, any> = {};
      for (const r of data) m[r.key] = r.value;
      setDraft(m);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async (key: string) => {
      let value = draft[key];
      if (Array.isArray(value)) value = value.map((x) => (typeof x === "string" ? x.trim() : x)).filter(Boolean);
      else if (typeof value === "string" && value.includes("\n")) {
        const orig = (data ?? []).find((r) => r.key === key);
        if (Array.isArray(orig?.value)) value = value.split("\n").map((x) => x.trim()).filter(Boolean);
      }
      const { error } = await supabase.from("site_content").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "content"] }); qc.invalidateQueries({ queryKey: ["site_content"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;

  const rowsByGroup = (data ?? []).reduce<Record<string, Row[]>>((acc, r) => {
    (acc[r.group_name] ||= []).push(r); return acc;
  }, {});

  // Page list view
  if (!selectedPage) {
    const shortcuts = [
      { to: "/admin/conditions", label: "Conditions (Face / Body / Skin)", description: "Add, edit, remove or reorder conditions shown on the public conditions pages.", icon: Stethoscope },
      { to: "/admin/faqs", label: "FAQs", description: "Add, edit, remove or reorder questions on the FAQ page.", icon: HelpCircle },
    ] as const;

    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-semibold">Site Content</h1>
          <p className="text-muted-foreground mt-1">Choose what to edit. The small arrow next to each item opens that page on the live site.</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">List editors</h2>
          <div className="grid gap-3">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.to}
                  to={s.to as any}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card p-5 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-sm text-muted-foreground">{s.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Page text & images</h2>
          <div className="grid gap-3">
            {PAGES.map((p) => {
              const count = p.groups.reduce((n, g) => n + (rowsByGroup[g]?.length ?? 0), 0);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-card p-5 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <button onClick={() => setSelectedPage(p.id)} className="flex items-start gap-3 text-left flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-sm text-muted-foreground">{p.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{count} editable field{count === 1 ? "" : "s"}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      title="Open this page on the live site"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button onClick={() => setSelectedPage(p.id)} className="p-1" title="Edit">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const page = PAGES.find((p) => p.id === selectedPage)!;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <button
          onClick={() => setSelectedPage(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> All pages
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{page.label}</h1>
            <p className="text-muted-foreground mt-1">{page.description}</p>
          </div>
          <a
            href={page.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0 mt-2"
            title="Open this page on the live site"
          >
            View on site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-destructive">Changes go live immediately</p>
          <p className="text-foreground/80">
            Anything you save here updates the public website right away. Please double-check spelling, links, and images before clicking Save.
          </p>
        </div>
      </div>

      {page.groups.map((group) => {
        const rows = rowsByGroup[group];
        if (!rows || rows.length === 0) return null;
        return (
          <section key={group} className="rounded-lg border bg-card p-6 space-y-5">
            {page.groups.length > 1 && (
              <h2 className="text-xl font-semibold">{GROUP_LABEL[group] ?? group}</h2>
            )}
            {rows.map((r) => (
              <Field
                key={r.key}
                row={r}
                value={draft[r.key]}
                onChange={(v) => setDraft((d) => ({ ...d, [r.key]: v }))}
                onSave={() => save.mutateAsync(r.key)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Field({ row, value, onChange, onSave }: { row: Row; value: any; onChange: (v: any) => void; onSave: () => Promise<void> }) {
  const isImage = row.key.endsWith("image_url");
  const isArray = Array.isArray(row.value);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage("content", file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-2 rounded-md border bg-background/40 p-4">
      <Label>{row.label}</Label>
      {isImage ? (
        <div className="space-y-2">
          {value && <img src={value} alt="" className="h-32 rounded border object-cover" />}
          <div className="flex gap-2 items-center">
            <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {value && <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>Clear</Button>}
          </div>
          <Input placeholder="or paste image URL" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : isArray ? (
        <Textarea
          rows={4}
          value={Array.isArray(value) ? value.join("\n") : (typeof value === "string" ? value : "")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
          placeholder="One per line"
        />
      ) : typeof row.value === "string" && row.value.length > 80 ? (
        <Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      <div className="flex justify-end">
        <Button size="sm" onClick={onSave} disabled={uploading}>Save</Button>
      </div>
    </div>
  );
}
