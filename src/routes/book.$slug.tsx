import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTreatment, treatments } from "@/data/treatments";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$slug")({
  loader: ({ params }) => {
    const treatment = getTreatment(params.slug);
    if (!treatment) throw notFound();
    return { treatment };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Book ${loaderData.treatment.name} — Saleem Skin` },
          {
            name: "description",
            content: `Book your ${loaderData.treatment.name} appointment online at Saleem Skin.`,
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-primary mb-4">Treatment not found</h1>
        <Link to="/treatments" className="text-gold underline">Back to Treatments</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: BookingPage,
});

// 09:00 to 17:00 in 30-min increments
const ALL_TIMES: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

function formatDateLong(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function BookingPage() {
  const { treatment: t } = Route.useLoaderData();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Fetch booked times when date changes
  useEffect(() => {
    if (!date) return;
    setLoadingTimes(true);
    setTime(undefined);
    (async () => {
      const { data, error } = await supabase.rpc("get_booked_times", {
        p_date: toIsoDate(date),
      });
      if (error) {
        console.error(error);
        setBookedTimes([]);
      } else {
        setBookedTimes(
          (data ?? []).map((r: { appointment_time: string }) => r.appointment_time),
        );
      }
      setLoadingTimes(false);
    })();
  }, [date]);

  const availableTimes = ALL_TIMES.filter((s) => !bookedTimes.includes(s));

  const detailsValid =
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    mobile.trim().replace(/[^\d+]/g, "").length >= 7;

  async function handleConfirm() {
    if (!date || !time) return;
    setSubmitting(true);
    try {
      const isoDate = toIsoDate(date);
      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert({
          first_name: firstName.trim(),
          surname: surname.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          treatment_slug: t.slug,
          treatment_name: t.name,
          treatment_price: t.price,
          appointment_date: isoDate,
          appointment_time: time,
        })
        .select()
        .single();
      if (error) throw error;

      // Send emails (non-blocking failure)
      const { error: fnErr } = await supabase.functions.invoke("send-booking-emails", {
        body: {
          firstName: firstName.trim(),
          surname: surname.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          treatmentName: t.name,
          treatmentPrice: t.price,
          appointmentDate: formatDateLong(date),
          appointmentTime: time,
        },
      });
      if (fnErr) console.error("Email send error:", fnErr);

      toast.success("Booking confirmed", {
        description: `We'll see you on ${formatDateLong(date)} at ${time}.`,
      });

      navigate({
        to: "/book-confirmed",
        search: {
          name: firstName,
          treatment: t.name,
          date: formatDateLong(date),
          time,
        } as never,
      });
      void inserted;
    } catch (err) {
      console.error(err);
      toast.error("Could not complete booking", {
        description: (err as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        {/* Header band */}
        <section className="bg-card border-b border-border py-10">
          <div className="container mx-auto px-6">
            <Link
              to="/treatments/$slug"
              params={{ slug: t.slug }}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {t.name}
            </Link>
            <div className="text-gold text-[11px] tracking-[0.35em] uppercase mb-2">
              {t.category}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-primary">Book {t.name}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-muted-foreground">
              <span><span className="text-foreground font-semibold">Price:</span> {t.price}</span>
              <span><span className="text-foreground font-semibold">Duration:</span> {t.duration}</span>
            </div>
          </div>
        </section>

        {/* Stepper */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center gap-3 md:gap-6 mb-10 text-xs tracking-[0.2em] uppercase">
              {(["Date & Time", "Your Details", "Confirm"] as const).map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3;
                const active = step === n;
                const done = step > n;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-7 w-7 inline-flex items-center justify-center rounded-full border text-[11px]",
                        active && "bg-gold border-gold text-gold-foreground",
                        done && "bg-primary border-primary text-primary-foreground",
                        !active && !done && "border-border text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : n}
                    </span>
                    <span className={cn("hidden sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
                      {label}
                    </span>
                    {n < 3 && <span className="hidden md:inline-block w-10 h-px bg-border" />}
                  </div>
                );
              })}
            </div>

            <div className="max-w-4xl mx-auto">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8 bg-card border border-border p-6 md:p-8">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Choose a date</h2>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(d) => d < today}
                      className={cn("p-3 pointer-events-auto rounded-md border border-border")}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      {date ? `Available times — ${formatDateLong(date)}` : "Select a date to see times"}
                    </h2>
                    {!date && (
                      <p className="text-sm text-muted-foreground">
                        Please select a date from the calendar.
                      </p>
                    )}
                    {date && loadingTimes && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading times…
                      </div>
                    )}
                    {date && !loadingTimes && (
                      <>
                        {availableTimes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No times available on this day. Please pick another date.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimes.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTime(s)}
                                className={cn(
                                  "py-2 text-sm border transition-colors",
                                  time === s
                                    ? "bg-gold text-gold-foreground border-gold"
                                    : "border-border hover:border-gold hover:text-gold",
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-8 flex justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!date || !time}
                        className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-8 py-6 text-xs tracking-[0.25em] uppercase"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="bg-card border border-border p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Your details</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName">First name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        maxLength={100}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname">Surname *</Label>
                      <Input
                        id="surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        maxLength={100}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile number *</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        maxLength={20}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={255}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">All fields are required.</p>

                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-none px-8 py-6 text-xs tracking-[0.25em] uppercase"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!detailsValid}
                      className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-8 py-6 text-xs tracking-[0.25em] uppercase"
                    >
                      Review booking
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && date && time && (
                <div className="bg-card border border-border p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Confirm your booking</h2>

                  <div className="grid md:grid-cols-[140px_1fr] gap-6 mb-6">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-32 md:h-full object-cover"
                    />
                    <div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">
                        {t.category}
                      </div>
                      <div className="font-serif text-2xl text-primary">{t.name}</div>
                      <div className="text-sm text-muted-foreground mt-2">{t.description}</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-4 w-4 text-gold mt-0.5" />
                      <div>
                        <div className="text-muted-foreground text-xs uppercase tracking-wider">Date</div>
                        <div className="font-semibold text-foreground">{formatDateLong(date)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-gold mt-0.5" />
                      <div>
                        <div className="text-muted-foreground text-xs uppercase tracking-wider">Time</div>
                        <div className="font-semibold text-foreground">{time}</div>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-muted-foreground text-xs uppercase tracking-wider">Price</div>
                      <div className="text-2xl text-gold font-medium">{t.price}</div>
                    </div>
                  </div>

                  <div className="border-t border-border mt-6 pt-6 text-sm space-y-1 text-muted-foreground">
                    <div><span className="text-foreground font-semibold">Name:</span> {firstName} {surname}</div>
                    <div><span className="text-foreground font-semibold">Email:</span> {email}</div>
                    <div><span className="text-foreground font-semibold">Mobile:</span> {mobile}</div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="rounded-none px-8 py-6 text-xs tracking-[0.25em] uppercase"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={submitting}
                      className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-8 py-6 text-xs tracking-[0.25em] uppercase"
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                        </span>
                      ) : (
                        "Confirm booking"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* tiny nav back to all treatments */}
              <div className="text-center mt-10">
                <Link to="/treatments" className="text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-gold">
                  Browse all treatments
                </Link>
                <span className="hidden">{treatments.length}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
