import { describe, expect, it } from "vitest";
import { BuildingLinkUnavailableError } from "../client";
import { REFERENCE_PATTERN } from "../fallback";
import { MockBuildingLinkClient } from "./client";
import { FAILED_MIRROR_ANNOUNCEMENT_ID, lastDailyRun } from "./fixtures";

/* A fixed clock so every assertion below is about the data, not the time of day. */
const NOW = new Date(2026, 9, 16, 13, 15, 0);
const make = (now: Date = NOW) => new MockBuildingLinkClient({ now: () => now, latency: false });

describe("determinism", () => {
  it("gives two clients the same roster, notices, calendar, and packages", async () => {
    const a = make();
    const b = make();
    expect(await a.getRoster()).toEqual(await b.getRoster());
    expect(await a.listAnnouncements()).toEqual(await b.listAnnouncements());
    expect(await a.listPackages()).toEqual(await b.listPackages());
    const range = { from: NOW.toISOString(), to: new Date(2026, 10, 16).toISOString() };
    expect(await a.listEvents(range)).toEqual(await b.listEvents(range));
    expect(await a.getSyncStatus()).toEqual(await b.getSyncStatus());
  });

  it("stamps every BuildingLink item with provenance and the last daily run", async () => {
    const client = make();
    const syncedAt = lastDailyRun(NOW).toISOString();
    for (const household of await client.getRoster()) {
      expect(household.provenance).toEqual({
        source: "buildinglink",
        label: "On the building roster",
        syncedAt,
      });
    }
    for (const notice of await client.listAnnouncements()) {
      expect(notice.provenance.label).toBe("Posted via BuildingLink");
      expect(notice.provenance.syncedAt).toBe(syncedAt);
    }
    for (const pkg of await client.listPackages()) {
      expect(pkg.provenance.label).toBe("Logged by the desk");
      expect(pkg.provenance.syncedAt).toBe(pkg.loggedAt);
    }
  });

  it("reuses the demo's fictional residents and invents no new units", async () => {
    const { RESIDENTS } = await import("@/lib/portal-data");
    const units = (await make().getRoster()).map((h) => h.unit).sort();
    expect(units).toEqual(RESIDENTS.map((r) => r.unit).sort());
  });
});

describe("roster verification", () => {
  it("matches a surname and unit regardless of case, prefix, or full name", async () => {
    const client = make();
    expect((await client.verifyResident("34b", "VANCE")).outcome).toBe("match");
    expect((await client.verifyResident("Residence 34B", "Eleanor Vance")).outcome).toBe("match");
    expect((await client.verifyResident("unit 41C", "Whitfield")).outcome).toBe("match");
  });

  it("misses without a reason when the unit or surname is wrong or empty", async () => {
    const client = make();
    expect(await client.verifyResident("34B", "Chen")).toEqual({ outcome: "miss" });
    expect(await client.verifyResident("99Z", "Vance")).toEqual({ outcome: "miss" });
    expect(await client.verifyResident("", "Vance")).toEqual({ outcome: "miss" });
    expect(await client.verifyResident("34B", "  ")).toEqual({ outcome: "miss" });
  });
});

describe("service requests", () => {
  const input = {
    unit: "Residence 22H",
    category: "Engineering",
    detail: "Terrace door closer catching.",
    priority: "Standard" as const,
  };

  it("returns a Hub reference in the RRH format and routes to BuildingLink", async () => {
    const client = make();
    const first = await client.createServiceRequest(input);
    const second = await client.createServiceRequest(input);
    expect(first.reference).toBe("RRH-20261016-001");
    expect(second.reference).toBe("RRH-20261016-002");
    expect(first.reference).toMatch(REFERENCE_PATTERN);
    expect(first.route).toBe("buildinglink");
    expect(first.source).toBe("hub");
    expect(first.status).toBe("Submitted");
    expect(first.externalId).toBeUndefined();
  });

  it("advances a lodged request on the clock and never completes it alone", async () => {
    let now = NOW;
    const client = new MockBuildingLinkClient({ now: () => now, latency: false });
    const created = await client.createServiceRequest(input);
    now = new Date(NOW.getTime() + 20_000);
    expect((await client.getServiceRequest(created.id))?.status).toBe("Received");
    now = new Date(NOW.getTime() + 60_000);
    expect((await client.getServiceRequest(created.reference))?.status).toBe("In progress");
    now = new Date(NOW.getTime() + 60 * 60_000);
    expect((await client.getServiceRequest(created.id))?.status).toBe("In progress");
  });

  it("lists desk-logged requests beside Hub ones, labelled by source", async () => {
    const client = make();
    await client.createServiceRequest(input);
    const all = await client.listServiceRequests();
    expect(all.map((r) => r.source)).toEqual(["hub", "buildinglink", "buildinglink"]);
    expect(
      all.filter((r) => r.source === "buildinglink").every((r) => r.reference === undefined),
    ).toBe(true);
    expect(await client.listServiceRequests({ unit: "22h" })).toHaveLength(1);
    expect(await client.listServiceRequests({ open: true, source: "buildinglink" })).toHaveLength(
      2,
    );
  });
});

describe("sync status", () => {
  it("reports one record per flow with believable timestamps", async () => {
    const records = await make().getSyncStatus();
    expect(records.map((r) => r.flow)).toEqual([
      "roster",
      "announcements",
      "events",
      "packages",
      "service-requests",
    ]);
    const roster = records[0]!;
    expect(roster.lastRunAt).toBe(lastDailyRun(NOW).toISOString());
    expect(new Date(roster.nextRunAt!).getTime() - new Date(roster.lastRunAt!).getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
    expect(records[4]!.lastRunAt).toBeNull();
    expect(records[4]!.message).toContain("No requests written yet");
  });

  it("shows one simulated mirror failure, hides the notice, and clears it on retry", async () => {
    const client = make();
    const before = await client.getSyncStatus();
    const mirror = before.find((r) => r.flow === "announcements")!;
    expect(mirror.status).toBe("partial");
    expect(mirror.failures?.map((f) => f.itemId)).toEqual([FAILED_MIRROR_ANNOUNCEMENT_ID]);
    expect(mirror.fallback).toBeTruthy();
    expect((await client.listAnnouncements()).map((a) => a.id)).not.toContain(
      FAILED_MIRROR_ANNOUNCEMENT_ID,
    );

    const after = await client.retrySync("announcements", FAILED_MIRROR_ANNOUNCEMENT_ID);
    expect(after.status).toBe("ok");
    expect(after.failures).toBeUndefined();
    expect((await client.listAnnouncements()).map((a) => a.id)).toContain(
      FAILED_MIRROR_ANNOUNCEMENT_ID,
    );
  });
});

describe("outage", () => {
  it("fails reads and writes with a plain message but keeps sync status readable", async () => {
    const client = make();
    client.setOutage(true);
    await expect(client.getRoster()).rejects.toBeInstanceOf(BuildingLinkUnavailableError);
    await expect(
      client.createServiceRequest({
        unit: "22H",
        category: "Other",
        detail: "x",
        priority: "Standard",
      }),
    ).rejects.toThrow(/not answering/);
    const records = await client.getSyncStatus();
    expect(records.every((r) => r.status === "failed")).toBe(true);
    expect(records.find((r) => r.flow === "service-requests")?.fallback).toMatch(/emailed/);
    client.setOutage(false);
    expect((await client.getRoster()).length).toBeGreaterThan(0);
  });
});
