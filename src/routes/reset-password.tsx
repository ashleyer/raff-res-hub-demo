import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/PageShell";
import { usePortal } from "@/lib/portal-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { newPasswordSchema, validate, type FieldErrors } from "@/lib/auth-validation";
import { scorePassword } from "@/lib/password-strength";

/** Minimum meter score ("Fair") required before the reset can be submitted. */
const MIN_STRENGTH_SCORE = 2;

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Request a reset code and choose a new password for your Raffles Residences Boston resident portal account.",
      },
      { property: "og:title", content: "Reset Your Password, Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Password recovery for the private residents' portal at 40 Trinity Place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { requestPasswordReset, resetPassword } = usePortal();
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState("");
  const [pending, setPending] = useState<null | "request" | "resend" | "reset">(null);
  const busy = pending !== null;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const issueCode = async (silent = false) => {
    if (busy) return false;
    setPending(silent ? "resend" : "request");
    /* Simulated request latency so the loading state is observable. */
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const result = requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error ?? "That request could not be completed.");
      setPending(null);
      return false;
    }
    setError(null);
    setIssuedCode(result.code ?? null);
    setCode("");
    setCooldown(30);
    toast.success(silent ? "New reset code issued." : "Reset code issued.");
    setPending(null);
    return true;
  };

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (await issueCode()) setStep("reset");
  };

  const strength = scorePassword(password);
  const liveIssues: FieldErrors = { ...validate(newPasswordSchema, { code, password, confirm }) };
  if (!liveIssues["password"] && password && strength.score < MIN_STRENGTH_SCORE) {
    liveIssues["password"] =
      `Password strength is “${strength.label}”. Reach at least “Fair” to continue.`;
  }
  const canSubmit = Object.keys(liveIssues).length === 0;

  /** Errors surfaced next to a field: after a submit attempt, or once the field has been used. */
  const errorFor = (field: "code" | "password" | "confirm") =>
    touched[field] ? (liveIssues[field] ?? fieldErrors[field]) : undefined;

  /** Error styling for an input that is currently failing validation. */
  const fieldClass = (field: "code" | "password" | "confirm") =>
    cn(
      "min-h-11",
      errorFor(field) &&
        "border-destructive ring-1 ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/40",
    );

  /** Ties an invalid input to its own message and the live validation summary. */
  const describedBy = (field: "code" | "password" | "confirm", extra?: string) =>
    [extra, errorFor(field) ? `reset-${field}-error reset-validation-summary` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldLabels = {
    code: "Reset code",
    password: "New password",
    confirm: "Confirm password",
  } as const;

  const blockingIssues = (["code", "password", "confirm"] as const)
    .map((field) => ({
      field,
      label: fieldLabels[field] as string,
      message: liveIssues[field],
    }))
    .filter((entry): entry is { field: typeof entry.field; label: string; message: string } =>
      Boolean(entry.message),
    );

  const visibleIssues = (["code", "password", "confirm"] as const)
    .map((field) => ({ field, message: errorFor(field) }))
    .filter((entry): entry is { field: typeof entry.field; message: string } =>
      Boolean(entry.message),
    );

  const summaryText = visibleIssues.length
    ? `${visibleIssues.length} field${visibleIssues.length > 1 ? "s need" : " needs"} attention. ${visibleIssues
        .map((issue) => `${fieldLabels[issue.field]}: ${issue.message}`)
        .join(" ")}`
    : "All fields are valid.";

  /* Which fields are failing, used to announce a changed field set at once. */
  const invalidFieldKey = visibleIssues.map((issue) => issue.field).join(",");

  useEffect(() => {
    if (step !== "reset") return;
    /* Announce immediately when the set of failing fields changes; debounce
       wording-only changes so a screen reader is not interrupted per keystroke. */
    setAnnouncement("");
    const delay = 60;
    const timer = window.setTimeout(() => setAnnouncement(summaryText), delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidFieldKey, step]);

  useEffect(() => {
    if (step !== "reset") return;
    const timer = window.setTimeout(() => setAnnouncement(summaryText), 700);
    return () => window.clearTimeout(timer);
  }, [summaryText, step]);

  /** Moves keyboard focus to the first field, in visual order, that is failing validation. */
  const focusFirstInvalid = (issues: FieldErrors) => {
    const first = (["code", "password", "confirm"] as const).find((field) => issues[field]);
    if (!first) return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`reset-${first}`) as HTMLInputElement | null;
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setTouched({ code: true, password: true, confirm: true });
    const issues = { ...validate(newPasswordSchema, { code, password, confirm }) };
    if (!issues["password"] && password && strength.score < MIN_STRENGTH_SCORE) {
      issues["password"] =
        `Password strength is “${strength.label}”. Reach at least “Fair” to continue.`;
    }
    setFieldErrors(issues);
    if (Object.keys(issues).length > 0) {
      setError("Please correct the highlighted fields.");
      focusFirstInvalid(issues);
      return;
    }
    setPending("reset");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const result = resetPassword({ email, code, password, confirm });
    if (!result.ok) {
      setError(result.error ?? "That password could not be changed.");
      setPending(null);
      return;
    }
    setError(null);

    toast.success("Password changed", {
      description: "Please sign in with your new password.",
    });
    void navigate({ to: "/login", search: { mode: "signin" } });
  };

  return (
    <PageShell
      eyebrow="Account Recovery"
      title="Reset your password"
      intro="Request a reset code for your registered address, then choose a new password. This demonstration keeps accounts in your browser only, so the code is shown on screen rather than emailed."
    >
      <div className="mt-12 max-w-xl border border-border bg-card p-8">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="eyebrow">{step === "request" ? "Step one of two" : "Step two of two"}</p>
        </div>

        {step === "request" ? (
          <form onSubmit={request} className="mt-6 space-y-5" noValidate aria-busy={busy}>
            <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error ? "reset-error" : undefined}
                  aria-invalid={error ? true : undefined}
                  className="min-h-11"
                />
              </div>
            </fieldset>
            <p
              id="reset-error"
              role="alert"
              aria-live="polite"
              className="min-h-5 text-sm text-destructive"
            >
              {error}
            </p>
            <Button
              type="submit"
              disabled={busy}
              className="min-h-11 w-full tracking-[0.18em] uppercase"
            >
              {pending === "request" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Sending reset code…
                </>
              ) : (
                "Send reset code"
              )}
            </Button>
            <p role="status" aria-live="polite" className="sr-only">
              {pending === "request" ? "Sending your reset code, please wait." : ""}
            </p>
          </form>
        ) : (
          <form onSubmit={complete} className="mt-6 space-y-5" noValidate aria-busy={busy}>
            {issuedCode ? (
              <p className="border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Demonstration only, your reset code is{" "}
                <span className="text-foreground tracking-[0.2em]">{issuedCode}</span>. It lapses in
                fifteen minutes.
              </p>
            ) : null}
            <div id="reset-validation-summary" role="status" aria-live="polite" className="sr-only">
              {announcement}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-code" className={errorFor("code") ? "text-destructive" : ""}>
                Reset code
              </Label>
              <Input
                id="reset-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, code: true }))}
                aria-invalid={errorFor("code") ? true : undefined}
                aria-describedby={describedBy("code")}
                className={fieldClass("code")}
              />
              {errorFor("code") ? (
                <p id="reset-code-error" className="flex gap-1.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{errorFor("code")}</span>
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="reset-password">New password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </button>
              </div>
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={errorFor("password") ? true : undefined}
                aria-describedby={describedBy("password", "reset-password-meter")}
                className={fieldClass("password")}
              />
              <PasswordStrengthMeter id="reset-password-meter" value={password} />
              {errorFor("password") ? (
                <p id="reset-password-error" className="flex gap-1.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{errorFor("password")}</span>
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="reset-confirm"
                className={errorFor("confirm") ? "text-destructive" : ""}
              >
                Confirm new password
              </Label>
              <Input
                id="reset-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                aria-invalid={errorFor("confirm") ? true : undefined}
                aria-describedby={describedBy("confirm")}
                className={fieldClass("confirm")}
              />
              {errorFor("confirm") ? (
                <p id="reset-confirm-error" className="flex gap-1.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{errorFor("confirm")}</span>
                </p>
              ) : null}
            </div>

            <p
              id="reset-error"
              role="alert"
              aria-live="polite"
              className="min-h-5 text-sm text-destructive"
            >
              {error}
            </p>
            <Button
              type="submit"
              disabled={!canSubmit || busy}
              aria-describedby="reset-submit-hint"
              className="min-h-11 w-full tracking-[0.18em] uppercase"
            >
              {pending === "reset" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Changing password…
                </>
              ) : (
                "Change my password"
              )}
            </Button>
            <div
              id="reset-submit-hint"
              role="status"
              aria-live="polite"
              className={cn(
                "border p-3 text-sm",
                canSubmit
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {busy ? (
                <p>Working on your request, please wait.</p>
              ) : canSubmit ? (
                <p>All required fields are valid, you can submit this form.</p>
              ) : blockingIssues.length === 0 ? (
                <p>Complete all three fields to enable “Change my password”.</p>
              ) : (
                <>
                  <p className="font-medium text-foreground">
                    {blockingIssues.length} field
                    {blockingIssues.length > 1 ? "s" : ""} still to fix before you can submit:
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5">
                    {blockingIssues.map((issue) => (
                      <li key={issue.field}>
                        <span className="font-medium">{issue.label}:</span> {issue.message}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={cooldown > 0 || busy}
              onClick={() => void issueCode(true)}
              className="min-h-11 w-full tracking-[0.18em] uppercase"
            >
              {pending === "resend" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Sending new code…
                </>
              ) : cooldown > 0 ? (
                `Resend code in ${cooldown}s`
              ) : (
                "Resend code"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm">
          <Link to="/login" search={{ mode: "signin" }} className="underline underline-offset-4">
            Return to sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
