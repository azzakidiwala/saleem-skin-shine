import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/faqs")({ component: FaqsPage });

type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

function FaqsPage() {
  const qc = useQueryClient();
  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
      if (error) throw error;
      return data as Faq[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  };

  const add = useMutation({
    mutationFn: async () => {
      const nextOrder = ((faqs ?? []).reduce((m, f) => Math.max(m, f.sort_order), 0)) + 10;
      const { error } = await supabase
        .from("faqs")
        .insert({ question: "New question", answer: "Answer goes here.", sort_order: nextOrder });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("FAQ added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">FAQs</h1>
          <p className="text-muted-foreground mt-1">Add, edit, remove, and reorder questions shown on the public FAQ page.</p>
        </div>
        <a
          href="/faq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View on site <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Button onClick={() => add.mutate()} disabled={add.isPending}>
        <Plus className="h-4 w-4 mr-2" /> Add question
      </Button>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="space-y-3">
        {(faqs ?? []).map((f, idx) => (
          <FaqRow
            key={f.id}
            faq={f}
            isFirst={idx === 0}
            isLast={idx === (faqs?.length ?? 0) - 1}
            neighborAbove={faqs?.[idx - 1]}
            neighborBelow={faqs?.[idx + 1]}
            onChanged={invalidate}
          />
        ))}
        {faqs && faqs.length === 0 && <p className="text-muted-foreground text-sm">No questions yet. Click "Add question" to create one.</p>}
      </div>
    </div>
  );
}

function FaqRow({
  faq, isFirst, isLast, neighborAbove, neighborBelow, onChanged,
}: {
  faq: Faq;
  isFirst: boolean;
  isLast: boolean;
  neighborAbove?: Faq;
  neighborBelow?: Faq;
  onChanged: () => void;
}) {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [active, setActive] = useState(faq.is_active);
  const [saving, setSaving] = useState(false);
  const dirty = question !== faq.question || answer !== faq.answer || active !== faq.is_active;

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("faqs")
        .update({ question, answer, is_active: active })
        .eq("id", faq.id);
      if (error) throw error;
      toast.success("Saved");
      onChanged();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm(`Delete this question?\n\n"${faq.question}"`)) return;
    const { error } = await supabase.from("faqs").delete().eq("id", faq.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  }

  async function swap(other?: Faq) {
    if (!other) return;
    const { error: e1 } = await supabase.from("faqs").update({ sort_order: other.sort_order }).eq("id", faq.id);
    const { error: e2 } = await supabase.from("faqs").update({ sort_order: faq.sort_order }).eq("id", other.id);
    if (e1 || e2) return toast.error((e1 ?? e2)!.message);
    onChanged();
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={isFirst} onClick={() => swap(neighborAbove)} title="Move up"><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" disabled={isLast} onClick={() => swap(neighborBelow)} title="Move down"><ChevronDown className="h-4 w-4" /></Button>
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
        <Label>Question</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Answer</Label>
        <Textarea rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={!dirty || saving}>Save</Button>
      </div>
    </div>
  );
}
