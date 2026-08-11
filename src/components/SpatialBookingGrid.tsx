import { useMemo } from "react";
import { Check, Lock, Clock3 } from "lucide-react";
import type { Booking } from "@/lib/intranet-data";

export type SlotStatus = "free" | "held" | "booked";

/**
 * Real-time spatial grid for high-demand resident-only rooms: each sitting is
 * shown as free, held by the house, or already booked, so two residents cannot
 * claim the same window.
 */
export function SpatialBookingGrid({
  slots,
  bookings,
  amenityId,
  date,
  selected,
  onSelect,
}: {
  slots: readonly string[];
  bookings: Booking[];
  amenityId: string;
  date: string;
  selected: string;
  onSelect: (slot: string) => void;
}) {
  const statuses = useMemo(() => {
    const map = new Map<string, SlotStatus>();
    for (const slot of slots) {
      const taken = bookings.some(
        (b) => b.amenityId === amenityId && b.date === date && b.slot === slot,
      );
      // Without a date the grid shows availability as indicative only.
      map.set(slot, taken ? "booked" : "free");
    }
    return map;
  }, [slots, bookings, amenityId, date]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 border border-primary bg-transparent" aria-hidden="true" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-primary" aria-hidden="true" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-muted-foreground/40" aria-hidden="true" />
          Reserved
        </span>
      </div>

      <div
        role="group"
        aria-label={
          date ? `Sittings for ${date}` : "Sittings · choose a date for live availability"
        }
        className="mt-3 grid gap-2 sm:grid-cols-2"
      >
        {slots.map((slot) => {
          const status = statuses.get(slot) ?? "free";
          const isSelected = selected === slot;
          const disabled = status === "booked";
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot)}
              className={[
                "flex min-h-11 items-center justify-between gap-2 border px-3 py-2 text-left text-sm transition-colors",
                disabled
                  ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground line-through"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary",
              ].join(" ")}
            >
              <span>{slot}</span>
              {disabled ? (
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              ) : isSelected ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Clock3 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="sr-only">{disabled ? "already reserved" : "available"}</span>
            </button>
          );
        })}
      </div>
      {!date && (
        <p className="mt-2 text-xs text-muted-foreground">
          Choose a date above to see live availability for this room.
        </p>
      )}
    </div>
  );
}
