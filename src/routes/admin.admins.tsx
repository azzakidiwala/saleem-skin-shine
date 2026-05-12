import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { listAdmins, inviteAdmin, removeAdmin, updateAdminPassword } from "@/lib/admin/admins.functions";
import { useIsAdmin } from "@/lib/admin/auth";

type AdminRow = { user_id: string; email: string | null; created_at: string };

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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Admins</h1>
          <p className="text-muted-foreground mt-1">Create or remove people who can manage the site.</p>
        </div>
        <CreateDialog onCreate={(input) => inviteMut.mutateAsync(input)} />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={3} className="text-center py-8 text-destructive">Could not load admins. Please try again.</TableCell></TableRow>}
            {(data ?? []).map((a) => (
              <TableRow key={a.user_id}>
                <TableCell className="font-medium">{a.email ?? a.user_id}{a.user_id === session?.user.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
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
