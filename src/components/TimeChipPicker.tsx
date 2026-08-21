import { useMemo } from "react";
import { Check, Clock3 } from "lucide-react";
import { format, parse } from "date-fns";
import { timeOptionsFromWindow } from "@/lib/time-window";

function label(hhmm: string): string {
  return format(parse(hhmm, "HH:mm", new Date()), "h:mm a");
}

/** App-specific chip time selector for Hotel Bridge's priority-table form — same visual
 *  language as `SpatialBookingGrid`'s chips, without its booking-conflict logic (there's no
 *  equivalent "already reserved" concept for a simple time field). */
export function TimeChipPicker({
  window,
  selected,
  onSelect,
}: {
  window: string;
  selected: string;
  onSelect: (time: string) => void;
}) {
  const options = useMemo(() => timeOptionsFromWindow(window), [window]);

  return (
    <div role="radiogroup" aria-label="Reservation time" className="flex flex-wrap gap-2">
      {options.map((t) => {
        const isSelected = t === selected;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(t)}
            className={[
              "flex min-h-11 items-center gap-2 border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary",
            ].join(" ")}
          >
            {isSelected ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Clock3 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            )}
            {label(t)}
          </button>
        );
      })}
    </div>
  );
}
