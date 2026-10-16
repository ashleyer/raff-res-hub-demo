import { describe, expect, it, vi } from "vitest";
import { BuildingLinkUnavailableError } from "../client";
import { HttpBuildingLinkClient, PROXY_BASE } from "./client";

const html404 = () =>
  new Response("<!doctype html><title>Not found</title>", {
    status: 404,
    headers: { "content-type": "text/html" },
  });

describe("http client without a proxy", () => {
  it("only ever talks to the Hub's own proxy path, with no credential headers", async () => {
    const fetchSpy = vi.fn(async () => html404());
    const client = new HttpBuildingLinkClient(fetchSpy as unknown as typeof fetch);
    await client.listAnnouncements().catch(() => undefined);
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url.startsWith(`${PROXY_BASE}/`)).toBe(true);
    const headers = (init.headers ?? {}) as Record<string, string>;
    expect(Object.keys(headers).map((h) => h.toLowerCase())).not.toContain("authorization");
    expect(init.credentials).toBe("same-origin");
  });

  it("reads the app's 404 page as 'proxy absent' and says so plainly", async () => {
    const client = new HttpBuildingLinkClient((async () => html404()) as unknown as typeof fetch);
    await expect(client.getRoster()).rejects.toBeInstanceOf(BuildingLinkUnavailableError);
    await expect(client.getRoster()).rejects.toThrow(/proxy is not deployed/);
  });

  it("reads a network failure as unreachable", async () => {
    const client = new HttpBuildingLinkClient((async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch);
    await expect(client.getSyncStatus()).rejects.toThrow(/could not be reached/);
  });

  it("passes JSON through when the proxy answers", async () => {
    const client = new HttpBuildingLinkClient((async () =>
      Response.json([{ id: "x" }])) as unknown as typeof fetch);
    expect(await client.listPackages("22H")).toEqual([{ id: "x" }]);
  });
});
