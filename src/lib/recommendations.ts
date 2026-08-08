/**
 * Rule-based personalisation engine.
 *
 * Every suggestion is derived deterministically from data points the resident
 * has already generated inside the portal — profile interests, amenity
 * bookings, event RSVPs, community memberships, marketplace and forum
 * activity, house-account status and open service requests. The AI layer
 * (see `recommendations.functions.ts`) only rewrites the one-line reason; it
 * never chooses what is recommended.
 */

import { AMENITIES, SEED_EVENTS } from "./intranet-data";
import { SUB_COMMUNITIES, type Listing, type Resident, type Statement } from "./portal-data";

export type RecommendationArea =
  "amenities" | "events" | "community" | "marketplace" | "account" | "services";

export type Recommendation = {
  id: string;
  area: RecommendationArea;
  title: string;
  /** Deterministic explanation. Replaced by AI-polished copy when available. */
  reason: string;
  /** The signals that produced this suggestion, shown for transparency. */
  signals: string[];
  to: string;
  cta: string;
  score: number;
};

export type ActivityEvent = {
  id: number;
  kind: "booking" | "rsvp";
  refId: string;
  label: string;
  at: string;
};

export type RecommendationInput = {
  user: Resident;
  activity: ActivityEvent[];
  joined: string[];
  listings: Listing[];
  topicsAuthored: number;
  statements: Statement[];
  openMaintenance: number;
  parcelsWaiting: number;
  hasAnsweredSurvey: boolean;
};

/** Interest keywords mapped onto the things a resident can actually book. */
const INTEREST_MAP: Record<string, { amenities: string[]; communities: string[] }> = {
  wine: { amenities: ["emerald-lounge", "nantucket-kitchen"], communities: ["wine"] },
  cocktails: { amenities: ["emerald-lounge", "emerald-lounge"], communities: ["wine"] },
  dining: { amenities: ["nantucket-kitchen", "private-dining"], communities: ["wine"] },
  food: { amenities: ["nantucket-kitchen", "private-dining"], communities: ["wine"] },
  cooking: { amenities: ["private-dining"], communities: ["wine"] },
  wellness: { amenities: ["secret-garden-room"], communities: ["wellness"] },
  swimming: { amenities: ["secret-garden-room"], communities: ["wellness"] },
  yoga: { amenities: ["secret-garden-room"], communities: ["wellness"] },
  fitness: { amenities: ["secret-garden-room"], communities: ["wellness"] },
  reading: { amenities: ["residents-lounge"], communities: ["books"] },
  books: { amenities: ["residents-lounge"], communities: ["books"] },
  literature: { amenities: ["residents-lounge"], communities: ["books"] },
  art: { amenities: ["residents-lounge"], communities: ["books"] },
  music: { amenities: ["emerald-lounge"], communities: ["wine"] },
  dogs: { amenities: [], communities: ["dogs"] },
  pets: { amenities: [], communities: ["dogs"] },
  family: { amenities: ["residents-lounge"], communities: ["families"] },
  children: { amenities: ["residents-lounge"], communities: ["families"] },
  travel: { amenities: ["emerald-lounge"], communities: ["wine"] },
  entertaining: { amenities: ["private-dining", "residents-lounge"], communities: ["wine"] },
};

function matchInterest(interest: string) {
  const key = interest.toLowerCase();
  for (const [word, value] of Object.entries(INTEREST_MAP)) {
    if (key.includes(word)) return value;
  }
  return null;
}

function eventKeywords(title: string, detail: string) {
  return `${title} ${detail}`.toLowerCase();
}

