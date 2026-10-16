import type {
  AdapterMode,
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
} from "./types";

/* The adapter interface. Every resident page and every personnel panel reads
 * through this, never through a concrete client, so swapping mock for http is
 * one environment variable.
 *
 * The method set follows the four flows the Hub needs and the capabilities
 * BuildingLink names on its developer page (calendar events, announcements,
 * package information, reservation availability, and importing maintenance
 * requests from an external program). The roster read is the one flow that
 * page does not list; http/MAPPING.md says so. */
export interface BuildingLinkClient {
  readonly mode: AdapterMode;

  /* roster · read, daily */
  getRoster(): Promise<Household[]>;
  verifyResident(unit: string, lastName: string): Promise<VerificationResult>;

  /* announcements and events · read, daily */
  listAnnouncements(since?: string): Promise<Announcement[]>;
  listEvents(range: DateRange): Promise<CalendarEvent[]>;

  /* packages · read, on arrival */
  listPackages(unitId?: string): Promise<Package[]>;

  /* service requests · write, live once access is granted */
  createServiceRequest(input: ServiceRequestInput): Promise<HubServiceRequest>;
  getServiceRequest(id: string): Promise<ServiceRequest | null>;
  /** Staff view. Residents get their own unit through the filter. */
  listServiceRequests(filter?: ServiceRequestFilter): Promise<ServiceRequest[]>;

  /* sync bookkeeping · Hub-side, so staff can see every run */
  getSyncStatus(): Promise<SyncRecord[]>;
  retrySync(flow: SyncFlow, itemId?: string): Promise<SyncRecord>;
}

/** Raised when BuildingLink, or the proxy in front of it, cannot be reached. The
 *  hooks catch this and fall back; the message is written to be shown as is. */
export class BuildingLinkUnavailableError extends Error {
  readonly flow: SyncFlow | "unknown";

  constructor(message: string, flow: SyncFlow | "unknown" = "unknown") {
    super(message);
    this.name = "BuildingLinkUnavailableError";
    this.flow = flow;
  }
}

export function isUnavailable(error: unknown): error is BuildingLinkUnavailableError {
  return error instanceof BuildingLinkUnavailableError;
}
