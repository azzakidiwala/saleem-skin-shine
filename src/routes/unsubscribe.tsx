import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — Saleem Skin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "valid"; email?: string }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "done" };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token")
    : null;

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "Missing unsubscribe token." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState({ kind: "invalid", message: data?.error || "Invalid or expired link." });
        } else if (data?.alreadyUnsubscribed || data?.already_unsubscribed) {
          setState({ kind: "already" });
        } else {
          setState({ kind: "valid", email: data?.email });
        }
      } catch {
        setState({ kind: "invalid", message: "Couldn't validate this link." });
      }
    })();
  }, [token]);

  async function confirm() {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState({ kind: "invalid", message: data?.error || "Could not unsubscribe." });
        return;
      }
      setState({ kind: "done" });
    } catch {
      setState({ kind: "invalid", message: "Couldn't process your request." });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center bg-card border border-border p-8">
        <h1 className="font-serif text-2xl text-primary mb-4">Email preferences</h1>

        {state.kind === "loading" && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking link…
          </div>
        )}

        {state.kind === "valid" && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Unsubscribe {state.email ? <strong className="text-foreground">{state.email}</strong> : "this email address"} from Saleem Skin emails?
            </p>
            <Button onClick={confirm} className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-none px-8">
              Confirm unsubscribe
            </Button>
          </>
        )}

        {state.kind === "submitting" && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </div>
        )}

        {state.kind === "done" && (
          <div>
            <Check className="h-8 w-8 text-gold mx-auto mb-3" />
            <p className="text-sm text-foreground">You've been unsubscribed. We're sorry to see you go.</p>
          </div>
        )}

        {state.kind === "already" && (
          <div>
            <Check className="h-8 w-8 text-gold mx-auto mb-3" />
            <p className="text-sm text-foreground">This email is already unsubscribed.</p>
          </div>
        )}

        {state.kind === "invalid" && (
          <div>
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
