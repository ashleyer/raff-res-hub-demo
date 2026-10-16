import type { SyncRecord } from "./types";

/* What the dashboard shows when the sync log itself cannot be read: one row per
   flow, status "pending access", and the fallback each flow is on today. The
   Hub knows its own flows even when BuildingLink is out of reach. */
export function pendingAccessRecords(message: string): SyncRecord[] {
  const base = { status: "pending access" as const, lastRunAt: null, nextRunAt: null, message };
  return [
    {
      ...base,
      flow: "roster",
      direction: "read",
      cadence: "daily",
      fallback: "Sign-ups wait in the verification queue for the desk to confirm.",
    },
    {
      ...base,
      flow: "announcements",
      direction: "read",
      cadence: "daily",
      fallback: "Residents see the Residences Office notices kept in this app.",
    },
    {
      ...base,
      flow: "events",
      direction: "read",
      cadence: "daily",
      fallback: "Residents see the gatherings kept in this app.",
    },
    {
      ...base,
      flow: "packages",
      direction: "read",
      cadence: "on arrival",
      fallback: "Package notices come from the desk by the usual means.",
    },
    {
      ...base,
      flow: "service-requests",
      direction: "write",
      cadence: "live",
      fallback: "New requests are emailed to the desk with a reference number.",
    },
  ];
}
