import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "@/lib/portal-store";

const SECURITY_MAILTO =
  "mailto:security@raffles-boston.demo?subject=Security%20issue%20report&body=Residence%3A%0ALocation%3A%0ATime%20observed%3A%0AWhat%20happened%3A%0A";

type Receipt = { reference: string; at: string };

function formatLoggedAt(now: Date): string {
  return now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Security notification trigger. Opens the desk's mail draft (for a production
 * deployment's real inbox) AND lodges a Priority "Security" concierge request,
 * so the click lands in the same staff-reviewed queue as the concierge form's
 * own Security category, one review pipeline behind two front doors, by design.
 * Confirms with a toast and an on-screen receipt either way.
 */
export function NotifySecurity({
  label = "Notify security of an issue",
  className = "btn-alert mt-6 w-full self-center sm:w-auto",
  ariaLabel = "Notify security of an issue by email",
}: {
  label?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const { currentUser, addConciergeRequest } = usePortal();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  return (
    <>
      <a
        href={SECURITY_MAILTO}
        className={className}
        aria-label={ariaLabel}
        onClick={() => {
          const id = addConciergeRequest({
            service: "Security",
            detail:
              'Submitted via the site-wide "Notify security" button, no further detail given yet. Follow up with the resident directly.',
            unit: currentUser?.unit ?? "Not signed in",
            priority: "Priority",
          });
          setReceipt({ reference: `SEC-${id}`, at: formatLoggedAt(new Date()) });
          toast.success("Security has been notified.", {
            description: `Reference SEC-${id}, also queued on the concierge desk.`,
          });
        }}
      >
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
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
              <dd className="text-foreground">Concierge desk queue</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo receipt, the email draft isn't actually delivered, but this request is now on the
            concierge desk queue like any other. For emergencies, dial 911.
          </p>
        </div>
      )}
    </>
  );
}
