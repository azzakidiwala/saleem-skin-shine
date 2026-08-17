import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIsAdmin, signOut } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { LayoutDashboard, CalendarDays, Sparkles, Users, UserSquare, FileText, Shield, LogOut, ExternalLink, Tag, Menu } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6 border-b">
        <Link to="/admin" onClick={onNavigate} className="font-semibold text-lg">Admin</Link>
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
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/80"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm hover:bg-muted">
          <ExternalLink className="h-4 w-4" /> View site
        </a>
        <button
          onClick={async () => { onNavigate?.(); await signOut(); navigate({ to: "/login" }); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="hidden md:flex w-60 border-r bg-card flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed inset-x-0 top-0 z-40 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b bg-card px-3 h-14">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin menu</SheetTitle>
            </SheetHeader>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="truncate font-semibold">
          {nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Admin"}
        </span>
      </header>

      <main className="flex-1 min-w-0 overflow-x-hidden p-4 pt-18 md:p-8 md:pt-8 md:ml-60">
        <Outlet />
      </main>
    </div>
  );
}
