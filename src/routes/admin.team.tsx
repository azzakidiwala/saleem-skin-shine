import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { uploadSiteImage } from "@/lib/admin/storage";

export const Route = createFileRoute("/admin/team")({
  component: TeamPage,
});

type Row = {
  id: string;
  name: string;
  role: string;
  bio: string;
  credentials: string;
  tags: string[];
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Row = {
  id: "", name: "", role: "", bio: "", credentials: "", tags: [], icon: "Stethoscope",
  image_url: null, sort_order: 0, is_active: true,
};

async function renumberSortOrders(currentId: string) {
  const { data, error } = await supabase
    .from("team_members")
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
      return supabase.from("team_members").update({ sort_order: newOrder }).eq("id", r.id);
    })
  );
}

function TeamPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
      if (error) throw error;
      return data as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      let savedId = row.id;
      if (!row.id) {
        const { id, ...insert } = row;
        const { data: ins, error } = await supabase.from("team_members").insert(insert).select("id").single();
        if (error) throw error;
        savedId = ins?.id ?? "";
      } else {
        const { id, ...update } = row;
        const { error } = await supabase.from("team_members").update(update).eq("id", id);
        if (error) throw error;
      }
      if (savedId) await renumberSortOrders(savedId);
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "team"] }); qc.invalidateQueries({ queryKey: ["team"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "team"] }); qc.invalidateQueries({ queryKey: ["team"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Team</h1>
          <p className="text-muted-foreground mt-1">Manage the Meet the Team page.</p>
        </div>
        <EditorDialog
          trigger={<Button><Plus className="h-4 w-4 mr-1" /> New member</Button>}
          initial={empty}
          onSave={(r) => save.mutateAsync(r)}
        />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.image_url && <img src={r.image_url} alt="" className="h-10 w-10 rounded-full object-cover" />}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.sort_order}</TableCell>
                <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <EditorDialog
                    trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
                    initial={r}
                    onSave={(row) => save.mutateAsync(row)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete ${r.name}?`)) remove.mutate(r.id); }}>
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
  const [tagInput, setTagInput] = useState(initial.tags.join(", "));

  function update<K extends keyof Row>(k: K, v: Row[K]) { setRow((r) => ({ ...r, [k]: v })); }

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage("team", file);
      update("image_url", url);
      toast.success("Photo uploaded");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  function parseTags() {
    update("tags", tagInput.split(",").map((x) => x.trim()).filter(Boolean));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) {
        setRow(initial);
        setTagInput(initial.tags.join(", "));
      }
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial.id ? "Edit team member" : "New team member"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Name</Label><Input value={row.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Role</Label><Input value={row.role} onChange={(e) => update("role", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Credentials</Label><Input value={row.credentials} onChange={(e) => update("credentials", e.target.value)} /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea rows={4} value={row.bio} onChange={(e) => update("bio", e.target.value)} /></div>
          <div className="space-y-2"><Label>Tags (comma separated)</Label>
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onBlur={parseTags} />
          </div>
          <div className="space-y-2"><Label>Icon name (lucide)</Label><Input value={row.icon} onChange={(e) => update("icon", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Photo</Label>
            {row.image_url && <img src={row.image_url} alt="" className="h-32 w-32 rounded-full object-cover border" />}
            <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {row.image_url && <Button type="button" variant="outline" size="sm" onClick={() => update("image_url", null)}>Remove photo</Button>}
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={row.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value || "0", 10))} /></div>
            <div className="flex items-center gap-2"><Switch checked={row.is_active} onCheckedChange={(v) => update("is_active", v)} /><Label>Active</Label></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            parseTags();
            await onSave({ ...row, tags: tagInput.split(",").map((x) => x.trim()).filter(Boolean) });
            setOpen(false);
          }} disabled={uploading || !row.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
