import { useCallback, useEffect, useMemo } from "react";
import { sameUnit } from "@/lib/units";
import { useBuildingLink, type DataSource, type ResourceKey } from "./provider";
import type {
  Announcement,
  CalendarEvent,
  Household,
  Package,
  ServiceRequest,
  ServiceRequestFilter,
  SyncRecord,
} from "./types";

/* Hooks over the adapter. Every one returns data, loading, error, lastSyncedAt,
 * and source, plus a manual refresh. The first component to need a resource
 * triggers its single fetch for the session; later components reuse it. */

export type HookState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  source: DataSource | null;
  refresh: () => Promise<void>;
};

function useResource<K extends ResourceKey>(key: K) {
  const { resources, load, refresh } = useBuildingLink();
  useEffect(() => load(key), [load, key]);
  const state = resources[key];
  const refreshThis = useCallback(() => refresh(key), [refresh, key]);
  return { state, refresh: refreshThis };
}

const EMPTY: never[] = [];

/* ----------------------------------------------------------- announcements */

export function useAnnouncements(): HookState<Announcement[]> {
  const { state, refresh } = useResource("announcements");
  return {
    data: state.data ?? EMPTY,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
  };
}

/* ------------------------------------------------------------------ events */

export function useEvents(): HookState<CalendarEvent[]> {
  const { state, refresh } = useResource("events");
  return {
    data: state.data ?? EMPTY,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
  };
}

/* ---------------------------------------------------------------- packages */

/** All packages, or one residence's when a unit is given. */
export function usePackages(unit?: string | null): HookState<Package[]> {
  const { state, refresh } = useResource("packages");
  const data = useMemo(() => {
    const all = state.data ?? EMPTY;
    return unit ? all.filter((p) => sameUnit(p.unit, unit)) : all;
  }, [state.data, unit]);
  return {
    data,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
  };
}

/* -------------------------------------------------------- service requests */

export function useServiceRequests(filter: ServiceRequestFilter = {}) {
  const { state, refresh } = useResource("serviceRequests");
  const { createRequest, emailFor, mode } = useBuildingLink();
  const { unit, open, source } = filter;
  const data = useMemo(() => {
    const all = state.data ?? EMPTY;
    return all
      .filter((r) => (unit ? sameUnit(r.unit, unit) : true))
      .filter((r) =>
        open
          ? r.status === "Submitted" || r.status === "Received" || r.status === "In progress"
          : true,
      )
      .filter((r) => (source ? r.source === source : true));
  }, [state.data, unit, open, source]);
  const byReference = useCallback(
    (reference: string): ServiceRequest | undefined => data.find((r) => r.reference === reference),
    [data],
  );
  return {
    data,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
    create: createRequest,
    emailFor,
    byReference,
    mode,
  };
}

/* --------------------------------------------------------- roster, sign-up */

/** Sign-up verification. Does not download the roster: the match happens in
 *  the adapter (server-side once the proxy exists), and a miss goes to the
 *  desk's queue. */
export function useRosterVerification() {
  const { verify, verifications, approveVerification, declineVerification, resources, refresh } =
    useBuildingLink();
  const state = resources.roster;
  const refreshRoster = useCallback(() => refresh("roster"), [refresh]);
  return {
    verify,
    pending: verifications.filter((v) => v.status === "pending"),
    all: verifications,
    approve: approveVerification,
    decline: declineVerification,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh: refreshRoster,
  };
}

/** The roster itself, for the personnel dashboard only. */
export function useRoster(): HookState<Household[]> {
  const { state, refresh } = useResource("roster");
  return {
    data: state.data ?? EMPTY,
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
  };
}

/* -------------------------------------------------------------------- sync */

export function useSyncStatus() {
  const { state, refresh } = useResource("sync");
  const { retrySync, mode, canSimulateOutage, outage, setOutage, refreshAll } = useBuildingLink();
  return {
    data: (state.data ?? EMPTY) as SyncRecord[],
    loading: state.loading,
    error: state.error,
    lastSyncedAt: state.lastSyncedAt,
    source: state.source,
    refresh,
    refreshAll,
    retry: retrySync,
    mode,
    canSimulateOutage,
    outage,
    setOutage,
  };
}
