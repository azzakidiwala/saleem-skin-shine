import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, CalendarPlus, Eye } from "lucide-react";
import { useTreatments } from "@/lib/content/queries";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

type Customer = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  mobile: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type CustomerBooking = {
  id: string;
  treatment_name: string;
  treatment_price: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "cancelled") return "destructive";
  if (status === "completed") return "secondary";
  if (status === "confirmed") return "default";
  return "outline";
}

function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: bookingCounts } = useQuery({
    queryKey: ["admin", "customers", "booking-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("customer_id")
        .not("customer_id", "is", null);
      if (error) throw error;
      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        const id = (row as { customer_id: string }).customer_id;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      return counts;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (customers ?? []).filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(s) ||
      c.surname.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.mobile.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="text-muted-foreground mt-1">Every person who has booked. Click a customer to view their bookings or book a new appointment for them.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search name, email, mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="text-sm text-muted-foreground">
          {customers ? `${customers.length} total` : ""}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No customers yet.</TableCell></TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.first_name} {c.surname}</TableCell>
                <TableCell className="text-sm">{c.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.mobile}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{bookingCounts?.get(c.id) ?? 0}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(c.updated_at).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CustomerDetailDialog customer={c} />
                    <EditCustomerDialog customer={c} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete ${c.first_name} ${c.surname}? Their bookings will be kept but unlinked.`)) {
                          remove.mutate(c.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CustomerDetailDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const { data: bookings } = useQuery({
    queryKey: ["admin", "customers", customer.id, "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, treatment_name, treatment_price, appointment_date, appointment_time, status, created_at")
        .eq("customer_id", customer.id)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });
      if (error) throw error;
      return data as CustomerBooking[];
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="View details"><Eye className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer.first_name} {customer.surname}</DialogTitle>
          <DialogDescription>
            {customer.email} · {customer.mobile}
          </DialogDescription>
        </DialogHeader>

        {customer.notes && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
            {customer.notes}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <h3 className="text-sm font-semibold">Booking history ({bookings?.length ?? 0})</h3>
          <NewBookingForCustomer customer={customer} />
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!bookings || bookings.length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">No bookings yet.</TableCell></TableRow>
              )}
              {(bookings ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium whitespace-nowrap text-sm">
                    {b.appointment_date}
                    <div className="text-xs text-muted-foreground">{b.appointment_time}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {b.treatment_name}
                    {b.treatment_price && <div className="text-xs text-muted-foreground">{b.treatment_price}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(b.status)} className="capitalize">{b.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Link
            to="/admin/bookings"
            className="text-sm text-muted-foreground hover:text-foreground self-center"
          >
            Manage in bookings →
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewBookingForCustomer({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const { data: treatments = [] } = useTreatments();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <CalendarPlus className="h-4 w-4 mr-1" /> New booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New booking for {customer.first_name} {customer.surname}</DialogTitle>
          <DialogDescription>Pick a treatment — the booking form will open with their details pre-filled.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Treatment</Label>
          <Select value={slug} onValueChange={setSlug}>
            <SelectTrigger><SelectValue placeholder="Choose a treatment" /></SelectTrigger>
            <SelectContent>
              {treatments.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Link
            to="/book/$slug"
            params={{ slug }}
            search={{
              email: customer.email,
              first: customer.first_name,
              surname: customer.surname,
              mobile: customer.mobile,
            }}
            target="_blank"
            rel="noreferrer"
            className={slug ? "" : "pointer-events-none opacity-50"}
            onClick={() => setOpen(false)}
          >
            <Button disabled={!slug}>Open booking form</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCustomerDialog({ customer }: { customer: Customer }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState(customer);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: row.first_name,
          surname: row.surname,
          email: row.email,
          mobile: row.mobile,
          notes: row.notes,
        })
        .eq("id", customer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer updated");
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setRow(customer); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit customer</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>First name</Label><Input value={row.first_name} onChange={(e) => setRow({ ...row, first_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Surname</Label><Input value={row.surname} onChange={(e) => setRow({ ...row, surname: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={row.email} onChange={(e) => setRow({ ...row, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Mobile</Label><Input value={row.mobile} onChange={(e) => setRow({ ...row, mobile: e.target.value })} /></div>
          <div className="space-y-2"><Label>Notes (internal)</Label><Textarea rows={4} value={row.notes} onChange={(e) => setRow({ ...row, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
