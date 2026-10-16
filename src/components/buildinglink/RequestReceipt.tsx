import { Mail } from "lucide-react";
import { useServiceRequests } from "@/integrations/buildinglink/hooks";
import type { ServiceRequestRoute } from "@/integrations/buildinglink/types";

/** The receipt a resident keeps for a request lodged through the Hub. Shows the
 *  reference, the route the request took, and a status that updates while the
 *  desk's queue moves. Rendered inside whatever shell the page already uses. */
export function RequestReceipt({
  reference,
  route,
  rows,
  note,
}: {
  reference: string;
  route: ServiceRequestRoute;
  /** Page-specific rows such as service, residence, and handling. */
  rows?: { label: string; value: string }[];
  note?: string;
}) {
  const { byReference, emailFor, mode } = useServiceRequests();
  const live = byReference(reference);
  const email = route === "desk-email" ? emailFor(reference) : undefined;
  const status = live?.status ?? "Submitted";

  return (
    <dl className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
        <dt className="text-muted-foreground">Reference</dt>
        <dd className="font-medium tracking-wide">{reference}</dd>
      </div>
      {rows?.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 border-b border-border pb-2"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium">{row.value}</dd>
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
        <dt className="text-muted-foreground">Route</dt>
        <dd className="text-right font-medium">
          {route === "buildinglink" ? (
            <>
              Sent to BuildingLink
              {mode === "mock" && (
                <span className="block text-xs font-normal text-muted-foreground">Simulated</span>
              )}
            </>
          ) : (
            "Emailed to the desk"
          )}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Status</dt>
        <dd aria-live="polite" className="font-medium">
          {status}
        </dd>
      </div>
      {email && (
        <div className="border-t border-border pt-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            BuildingLink access is pending, so this request goes to the desk by email under the same
            reference. Send it from your own mail app.
          </p>
          <a
            href={email.mailto}
            className="btn-outline mt-3 inline-flex min-h-11 items-center gap-2 text-sm"
          >
            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            Open the email to the desk
          </a>
        </div>
      )}
      {note && <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </dl>
  );
}
