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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Bookings</h1>
          <p className="text-muted-foreground mt-1">View, reschedule, or cancel appointments.</p>
        </div>
        <NewBookingDialog onCreated={() => qc.invalidateQueries({ queryKey: ["admin", "bookings"] })} />
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

// ============ New Booking Dialog ============
type CustomerLite = { id: string; first_name: string; surname: string; email: string; mobile: string };

const ALL_TIMES: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NewBookingDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [treatmentSlug, setTreatmentSlug] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const treatment = useMemo(() => treatments.find((t) => t.slug === treatmentSlug), [treatmentSlug]);

  const { data: customers } = useQuery({
    queryKey: ["admin", "customers", "lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, surname, email, mobile")
        .order("first_name");
      if (error) throw error;
      return data as CustomerLite[];
    },
    enabled: open,
  });

  const filteredCustomers = useMemo(() => {
    const list = customers ?? [];
    if (!customerSearch.trim()) return list.slice(0, 50);
    const s = customerSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.first_name.toLowerCase().includes(s) ||
        c.surname.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.mobile ?? "").toLowerCase().includes(s),
    ).slice(0, 50);
  }, [customers, customerSearch]);

  useEffect(() => {
    if (!date) return;
    setLoadingTimes(true);
    setTime(undefined);
    (async () => {
      const { data, error } = await supabase.rpc("get_booked_times", { p_date: toIsoDate(date) });
      if (error) setBookedTimes([]);
      else setBookedTimes((data ?? []).map((r: { appointment_time: string }) => r.appointment_time));
      setLoadingTimes(false);
    })();
  }, [date]);

  function reset() {
    setMode("existing");
    setCustomerSearch("");
    setSelectedCustomerId(null);
    setFirstName(""); setSurname(""); setEmail(""); setMobile("");
    setTreatmentSlug(""); setDate(undefined); setTime(undefined);
    setBookedTimes([]);
  }

  const selectedCustomer = (customers ?? []).find((c) => c.id === selectedCustomerId) || null;

  const customerValid = mode === "existing"
    ? !!selectedCustomer
    : firstName.trim() && surname.trim() && /\S+@\S+\.\S+/.test(email) && mobile.trim().replace(/[^\d+]/g, "").length >= 7;

  const canSubmit = !!treatment && !!date && !!time && customerValid && !submitting;

  async function handleSubmit() {
    if (!treatment || !date || !time) return;
    const first = mode === "existing" ? selectedCustomer!.first_name : firstName.trim();
    const last = mode === "existing" ? selectedCustomer!.surname : surname.trim();
    const em = mode === "existing" ? selectedCustomer!.email : email.trim();
    const mob = mode === "existing" ? selectedCustomer!.mobile : mobile.trim();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        first_name: first,
        surname: last,
        email: em,
        mobile: mob,
        treatment_slug: treatment.slug,
        treatment_name: treatment.name,
        treatment_price: treatment.price,
        appointment_date: toIsoDate(date),
        appointment_time: time,
      });
      if (error) throw error;
      toast.success("Booking created");
      reset();
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e.message ?? "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  }

  const availableTimes = ALL_TIMES.filter((s) => !bookedTimes.includes(s));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />New booking</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create a booking</DialogTitle></DialogHeader>

        <div className="space-y-6">
          {/* Customer */}
          <div className="space-y-3">
            <Label>Customer</Label>
            <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
              <Button size="sm" variant={mode === "existing" ? "default" : "ghost"} onClick={() => setMode("existing")}>Existing</Button>
              <Button size="sm" variant={mode === "new" ? "default" : "ghost"} onClick={() => setMode("new")}>New customer</Button>
            </div>

            {mode === "existing" && (
              <div className="space-y-2">
                <Input
                  placeholder="Search by name, email, or mobile…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto rounded border bg-background">
                  {filteredCustomers.length === 0 && (
                    <div className="text-sm text-muted-foreground p-3">No customers found.</div>
                  )}
                  {filteredCustomers.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-accent",
                        selectedCustomerId === c.id && "bg-accent",
                      )}
                    >
                      <div className="font-medium">{c.first_name} {c.surname}</div>
                      <div className="text-xs text-muted-foreground">{c.email} · {c.mobile}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "new" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                <div><Label className="text-xs">Surname</Label><Input value={surname} onChange={(e) => setSurname(e.target.value)} /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label className="text-xs">Mobile</Label><Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} /></div>
              </div>
            )}
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label>Treatment</Label>
            <Select value={treatmentSlug} onValueChange={setTreatmentSlug}>
              <SelectTrigger><SelectValue placeholder="Choose a treatment" /></SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>{t.name} — {t.price} · {t.duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {treatment && (
              <div className="text-xs text-muted-foreground">Price: {treatment.price} · Duration: {treatment.duration}</div>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              {!date && <p className="text-sm text-muted-foreground">Pick a date first.</p>}
              {date && loadingTimes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              )}
              {date && !loadingTimes && availableTimes.length === 0 && (
                <p className="text-sm text-muted-foreground">No times available.</p>
              )}
              {date && !loadingTimes && availableTimes.length > 0 && (
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                  {availableTimes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setTime(s)}
                      className={cn(
                        "py-1.5 text-xs border rounded transition-colors",
                        time === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
