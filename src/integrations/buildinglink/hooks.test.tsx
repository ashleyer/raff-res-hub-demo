import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { BuildingLinkUnavailableError, type BuildingLinkClient } from "./client";
import {
  useAnnouncements,
  usePackages,
  useRosterVerification,
  useServiceRequests,
  useSyncStatus,
} from "./hooks";
import { HttpBuildingLinkClient } from "./http/client";
import { MockBuildingLinkClient } from "./mock/client";
import { lastDailyRun } from "./mock/fixtures";
import { BuildingLinkProvider } from "./provider";

const NOW = new Date(2026, 9, 16, 13, 15, 0);

function wrapperFor(client: BuildingLinkClient) {
  return ({ children }: { children: ReactNode }) => (
    <BuildingLinkProvider client={client}>{children}</BuildingLinkProvider>
  );
}

const mock = () => new MockBuildingLinkClient({ now: () => NOW, latency: false });

describe("useAnnouncements", () => {
  it("goes from loading to data, with provenance, source, and the last sync time", async () => {
    const client = mock();
    const { result } = renderHook(() => useAnnouncements(), { wrapper: wrapperFor(client) });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data.every((a) => a.provenance.label === "Posted via BuildingLink")).toBe(
      true,
    );
    expect(result.current.source).toBe("buildinglink");
    expect(result.current.lastSyncedAt).toBe(lastDailyRun(NOW).toISOString());
    expect(result.current.error).toBeNull();
  });

  it("fetches once per session however many components ask", async () => {
    const client = mock();
    const spy = vi.spyOn(client, "listAnnouncements");
    const wrapper = wrapperFor(client);
    const { result } = renderHook(() => [useAnnouncements(), useAnnouncements()] as const, {
      wrapper,
    });
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(spy).toHaveBeenCalledTimes(1);
    await act(() => result.current[1].refresh());
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("surfaces an unavailable adapter as a plain message and a fallback source", async () => {
    const client = mock();
    client.setOutage(true);
    const { result } = renderHook(() => useAnnouncements(), { wrapper: wrapperFor(client) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/not answering/);
    expect(result.current.source).toBe("fallback");
    expect(result.current.data).toEqual([]);
  });
});

describe("usePackages", () => {
  it("filters to one residence and keeps the desk's provenance", async () => {
    const { result } = renderHook(() => usePackages("22h"), { wrapper: wrapperFor(mock()) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.length).toBe(2);
    expect(result.current.data.every((p) => p.unit === "Residence 22H")).toBe(true);
    expect(result.current.data.every((p) => p.provenance.label === "Logged by the desk")).toBe(
      true,
    );
  });
});

describe("useServiceRequests", () => {
  const input = {
    unit: "Residence 22H",
    category: "Engineering",
    detail: "Terrace door closer catching.",
    priority: "Standard" as const,
  };

  it("writes to BuildingLink when it answers, with no email", async () => {
    const { result } = renderHook(() => useServiceRequests({ unit: "22H" }), {
      wrapper: wrapperFor(mock()),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = await act(() => result.current.create(input));
    expect(created.request.route).toBe("buildinglink");
    expect(created.email).toBeUndefined();
    await waitFor(() => expect(result.current.byReference(created.request.reference)).toBeTruthy());
  });

  it("falls back to a desk email with a reference when BuildingLink is away", async () => {
    const client = mock();
    client.setOutage(true);
    const { result } = renderHook(() => useServiceRequests(), { wrapper: wrapperFor(client) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = await act(() => result.current.create(input));
    expect(created.request.route).toBe("desk-email");
    expect(created.request.reference).toMatch(/^RRH-\d{8}-\d{3}$/);
    expect(created.email?.subject).toContain(created.request.reference);
    expect(result.current.emailFor(created.request.reference)).toBe(created.email);
    expect(result.current.data.map((r) => r.reference)).toContain(created.request.reference);
  });

  it("rethrows anything that is not an outage", async () => {
    const client = mock();
    vi.spyOn(client, "createServiceRequest").mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useServiceRequests(), { wrapper: wrapperFor(client) });
    await expect(result.current.create(input)).rejects.toThrow("boom");
    void BuildingLinkUnavailableError;
  });
});

describe("useRosterVerification", () => {
  it("matches a listed household and queues an unlisted one for the desk", async () => {
    const { result } = renderHook(() => useRosterVerification(), { wrapper: wrapperFor(mock()) });
    const match = await act(() => result.current.verify("34B", "Vance", "x@y.test"));
    expect(match).toEqual({ outcome: "match", via: "roster" });
    const miss = await act(() => result.current.verify("34B", "Nobody", "n@y.test"));
    expect(miss).toEqual({ outcome: "queued" });
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0]).toMatchObject({ unit: "34B", lastName: "Nobody" });
  });

  it("lets the desk approve a queued sign-up so the next attempt proceeds", async () => {
    const { result } = renderHook(() => useRosterVerification(), { wrapper: wrapperFor(mock()) });
    await act(() => result.current.verify("34B", "Nobody", "n@y.test"));
    const id = result.current.pending[0]!.id;
    act(() => result.current.approve(id));
    expect(result.current.pending).toHaveLength(0);
    const again = await act(() => result.current.verify("34b", "nobody", "n@y.test"));
    expect(again).toEqual({ outcome: "match", via: "desk" });
  });

  it("queues rather than blocks when the roster cannot be read", async () => {
    const client = mock();
    client.setOutage(true);
    const { result } = renderHook(() => useRosterVerification(), { wrapper: wrapperFor(client) });
    const outcome = await act(() => result.current.verify("34B", "Vance", "x@y.test"));
    expect(outcome).toEqual({ outcome: "queued" });
  });
});

describe("useSyncStatus", () => {
  it("exposes one record per flow, the mode, and the outage switch", async () => {
    const { result } = renderHook(() => useSyncStatus(), { wrapper: wrapperFor(mock()) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.map((r) => r.flow)).toHaveLength(5);
    expect(result.current.mode).toBe("mock");
    expect(result.current.canSimulateOutage).toBe(true);
    act(() => result.current.setOutage(true));
    await waitFor(() => expect(result.current.data.every((r) => r.status === "failed")).toBe(true));
    expect(result.current.outage).toBe(true);
    act(() => result.current.setOutage(false));
    await waitFor(() => expect(result.current.data.some((r) => r.status === "ok")).toBe(true));
  });

  it("retries a failed mirror item and refreshes both the record and the notices", async () => {
    const client = mock();
    const { result } = renderHook(() => [useSyncStatus(), useAnnouncements()] as const, {
      wrapper: wrapperFor(client),
    });
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    await waitFor(() => expect(result.current[1].loading).toBe(false));
    const mirror = result.current[0].data.find((r) => r.flow === "announcements")!;
    expect(mirror.status).toBe("partial");
    const before = result.current[1].data.length;
    await act(() => result.current[0].retry("announcements", mirror.failures![0]!.itemId));
    await waitFor(() =>
      expect(result.current[0].data.find((r) => r.flow === "announcements")?.status).toBe("ok"),
    );
    await waitFor(() => expect(result.current[1].data.length).toBe(before + 1));
  });
});

describe("http mode without a proxy", () => {
  it("degrades every flow to a pending-access record with the fallback named", async () => {
    const absent = new HttpBuildingLinkClient(
      (async () =>
        new Response("<!doctype html>", {
          status: 404,
          headers: { "content-type": "text/html" },
        })) as unknown as typeof fetch,
    );
    const { result } = renderHook(() => [useSyncStatus(), useServiceRequests()] as const, {
      wrapper: wrapperFor(absent),
    });
    await waitFor(() => expect(result.current[0].loading).toBe(false));
    expect(result.current[0].mode).toBe("http");
    expect(result.current[0].canSimulateOutage).toBe(false);
    expect(result.current[0].source).toBe("fallback");
    expect(result.current[0].error).toMatch(/proxy is not deployed/);
    expect(result.current[0].data).toHaveLength(5);
    expect(result.current[0].data.every((r) => r.status === "pending access")).toBe(true);
    expect(result.current[0].data.find((r) => r.flow === "service-requests")?.fallback).toMatch(
      /emailed to the desk/,
    );

    const created = await act(() =>
      result.current[1].create({
        unit: "22H",
        category: "Engineering",
        detail: "Door closer.",
        priority: "Standard",
      }),
    );
    expect(created.request.route).toBe("desk-email");
    expect(created.email?.to).toBeTruthy();
  });
});
