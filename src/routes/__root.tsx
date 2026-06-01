import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { ComingSoon } from "@/components/site/ComingSoon";
import { PromoPopup } from "@/components/site/PromoPopup";
import { useAuthSession } from "@/lib/admin/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Saleem Skin — Award-Winning Aesthetic Clinic" },
      { name: "description", content: "Saleem Skin is an award-winning aesthetic clinic offering premium skin, health and wellness treatments delivered by expert specialists in Manchester." },
      { property: "og:site_name", content: "Saleem Skin" },
      { property: "og:title", content: "Saleem Skin — Award-Winning Aesthetic Clinic" },
      { property: "og:description", content: "Award-winning aesthetic clinic offering premium skin, health and wellness treatments by expert specialists in Manchester." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Saleem Skin — Award-Winning Aesthetic Clinic" },
      { name: "twitter:description", content: "Award-winning aesthetic clinic offering premium skin, health and wellness treatments by expert specialists in Manchester." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/RoOzt9UhDSN89q9PkFRpAtV8MqC2/social-images/social-1778621872838-Screenshot_2026-05-12_at_22.36.23.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/RoOzt9UhDSN89q9PkFRpAtV8MqC2/social-images/social-1778621872838-Screenshot_2026-05-12_at_22.36.23.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteGate />
      <Toaster />
    </QueryClientProvider>
  );
}

function SiteGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, loading } = useAuthSession();

  // Routes that bypass the coming-soon gate entirely
  const isBypass = pathname === "/login" || pathname.startsWith("/admin");
  if (isBypass) return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!session) return <ComingSoon />;
  return (
    <>
      <Outlet />
      <PromoPopup />
    </>
  );
}
