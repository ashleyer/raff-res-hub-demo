import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const SECURITY_MAILTO =
  "mailto:security@raffles-boston.demo?subject=Security%20issue%20report&body=Residence%3A%0ALocation%3A%0ATime%20observed%3A%0AWhat%20happened%3A%0A";

type Receipt = { reference: string; at: string };

function makeReceipt(): Receipt {
  const now = new Date();
  const stamp = now.toISOString().slice(2, 16).replace(/[-:T]/g, "");
  return {
    reference: `SEC-${stamp}`,
    at: now.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

/**
 * Security notification trigger. Opens the desk's mail draft, then confirms with a
 * toast and an on-screen receipt so the resident knows the alert was raised.
 */
export function NotifySecurity({
  label = "Notify security of an issue",
  className = "btn-outline mt-6 w-full self-center sm:w-auto",
  ariaLabel = "Notify security of an issue by email",
}: {
  label?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  return (
    <>
      <a
        href={SECURITY_MAILTO}
        className={className}
        aria-label={ariaLabel}
        onClick={() => {
          const next = makeReceipt();
          setReceipt(next);
          toast.success("Security has been notified.", {
            description: `Reference ${next.reference} · ${next.at}`,
          });
        }}
      >
        {label}
      </a>

      {receipt && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mt-5 w-full max-w-sm border border-primary/40 bg-primary/5 px-4 py-4 text-left"
        >
          <p className="flex items-center gap-2 text-xs tracking-[0.16em] text-primary uppercase">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Notification sent
          </p>
          <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between gap-4">
              <dt>Reference</dt>
              <dd className="text-foreground">{receipt.reference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Logged</dt>
              <dd className="text-foreground">{receipt.at}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Routed to</dt>
              <dd className="text-foreground">Security desk</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo receipt — no message is actually delivered. For emergencies, dial 911.
          </p>
        </div>
      )}
    </>
  );
}
