import listingImg from "@/assets/residence-listing.jpg";

export type SaleStatus = "For sale" | "Pending" | "Under agreement" | "Recently sold";

export type SaleListing = {
  id: string;
  unit: string;
  status: SaleStatus;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  closedPrice?: number;
  exposure: string;
  note: string;
  listed: string;
  image: string;
};

export type LeaseListing = {
  id: string;
  unit: string;
  status: "Available" | "Application pending" | "Leased";
  beds: number;
  baths: number;
  sqft: number;
  monthly: number;
  term: string;
  furnished: string;
  available: string;
  image: string;
};

export type ParkingListing = {
  id: string;
  space: string;
  level: string;
  kind: "Sale" | "Lease";
  status: "Available" | "Pending" | "Sold" | "Leased";
  price: number;
  note: string;
};

export const SALE_LISTINGS: SaleListing[] = [
  {
    id: "s-2903",
    unit: "Residence 29C",
    status: "For sale",
    beds: 3,
    baths: 3.5,
    sqft: 2480,
    price: 7950000,
    exposure: "South-west · Charles River and Back Bay",
    note: "Corner residence with private elevator landing and two parking spaces included.",
    listed: "Listed 18 days ago",
    image: listingImg,
  },
  {
    id: "s-2211",
    unit: "Residence 22B",
    status: "For sale",
    beds: 2,
    baths: 2.5,
    sqft: 1735,
    price: 4650000,
    exposure: "North · Trinity Church and the Hancock",
    note: "Delivered furnished by the developer's design team.",
    listed: "Listed 6 weeks ago",
    image: listingImg,
  },
  {
    id: "s-3301",
    unit: "Residence 33A",
    status: "Pending",
    beds: 4,
    baths: 4.5,
    sqft: 3410,
    price: 12250000,
    exposure: "East · Harbour and skyline",
    note: "Offer accepted; inspection period closes this month.",
    listed: "Listed 4 months ago",
    image: listingImg,
  },
  {
    id: "s-1907",
    unit: "Residence 19G",
    status: "Under agreement",
    beds: 2,
    baths: 2,
    sqft: 1480,
    price: 3495000,
    exposure: "West · Copley Square",
    note: "Under agreement, closing scheduled for next quarter.",
    listed: "Listed 2 months ago",
    image: listingImg,
  },
  {
    id: "s-2604",
    unit: "Residence 26D",
    status: "Recently sold",
    beds: 3,
    baths: 3,
    sqft: 2205,
    price: 6750000,
    closedPrice: 6600000,
    exposure: "South · Back Bay rooftops",
    note: "Closed at 97.8% of asking after 51 days.",
    listed: "Sold last month",
    image: listingImg,
  },
  {
    id: "s-3102",
    unit: "Residence 31B",
    status: "Recently sold",
    beds: 3,
    baths: 3.5,
    sqft: 2560,
    price: 8250000,
    closedPrice: 8400000,
    exposure: "South-east · Harbour",
    note: "Two offers; closed above asking in 19 days.",
    listed: "Sold ten weeks ago",
    image: listingImg,
  },
];

export const LEASE_LISTINGS: LeaseListing[] = [
  {
    id: "l-2405",
    unit: "Residence 24E",
    status: "Available",
    beds: 2,
    baths: 2,
    sqft: 1520,
    monthly: 14500,
    term: "12 months minimum",
    furnished: "Fully furnished",
    available: "Available immediately",
    image: listingImg,
  },
  {
    id: "l-2008",
    unit: "Residence 20H",
    status: "Available",
    beds: 1,
    baths: 1.5,
    sqft: 1080,
    monthly: 9800,
    term: "12 months minimum",
    furnished: "Unfurnished",
    available: "Available next month",
    image: listingImg,
  },
  {
    id: "l-2801",
    unit: "Residence 28A",
    status: "Application pending",
    beds: 3,
    baths: 3.5,
    sqft: 2390,
    monthly: 24000,
    term: "24 months",
    furnished: "Fully furnished",
    available: "Application under board review",
    image: listingImg,
  },
  {
    id: "l-1703",
    unit: "Residence 17C",
    status: "Leased",
    beds: 2,
    baths: 2.5,
    sqft: 1690,
    monthly: 16250,
    term: "12 months",
    furnished: "Furnished",
    available: "Leased last month",
    image: listingImg,
  },
];

export const PARKING_LISTINGS: ParkingListing[] = [
  {
    id: "p-b2-14",
    space: "Space B2-14",
    level: "Level B2 · Valet-attended",
    kind: "Sale",
    status: "Available",
    price: 250000,
    note: "Deeded space, transferable with or without a residence.",
  },
  {
    id: "p-b1-06",
    space: "Space B1-06",
    level: "Level B1 · Self-park, EV charger",
    kind: "Sale",
    status: "Pending",
    price: 285000,
    note: "Purchase and sale signed; closing with Residence 33A.",
  },
  {
    id: "p-b2-21",
    space: "Space B2-21",
    level: "Level B2 · Valet-attended",
    kind: "Sale",
    status: "Sold",
    price: 240000,
    note: "Closed last quarter.",
  },
  {
    id: "p-b1-18",
    space: "Space B1-18",
    level: "Level B1 · Self-park, EV charger",
    kind: "Lease",
    status: "Available",
    price: 750,
    note: "Monthly licence, month-to-month after the first year.",
  },
  {
    id: "p-b2-09",
    space: "Space B2-09",
    level: "Level B2 · Valet-attended",
    kind: "Lease",
    status: "Leased",
    price: 695,
    note: "Licensed to a resident through next spring.",
  },
];

/** Illustrative building-level market facts shown on the owner's dashboard. */
export const BUILDING_MARKET_FACTS = {
  medianPricePerSqft: 3120,
  yearOverYear: 4.8,
  daysOnMarket: 46,
  askingToClose: 98.4,
  activeListings: SALE_LISTINGS.filter((l) => l.status === "For sale").length,
  soldTrailingYear: 11,
  leaseOccupancy: 93,
  medianLease: 15400,
} as const;

/** Deterministic per-unit figures so a residence sees the same numbers each visit. */
export function unitMarketSnapshot(unit: string) {
  const seed = [...unit].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const sqft = 1400 + (seed % 12) * 120;
  const purchase = Math.round((sqft * (2450 + (seed % 7) * 40)) / 1000) * 1000;
  const estimate = Math.round((sqft * BUILDING_MARKET_FACTS.medianPricePerSqft) / 1000) * 1000;
  const rentEstimate = Math.round((sqft * 7.4) / 50) * 50;
  return {
    sqft,
    purchase,
    estimate,
    gain: estimate - purchase,
    gainPct: Number((((estimate - purchase) / purchase) * 100).toFixed(1)),
    rentEstimate,
    grossYield: Number((((rentEstimate * 12) / estimate) * 100).toFixed(2)),
  };
}
