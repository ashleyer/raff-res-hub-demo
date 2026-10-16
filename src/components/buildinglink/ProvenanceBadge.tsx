import { Link2 } from "lucide-react";
import { formatSyncTime } from "@/integrations/buildinglink/format";
import type { Provenance } from "@/integrations/buildinglink/types";
import { cn } from "@/lib/utils";

/** The small source label every BuildingLink-sourced item carries. Hub-native
 *  items render nothing here, which is the point: the label is the difference. */
export function ProvenanceBadge({
  provenance,
  className,
}: {
  provenance: Provenance | undefined;
  className?: string;
}) {
  if (!provenance) return null;
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 border border-border bg-background/60 px-2 py-1 text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase",
        className,
      )}
    >
      <Link2 className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
      <span>{provenance.label}</span>
      <span aria-hidden="true">·</span>
      <span>
        Synced{" "}
        <time dateTime={provenance.syncedAt} className="normal-case">
          {formatSyncTime(provenance.syncedAt)}
        </time>
      </span>
    </span>
  );
}
