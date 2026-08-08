/**
 * Simulated Accor-style PMS / POS bridge.
 *
 * There is no live property-management credential in this demo, so this module
 * stands in for the real integration while keeping the shape of a production
 * adapter: a TTL response cache in front of each outlet and a fault-tolerant
 * circuit breaker that trips after repeated upstream faults and recovers
 * through a half-open probe.
 */

import {
  OUTLETS,
  type BreakerSnapshot,
  type BreakerState,
  type FolioCharge,
  type FolioSnapshot,
  type InResidenceDelivery,
  type Outlet,
  type OutletId,
  type PriorityReservation,
} from "@/lib/pms-types";

/* ------------------------------------------------------------------ *
 * Circuit breaker
 * ------------------------------------------------------------------ */

const FAILURE_THRESHOLD = 3;
const OPEN_MS = 15_000;

type BreakerRecord = { failures: number; openedAt: number | null };

const breakers = new Map<string, BreakerRecord>();

function record(key: string): BreakerRecord {
  let entry = breakers.get(key);
  if (!entry) {
    entry = { failures: 0, openedAt: null };
    breakers.set(key, entry);
  }
  return entry;
}

function stateOf(entry: BreakerRecord): BreakerState {
  if (entry.openedAt === null) return "closed";
  return Date.now() - entry.openedAt >= OPEN_MS ? "half-open" : "open";
}

export function breakerSnapshot(key: string): BreakerSnapshot {
  const entry = record(key);
  const state = stateOf(entry);
  const retryInSeconds =
    state === "open" && entry.openedAt !== null
      ? Math.max(0, Math.ceil((OPEN_MS - (Date.now() - entry.openedAt)) / 1000))
      : 0;
  return {
    state,
    failures: entry.failures,
    openedAt: entry.openedAt === null ? null : new Date(entry.openedAt).toISOString(),
    retryInSeconds,
  };
}

export class BridgeUnavailableError extends Error {
  constructor(public readonly snapshot: BreakerSnapshot) {
    super("The hotel bridge is temporarily unavailable. The desk has been notified.");
    this.name = "BridgeUnavailableError";
  }
}

/** Runs `work` behind the breaker for `key`, tripping it after repeated faults. */
export async function withBreaker<T>(key: string, work: () => Promise<T>): Promise<T> {
  const entry = record(key);
  const state = stateOf(entry);
  if (state === "open") throw new BridgeUnavailableError(breakerSnapshot(key));

  try {
    const result = await work();
    entry.failures = 0;
    entry.openedAt = null;
    return result;
  } catch (error) {
    entry.failures += 1;
    if (entry.failures >= FAILURE_THRESHOLD) entry.openedAt = Date.now();
    if (error instanceof BridgeUnavailableError) throw error;
    throw new BridgeUnavailableError(breakerSnapshot(key));
  }
}

/* ------------------------------------------------------------------ *
 * TTL cache
 * ------------------------------------------------------------------ */

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: unknown; expiresAt: number }>();

export function readCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

export function writeCache(key: string, value: unknown) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidateCache(prefix: string) {
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

/* ------------------------------------------------------------------ *
 * Simulated upstream
 * ------------------------------------------------------------------ */

function outlet(id: OutletId): Outlet {
  return OUTLETS.find((o) => o.id === id) ?? OUTLETS[0]!;
}

/** Deterministic pseudo-random so a given unit always sees the same folio. */
function seedFrom(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return () => {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    return hash / 0xffffffff;
  };
}

const DESCRIPTIONS: Record<OutletId, string[]> = {
  "la-padrona": ["Dinner for two", "Chef's counter tasting", "Wine pairing supplement"],
  "emerald-lounge": ["Private reception bar", "Canapé service", "Champagne on host account"],
  "blind-duck": ["Signature cocktails", "Barrel-aged flight", "Late sitting"],
  "cafe-pastel": ["Morning pastries", "Coffee service to residence", "Celebration cake"],
};

async function upstreamFolio(unit: string): Promise<Omit<FolioSnapshot, "cached" | "breaker">> {
  // Stand-in for the PMS round trip.
  await new Promise((resolve) => setTimeout(resolve, 120));

  const next = seedFrom(unit.toLowerCase());
  const charges: FolioCharge[] = OUTLETS.flatMap((o, index) => {
    const count = 1 + Math.floor(next() * 2);
    return Array.from({ length: count }, (_, n) => {
      const day = 1 + Math.floor(next() * 27);
      const list = DESCRIPTIONS[o.id];
      return {
        id: `${o.id}-${index}-${n}`,
        outletId: o.id,
        outletName: o.name,
        description: list[Math.floor(next() * list.length)] ?? list[0]!,
        postedAt: `2026-08-${String(day).padStart(2, "0")}`,
        amount: Math.round((45 + next() * 420) * 100) / 100,
      };
    });
  }).sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const subtotal = Math.round(charges.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
  const serviceCharge = Math.round(subtotal * 0.2 * 100) / 100;

  return {
    unit,
    currency: "USD",
    charges,
    subtotal,
    serviceCharge,
    total: Math.round((subtotal + serviceCharge) * 100) / 100,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchFolio(unit: string, forceFault: boolean): Promise<FolioSnapshot> {
  const key = `folio:${unit.toLowerCase()}`;
  const cached = readCache<Omit<FolioSnapshot, "cached" | "breaker">>(key);
  if (cached && !forceFault) {
    return { ...cached, cached: true, breaker: breakerSnapshot("pms") };
  }

  const fresh = await withBreaker("pms", async () => {
    if (forceFault) throw new Error("Simulated PMS timeout");
    return upstreamFolio(unit);
  });

  writeCache(key, fresh);
  return { ...fresh, cached: false, breaker: breakerSnapshot("pms") };
}

function reference(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function bookPriority(input: {
  outletId: OutletId;
  date: string;
  time: string;
  party: number;
}): Promise<PriorityReservation> {
  const o = outlet(input.outletId);
  return withBreaker(`pos:${o.id}`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    // Residents hold a priority allocation; very large parties fall to a waitlist.
    const confirmed = input.party <= 8;
    return {
      reference: reference("RES"),
      outletId: o.id,
      outletName: o.name,
      date: input.date,
      time: input.time,
      party: input.party,
      status: confirmed ? "Confirmed" : "Waitlisted",
      note: confirmed
        ? `Held against the residents' priority allocation at ${o.name}. Charges route to your house account.`
        : `Parties above eight are passed to the ${o.name} maître d' for a private arrangement.`,
    } satisfies PriorityReservation;
  });
}

export async function orderInResidence(input: {
  outletId: OutletId;
  unit: string;
  items: string;
}): Promise<InResidenceDelivery> {
  const o = outlet(input.outletId);
  if (!o.supportsInResidence) {
    throw new Error(`${o.name} does not deliver to residences.`);
  }
  return withBreaker(`pos:${o.id}`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    invalidateCache(`folio:${input.unit.toLowerCase()}`);
    return {
      reference: reference("IRD"),
      outletId: o.id,
      outletName: o.name,
      unit: input.unit,
      items: input.items,
      etaMinutes: o.kind === "Patisserie" ? 20 : 40,
      chargedToFolio: true,
    } satisfies InResidenceDelivery;
  });
}