export function buildRecommendations(input: RecommendationInput): Recommendation[] {
  const {
    user,
    activity,
    joined,
    listings,
    topicsAuthored,
    statements,
    openMaintenance,
    parcelsWaiting,
    hasAnsweredSurvey,
  } = input;

  const out: Recommendation[] = [];
  const bookedAmenityIds = activity.filter((a) => a.kind === "booking").map((a) => a.refId);
  const rsvpedIds = activity.filter((a) => a.kind === "rsvp").map((a) => a.refId);

  const amenityScore = new Map<string, { score: number; signals: string[] }>();
  const communityScore = new Map<string, { score: number; signals: string[] }>();

  const bump = (
    map: Map<string, { score: number; signals: string[] }>,
    id: string,
    score: number,
    signal: string,
  ) => {
    const prev = map.get(id) ?? { score: 0, signals: [] };
    map.set(id, {
      score: prev.score + score,
      signals: prev.signals.includes(signal) ? prev.signals : [...prev.signals, signal],
    });
  };

  /* --- profile interests ------------------------------------------------ */
  for (const interest of user.interests) {
    const match = matchInterest(interest);
    if (!match) continue;
    for (const a of match.amenities) bump(amenityScore, a, 3, `Interest: ${interest}`);
    for (const c of match.communities) bump(communityScore, c, 3, `Interest: ${interest}`);
  }

  /* --- booking history -------------------------------------------------- */
  for (const id of bookedAmenityIds) {
    bump(amenityScore, id, 2, "You have reserved this before");
    if (id === "emerald-lounge" || id === "nantucket-kitchen")
      bump(communityScore, "wine", 2, "Dining and bar reservations");
    if (id === "secret-garden-room")
      bump(communityScore, "wellness", 2, "Quiet mornings on Floor 21");
    if (id === "residents-lounge")
      bump(communityScore, "books", 1, "Time in the Residents' Lounge");
  }

  /* --- community memberships ------------------------------------------- */
  for (const c of joined) {
    if (c === "wine") {
      bump(amenityScore, "emerald-lounge", 2, "Wine & Spirits Circle member");
      bump(amenityScore, "nantucket-kitchen", 2, "Wine & Spirits Circle member");
    }
    if (c === "wellness") bump(amenityScore, "secret-garden-room", 3, "Wellness & Lap Swim member");
    if (c === "books") bump(amenityScore, "residents-lounge", 2, "Floor 21 Book Club member");
    if (c === "families")
      bump(amenityScore, "residents-lounge", 1, "Families at Trinity Place member");
  }

  /* --- amenity suggestions ---------------------------------------------- */
  for (const amenity of AMENITIES) {
    const entry = amenityScore.get(amenity.id);
    if (!entry || entry.score < 2) continue;
    const seen = bookedAmenityIds.includes(amenity.id);
    out.push({
      id: `amenity-${amenity.id}`,
      area: "amenities",
      title: seen ? `Reserve ${amenity.name} again` : `Try ${amenity.name}`,
      reason: seen
        ? `You have booked ${amenity.name} before and ${entry.signals[0]?.toLowerCase() ?? "it fits your profile"}.`
        : `Matched to your profile — ${entry.signals.join("; ").toLowerCase()}.`,
      signals: entry.signals,
      to: "/amenities",
      cta: "Open reservations",
      score: entry.score + (seen ? 1 : 0),
    });
  }

  /* --- event suggestions ------------------------------------------------ */
  for (const event of SEED_EVENTS) {
    if (rsvpedIds.includes(String(event.id))) continue;
    const text = eventKeywords(event.title, event.detail);
    const signals: string[] = [];
    let score = 0;

    for (const interest of user.interests) {
      if (text.includes(interest.toLowerCase().split(" ")[0] ?? "")) {
        score += 3;
        signals.push(`Interest: ${interest}`);
      }
    }
    if (joined.includes("wine") && /wine|sommelier|tasting|chef/.test(text)) {
      score += 3;
      signals.push("Wine & Spirits Circle member");
    }
    if (joined.includes("wellness") && /wellness|swim|spa|breathwork/.test(text)) {
      score += 3;
      signals.push("Wellness & Lap Swim member");
    }
    if (bookedAmenityIds.some((id) => text.includes(id.replace(/-/g, " ")))) {
      score += 2;
      signals.push("You have booked this venue");
    }
    const spacesLeft = event.capacity - event.attending;
    if (spacesLeft <= 5 && score > 0) {
      score += 1;
      signals.push(`Only ${spacesLeft} places left`);
    }
    if (score < 3) continue;

    out.push({
      id: `event-${event.id}`,
      area: "events",
      title: `RSVP to ${event.title}`,
      reason: `${event.date} at ${event.time} — ${signals.join("; ").toLowerCase()}.`,
      signals,
      to: "/events",
      cta: "See the calendar",
      score,
    });
  }

  /* --- community suggestions -------------------------------------------- */
  for (const community of SUB_COMMUNITIES) {
    if (joined.includes(community.id)) continue;
    const entry = communityScore.get(community.id);
    if (!entry || entry.score < 2) continue;
    out.push({
      id: `community-${community.id}`,
      area: "community",
      title: `Join the ${community.name}`,
      reason: `${community.members} neighbours already belong — ${entry.signals.join("; ").toLowerCase()}.`,
      signals: entry.signals,
      to: "/community",
      cta: "Open the forum",
      score: entry.score,
    });
  }

  /* --- marketplace ------------------------------------------------------ */
  const openRequests = listings.filter(
    (l) => l.kind === "Recommendation wanted" && l.replies.length === 0,
  );
  for (const listing of openRequests.slice(0, 2)) {
    const relevant = user.interests.some((i) =>
      `${listing.title} ${listing.body}`
        .toLowerCase()
        .includes(i.toLowerCase().split(" ")[0] ?? ""),
    );
    const score = relevant ? 5 : 2;
    out.push({
      id: `listing-${listing.id}`,
      area: "marketplace",
      title: `Answer: ${listing.title}`,
      reason: relevant
        ? "A neighbour is asking about something in your stated interests and nobody has replied yet."
        : "A neighbour's request is still unanswered — you may know someone.",
      signals: relevant ? ["Matches your interests", "No replies yet"] : ["No replies yet"],
      to: "/marketplace",
      cta: "Open the marketplace",
      score,
    });
  }

  if (topicsAuthored === 0 && joined.length > 0) {
    out.push({
      id: "community-first-post",
      area: "community",
      title: "Start your first forum topic",
      reason: `You belong to ${joined.length} ${joined.length === 1 ? "circle" : "circles"} but have not posted yet.`,
      signals: ["Member with no posts"],
      to: "/community",
      cta: "Open the forum",
      score: 3,
    });
  }

  /* --- house account & services ----------------------------------------- */
  const due = statements.find((s) => s.status === "Due");
  if (due) {
    out.push({
      id: `statement-${due.id}`,
      area: "account",
      title: `Settle your ${due.period} statement`,
      reason: `$${due.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} is due by ${due.due}.`,
      signals: ["Outstanding balance"],
      to: "/account",
      cta: "Open house account",
      score: 9,
    });
  }
  if (parcelsWaiting > 0) {
    out.push({
      id: "parcels-waiting",
      area: "services",
      title: `${parcelsWaiting} ${parcelsWaiting === 1 ? "parcel is" : "parcels are"} held at the concierge desk`,
      reason: "Request delivery to your residence at a time that suits you.",
      signals: ["Parcels awaiting collection"],
      to: "/services",
      cta: "Open services",
      score: 8,
    });
  }
  if (openMaintenance > 0) {
    out.push({
      id: "maintenance-open",
      area: "services",
      title: `Track your ${openMaintenance === 1 ? "open maintenance request" : "open maintenance requests"}`,
      reason: "Engineering has work in progress on your residence.",
      signals: ["Open maintenance ticket"],
      to: "/services",
      cta: "View requests",
      score: 6,
    });
  }
  if (!hasAnsweredSurvey) {
    out.push({
      id: "survey",
      area: "account",
      title: "Complete this month's satisfaction survey",
      reason: "Four questions; management reads every response before the board meeting.",
      signals: ["Survey not yet answered"],
      to: "/management",
      cta: "Answer the survey",
      score: 4,
    });
  }
  if (!user.visibleInDirectory) {
    out.push({
      id: "profile-visibility",
      area: "community",
      title: "Consider appearing in the residents directory",
      reason: "Your profile is hidden, so neighbours in your circles cannot reach you.",
      signals: ["Directory visibility off"],
      to: "/directory",
      cta: "Review your profile",
      score: 3,
    });
  }

  return out.sort((a, b) => b.score - a.score);
}
