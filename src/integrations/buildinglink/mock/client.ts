import { sameUnit } from "@/lib/units";
import { BuildingLinkUnavailableError, type BuildingLinkClient } from "../client";
import { createReferenceCounter } from "../fallback";
import type {
  Announcement,
  CalendarEvent,
  DateRange,
  Household,
  HubServiceRequest,
  Package,
  ServiceRequest,
  ServiceRequestFilter,
  ServiceRequestInput,
  SyncFlow,
  SyncRecord,
  VerificationResult,
} from "../types";
import {
  FAILED_MIRROR_ANNOUNCEMENT_ID,
  buildAnnouncements,
  buildDeskRequests,
  buildEvents,
  buildPackages,
  buildRoster,
  lastDailyRun,
  nextDailyRun,
} from "./fixtures";
import { between, mulberry32 } from "./random";

/* The simulated BuildingLink. Deterministic: the same seed and the same clock
 * give the same answers, the same latency, and the same sync timestamps. It
 * behaves like a connected system so the demo can show the integration end to
 * end, and it can be switched into an outage so the fallback can be shown too. */

export type MockOptions = {
  /** Seed for latency and nothing else; fixtures do not use it. */
  seed?: number;
  /** Clock, injectable for tests. */
  now?: () => Date;
  /** Simulated network latency on every call. Off in tests. */
  latency?: boolean;
};

export const DEFAULT_SEED = 20261016;

const OPEN: ReadonlySet<ServiceRequest["status"]> = new Set([
  "Submitted",
  "Received",
  "In progress",
]);

/* How quickly the simulated desk moves a request along, in seconds. */
const RECEIVED_AFTER = 15;
const IN_PROGRESS_AFTER = 45;

export class MockBuildingLinkClient implements BuildingLinkClient {
  readonly mode = "mock" as const;

  private readonly rng: () => number;
  private readonly now: () => Date;
  private readonly latency: boolean;
  private readonly nextReference = createReferenceCounter();

  private outage = false;
  private hubRequests: HubServiceRequest[] = [];
  private failedMirror = new Set<string>([FAILED_MIRROR_ANNOUNCEMENT_ID]);
  private lastRetryAt: Date | null = null;
  private writesThisSession = 0;

  constructor(options: MockOptions = {}) {
    this.rng = mulberry32(options.seed ?? DEFAULT_SEED);
    this.now = options.now ?? (() => new Date());
    this.latency = options.latency ?? true;
  }

  /* ----------------------------------------------------------- demo controls */

  /** Staff can flip this on the dashboard to watch the fallback take over. */
  setOutage(on: boolean) {
    this.outage = on;
  }

  get isOutage() {
    return this.outage;
  }

  /* --------------------------------------------------------------- plumbing */

