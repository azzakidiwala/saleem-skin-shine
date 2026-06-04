import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/conditions")({ component: ConditionsAdmin });

type Area = "face" | "body" | "skin";
type Cond = {
  id: string;
  area: Area;
  name: string;
  description: string;
  treatments: string[];
  sort_order: number;
  is_active: boolean;
};

function ConditionsAdmin() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold">Conditions</h1>
        <p className="text-muted-foreground mt-1">Add, edit, remove, and reorder conditions shown on Face, Body, and Skin pages.</p>
      </div>
      <Tabs defaultValue="face">
        <TabsList>
          <TabsTrigger value="face">Face</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="skin">Skin</TabsTrigger>
        </TabsList>
        <TabsContent value="face"><AreaList area="face" /></TabsContent>
        <TabsContent value="body"><AreaList area="body" /></TabsContent>
        <TabsContent value="skin"><AreaList area="skin" /></TabsContent>
      </Tabs>
    </div>
  );
}

function AreaList({ area }: { area: Area }) {
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({
    queryKey: ["admin", "conditions", area],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conditions").select("*").eq("area", area).order("sort_order");
      if (error) throw error;
      return data as Cond[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "conditions", area] });
    qc.invalidateQueries({ queryKey: ["conditions", area] });
  };

  const add = useMutation({
    mutationFn: async () => {
      const nextOrder = ((items ?? []).reduce((m, c) => Math.max(m, c.sort_order), 0)) + 10;
      const { error } = await supabase
        .from("conditions")
        .insert({ area, name: "New condition", description: "", treatments: [], sort_order: nextOrder });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Condition added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => add.mutate()} disabled={add.isPending}>
          <Plus className="h-4 w-4 mr-2" /> Add {area} condition
        </Button>
        <a
          href={`/conditions/${area}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View {area} page <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      <div className="space-y-3">
        {(items ?? []).map((c, idx) => (
          <CondRow
            key={c.id}
            cond={c}
            isFirst={idx === 0}
            isLast={idx === (items?.length ?? 0) - 1}
            above={items?.[idx - 1]}
            below={items?.[idx + 1]}
            onChanged={invalidate}
          />
        ))}
        {items && items.length === 0 && <p className="text-muted-foreground text-sm">No {area} conditions yet.</p>}
      </div>
    </div>
  );
}

function CondRow({
  cond, isFirst, isLast, above, below, onChanged,
}: {
  cond: Cond; isFirst: boolean; isLast: boolean; above?: Cond; below?: Cond; onChanged: () => void;
}) {
  const [name, setName] = useState(cond.name);
  const [description, setDescription] = useState(cond.description);
  const [treatments, setTreatments] = useState(cond.treatments.join("\n"));
  const [active, setActive] = useState(cond.is_active);
  const [saving, setSaving] = useState(false);
  const dirty =
    name !== cond.name ||
    description !== cond.description ||
    treatments !== cond.treatments.join("\n") ||
    active !== cond.is_active;

  async function save() {
    setSaving(true);
    try {
      const t = treatments.split("\n").map(s => s.trim()).filter(Boolean);
      const { error } = await supabase
        .from("conditions")
        .update({ name, description, treatments: t, is_active: active })
        .eq("id", cond.id);
      if (error) throw error;
      toast.success("Saved");
      onChanged();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm(`Delete "${cond.name}"?`)) return;
    const { error } = await supabase.from("conditions").delete().eq("id", cond.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  }

  async function swap(other?: Cond) {
    if (!other) return;
    const { error: e1 } = await supabase.from("conditions").update({ sort_order: other.sort_order }).eq("id", cond.id);
    const { error: e2 } = await supabase.from("conditions").update({ sort_order: cond.sort_order }).eq("id", other.id);
    if (e1 || e2) return toast.error((e1 ?? e2)!.message);
    onChanged();
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={isFirst} onClick={() => swap(above)} title="Move up"><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" disabled={isLast} onClick={() => swap(below)} title="Move down"><ChevronDown className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-muted-foreground">{active ? "Visible" : "Hidden"}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={remove} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Treatment options <span className="text-muted-foreground text-xs">(one per line)</span></Label>
        <Textarea rows={4} value={treatments} onChange={(e) => setTreatments(e.target.value)} placeholder="e.g.&#10;Hydrafacial&#10;Microneedling" />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={!dirty || saving}>Save</Button>
      </div>
    </div>
  );
}
