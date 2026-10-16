import type { BuildingLinkClient } from "./client";
import { HttpBuildingLinkClient } from "./http/client";
import { MockBuildingLinkClient } from "./mock/client";
import type { AdapterMode } from "./types";

export type { BuildingLinkClient } from "./client";
export { BuildingLinkUnavailableError, isUnavailable } from "./client";
export { MockBuildingLinkClient } from "./mock/client";
export { HttpBuildingLinkClient } from "./http/client";
export * from "./types";
export { buildDeskEmail, makeReference, REFERENCE_PATTERN, DESK_EMAIL } from "./fallback";

/* VITE_ variables are public, so this is the only one the front end reads.
   Credentials live with the backend proxy and never reach the browser. */
export function readMode(raw: string | undefined): AdapterMode {
  return raw?.trim().toLowerCase() === "http" ? "http" : "mock";
}

export const BUILDINGLINK_MODE: AdapterMode = readMode(import.meta.env["VITE_BUILDINGLINK_MODE"]);

export function createBuildingLinkClient(
  mode: AdapterMode = BUILDINGLINK_MODE,
): BuildingLinkClient {
  return mode === "http" ? new HttpBuildingLinkClient() : new MockBuildingLinkClient();
}
