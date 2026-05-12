import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadSiteImage } from "@/lib/admin/storage";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

type Row = { key: string; value: any; label: string; group_name: string };

const GROUP_LABEL: Record<string, string> = {
  hero: "Homepage Hero",
  about: "About Section",
  cta: "Call to Action / Contact",
  announcement: "Announcement Bar",
};

function ContentPage() {
  const qc = useQueryClient();
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
        // safety net for array fields still held as raw string
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

  const grouped = (data ?? []).reduce<Record<string, Row[]>>((acc, r) => {
    (acc[r.group_name] ||= []).push(r); return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold">Site Content</h1>
        <p className="text-muted-foreground mt-1">Edit text and images shown across the public site.</p>
      </div>

      <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-destructive">Changes go live immediately</p>
          <p className="text-foreground/80">
            Anything you save here updates the public website right away and cannot be undone. Please double-check spelling, links, and images before clicking Save.
          </p>
        </div>
      </div>

      {Object.entries(grouped).map(([group, rows]) => (
        <section key={group} className="rounded-lg border bg-card p-6 space-y-5">
          <h2 className="text-xl font-semibold">{GROUP_LABEL[group] ?? group}</h2>
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
      ))}
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
    <div className="space-y-2">
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
