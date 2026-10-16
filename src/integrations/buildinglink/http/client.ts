import { BuildingLinkUnavailableError, type BuildingLinkClient } from "../client";
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

/* The HTTP client. A skeleton on purpose.
 *
 * It talks to exactly one thing: the Hub's own backend proxy under
 * /api/buildinglink/*. The proxy holds the building's BuildingLink credential;
 * this file never sees it, and the browser never sends one. BuildingLink has
 * not granted access yet and has not published endpoint documentation this
 * project could read, so every method below is a Hub-shaped request to the
 * proxy with a TODO where the real mapping goes. See MAPPING.md beside this
 * file for the capability each method depends on and its status. */

export const PROXY_BASE = "/api/buildinglink";

type FetchLike = typeof fetch;

export class HttpBuildingLinkClient implements BuildingLinkClient {
  readonly mode = "http" as const;

  private readonly fetchImpl: FetchLike;

  constructor(fetchImpl?: FetchLike) {
    this.fetchImpl = fetchImpl ?? ((input, init) => fetch(input, init));
  }

  private async request<T>(flow: SyncFlow, path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${PROXY_BASE}${path}`, {
        ...init,
        credentials: "same-origin",
        headers: { accept: "application/json", ...(init?.headers ?? {}) },
      });
    } catch {
      throw new BuildingLinkUnavailableError(
        "The BuildingLink proxy could not be reached. BuildingLink access is pending.",
        flow,
      );
    }
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !type.includes("application/json")) {
      /* A missing proxy answers with the app's own 404 page, not JSON. That is
         the normal state until access is granted, so say so plainly. */
      throw new BuildingLinkUnavailableError(
        response.status === 404 || !type.includes("application/json")
          ? "The BuildingLink proxy is not deployed. BuildingLink access is pending."
          : `The BuildingLink proxy answered ${response.status}.`,
        flow,
      );
    }
    return (await response.json()) as T;
  }

  /* roster · read, daily */
  getRoster(): Promise<Household[]> {
    // TODO(buildinglink): map the proxy's roster payload once access is granted.
    return this.request<Household[]>("roster", "/roster");
  }

  verifyResident(unit: string, lastName: string): Promise<VerificationResult> {
    // TODO(buildinglink): the proxy performs the match server-side; the browser
    // never downloads the roster to compare locally.
    return this.request<VerificationResult>("roster", "/roster/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ unit, lastName }),
    });
  }

  /* announcements and events · read, daily */
  listAnnouncements(since?: string): Promise<Announcement[]> {
    // TODO(buildinglink): map announcement fields and the "since" filter.
    const query = since ? `?since=${encodeURIComponent(since)}` : "";
    return this.request<Announcement[]>("announcements", `/announcements${query}`);
  }

  listEvents(range: DateRange): Promise<CalendarEvent[]> {
    // TODO(buildinglink): map calendar event fields and the date range.
    const query = `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
    return this.request<CalendarEvent[]>("events", `/events${query}`);
  }

  /* packages · read, on arrival */
  listPackages(unitId?: string): Promise<Package[]> {
    // TODO(buildinglink): map package fields; confirm whether a per-unit filter exists.
    const query = unitId ? `?unit=${encodeURIComponent(unitId)}` : "";
    return this.request<Package[]>("packages", `/packages${query}`);
  }

  /* service requests · write */
  createServiceRequest(input: ServiceRequestInput): Promise<HubServiceRequest> {
    // TODO(buildinglink): the proxy writes into BuildingLink's maintenance
    // request import and returns the Hub reference plus BuildingLink's id.
    return this.request<HubServiceRequest>("service-requests", "/service-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  getServiceRequest(id: string): Promise<ServiceRequest | null> {
    // TODO(buildinglink): status read-back depends on what the import path returns.
    return this.request<ServiceRequest | null>(
      "service-requests",
      `/service-requests/${encodeURIComponent(id)}`,
    );
  }

  listServiceRequests(filter: ServiceRequestFilter = {}): Promise<ServiceRequest[]> {
    // TODO(buildinglink): staff list; confirm whether desk-logged requests are readable.
    const params = new URLSearchParams();
    if (filter.unit) params.set("unit", filter.unit);
    if (filter.open) params.set("open", "1");
    if (filter.source) params.set("source", filter.source);
    const query = params.size > 0 ? `?${params.toString()}` : "";
    return this.request<ServiceRequest[]>("service-requests", `/service-requests${query}`);
  }

  /* sync bookkeeping · kept by the proxy, never by BuildingLink */
  getSyncStatus(): Promise<SyncRecord[]> {
    return this.request<SyncRecord[]>("roster", "/sync");
  }

  retrySync(flow: SyncFlow, itemId?: string): Promise<SyncRecord> {
    return this.request<SyncRecord>(flow, `/sync/${flow}/retry`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(itemId ? { itemId } : {}),
    });
  }
}
