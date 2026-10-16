import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sameUnit } from "@/lib/units";
import { isUnavailable, type BuildingLinkClient } from "./client";
import { buildDeskEmail, createReferenceCounter, type DeskEmail } from "./fallback";
import { createBuildingLinkClient } from "./index";
import { MockBuildingLinkClient } from "./mock/client";
import type {
  AdapterMode,
  Announcement,
  CalendarEvent,
  Household,
  HubServiceRequest,
  Package,
  ServiceRequest,
  ServiceRequestInput,
  SyncFlow,
  SyncRecord,
} from "./types";

/* One provider owns the adapter and a per-session cache, so the resident pages
 * and the personnel dashboard render the same objects. Navigating between
 * pages does not refetch; a manual refresh, a retry, or an outage switch does.
 * Everything here is in memory and resets when the page reloads, like the rest
 * of the demo. */

/* ------------------------------------------------------------------ shapes */

export type DataSource = "buildinglink" | "fallback";

export type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  /** A plain-language message to show as written, or null. */
  error: string | null;
  lastSyncedAt: string | null;
  source: DataSource | null;
};

type Resources = {
  roster: ResourceState<Household[]>;
  announcements: ResourceState<Announcement[]>;
  events: ResourceState<CalendarEvent[]>;
  packages: ResourceState<Package[]>;
  serviceRequests: ResourceState<ServiceRequest[]>;
  sync: ResourceState<SyncRecord[]>;
};

export type ResourceKey = keyof Resources;

/** A sign-up the roster could not match, waiting for the desk. Hub-side state. */
export type VerificationRequest = {
  id: string;
  unit: string;
  lastName: string;
  email: string;
  requestedAt: string;
  status: "pending" | "approved" | "declined";
};

export type VerifyOutcome =
  | { outcome: "match"; via: "roster" | "desk" }
  /* "queued" covers both a roster miss and a roster that could not be read.
     The resident sees the same calm message either way; the desk sees why. */
  | { outcome: "queued" };

export type CreateResult = {
  request: HubServiceRequest;
  /** Present only when the request went by email. */
  email?: DeskEmail;
};

type BuildingLinkValue = {
  mode: AdapterMode;
  resources: Resources;
  load: (key: ResourceKey) => void;
  refresh: (key: ResourceKey) => Promise<void>;
  refreshAll: () => Promise<void>;

  verify: (unit: string, lastName: string, email: string) => Promise<VerifyOutcome>;
  verifications: VerificationRequest[];
  approveVerification: (id: string) => void;
  declineVerification: (id: string) => void;

  createRequest: (input: ServiceRequestInput) => Promise<CreateResult>;
  emailFor: (reference: string) => DeskEmail | undefined;

  retrySync: (flow: SyncFlow, itemId?: string) => Promise<void>;
  canSimulateOutage: boolean;
  outage: boolean;
  setOutage: (on: boolean) => void;
};

const empty = <T,>(): ResourceState<T> => ({
  data: null,
  loading: false,
  error: null,
  lastSyncedAt: null,
  source: null,
});

const EMPTY_RESOURCES: Resources = {
  roster: empty(),
  announcements: empty(),
  events: empty(),
  packages: empty(),
  serviceRequests: empty(),
  sync: empty(),
};

/* The calendar window the Hub shows: a little history, three months ahead. */
const EVENT_WINDOW = () => {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setDate(to.getDate() + 90);
  return { from: from.toISOString(), to: to.toISOString() };
};

/* While a request the Hub lodged is still fresh, poll so the receipt's status
   moves. Ten seconds is plenty for a demo and gentle on a real proxy. */
const POLL_MS = 10_000;
const POLL_FOR_MS = 2 * 60_000;

const BuildingLinkContext = createContext<BuildingLinkValue | null>(null);

const latestSync = (items: { provenance?: { syncedAt: string } }[]): string | null =>
  items.reduce<string | null>((latest, item) => {
    const at = item.provenance?.syncedAt;
    return at && (!latest || at > latest) ? at : latest;
  }, null);

