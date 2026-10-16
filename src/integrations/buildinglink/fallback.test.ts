import { describe, expect, it } from "vitest";
import {
  REFERENCE_PATTERN,
  buildDeskEmail,
  createReferenceCounter,
  makeReference,
  toDeskPostPayload,
  DESK_EMAIL,
} from "./fallback";
import type { HubServiceRequest } from "./types";

describe("reference numbers", () => {
  it("follow RRH-YYYYMMDD-NNN", () => {
    const ref = makeReference(new Date(2026, 9, 16, 13, 0), 7);
    expect(ref).toBe("RRH-20261016-007");
    expect(ref).toMatch(REFERENCE_PATTERN);
  });

  it("count up within a day and restart on the next", () => {
    const next = createReferenceCounter();
    const day1 = new Date(2026, 9, 16, 9, 0);
    const day2 = new Date(2026, 9, 17, 9, 0);
    expect(next(day1)).toBe("RRH-20261016-001");
    expect(next(day1)).toBe("RRH-20261016-002");
    expect(next(day2)).toBe("RRH-20261017-001");
  });

  it("clamp the sequence to three digits", () => {
    expect(makeReference(new Date(2026, 0, 1), 1200)).toBe("RRH-20260101-999");
    expect(makeReference(new Date(2026, 0, 1), 0)).toBe("RRH-20260101-001");
  });
});

const request: HubServiceRequest = {
  id: "hub-RRH-20261016-001",
  reference: "RRH-20261016-001",
  source: "hub",
  route: "desk-email",
  status: "Submitted",
  unit: "Residence 22H",
  category: "Engineering",
  detail: "Terrace door closer catching.",
  priority: "Standard",
  permissionToEnter: true,
  createdAt: "2026-10-16T13:00:00.000Z",
  updatedAt: "2026-10-16T13:00:00.000Z",
};

describe("desk email fallback", () => {
  it("addresses the desk with the reference in the subject and body", () => {
    const email = buildDeskEmail(request);
    expect(email.to).toBe(DESK_EMAIL);
    expect(email.subject).toContain("RRH-20261016-001");
    expect(email.body).toContain("Reference: RRH-20261016-001");
    expect(email.body).toContain("Permission to enter: yes");
    expect(email.body).toContain("Terrace door closer catching.");
    expect(email.mailto.startsWith(`mailto:${DESK_EMAIL}?subject=`)).toBe(true);
  });

  it("never carries a credential, only the request", () => {
    const payload = toDeskPostPayload(request);
    expect(Object.keys(payload).sort()).toEqual(
      [
        "category",
        "detail",
        "permissionToEnter",
        "priority",
        "reference",
        "submittedAt",
        "unit",
      ].sort(),
    );
  });
});