  private async call<T>(flow: SyncFlow, work: () => T): Promise<T> {
    if (this.latency) {
      const ms = between(this.rng, 120, 420);
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
    if (this.outage) {
      throw new BuildingLinkUnavailableError(
        "BuildingLink is not answering right now. The last good copy is shown.",
        flow,
      );
    }
    return work();
  }

  private iso(d: Date) {
    return d.toISOString();
  }

  /* ----------------------------------------------------------------- roster */

  getRoster(): Promise<Household[]> {
    return this.call("roster", () => buildRoster(this.now()));
  }

  verifyResident(unit: string, lastName: string): Promise<VerificationResult> {
    return this.call("roster", () => {
      const typed = lastName.trim().toLowerCase();
      /* Accept the surname alone or a full name ending in it. */
      const surname = typed.split(/\s+/).pop() ?? typed;
      if (!surname || !unit.trim()) return { outcome: "miss" };
      for (const household of buildRoster(this.now())) {
        if (!sameUnit(household.unit, unit)) continue;
        const resident = household.residents.find(
          (r) => r.status === "current" && r.lastName.toLowerCase() === surname,
        );
        if (resident) return { outcome: "match", resident };
      }
      return { outcome: "miss" };
    });
  }

  /* ---------------------------------------------------- announcements, events */

  listAnnouncements(since?: string): Promise<Announcement[]> {
    return this.call("announcements", () => {
      const cutoff = since ? new Date(since).getTime() : 0;
      return buildAnnouncements(this.now()).filter(
        (a) => !this.failedMirror.has(a.id) && new Date(a.postedAt).getTime() >= cutoff,
      );
    });
  }

  listEvents(range: DateRange): Promise<CalendarEvent[]> {
    return this.call("events", () => {
      const from = new Date(range.from).getTime();
      const to = new Date(range.to).getTime();
      return buildEvents(this.now()).filter((e) => {
        const t = new Date(e.startsAt).getTime();
        return t >= from && t <= to;
      });
    });
  }

  /* --------------------------------------------------------------- packages */

  listPackages(unitId?: string): Promise<Package[]> {
    return this.call("packages", () => {
      const all = buildPackages(this.now());
      return unitId ? all.filter((p) => sameUnit(p.unit, unitId)) : all;
    });
  }

  /* ------------------------------------------------------- service requests */

  createServiceRequest(input: ServiceRequestInput): Promise<HubServiceRequest> {
    return this.call("service-requests", () => {
      const now = this.now();
      const reference = this.nextReference(now);
      const request: HubServiceRequest = {
        ...input,
        id: `hub-${reference}`,
        reference,
        source: "hub",
        route: "buildinglink",
        status: "Submitted",
        createdAt: this.iso(now),
        updatedAt: this.iso(now),
        provenance: {
          source: "buildinglink",
          label: "Sent to BuildingLink",
          syncedAt: this.iso(now),
        },
      };
      this.hubRequests = [request, ...this.hubRequests];
      this.writesThisSession += 1;
      return request;
    });
  }

  /** Requests the Hub lodged move along on a clock: Submitted, then Received,
   *  then In progress. Nothing completes on its own; staff do that. */
  private withProgress<T extends ServiceRequest>(request: T): T {
    if (request.source !== "hub" || !OPEN.has(request.status)) return request;
    const age = (this.now().getTime() - new Date(request.createdAt).getTime()) / 1000;
    const status: ServiceRequest["status"] =
      age >= IN_PROGRESS_AFTER ? "In progress" : age >= RECEIVED_AFTER ? "Received" : "Submitted";
    if (status === request.status) return request;
    const updatedAt = new Date(
      new Date(request.createdAt).getTime() +
        (status === "Received" ? RECEIVED_AFTER : IN_PROGRESS_AFTER) * 1000,
    );
    return { ...request, status, updatedAt: this.iso(updatedAt) };
  }

  private allRequests(): ServiceRequest[] {
    return [...this.hubRequests.map((r) => this.withProgress(r)), ...buildDeskRequests(this.now())];
  }

  getServiceRequest(id: string): Promise<ServiceRequest | null> {
    return this.call("service-requests", () => {
      return this.allRequests().find((r) => r.id === id || r.reference === id) ?? null;
    });
  }

  listServiceRequests(filter: ServiceRequestFilter = {}): Promise<ServiceRequest[]> {
    return this.call("service-requests", () => {
      return this.allRequests()
        .filter((r) => (filter.unit ? sameUnit(r.unit, filter.unit) : true))
        .filter((r) => (filter.open ? OPEN.has(r.status) : true))
        .filter((r) => (filter.source ? r.source === filter.source : true))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  }

  /* ------------------------------------------------------------------- sync */

  private syncRecords(): SyncRecord[] {
    const now = this.now();
    const last = this.iso(lastDailyRun(now));
    const next = this.iso(nextDailyRun(now));
    const roster = buildRoster(now);
    const announcements = buildAnnouncements(now);
    const packages = buildPackages(now);
    const failures = announcements
      .filter((a) => this.failedMirror.has(a.id))
      .map((a) => ({
        itemId: a.id,
        title: a.title,
        reason: "The notice body did not download before the run's time limit.",
      }));
    const mirrored = announcements.length - failures.length;
    const latestPackage = packages
      .map((p) => p.loggedAt)
      .sort()
      .at(-1);
    const latestWrite = this.hubRequests[0]?.createdAt ?? null;
    const outageNote = this.outage ? "BuildingLink did not answer the last attempt." : null;

    const records: SyncRecord[] = [
      {
        flow: "roster",
        direction: "read",
        cadence: "daily",
        status: this.outage ? "failed" : "ok",
        lastRunAt: last,
        nextRunAt: next,
        message:
          outageNote ?? `${roster.length} households read. Sign-ups are checked against this copy.`,
        ...(this.outage
          ? { fallback: "Sign-ups wait in the verification queue for the desk to confirm." }
          : {}),
      },
      {
        flow: "announcements",
        direction: "read",
        cadence: "daily",
        status: this.outage ? "failed" : failures.length > 0 ? "partial" : "ok",
        lastRunAt: this.lastRetryAt ? this.iso(this.lastRetryAt) : last,
        nextRunAt: next,
        message:
          outageNote ??
          (failures.length > 0
            ? `Mirrored ${mirrored} of ${announcements.length} notices.`
            : `Mirrored ${mirrored} of ${announcements.length} notices.`),
        ...(this.outage
          ? { fallback: "Residents see the notices from the last good run." }
          : failures.length > 0
            ? {
                fallback:
                  "Kept the last good copy of the notice that failed. Retry it from the mirror panel.",
              }
            : {}),
        ...(failures.length > 0 ? { failures } : {}),
      },
      {
        flow: "events",
        direction: "read",
        cadence: "daily",
        status: this.outage ? "failed" : "ok",
        lastRunAt: last,
        nextRunAt: next,
        message: outageNote ?? `${buildEvents(now).length} calendar entries read.`,
        ...(this.outage ? { fallback: "Residents see the calendar from the last good run." } : {}),
      },
      {
        flow: "packages",
        direction: "read",
        cadence: "on arrival",
        status: this.outage ? "failed" : "ok",
        lastRunAt: latestPackage ?? null,
        nextRunAt: null,
        message:
          outageNote ?? `${packages.length} packages on the log, read as the desk logs them.`,
        ...(this.outage
          ? { fallback: "Package notices pause until BuildingLink answers again." }
          : {}),
      },
      {
        flow: "service-requests",
        direction: "write",
        cadence: "live",
        status: this.outage ? "failed" : "ok",
        lastRunAt: latestWrite,
        nextRunAt: null,
        message:
          outageNote ??
          (this.writesThisSession === 0
            ? "No requests written yet this session."
            : `${this.writesThisSession} request${this.writesThisSession === 1 ? "" : "s"} written to the desk's queue this session.`),
        ...(this.outage
          ? { fallback: "New requests are emailed to the desk with a reference number." }
          : {}),
      },
    ];
    return records;
  }

  getSyncStatus(): Promise<SyncRecord[]> {
    /* Sync status must stay readable during an outage: that is the point of it. */
    return Promise.resolve(this.syncRecords());
  }

  retrySync(flow: SyncFlow, itemId?: string): Promise<SyncRecord> {
    return this.call(flow, () => {
      if (flow === "announcements") {
        if (itemId) this.failedMirror.delete(itemId);
        else this.failedMirror.clear();
        this.lastRetryAt = this.now();
      }
      const record = this.syncRecords().find((r) => r.flow === flow);
      if (!record) throw new Error(`Unknown sync flow: ${flow}`);
      return record;
    });
  }
}
