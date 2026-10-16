/* Types for the BuildingLink adapter.
 *
 * These are the Hub's own shapes, not BuildingLink's. BuildingLink has not
 * published endpoint documentation that this project could read, so nothing
 * here claims to mirror a BuildingLink field. The http client maps whatever
 * the backend proxy returns into these shapes; see http/MAPPING.md for the
 * capability each method depends on and its status. */

/* ---------------------------------------------------------------- provenance */

/** Where an item came from. Hub-native items carry no provenance at all. */
export type ProvenanceLabel =
  | "Posted via BuildingLink"
  | "Logged by the desk"
  | "From the building calendar"
  | "On the building roster"
  | "Sent to BuildingLink";

export type Provenance = {
  source: "buildinglink";
  label: ProvenanceLabel;
  /** ISO timestamp of the sync that produced this copy. */
  syncedAt: string;
};

/* -------------------------------------------------------------------- roster */

export type Resident = {
  id: string;
  householdId: string;
  /** "Residence 22H", formatted the way the rest of the Hub formats units. */
  unit: string;
  lastName: string;
  firstName?: string;
  status: "current" | "moved out";
  provenance: Provenance;
};

export type Household = {
  id: string;
  unit: string;
  residents: Resident[];
  provenance: Provenance;
};

export type VerificationResult =
  | { outcome: "match"; resident: Resident }
  /* A miss carries no reason on purpose. The resident sees one calm message
     and the desk sees the attempt; nobody learns who lives where by guessing. */
  | { outcome: "miss" };

/* ------------------------------------------------------- announcements & events */

export type Announcement = {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  /** ISO timestamp. */
  postedAt: string;
  pinned?: boolean;
  provenance: Provenance;
};

export type CalendarEvent = {
  id: string;
  title: string;
  detail: string;
  location: string;
  /** ISO timestamps. */
  startsAt: string;
  endsAt?: string;
  provenance: Provenance;
};

export type DateRange = { from: string; to: string };

/* ------------------------------------------------------------------ packages */

export type PackageStatus = "At the desk" | "Released";

export type Package = {
  id: string;
  unit: string;
  carrier: string;
  description: string;
  /** ISO timestamp the desk logged it. */
  loggedAt: string;
  status: PackageStatus;
  provenance: Provenance;
};

/* ---------------------------------------------------------- service requests */

export type ServiceRequestStatus =
  "Submitted" | "Received" | "In progress" | "Completed" | "Cancelled";

/** How a request reached the desk. */
export type ServiceRequestRoute = "buildinglink" | "desk-email";

export type ServiceRequestInput = {
  unit: string;
  category: string;
  detail: string;
  priority: "Standard" | "Priority";
  permissionToEnter?: boolean;
  /** Contact for the desk's reply; never a credential. */
  contact?: string;
};

export type ServiceRequest = ServiceRequestInput & {
  id: string;
  /** Hub reference, RRH-YYYYMMDD-NNN, on every request lodged through the Hub.
   *  Requests the desk logged in BuildingLink directly have none. */
  reference?: string;
  /** Whether the Hub created it or the desk logged it in BuildingLink directly. */
  source: "hub" | "buildinglink";
  route: ServiceRequestRoute;
  status: ServiceRequestStatus;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  /** BuildingLink's own identifier once it has accepted the request. Its shape is
   *  unknown until access is granted, so the mock never sets it. */
  externalId?: string;
  provenance?: Provenance;
};

/** A request lodged through the Hub always carries a reference. */
export type HubServiceRequest = ServiceRequest & { source: "hub"; reference: string };

export type ServiceRequestFilter = {
  unit?: string;
  open?: boolean;
  source?: ServiceRequest["source"];
};

/* ---------------------------------------------------------------------- sync */

export type SyncFlow = "roster" | "announcements" | "events" | "packages" | "service-requests";

export type SyncCadence = "daily" | "on arrival" | "live";

export type SyncStatus = "ok" | "partial" | "failed" | "pending access" | "never run";

export type SyncFailure = {
  itemId: string;
  title: string;
  reason: string;
};

export type SyncRecord = {
  flow: SyncFlow;
  direction: "read" | "write";
  cadence: SyncCadence;
  status: SyncStatus;
  /** ISO timestamps; null when the flow has never run. */
  lastRunAt: string | null;
  nextRunAt: string | null;
  /** Plain-language note on what happened, shown to staff as written. */
  message: string;
  /** What the fallback did when the run failed, if it failed. */
  fallback?: string;
  failures?: SyncFailure[];
};

export type AdapterMode = "mock" | "http";
