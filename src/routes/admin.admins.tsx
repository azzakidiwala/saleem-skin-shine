import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound, UserCheck, UserX, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listAdmins, inviteAdmin, removeAdmin, updateAdminPassword, setAdminActive } from "@/lib/admin/admins.functions";
import { useIsAdmin } from "@/lib/admin/auth";

type AdminRow = { user_id: string; email: string | null; created_at: string; active: boolean };

function normalizeAdminsResponse(value: unknown): AdminRow[] {
  if (Array.isArray(value)) return value as AdminRow[];
  if (value && typeof value === "object" && Array.isArray((value as { result?: unknown }).result)) {
    return (value as { result: AdminRow[] }).result;
  }
  return [];
}

export const Route = createFileRoute("/admin/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdmins);
  const invite = useServerFn(inviteAdmin);
  const remove = useServerFn(removeAdmin);
  const updatePw = useServerFn(updateAdminPassword);
  const setActive = useServerFn(setAdminActive);
  const { session } = useIsAdmin();
  const getAuthHeaders = () => {
    if (!session?.access_token) throw new Error("Please sign in again.");
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: async () => normalizeAdminsResponse(await list({ headers: getAuthHeaders() })),
    enabled: !!session?.access_token,
    throwOnError: false,
  });

  const inviteMut = useMutation({
    mutationFn: async (input: { email: string; password: string }) => invite({ data: input, headers: getAuthHeaders() }),
    onSuccess: () => { toast.success("Admin created"); qc.invalidateQueries({ queryKey: ["admin", "admins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: async (user_id: string) => remove({ data: { user_id }, headers: getAuthHeaders() }),
    onSuccess: () => { toast.success("Admin removed"); qc.invalidateQueries({ queryKey: ["admin", "admins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const passwordMut = useMutation({
    mutationFn: async (input: { user_id: string; password: string }) => updatePw({ data: input, headers: getAuthHeaders() }),
    onSuccess: () => toast.success("Password updated"),
    onError: (e: any) => toast.error(e.message),
  });

  const activeMut = useMutation({
    mutationFn: async (input: { user_id: string; active: boolean }) => setActive({ data: input, headers: getAuthHeaders() }),
    onSuccess: (_d, vars) => { toast.success(vars.active ? "Admin activated" : "Admin deactivated"); qc.invalidateQueries({ queryKey: ["admin", "admins"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admins</h1>
          <p className="text-muted-foreground mt-1">Create or remove people who can manage the site.</p>
        </div>
        <CreateDialog onCreate={(input) => inviteMut.mutateAsync(input)} />
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {isLoading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}
        {error && <div className="text-center py-8 text-destructive">Could not load admins. Please try again.</div>}
        {(data ?? []).map((a) => (
          <div key={a.user_id} className="rounded-lg border bg-card p-3 space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{a.email ?? a.user_id}</div>
                <div className="text-xs text-muted-foreground">
                  {a.user_id === session?.user.id ? "You · " : ""}Added {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
              <Badge variant={a.active ? "default" : "secondary"} className="shrink-0">{a.active ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost" size="icon"
                disabled={a.user_id === session?.user.id || activeMut.isPending}
                title={a.active ? "Deactivate" : "Activate"}
                onClick={() => activeMut.mutate({ user_id: a.user_id, active: !a.active })}
              >
                {a.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
              <PasswordDialog
                email={a.email ?? a.user_id}
                onSave={(password) => passwordMut.mutateAsync({ user_id: a.user_id, password })}
              />
              <Button
                variant="ghost" size="icon"
                disabled={a.user_id === session?.user.id}
                onClick={() => { if (confirm(`Remove admin access for ${a.email}?`)) removeMut.mutate(a.user_id); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={4} className="text-center py-8 text-destructive">Could not load admins. Please try again.</TableCell></TableRow>}
            {(data ?? []).map((a) => (
              <TableRow key={a.user_id}>
                <TableCell className="font-medium">{a.email ?? a.user_id}{a.user_id === session?.user.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                <TableCell>
                  <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost" size="icon"
                    disabled={a.user_id === session?.user.id || activeMut.isPending}
                    title={a.active ? "Deactivate" : "Activate"}
                    onClick={() => activeMut.mutate({ user_id: a.user_id, active: !a.active })}
                  >
                    {a.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <PasswordDialog
                    email={a.email ?? a.user_id}
                    onSave={(password) => passwordMut.mutateAsync({ user_id: a.user_id, password })}
                  />
                  <Button
                    variant="ghost" size="icon"
                    disabled={a.user_id === session?.user.id}
                    onClick={() => { if (confirm(`Remove admin access for ${a.email}?`)) removeMut.mutate(a.user_id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NotificationRecipients />
    </div>
  );
}

type Recipient = { id: string; email: string; enabled: boolean };

function NotificationRecipients() {
  const qc = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "booking-recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_notification_recipients")
        .select("id, email, enabled")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Recipient[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (r: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("booking_notification_recipients")
        .update({ enabled: r.enabled })
        .eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "booking-recipients"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const add = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("booking_notification_recipients")
        .insert({ email: email.trim().toLowerCase(), enabled: true });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewEmail("");
      toast.success("Recipient added");
      qc.invalidateQueries({ queryKey: ["admin", "booking-recipients"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_notification_recipients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recipient removed");
      qc.invalidateQueries({ queryKey: ["admin", "booking-recipients"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 pt-6 border-t">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" /> Booking notification recipients
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose which addresses receive an email when a new booking comes in from the website. Tick to enable.
        </p>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {isLoading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}
        {(data ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <Checkbox checked={r.enabled} onCheckedChange={(v) => toggle.mutate({ id: r.id, enabled: !!v })} />
            <div className="min-w-0 text-sm font-medium truncate">{r.email}</div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { if (confirm(`Remove ${r.email}?`)) remove.mutate(r.id); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {data && data.length === 0 && <div className="text-center py-8 text-muted-foreground">No recipients yet.</div>}
      </div>

      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Receive</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {(data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox
                    checked={r.enabled}
                    onCheckedChange={(v) => toggle.mutate({ id: r.id, enabled: !!v })}
                  />
                </TableCell>
                <TableCell className="font-medium">{r.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { if (confirm(`Remove ${r.email}?`)) remove.mutate(r.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data && data.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No recipients yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          type="email"
          placeholder="name@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button
          disabled={!newEmail.includes("@") || add.isPending}
          onClick={() => add.mutate(newEmail)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}

function CreateDialog({ onCreate }: { onCreate: (input: { email: string; password: string }) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Create admin</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create admin</DialogTitle>
          <DialogDescription>Creates a new admin account with the email and password you set. Share these details securely.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={busy || !email || password.length < 8}
            onClick={async () => {
              setBusy(true);
              try { await onCreate({ email, password }); setEmail(""); setPassword(""); setOpen(false); }
              finally { setBusy(false); }
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordDialog({ email, onSave }: { email: string; onSave: (password: string) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPassword(""); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Change password">
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Set a new password for {email}. Share it securely.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>New password</Label>
          <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={busy || password.length < 8}
            onClick={async () => {
              setBusy(true);
              try { await onSave(password); setPassword(""); setOpen(false); }
              finally { setBusy(false); }
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
