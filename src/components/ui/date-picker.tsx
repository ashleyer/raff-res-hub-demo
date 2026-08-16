import { useState } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DATE_FORMAT = "yyyy-MM-dd";

/** A resident-facing date field styled to match the app's editorial forms, wrapping the
 *  same react-day-picker `Calendar` the shadcn kit ships (previously unused). Stores and
 *  emits the same "yyyy-MM-dd" string shape a native `<input type="date">` produced, so it
 *  drops in without changing any surrounding validation or state. */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Select a date",
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, DATE_FORMAT, new Date()) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          {selected ? format(selected, "EEE, MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, DATE_FORMAT) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
