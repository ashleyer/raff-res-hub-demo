import { RESIDENTS } from "@/lib/portal-data";
import type {
  Announcement,
  CalendarEvent,
  Household,
  Package,
  Provenance,
  Resident,
  ServiceRequest,
} from "../types";

/* Simulated BuildingLink data for the demo.
 *
 * Everything here is invented. The roster reuses the fictional residents the
 * demo already shows, so no new names or units appear anywhere. Timestamps are
 * computed from "now" so the data always reads as current, and the same "now"
 * always produces the same fixtures. */

/** Hour of the daily sync, local time. Staff see it on the dashboard. */
export const DAILY_SYNC_HOUR = 5;
export const DAILY_SYNC_MINUTE = 2;

/** The most recent daily run at or before "now". */
export function lastDailyRun(now: Date): Date {
  const run = new Date(now);
  run.setHours(DAILY_SYNC_HOUR, DAILY_SYNC_MINUTE, 0, 0);
  if (run > now) run.setDate(run.getDate() - 1);
  return run;
}

export function nextDailyRun(now: Date): Date {
  const next = lastDailyRun(now);
  next.setDate(next.getDate() + 1);
  return next;
}

/** A moment relative to "now": whole days back or forward, at a clock time. */
export function at(now: Date, days: number, hour: number, minute: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const iso = (d: Date) => d.toISOString();

function provenance(label: Provenance["label"], syncedAt: Date): Provenance {
  return { source: "buildinglink", label, syncedAt: iso(syncedAt) };
}

/* -------------------------------------------------------------------- roster */

/** "James & Odile Whitfield" → "Whitfield"; "Eleanor Vance" → "Vance". */
export function surnameOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName.trim();
}

function firstNameOf(fullName: string): string | undefined {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(0, -1).join(" ") : undefined;
}

export function buildRoster(now: Date): Household[] {
  const syncedAt = lastDailyRun(now);
  const label = "On the building roster" as const;
  return RESIDENTS.map((r, index) => {
    const householdId = `bl-hh-${String(index + 1).padStart(3, "0")}`;
    const first = firstNameOf(r.name);
    const resident: Resident = {
      id: `bl-res-${String(index + 1).padStart(3, "0")}`,
      householdId,
      unit: r.unit,
      lastName: surnameOf(r.name),
      ...(first ? { firstName: first } : {}),
      status: "current",
      provenance: provenance(label, syncedAt),
    };
    return {
      id: householdId,
      unit: r.unit,
      residents: [resident],
      provenance: provenance(label, syncedAt),
    };
  });
}

/* ------------------------------------------------------------- announcements */

/** The one notice whose first mirror run fails, so the dashboard has something
 *  real to retry. Everything about the failure is simulated. */
export const FAILED_MIRROR_ANNOUNCEMENT_ID = "bl-ann-003";

export function buildAnnouncements(now: Date): Announcement[] {
  const syncedAt = lastDailyRun(now);
  const label = "Posted via BuildingLink" as const;
  return [
    {
      id: "bl-ann-001",
      title: "Water shut-off, Floors 30 to 34, Thursday 10:00 to 13:00",
      body: "Engineering will replace a riser valve. Please avoid running appliances during the window. Water returns by 13:00; call the desk if it has not.",
      postedBy: "Chief Engineer",
      postedAt: iso(at(now, -1, 16, 20)),
      pinned: true,
      provenance: provenance(label, syncedAt),
    },
    {
      id: "bl-ann-002",
      title: "Fire alarm test, Tuesday 11:00",
      body: "The annual alarm test sounds for about four minutes on every floor. No action is needed and the lifts stay in service.",
      postedBy: "Residences Office",
      postedAt: iso(at(now, -3, 9, 5)),
      provenance: provenance(label, syncedAt),
    },
    {
      id: FAILED_MIRROR_ANNOUNCEMENT_ID,
      title: "Window washing, east elevation, next week",
      body: "Crews work from the roof between 08:00 and 17:00. Please keep terrace furniture clear of the rail on the days listed at the desk.",
      postedBy: "Residences Office",
      postedAt: iso(at(now, -5, 14, 40)),
      provenance: provenance(label, syncedAt),
    },
  ];
}

