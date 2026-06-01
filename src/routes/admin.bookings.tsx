import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Loader2, CalendarIcon } from "lucide-react";
import { updateBookingStatus } from "@/lib/admin/bookings.functions";
import { treatments } from "@/data/treatments";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

type Booking = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  mobile: string;
  treatment_name: string;
  treatment_slug: string;
  treatment_price: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  confirmed_at: string | null;
  created_at: string;
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "cancelled") return "destructive";
  if (status === "completed") return "secondary";
  if (status === "confirmed") return "default";
  return "outline";
}

function BookingsPage() {
  const qc = useQueryClient();
  const setBookingStatus = useServerFn(updateBookingStatus);
  const [filter, setFilter] = useState<string>("upcoming");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "bookings", filter],
    queryFn: async () => {
      let q = supabase.from("bookings").select("*").order("appointment_date", { ascending: true }).order("appointment_time");
      const today = new Date().toISOString().slice(0, 10);
      if (filter === "upcoming") q = q.gte("appointment_date", today).neq("status", "cancelled");
      else if (filter === "past") q = q.lt("appointment_date", today);
      else if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Booking[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await setBookingStatus({ data: { id, status: status as "pending" | "confirmed" | "completed" | "cancelled" } });
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.status === "confirmed" ? "Booking confirmed and customer emailed" : "Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reschedule = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const { error } = await supabase.from("bookings").update({ appointment_date: date, appointment_time: time }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking rescheduled"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking deleted"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.first_name.toLowerCase().includes(s) ||
      b.surname.toLowerCase().includes(s) ||
      b.email.toLowerCase().includes(s) ||
      b.mobile.toLowerCase().includes(s) ||
      b.treatment_name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="text-muted-foreground mt-1">View, reschedule, or cancel appointments.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {[
            { value: "upcoming", label: "Upcoming" },
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
            { value: "past", label: "Past" },
          ].map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={filter === opt.value ? "default" : "ghost"}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <Input placeholder="Search name, email, treatment…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings.</TableCell></TableRow>}
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {b.appointment_date}<div className="text-xs text-muted-foreground">{b.appointment_time}</div>
                </TableCell>
                <TableCell>{b.first_name} {b.surname}</TableCell>
                <TableCell className="text-sm">
                  <div>{b.email}</div>
                  <div className="text-muted-foreground">{b.mobile}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {b.treatment_name}
                  {b.treatment_price && <div className="text-muted-foreground">{b.treatment_price}</div>}
                </TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v })}>
                    <SelectTrigger className="w-32 h-8">
                      <Badge variant={statusVariant(b.status)} className="capitalize">{b.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {b.status === "confirmed" && b.confirmed_at && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Confirmed {new Date(b.confirmed_at).toLocaleString("en-GB")}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <RescheduleDialog booking={b} onSubmit={(date, time) => reschedule.mutate({ id: b.id, date, time })} />
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this booking?")) remove.mutate(b.id); }}>
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

function RescheduleDialog({ booking, onSubmit }: { booking: Booking; onSubmit: (date: string, time: string) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(booking.appointment_date);
  const [time, setTime] = useState(booking.appointment_time);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Reschedule booking</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="space-y-2"><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSubmit(date, time); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
