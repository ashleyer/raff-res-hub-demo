import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { currentStaff, registerStaff, STAFF_DEPARTMENTS } from "@/lib/staff-store";

export const Route = createFileRoute("/staff-signup")({
  head: () => ({
    meta: [
      { title: "Raffles Personnel Sign Up, Residences Boston" },
      {
        name: "description",
        content:
          "Registration for Raffles Boston personnel to create an internal residences portal account.",
      },
      { property: "og:title", content: "Raffles Personnel Sign Up, Residences Boston" },
      {
        property: "og:description",
        content: "Create an internal account for the Raffles Residences Boston staff dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffSignUpPage,
});

function StaffSignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState<string>(STAFF_DEPARTMENTS[0]);
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    const result = registerStaff({ name, email, department, role, password, confirm });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "That registration could not be completed.");
      return;
    }
    setError(null);
    toast.success("Personnel account created.");
    void navigate({ to: "/staff-dashboard" });
  };

  return (
    <PageShell
      eyebrow="Raffles Personnel"
      title="Raffles Personnel Sign Up"
      intro="For internal Raffles Boston colleagues. Register a personnel account to reach the staff dashboard. Demonstration only, accounts are kept in this browser."
    >
      <form
        onSubmit={(e) => void submit(e)}
        aria-busy={busy}
        className="mt-12 max-w-xl space-y-5"
        noValidate
      >
        <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
          <div className="space-y-2">
            <Label htmlFor="staff-name">Full name</Label>
            <Input
              id="staff-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">Work email</Label>
            <Input
              id="staff-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-department">Department</Label>
            <select
              id="staff-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="min-h-11 w-full border border-input bg-background px-3 text-sm"
            >
              {STAFF_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-role">Position title</Label>
            <Input
              id="staff-role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-password">Password</Label>
            <Input
              id="staff-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="staff-password-meter"
              className="min-h-11"
            />
            <PasswordStrengthMeter id="staff-password-meter" value={password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-confirm">Confirm password</Label>
            <Input
              id="staff-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            Create personnel account
          </Button>
        </fieldset>
        <p className="text-sm">
          Already registered?{" "}
          <Link to="/staff-signin" className="underline underline-offset-4">
            Raffles Personnel Sign In
          </Link>
        </p>
      </form>
    </PageShell>
  );
}