/* ------------------------------------------------------------------- events */

export function buildEvents(now: Date): CalendarEvent[] {
  const syncedAt = lastDailyRun(now);
  const label = "From the building calendar" as const;
  return [
    {
      id: "bl-evt-001",
      title: "Service lift reserved for a move-in",
      detail: "Car four is held for a move-in on Floor 19. Deliveries go through car three.",
      location: "Service lift, Floor 19",
      startsAt: iso(at(now, 2, 9, 0)),
      endsAt: iso(at(now, 2, 15, 0)),
      provenance: provenance(label, syncedAt),
    },
    {
      id: "bl-evt-002",
      title: "Board of Trustees, open session",
      detail:
        "Residents are welcome for the first forty minutes. The agenda is posted at the desk.",
      location: "Board Room, Floor 21",
      startsAt: iso(at(now, 6, 18, 0)),
      endsAt: iso(at(now, 6, 19, 30)),
      provenance: provenance(label, syncedAt),
    },
    {
      id: "bl-evt-003",
      title: "Window washing, east elevation",
      detail:
        "Crews on the roof from 08:00. Terraces on the east side should be kept clear of the rail.",
      location: "East elevation",
      startsAt: iso(at(now, 9, 8, 0)),
      endsAt: iso(at(now, 9, 17, 0)),
      provenance: provenance(label, syncedAt),
    },
  ];
}

/* ----------------------------------------------------------------- packages */

export function buildPackages(now: Date): Package[] {
  const label = "Logged by the desk" as const;
  const logged = (days: number, hour: number, minute: number) => at(now, days, hour, minute);
  const rows: [string, string, string, Date, Package["status"]][] = [
    ["bl-pkg-001", "Residence 22H", "FedEx", logged(0, 8, 12), "At the desk"],
    ["bl-pkg-002", "Residence 34B", "UPS", logged(0, 10, 47), "At the desk"],
    ["bl-pkg-003", "Residence 41C", "USPS", logged(0, 11, 30), "At the desk"],
    ["bl-pkg-004", "Residence 17F", "DHL", logged(-1, 15, 5), "Released"],
    ["bl-pkg-005", "Residence 22H", "UPS", logged(-2, 13, 25), "Released"],
  ];
  const descriptions: Record<string, string> = {
    "bl-pkg-001": "One parcel, small",
    "bl-pkg-002": "Two parcels, signature taken at the desk",
    "bl-pkg-003": "Registered letter",
    "bl-pkg-004": "One parcel, large",
    "bl-pkg-005": "Garment box",
  };
  return rows
    .filter(([, , , when]) => when <= now)
    .map(([id, unit, carrier, when, status]) => ({
      id,
      unit,
      carrier,
      description: descriptions[id] ?? "Parcel",
      loggedAt: iso(when),
      status,
      provenance: provenance(label, when),
    }));
}

/* --------------------------------------------------------- service requests */

/** Requests the desk logged in BuildingLink itself, so staff see one list. */
export function buildDeskRequests(now: Date): ServiceRequest[] {
  const label = "Logged by the desk" as const;
  const logged = (days: number, hour: number, minute: number) => at(now, days, hour, minute);
  const a = logged(0, 7, 55);
  const b = logged(-1, 17, 10);
  return [
    {
      id: "bl-req-001",
      source: "buildinglink",
      route: "buildinglink",
      unit: "Residence 28D",
      category: "Engineering",
      detail: "Corridor light out outside the residence; reported at the desk in person.",
      priority: "Standard",
      status: "Received",
      createdAt: iso(a),
      updatedAt: iso(a),
      provenance: provenance(label, a),
    },
    {
      id: "bl-req-002",
      source: "buildinglink",
      route: "buildinglink",
      unit: "Residence 41C",
      category: "Engineering",
      detail: "Slow drain in the guest bath. Engineering scheduled for tomorrow morning.",
      priority: "Standard",
      status: "In progress",
      createdAt: iso(b),
      updatedAt: iso(logged(0, 8, 30)),
      permissionToEnter: true,
      provenance: provenance(label, b),
    },
  ];
}
