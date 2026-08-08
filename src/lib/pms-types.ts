/** Client-safe types and metadata for the hotel PMS / POS bridge. */

export type OutletId = "la-padrona" | "emerald-lounge" | "blind-duck" | "cafe-pastel";

export type Outlet = {
  id: OutletId;
  name: string;
  kind: "Restaurant" | "Lounge" | "Bar" | "Patisserie";
  location: string;
  posTerminal: string;
  supportsInResidence: boolean;
  serviceWindow: string;
};

export const OUTLETS: Outlet[] = [
  {
    id: "la-padrona",
    name: "La Padrona",
    kind: "Restaurant",
    location: "38 Trinity Place",
    posTerminal: "POS-LP-01",
    supportsInResidence: true,
    serviceWindow: "17:00 – 22:00 (23:00 Fri–Sat)",
  },
  {
    id: "emerald-lounge",
    name: "Emerald Lounge",
    kind: "Lounge",
    location: "Formerly Amar · Residences level",
    posTerminal: "POS-EL-04",
    supportsInResidence: true,
    serviceWindow: "12:00 – 23:30 by arrangement",
  },
  {
    id: "blind-duck",
    name: "Blind Duck",
    kind: "Bar",
    location: "Floors 17 & 18",
    posTerminal: "POS-BD-02",
    supportsInResidence: false,
    serviceWindow: "17:00 – 01:00 (02:00 Fri–Sat)",
  },
  {
    id: "cafe-pastel",
    name: "Café Pastel",
    kind: "Patisserie",
    location: "Ground floor · Trinity Place",
    posTerminal: "POS-CP-03",
    supportsInResidence: true,
    serviceWindow: "07:00 – 18:00 daily",
  },
];

export type FolioCharge = {
  id: string;
  outletId: OutletId;
  outletName: string;
  description: string;
  postedAt: string;
  amount: number;
};

export type BreakerState = "closed" | "open" | "half-open";

export type BreakerSnapshot = {
  state: BreakerState;
  failures: number;
  openedAt: string | null;
  retryInSeconds: number;
};

export type FolioSnapshot = {
  unit: string;
  currency: "USD";
  charges: FolioCharge[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  /** True when served from the bridge's in-memory cache rather than the PMS. */
  cached: boolean;
  fetchedAt: string;
  breaker: BreakerSnapshot;
};

export type PriorityReservation = {
  reference: string;
  outletId: OutletId;
  outletName: string;
  date: string;
  time: string;
  party: number;
  status: "Confirmed" | "Waitlisted";
  note: string;
};

export type InResidenceDelivery = {
  reference: string;
  outletId: OutletId;
  outletName: string;
  unit: string;
  items: string;
  etaMinutes: number;
  chargedToFolio: boolean;
};

export const OUTLET_IDS = OUTLETS.map((o) => o.id);

export function isOutletId(value: unknown): value is OutletId {
  return typeof value === "string" && OUTLET_IDS.includes(value as OutletId);
}
