import { Check, X } from "lucide-react";
import { scorePassword } from "@/lib/password-strength";

/* Visual strength indicator with an accessible text summary. Colour alone never
   conveys the result · the label, hints and per-rule reasons are always readable. */
export function PasswordStrengthMeter({ value, id }: { value: string; id?: string }) {
  const { score, label, suggestions, criteria } = scorePassword(value);
  const tone = [
    "bg-destructive",
    "bg-destructive",
    "bg-amber-500",
    "bg-emerald-600",
    "bg-emerald-700",
  ][score];

  return (
    <div id={id} className="space-y-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${value && i < score ? tone : "bg-border"}`}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        <span className="text-foreground">Password strength: {value ? label : "not set"}.</span>
        {suggestions.length ? ` ${suggestions.join(" ")}` : " This password looks solid."}
      </p>
      <ul className="grid gap-1 text-xs sm:grid-cols-2">
        {criteria.map((criterion) => (
          <li
            key={criterion.id}
            className={`flex items-start gap-1.5 ${
              criterion.met ? "text-emerald-700" : "text-muted-foreground"
            }`}
          >
            {criterion.met ? (
              <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              <span className="sr-only">{criterion.met ? "Met: " : "Not met: "}</span>
              {criterion.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
