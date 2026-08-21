const WINDOW_PATTERN = /^(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/;

function toMinutes(hhmm: string): number {
  const parts = hhmm.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function toHHMM(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60)
    .toString()
    .padStart(2, "0");
  const m = (wrapped % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Half-hour time options across an outlet's service window, e.g. "17:00 – 22:00
 *  (23:00 Fri–Sat)" → 17:00, 17:30, … 22:00. Ignores the parenthetical day-of-week
 *  extension — a deliberate simplification, not a real scheduling rule for this demo.
 *  Handles the one cross-midnight window (17:00 – 01:00) by wrapping past 24:00. */
export function timeOptionsFromWindow(window: string): string[] {
  const match = WINDOW_PATTERN.exec(window);
  if (!match) return [];
  const start = toMinutes(match[1]!);
  let end = toMinutes(match[2]!);
  if (end <= start) end += 1440;

  const options: string[] = [];
  for (let t = start; t <= end; t += 30) options.push(toHHMM(t));
  return options;
}
