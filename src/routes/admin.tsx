import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useIsAdmin, signOut } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarDays, Sparkles, Users, UserSquare, FileText, Shield, LogOut, ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const nav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/customers", label: "Customers", icon: UserSquare },
  { to: "/admin/discounts", label: "Discounts", icon: Tag },
  { to: "/admin/treatments", label: "Treatments", icon: Sparkles },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/content", label: "Site Content", icon: FileText },
  { to: "/admin/admins", label: "Admins", icon: Shield },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useIsAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
  }, [session, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!session) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">Your account doesn't have admin access.</p>
          <Button onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-60 border-r bg-card flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b">
          <Link to="/admin" className="font-semibold text-lg">Admin</Link>
          <p className="text-xs text-muted-foreground mt-1 truncate">{session.user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted">
            <ExternalLink className="h-4 w-4" /> View site
          </a>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto ml-60">
        <Outlet />
      </main>
    </div>
  );
}
