import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Sparkles, Users, UserRound, PoundSterling, TrendingUp, Clock } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parsePrice(p: string | null | undefined): number {
  if (!p) return 0;
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function Dashboard() {
  const year = new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [bookings, upcoming, treatments, team, customers] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("appointment_date", today).neq("status", "cancelled"),
        supabase.from("treatments").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalBookings: bookings.count ?? 0,
        upcoming: upcoming.count ?? 0,
        treatments: treatments.count ?? 0,
        team: team.count ?? 0,
        customers: customers.count ?? 0,
      };
    },
  });

  const { data: yearData } = useQuery({
    queryKey: ["admin", "year-bookings", year],
    queryFn: async () => {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      const { data, error } = await supabase
        .from("bookings")
        .select("appointment_date, treatment_price, treatment_name, status, created_at")
        .gte("appointment_date", start)
        .lte("appointment_date", end)
        .neq("status", "cancelled");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, first_name, surname, treatment_name, appointment_date, appointment_time, status")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const monthly = MONTHS.map((m, i) => ({ month: m, bookings: 0, revenue: 0 }));
  const treatmentCounts = new Map<string, number>();
  let yearRevenue = 0;
  let yearBookings = 0;

  (yearData ?? []).forEach((b: any) => {
    const d = new Date(b.appointment_date);
    const mi = d.getMonth();
    const price = parsePrice(b.treatment_price);
    monthly[mi].bookings += 1;
    monthly[mi].revenue += price;
    yearRevenue += price;
    yearBookings += 1;
    treatmentCounts.set(b.treatment_name, (treatmentCounts.get(b.treatment_name) ?? 0) + 1);
  });

  const topTreatments = Array.from(treatmentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgValue = yearBookings > 0 ? yearRevenue / yearBookings : 0;

  const cards = [
    { label: "Upcoming bookings", value: stats?.upcoming ?? "—", to: "/admin/bookings", icon: CalendarDays },
    { label: "Total bookings", value: stats?.totalBookings ?? "—", to: "/admin/bookings", icon: CalendarDays },
    { label: "Customers", value: stats?.customers ?? "—", to: "/admin/customers", icon: UserRound },
    { label: `Revenue ${year}`, value: `£${yearRevenue.toFixed(0)}`, to: "/admin/bookings", icon: PoundSterling },
    { label: `Bookings ${year}`, value: yearBookings, to: "/admin/bookings", icon: TrendingUp },
    { label: "Avg booking value", value: `£${avgValue.toFixed(0)}`, to: "/admin/bookings", icon: PoundSterling },
    { label: "Treatments", value: stats?.treatments ?? "—", to: "/admin/treatments", icon: Sparkles },
    { label: "Team members", value: stats?.team ?? "—", to: "/admin/team", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage bookings, treatments, team, and site content.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to as any} className="rounded-lg border bg-card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold mt-2">{c.value}</div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Bookings & revenue — {year}</h2>
            <p className="text-sm text-muted-foreground">Monthly bookings count and revenue</p>
          </div>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: any, name: string) =>
                  name === "Revenue" ? [`£${Number(value).toFixed(0)}`, name] : [value, name]
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="hsl(var(--accent-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top treatments ({year})</h2>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
          {topTreatments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet this year.</p>
          ) : (
            <ul className="space-y-3">
              {topTreatments.map(([name, count]) => {
                const max = topTreatments[0][1];
                const pct = Math.round((count / max) * 100);
                return (
                  <li key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate pr-2">{name}</span>
                      <span className="text-muted-foreground tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent bookings</h2>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          {!recent || recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((b: any) => (
                <li key={b.id} className="py-2 flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.first_name} {b.surname}</div>
                    <div className="text-muted-foreground truncate">{b.treatment_name}</div>
                  </div>
                  <div className="text-right text-muted-foreground tabular-nums whitespace-nowrap pl-3">
                    <div>{b.appointment_date}</div>
                    <div className="text-xs">{b.appointment_time}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link to="/admin/bookings" className="text-sm text-primary hover:underline">View all bookings →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
