import { CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** One line residents see when a BuildingLink read is loading or could not be
 *  refreshed. Quiet by design; the staff dashboard carries the detail. */
export function SyncNotice({
  loading,
  error,
  what,
  className,
}: {
  loading: boolean;
  error: string | null;
  /** "building notices", "the building calendar", "package notices" */
  what: string;
  className?: string;
}) {
  if (!loading && !error) return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {loading ? (
        <>
          <Loader2
            className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>Checking BuildingLink for {what}.</span>
        </>
      ) : (
        <>
          <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{error}</span>
        </>
      )}
    </p>
  );
}
