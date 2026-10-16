import type { HubServiceRequest, ServiceRequest, ServiceRequestInput } from "./types";

/* The fallback that works today.
 *
 * Until BuildingLink grants the building's access request, a service request
 * lodged in the Hub still has to reach the desk. This module turns one into an
 * email the desk already knows how to read, under a reference number the
 * resident keeps either way. In the demo the email is a mailto link; the stub
 * POST shape below is what a small backend mailer would accept later. */

/** Fictional desk address in the same invented domain the demo already uses. */
export const DESK_EMAIL = "desk@residences.raffles-boston.test";

/* ------------------------------------------------------------- references */

const pad = (n: number, width: number) => String(n).padStart(width, "0");

export function referenceDatePart(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;
}

/** RRH-YYYYMMDD-NNN. The sequence restarts each day and is three digits wide. */
export function makeReference(date: Date, sequence: number): string {
  const n = Math.max(1, Math.min(999, Math.floor(sequence)));
  return `RRH-${referenceDatePart(date)}-${pad(n, 3)}`;
}

export const REFERENCE_PATTERN = /^RRH-\d{8}-\d{3}$/;

/** Hands out the next reference for a day. One per client instance, in memory. */
export function createReferenceCounter() {
  let day = "";
  let next = 1;
  return (date: Date = new Date()): string => {
    const part = referenceDatePart(date);
    if (part !== day) {
      day = part;
      next = 1;
    }
    return makeReference(date, next++);
  };
}

/* ------------------------------------------------------------- desk email */

export type DeskEmail = {
  to: string;
  subject: string;
  body: string;
  /** mailto: link, used by the demo. */
  mailto: string;
};

export function buildDeskEmail(request: Pick<ServiceRequest, "reference"> & ServiceRequestInput) {
  const lines = [
    `Reference: ${request.reference}`,
    `Residence: ${request.unit}`,
    `Category: ${request.category}`,
    `Priority: ${request.priority}`,
    ...(request.permissionToEnter !== undefined
      ? [`Permission to enter: ${request.permissionToEnter ? "yes" : "no"}`]
      : []),
    ...(request.contact ? [`Contact: ${request.contact}`] : []),
    "",
    request.detail,
    "",
    "Lodged through the Raffles Residence Hub. BuildingLink access is pending, so this request arrives by email.",
  ];
  const subject = `[${request.reference}] ${request.category} · ${request.unit}`;
  const body = lines.join("\n");
  const email: DeskEmail = {
    to: DESK_EMAIL,
    subject,
    body,
    mailto: `mailto:${DESK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
  return email;
}

/* --------------------------------------------------------- future mailer */

/** The payload a backend mailer would accept. Nothing posts it yet.
 *  TODO(buildinglink): point the http client at POST /api/desk/requests once a
 *  mailer exists, and keep the mailto path as the last resort. */
export type DeskPostPayload = {
  reference: string;
  unit: string;
  category: string;
  detail: string;
  priority: ServiceRequestInput["priority"];
  permissionToEnter?: boolean;
  contact?: string;
  submittedAt: string;
};

export function toDeskPostPayload(request: HubServiceRequest): DeskPostPayload {
  return {
    reference: request.reference,
    unit: request.unit,
    category: request.category,
    detail: request.detail,
    priority: request.priority,
    ...(request.permissionToEnter !== undefined
      ? { permissionToEnter: request.permissionToEnter }
      : {}),
    ...(request.contact ? { contact: request.contact } : {}),
    submittedAt: request.createdAt,
  };
}