export function BuildingLinkProvider({
  children,
  client: injected,
}: {
  children: ReactNode;
  /** Tests pass a client; the app builds one from VITE_BUILDINGLINK_MODE. */
  client?: BuildingLinkClient;
}) {
  const client = useMemo(() => injected ?? createBuildingLinkClient(), [injected]);
  const mock = client instanceof MockBuildingLinkClient ? client : null;

  const [resources, setResources] = useState<Resources>(EMPTY_RESOURCES);
  /* Mirror of the state for callbacks that must stay stable across renders. */
  const resourcesRef = useRef(resources);
  resourcesRef.current = resources;
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [fallbackRequests, setFallbackRequests] = useState<HubServiceRequest[]>([]);
  const [outage, setOutageState] = useState(false);
  const emails = useRef(new Map<string, DeskEmail>());
  const inFlight = useRef(new Map<ResourceKey, Promise<void>>());
  const nextFallbackReference = useRef(createReferenceCounter());

  const patch = useCallback(<K extends ResourceKey>(key: K, next: Partial<Resources[K]>) => {
    setResources((prev) => ({ ...prev, [key]: { ...prev[key], ...next } }));
  }, []);

  /* One fetch per resource per session, deduplicated. On failure the last good
     copy stays on screen and the source flips to "fallback" with a message. */
  const fetchResource = useCallback(
    (key: ResourceKey): Promise<void> => {
      const running = inFlight.current.get(key);
      if (running) return running;
      patch(key, { loading: true });
      const work = (async () => {
        try {
          let data: unknown;
          let syncedAt: string | null = null;
          switch (key) {
            case "roster":
              data = await client.getRoster();
              syncedAt = latestSync(data as Household[]);
              break;
            case "announcements":
              data = await client.listAnnouncements();
              syncedAt = latestSync(data as Announcement[]);
              break;
            case "events":
              data = await client.listEvents(EVENT_WINDOW());
              syncedAt = latestSync(data as CalendarEvent[]);
              break;
            case "packages":
              data = await client.listPackages();
              syncedAt = latestSync(data as Package[]);
              break;
            case "serviceRequests":
              data = await client.listServiceRequests();
              syncedAt = new Date().toISOString();
              break;
            case "sync":
              data = await client.getSyncStatus();
              syncedAt = new Date().toISOString();
              break;
          }
          setResources((prev) => ({
            ...prev,
            [key]: {
              data,
              loading: false,
              error: null,
              lastSyncedAt: syncedAt ?? new Date().toISOString(),
              source: "buildinglink",
            },
          }));
        } catch (error) {
          const message = isUnavailable(error)
            ? error.message
            : "BuildingLink could not be read just now. The last good copy is shown.";
          setResources((prev) => ({
            ...prev,
            [key]: { ...prev[key], loading: false, error: message, source: "fallback" },
          }));
        } finally {
          inFlight.current.delete(key);
        }
      })();
      inFlight.current.set(key, work);
      return work;
    },
    [client, patch],
  );

  const load = useCallback(
    (key: ResourceKey) => {
      const current = resourcesRef.current[key];
      if (current.data !== null || current.loading || current.error) return;
      void fetchResource(key);
    },
    [fetchResource],
  );

  const refresh = useCallback((key: ResourceKey) => fetchResource(key), [fetchResource]);

  const refreshAll = useCallback(async () => {
    const current = resourcesRef.current;
    const keys = (Object.keys(current) as ResourceKey[]).filter(
      (k) => current[k].data !== null || current[k].error,
    );
    const set = new Set<ResourceKey>([...keys, "sync"]);
    await Promise.all([...set].map((k) => fetchResource(k)));
  }, [fetchResource]);

  /* ------------------------------------------------------------ verification */

  const verify = useCallback<BuildingLinkValue["verify"]>(
    async (unit, lastName, email) => {
      const approved = verifications.find(
        (v) =>
          v.status === "approved" &&
          sameUnit(v.unit, unit) &&
          v.lastName.toLowerCase() === lastName.trim().toLowerCase(),
      );
      if (approved) return { outcome: "match", via: "desk" };

      let matched = false;
      try {
        const result = await client.verifyResident(unit, lastName);
        matched = result.outcome === "match";
      } catch {
        matched = false;
      }
      if (matched) return { outcome: "match", via: "roster" };

      const address = email.trim().toLowerCase();
      setVerifications((prev) => {
        const exists = prev.some(
          (v) =>
            v.status === "pending" &&
            sameUnit(v.unit, unit) &&
            v.lastName.toLowerCase() === lastName.trim().toLowerCase() &&
            v.email === address,
        );
        if (exists) return prev;
        return [
          {
            id: `verify-${Date.now()}`,
            unit,
            lastName: lastName.trim(),
            email: address,
            requestedAt: new Date().toISOString(),
            status: "pending",
          },
          ...prev,
        ];
      });
      return { outcome: "queued" };
    },
    [client, verifications],
  );

  const setVerification = (id: string, status: VerificationRequest["status"]) =>
    setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));

  /* -------------------------------------------------------- service requests */

  const createRequest = useCallback<BuildingLinkValue["createRequest"]>(
    async (input) => {
      try {
        const request = await client.createServiceRequest(input);
        void fetchResource("serviceRequests");
        void fetchResource("sync");
        return { request };
      } catch (error) {
        if (!isUnavailable(error)) throw error;
        /* The fallback that works today: same request, same reference shape,
           delivered to the desk by email. The receipt lives here either way. */
        const now = new Date();
        const reference = nextFallbackReference.current(now);
        const request: HubServiceRequest = {
          ...input,
          id: `hub-${reference}`,
          reference,
          source: "hub",
          route: "desk-email",
          status: "Submitted",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        const email = buildDeskEmail(request);
        emails.current.set(reference, email);
        setFallbackRequests((prev) => [request, ...prev]);
        void fetchResource("sync");
        return { request, email };
      }
    },
    [client, fetchResource],
  );

  const emailFor = useCallback((reference: string) => emails.current.get(reference), []);

  /* Poll while a freshly lodged request is still moving. */
  const serviceRequests = resources.serviceRequests;
  useEffect(() => {
    const data = serviceRequests.data;
    if (!data || serviceRequests.source === "fallback") return;
    const now = Date.now();
    const fresh = data.some(
      (r) =>
        r.source === "hub" &&
        (r.status === "Submitted" || r.status === "Received") &&
        now - new Date(r.createdAt).getTime() < POLL_FOR_MS,
    );
    if (!fresh) return;
    const timer = window.setInterval(() => void fetchResource("serviceRequests"), POLL_MS);
    return () => window.clearInterval(timer);
  }, [serviceRequests, fetchResource]);

  /* -------------------------------------------------------------------- sync */

  const retrySync = useCallback<BuildingLinkValue["retrySync"]>(
    async (flow, itemId) => {
      try {
        await client.retrySync(flow, itemId);
      } catch {
        /* The sync record will say what happened. */
      }
      const key: ResourceKey | null =
        flow === "announcements"
          ? "announcements"
          : flow === "events"
            ? "events"
            : flow === "packages"
              ? "packages"
              : flow === "roster"
                ? "roster"
                : flow === "service-requests"
                  ? "serviceRequests"
                  : null;
      await Promise.all([fetchResource("sync"), key ? fetchResource(key) : Promise.resolve()]);
    },
    [client, fetchResource],
  );

  const setOutage = useCallback(
    (on: boolean) => {
      if (!mock) return;
      mock.setOutage(on);
      setOutageState(on);
      void refreshAll();
    },
    [mock, refreshAll],
  );

  /* ------------------------------------------------------------------ value */

  const merged = useMemo<Resources>(() => {
    if (fallbackRequests.length === 0) return resources;
    const live = resources.serviceRequests.data ?? [];
    return {
      ...resources,
      serviceRequests: {
        ...resources.serviceRequests,
        data: [...fallbackRequests, ...live].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      },
    };
  }, [resources, fallbackRequests]);

  const value = useMemo<BuildingLinkValue>(
    () => ({
      mode: client.mode,
      resources: merged,
      load,
      refresh,
      refreshAll,
      verify,
      verifications,
      approveVerification: (id) => setVerification(id, "approved"),
      declineVerification: (id) => setVerification(id, "declined"),
      createRequest,
      emailFor,
      retrySync,
      canSimulateOutage: mock !== null,
      outage,
      setOutage,
    }),
    [
      client.mode,
      merged,
      load,
      refresh,
      refreshAll,
      verify,
      verifications,
      createRequest,
      emailFor,
      retrySync,
      mock,
      outage,
      setOutage,
    ],
  );

  return <BuildingLinkContext.Provider value={value}>{children}</BuildingLinkContext.Provider>;
}

export function useBuildingLink(): BuildingLinkValue {
  const ctx = useContext(BuildingLinkContext);
  if (!ctx) throw new Error("useBuildingLink must be used inside BuildingLinkProvider");
  return ctx;
}
