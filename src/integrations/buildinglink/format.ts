/* Display helpers for sync times and ages. Plain words, local time, in the
   same shapes the demo already uses ("Today, 11:05 AM", "August 14, 2026"). */

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const clock = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** "Today, 5:02 AM" / "Yesterday, 4:20 PM" / "Oct 14, 9:05 AM". Null in → "never". */
export function formatSyncTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return `Today, ${clock(d)}`;
  if (sameDay(d, yesterday)) return `Yesterday, ${clock(d)}`;
  if (sameDay(d, tomorrow)) return `Tomorrow, ${clock(d)}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${clock(d)}`;
}

/** "just now" / "4 min" / "2 h" / "3 d". */
export function formatAge(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

/** "October 18, 2026", matching the Hub's existing event cards. */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "9:00 AM". */
export function formatClock(iso: string): string {
  return clock(new Date(iso));
}
