import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [bookings, upcoming, treatments, team] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).gte("appointment_date", today).neq("status", "cancelled"),
        supabase.from("treatments").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalBookings: bookings.count ?? 0,
        upcoming: upcoming.count ?? 0,
        treatments: treatments.count ?? 0,
        team: team.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Upcoming bookings", value: data?.upcoming ?? "—", to: "/admin/bookings", icon: CalendarDays },
    { label: "Total bookings", value: data?.totalBookings ?? "—", to: "/admin/bookings", icon: CalendarDays },
    { label: "Treatments", value: data?.treatments ?? "—", to: "/admin/treatments", icon: Sparkles },
    { label: "Team members", value: data?.team ?? "—", to: "/admin/team", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage bookings, treatments, team, and site content.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to as any} className="rounded-lg border bg-card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-semibold mt-2">{c.value}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
