import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentStaff, signInStaff } from "@/lib/staff-store";

export const Route = createFileRoute("/staff-signin")({
  head: () => ({
    meta: [
      { title: "Raffles Personnel Sign In · Residences Boston" },
      {
        name: "description",
        content:
          "Internal sign in for Raffles Boston personnel to reach the residences staff dashboard.",
      },
      { property: "og:title", content: "Raffles Personnel Sign In · Residences Boston" },
      {
        property: "og:description",
        content: "Sign in to the Raffles Residences Boston personnel dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffSignInPage,
});

function StaffSignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentStaff()) void navigate({ to: "/staff-dashboard" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    /* Simulated request latency so the loading state is observable. */
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const result = signInStaff(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "That sign in could not be completed.");
      return;
    }
    setError(null);
    toast.success(`Welcome back, ${result.account?.name ?? "colleague"}.`);
    void navigate({ to: "/staff-dashboard" });
  };

  return (
    <PageShell
      eyebrow="Raffles Personnel"
      title="Raffles Personnel Sign In"
      intro="Internal colleagues only. Sign in with the personnel account you registered on this device."
    >
      <form
        onSubmit={(e) => void submit(e)}
        aria-busy={busy}
        className="mt-12 max-w-md space-y-5"
        noValidate
      >
        <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
          <div className="space-y-2">
            <Label htmlFor="staff-signin-email">Work email</Label>
            <Input
              id="staff-signin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-signin-password">Password</Label>
            <Input
              id="staff-signin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11"
            />
          </div>
          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
            {error}
          </p>
          <Button
            type="submit"
            disabled={busy}
            className="min-h-11 w-full tracking-[0.18em] uppercase"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Sign in
          </Button>
        </fieldset>
        <p className="text-sm">
          New colleague?{" "}
          <Link to="/staff-signup" className="underline underline-offset-4">
            Raffles Personnel Sign Up
          </Link>
        </p>
      </form>
    </PageShell>
  );
}
