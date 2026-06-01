import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { uploadSiteImage } from "@/lib/admin/storage";
import { treatmentCategories } from "@/lib/content/queries";

export const Route = createFileRoute("/admin/treatments")({
  component: TreatmentsPage,
});

const CATS = treatmentCategories.filter((c) => c !== "All");

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  long_description: string;
  price: string;
  duration: string;
  sessions: string;
  benefits: string[];
  what_to_expect: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Row = {
  id: "",
  slug: "",
  name: "",
  category: CATS[0],
  description: "",
  long_description: "",
  price: "",
  duration: "",
  sessions: "",
  benefits: [],
  what_to_expect: "",
  image_url: null,
  sort_order: 0,
  is_active: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizePrice(s: string) {
  const t = (s ?? "").trim();
  if (!t) return "";
  if (/^[£$€]/.test(t)) return t;
  if (/^\d/.test(t)) return `£${t}`;
  return t;
}

function normalizeDuration(s: string) {
  const t = (s ?? "").trim();
  if (!t) return "";
  if (/^\d+$/.test(t)) return `${t} mins`;
  return t;
}

async function renumberSortOrders(currentId: string) {
  const { data, error } = await supabase
    .from("treatments")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) return;
  const sorted = [...data].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    if (a.id === currentId) return -1;
    if (b.id === currentId) return 1;
    return 0;
  });
  await Promise.all(
    sorted.map((r, i) => {
      const newOrder = (i + 1) * 10;
      if (r.sort_order === newOrder) return Promise.resolve();
      return supabase.from("treatments").update({ sort_order: newOrder }).eq("id", r.id);
    })
  );
}

function TreatmentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "treatments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("treatments").select("*").order("sort_order");
      if (error) throw error;
      return data as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const payload = { ...row };
      if (!payload.slug) payload.slug = slugify(payload.name);
      payload.price = normalizePrice(payload.price);
      payload.duration = normalizeDuration(payload.duration);
      let savedId = payload.id;
      if (!payload.id) {
        const { id, ...insert } = payload;
        const { data: ins, error } = await supabase.from("treatments").insert(insert).select("id").single();
        if (error) throw error;
        savedId = ins?.id ?? "";
      } else {
        const { id, ...update } = payload;
        const { error } = await supabase.from("treatments").update(update).eq("id", id);
        if (error) throw error;
      }
      if (savedId) await renumberSortOrders(savedId);
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "treatments"] }); qc.invalidateQueries({ queryKey: ["treatments"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("treatments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "treatments"] }); qc.invalidateQueries({ queryKey: ["treatments"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Treatments</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove treatments shown on the site.</p>
        </div>
        <EditorDialog
          trigger={<Button><Plus className="h-4 w-4 mr-1" /> New treatment</Button>}
          initial={empty}
          onSave={(r) => save.mutateAsync(r)}
        />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.image_url && <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" />}</TableCell>
                <TableCell className="font-medium">
                  {r.name}
                  <div className="text-xs text-muted-foreground">{r.slug}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                <TableCell>{r.price}</TableCell>
                <TableCell>{r.sort_order}</TableCell>
                <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <EditorDialog
                    trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
                    initial={r}
                    onSave={(row) => save.mutateAsync(row)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete "${r.name}"?`)) remove.mutate(r.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EditorDialog({ trigger, initial, onSave }: { trigger: React.ReactNode; initial: Row; onSave: (r: Row) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Row>(initial);
  const [uploading, setUploading] = useState(false);
  const [benefitsText, setBenefitsText] = useState<string>(initial.benefits.join("\n"));
  const [extraCats, setExtraCats] = useState<string[]>(
    initial.category && !CATS.includes(initial.category) ? [initial.category] : []
  );
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const allCats = [...CATS, ...extraCats];

  function update<K extends keyof Row>(k: K, v: Row[K]) { setRow((r) => ({ ...r, [k]: v })); }

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage("treatments", file);
      update("image_url", url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setUploading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setRow(initial); setBenefitsText(initial.benefits.join("\n")); setExtraCats(initial.category && !CATS.includes(initial.category) ? [initial.category] : []); setAddingCat(false); setNewCat(""); } }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial.id ? "Edit treatment" : "New treatment"}</DialogTitle>
          <DialogDescription>All fields shown on the public site.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Name</Label><Input value={row.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Slug (URL)</Label><Input value={row.slug} onChange={(e) => update("slug", slugify(e.target.value))} placeholder="auto from name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-2">
                <Select value={row.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{allCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setAddingCat((v) => !v)} title="Add new category">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {addingCat && (
                <div className="flex gap-2">
                  <Input
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="New category name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = newCat.trim();
                        if (v && !allCats.includes(v)) { setExtraCats((x) => [...x, v]); update("category", v); }
                        setNewCat(""); setAddingCat(false);
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={() => {
                    const v = newCat.trim();
                    if (v && !allCats.includes(v)) { setExtraCats((x) => [...x, v]); update("category", v); }
                    setNewCat(""); setAddingCat(false);
                  }}>Add</Button>
                </div>
              )}
            </div>
            <div className="space-y-2"><Label>Price</Label><Input value={row.price} onChange={(e) => update("price", e.target.value)} placeholder="100 (£ added automatically)" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Duration</Label><Input value={row.duration} onChange={(e) => update("duration", e.target.value)} placeholder="30 (mins added automatically)" /></div>
            <div className="space-y-2"><Label>Sessions</Label><Input value={row.sessions} onChange={(e) => update("sessions", e.target.value)} placeholder="1 session" /></div>
          </div>
          <div className="space-y-2"><Label>Short description</Label><Textarea rows={2} value={row.description} onChange={(e) => update("description", e.target.value)} /></div>
          <div className="space-y-2"><Label>Long description</Label><Textarea rows={4} value={row.long_description} onChange={(e) => update("long_description", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Benefits (one per line)</Label>
            <Textarea
              rows={4}
              value={benefitsText}
              onChange={(e) => {
                const text = e.target.value;
                setBenefitsText(text);
                update("benefits", text.split("\n").map((x) => x.trim()).filter(Boolean));
              }}
            />
          </div>
          <div className="space-y-2"><Label>What to expect</Label><Textarea rows={3} value={row.what_to_expect} onChange={(e) => update("what_to_expect", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Image</Label>
            {row.image_url && <img src={row.image_url} alt="" className="h-32 w-full object-cover rounded border" />}
            <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {row.image_url && <Button type="button" variant="outline" size="sm" onClick={() => update("image_url", null)}>Remove image</Button>}
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={row.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value || "0", 10))} /></div>
            <div className="flex items-center gap-2"><Switch checked={row.is_active} onCheckedChange={(v) => update("is_active", v)} /><Label>Active (visible on site)</Label></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={async () => { await onSave(row); setOpen(false); }} disabled={uploading || !row.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
