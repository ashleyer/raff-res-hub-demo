import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { usePortal } from "@/lib/portal-store";
import { DEMO_ACCOUNT, DEMO_PASSCODE, RESIDENTS } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RememberMeConsent } from "@/components/RememberMeConsent";
import { safeRedirectPath } from "@/lib/session-guard";
import { signInSchema, signUpSchema, validate, type FieldErrors } from "@/lib/auth-validation";

/** Inline, screen-reader announced message for a single field. */
function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Resident Sign In — Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Sign in or register for the private residents' portal of The Raffles Residences Boston at 40 Trinity Place.",
      },
      { property: "og:title", content: "Resident Sign In — Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Private portal access for registered residences at 40 Trinity Place.",
      },
    ],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode?: "signin" | "signup"; redirect?: string } => {
    const mode =
      search["mode"] === "signup"
        ? ("signup" as const)
        : search["mode"] === "signin"
          ? ("signin" as const)
          : undefined;
    const redirect = safeRedirectPath(search["redirect"]);
    return { ...(mode ? { mode } : {}), ...(redirect ? { redirect } : {}) };
  },
  component: LoginPage,
});

function LoginPage() {
  const { currentUser } = usePortal();
  const { mode: initialMode, redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");

  return (
    <PageShell
      eyebrow="Private Access"
      title={
        currentUser
          ? "Your account"
          : mode === "signin"
            ? "Resident sign in"
            : "Create your account"
      }
      intro={
        <>
          Registered deed-holders and approved leaseholders can sign up with their residence address
          here, or if previously registered,{" "}
          <Link
            to="/login"
            search={{ mode: "signin" }}
            onClick={() => setMode("signin")}
            className="underline underline-offset-4"
          >
            sign in by clicking here
          </Link>
          . Internal Raffles Persons can use the{" "}
          <Link to="/staff-signup" className="underline underline-offset-4">
            Raffles Personnel Sign Up
          </Link>{" "}
          and/or the{" "}
          <Link to="/staff-signin" className="underline underline-offset-4">
            Raffles Personnel Sign In
          </Link>{" "}
          found by scrolling down to the bottom.
          <strong className="mt-3 block text-foreground">
            For Demo purposes, login with "{DEMO_ACCOUNT.email}" with password "
            {DEMO_ACCOUNT.password}" to explore the site without signing up (not all features
            available in Demo Login).
          </strong>
        </>
      }
    >
      {currentUser ? (
        <SignedIn />
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <div role="tablist" aria-label="Account" className="flex gap-2">
              {(
                [
                  { id: "signin", label: "Sign in" },
                  { id: "signup", label: "Create account" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === t.id}
                  onClick={() => setMode(t.id)}
                  className={`min-h-11 border px-5 text-xs tracking-[0.16em] uppercase transition-colors ${
                    mode === t.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {mode === "signin" ? (
                <SignInForm redirectTo={redirect} />
              ) : (
                <SignUpForm redirectTo={redirect} />
              )}
            </div>
          </div>

          <aside className="border border-border bg-secondary/40 p-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="eyebrow">Demonstration accounts</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              This preview keeps everything in your browser. Any residence below may be used with
              the preview passcode, or register your own account — it will be remembered on this
              device until you sign out.
            </p>
            <p className="mt-4 border border-border bg-background p-4 text-sm leading-relaxed">
              Demo login — email <span className="text-foreground">{DEMO_ACCOUNT.email}</span>,
              password <span className="text-foreground">{DEMO_ACCOUNT.password}</span>. No
              residence number required; not all features are available.
            </p>

            <ul className="mt-6 space-y-4">
              {RESIDENTS.slice(0, 4).map((r) => (
                <li key={r.id} className="border-t border-border pt-4 text-sm">
                  <p>{r.name}</p>
                  <p className="text-muted-foreground">{r.unit}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.email} · passcode {DEMO_PASSCODE}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </PageShell>
  );
}

function SignedIn() {
  const { currentUser, signOut } = usePortal();
  if (!currentUser) return null;
  return (
    <div className="mt-12 max-w-xl border border-border bg-card p-8">
      <p className="text-sm text-muted-foreground">You are signed in as</p>
      <p className="mt-2 text-2xl">{currentUser.name}</p>
      <p className="text-sm text-muted-foreground">{currentUser.unit}</p>
      <p className="mt-1 text-sm text-muted-foreground">{currentUser.email}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        This device will remember you until you sign out.
      </p>
      <Button
        className="mt-6 min-h-11 tracking-[0.18em] uppercase"
        variant="outline"
        onClick={() => {
          signOut();
          toast.success("Signed out.");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

function SignInForm({ redirectTo = "/directory" }: { redirectTo?: string }) {
  const { signIn, rememberedEmail, rememberedUnit } = usePortal();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail);
    if (rememberedUnit) setUnit(rememberedUnit);
  }, [rememberedEmail, rememberedUnit]);

  const values = { email, unit, password };
  /* The open demonstration account has no residence number. */
  const isDemo = email.trim().toLowerCase() === DEMO_ACCOUNT.email;
  const checkValues = (v: typeof values) => {
    const found = validate(signInSchema, v);
    if (v.email.trim().toLowerCase() === DEMO_ACCOUNT.email) delete found["unit"];
    return found;
  };

  const check = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const next = checkValues(values);
    setFieldErrors((prev) => ({ ...prev, [field]: next[field] ?? "" }));
  };

  const errorFor = (field: string) =>
    touched[field] && fieldErrors[field] ? fieldErrors[field] : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = checkValues(values);
    setFieldErrors(found);
    setTouched({ email: true, unit: true, password: true });
    if (Object.keys(found).length > 0) {
      setError(null);
      const first = document.getElementById(
        Object.keys(found)[0] === "unit" ? "signin-unit" : Object.keys(found)[0]!,
      );
      first?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      /* Brief pause so the pending state is visible on this browser-only demo. */
      await new Promise((resolve) => setTimeout(resolve, 350));
      const result = signIn(email.trim(), password, remember, unit.trim());
      if (!result.ok) {
        setError(result.error ?? "Sign in failed.");
        return;
      }
      toast.success("Welcome to the residences.");
      navigate({ to: redirectTo, replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl border border-border bg-card p-8" noValidate>
      <h2 className="text-2xl">Sign in</h2>
      <fieldset disabled={submitting} className="mt-6 space-y-5 disabled:opacity-70">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched["email"])
                setFieldErrors((p) => ({
                  ...p,
                  email:
                    validate(signInSchema, { ...values, email: e.target.value })["email"] ?? "",
                }));
            }}
            onBlur={() => check("email")}
            aria-describedby={errorFor("email") ? "email-error" : "email-hint"}
            aria-invalid={errorFor("email") ? true : undefined}
            className="min-h-11"
          />
          <FieldError id="email-error" message={errorFor("email")} />
          <p id="email-hint" className="text-xs text-muted-foreground">
            Use your registered address, or any email of your own to explore as a guest.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-unit">Residence number</Label>
          <Input
            id="signin-unit"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              if (touched["unit"])
                setFieldErrors((p) => ({
                  ...p,
                  unit: checkValues({ ...values, unit: e.target.value })["unit"] ?? "",
                }));
            }}
            onBlur={() => check("unit")}
            placeholder="Residence 22H"
            aria-describedby={errorFor("unit") ? "signin-unit-error" : "signin-unit-hint"}
            aria-invalid={errorFor("unit") ? true : undefined}
            className="min-h-11"
          />
          <FieldError id="signin-unit-error" message={errorFor("unit")} />
          <p id="signin-unit-hint" className="text-xs text-muted-foreground">
            {isDemo
              ? "Not required for the demo login — leave blank."
              : "The residence on file for your address — for example 22H."}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password or residence passcode</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched["password"])
                setFieldErrors((p) => ({
                  ...p,
                  password:
                    validate(signInSchema, { ...values, password: e.target.value })["password"] ??
                    "",
                }));
            }}
            onBlur={() => check("password")}
            aria-describedby={errorFor("password") ? "password-error" : "passcode-hint"}
            aria-invalid={errorFor("password") ? true : undefined}
            className="min-h-11"
          />
          <FieldError id="password-error" message={errorFor("password")} />
          <p id="passcode-hint" className="text-xs text-muted-foreground">
            Preview passcode for the demonstration residences: {DEMO_PASSCODE}
          </p>
          <p className="text-sm">
            <Link to="/reset-password" className="underline underline-offset-4">
              Forgot password?
            </Link>
          </p>
        </div>

        <RememberMeConsent id="remember" checked={remember} onChange={setRemember} />

        <p
          id="signin-error"
          role="alert"
          aria-live="polite"
          className="min-h-5 text-sm text-destructive"
        >
          {error}
        </p>

        <Button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full tracking-[0.18em] uppercase"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Enter the portal"
          )}
        </Button>
      </fieldset>
    </form>
  );
}

function SignUpForm({ redirectTo = "/directory" }: { redirectTo?: string }) {
  const { signUp } = usePortal();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    unit: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    if (touched[key]) {
      const found = validate(signUpSchema, next);
      setFieldErrors((prev) => ({
        ...prev,
        [key]: found[key] ?? "",
        confirm: touched["confirm"] ? (found["confirm"] ?? "") : (prev["confirm"] ?? ""),
      }));
    }
  };

  const check = (key: keyof typeof form) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const found = validate(signUpSchema, form);
    setFieldErrors((prev) => ({ ...prev, [key]: found[key] ?? "" }));
  };

  const errorFor = (key: keyof typeof form) =>
    touched[key] && fieldErrors[key] ? fieldErrors[key] : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate(signUpSchema, form);
    setFieldErrors(found);
    setTouched({ name: true, email: true, unit: true, phone: true, password: true, confirm: true });
    if (Object.keys(found).length > 0) {
      setError(null);
      document.getElementById(`su-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const result = signUp({ ...form, remember });
      if (!result.ok) {
        setError(result.error ?? "Registration failed.");
        return;
      }
      toast.success("Your account has been created.");
      navigate({ to: redirectTo, replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-xl border border-border bg-card p-8" noValidate>
      <h2 className="text-2xl">Create an account</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Registering creates your household profile with contact details, and keeps your directory
        profile, reservations and preferences on this device.
      </p>
      <fieldset disabled={submitting} className="mt-6 space-y-5 disabled:opacity-70">
        <div className="space-y-2">
          <Label htmlFor="su-name">Residence Unit&apos;s Surname</Label>
          <Input
            id="su-name"
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            onBlur={check("name")}
            aria-invalid={errorFor("name") ? true : undefined}
            aria-describedby={errorFor("name") ? "su-name-error" : undefined}
            className="min-h-11"
          />
          <FieldError id="su-name-error" message={errorFor("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-email">Email address</Label>
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            onBlur={check("email")}
            aria-invalid={errorFor("email") ? true : undefined}
            aria-describedby={errorFor("email") ? "su-email-error" : undefined}
            className="min-h-11"
          />
          <FieldError id="su-email-error" message={errorFor("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-unit">Residence number</Label>
          <Input
            id="su-unit"
            value={form.unit}
            onChange={set("unit")}
            onBlur={check("unit")}
            placeholder="Residence 22H"
            aria-invalid={errorFor("unit") ? true : undefined}
            aria-describedby={errorFor("unit") ? "su-unit-error" : "su-unit-hint"}
            className="min-h-11"
          />
          <FieldError id="su-unit-error" message={errorFor("unit")} />
          <p id="su-unit-hint" className="text-xs text-muted-foreground">
            Residences are verified by the Residences Office before the directory listing is
            confirmed.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-phone">Contact number</Label>
          <Input
            id="su-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            onBlur={check("phone")}
            placeholder="617-555-0123"
            aria-invalid={errorFor("phone") ? true : undefined}
            aria-describedby={errorFor("phone") ? "su-phone-error" : "su-phone-hint"}
            className="min-h-11"
          />
          <FieldError id="su-phone-error" message={errorFor("phone")} />
          <p id="su-phone-hint" className="text-xs text-muted-foreground">
            Every household keeps a profile with contact details on file. Listing in the directory
            and letting neighbours contact you both stay optional — you choose in your profile
            settings.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-password">Password</Label>
          <Input
            id="su-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            onBlur={check("password")}
            aria-invalid={errorFor("password") ? true : undefined}
            aria-describedby={errorFor("password") ? "su-password-error" : "su-password-hint"}
            className="min-h-11"
          />
          <FieldError id="su-password-error" message={errorFor("password")} />
          <p id="su-password-hint" className="text-xs text-muted-foreground">
            At least eight characters. Never use a real password — this demo stores it in your
            browser.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-confirm">Confirm password</Label>
          <Input
            id="su-confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
            onBlur={check("confirm")}
            aria-invalid={errorFor("confirm") ? true : undefined}
            aria-describedby={errorFor("confirm") ? "su-confirm-error" : undefined}
            className="min-h-11"
          />
          <FieldError id="su-confirm-error" message={errorFor("confirm")} />
        </div>

        <RememberMeConsent id="su-remember" checked={remember} onChange={setRemember} />

        <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
          {error}
        </p>

        <Button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full tracking-[0.18em] uppercase"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </fieldset>
    </form>
  );
}
