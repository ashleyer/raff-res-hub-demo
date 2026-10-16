import { PackageCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProvenanceBadge } from "@/components/buildinglink/ProvenanceBadge";
import { SyncNotice } from "@/components/buildinglink/SyncNotice";
import { formatSyncTime } from "@/integrations/buildinglink/format";
import { usePackages } from "@/integrations/buildinglink/hooks";

/** Package arrival notices for one residence, read from the desk's log in
 *  BuildingLink. Shown on Messages and the house account so a resident hears
 *  about a parcel wherever they happen to be looking. */
export function PackageNotices({ unit, id = "package-notices" }: { unit: string; id?: string }) {
  const packages = usePackages(unit);
  const waiting = packages.data.filter((p) => p.status === "At the desk");

  return (
    <section aria-labelledby={`${id}-heading`} className="border border-border bg-card p-6">
      <p className="eyebrow">From the desk</p>
      <h2 id={`${id}-heading`} className="mt-3 text-xl">
        Packages at the desk
      </h2>
      <SyncNotice
        loading={packages.loading}
        error={packages.error}
        what="package notices"
        className="mt-3"
      />
      {!packages.loading && waiting.length === 0 && !packages.error && (
        <p className="mt-3 text-sm text-muted-foreground">Nothing is waiting for {unit}.</p>
      )}
      {waiting.length > 0 && (
        <ul className="mt-4 space-y-3">
          {waiting.map((p) => (
            <li key={p.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
              <p className="flex items-start gap-2 text-sm">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="text-foreground">{p.carrier}</span>, {p.description}. Logged{" "}
                  {formatSyncTime(p.loggedAt)}.
                </span>
              </p>
              <ProvenanceBadge provenance={p.provenance} className="mt-2" />
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/services"
        search={{ tab: "mail" }}
        className="nav-link mt-4 inline-flex min-h-11 items-center text-sm text-primary"
      >
        Collect or request delivery on the Services page
      </Link>
    </section>
  );
}
