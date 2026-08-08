/**
 * Health / readiness probes.
 *
 * This project has no database or GraphQL mesh provisioned yet, so those
 * checks report `skipped` rather than faking a pass. As soon as the env vars
 * below exist the checks start exercising them for real, without any further
 * code change.
 */

export type CheckStatus = "ok" | "degraded" | "down" | "skipped";

export type CheckResult = {
  name: string;
  status: CheckStatus;
  detail: string;
  durationMs: number;
};

const TIMEOUT_MS = 3000;

async function timed(name: string, fn: () => Promise<Omit<CheckResult, "name" | "durationMs">>) {
  const started = Date.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
      ),
    ]);
    return { name, ...result, durationMs: Date.now() - started };
  } catch (error) {
    return {
      name,
      status: "down" as const,
      detail: error instanceof Error ? error.message : "unknown error",
      durationMs: Date.now() - started,
    };
  }
}

/** The worker itself answered this request, so the API surface is up. */
export function checkApi(): CheckResult {
  return { name: "api", status: "ok", detail: "server function runtime responding", durationMs: 0 };
}

/** Round-trips a cheap request against the backend when one is configured. */
export function checkDatabase(): Promise<CheckResult> {
  return timed("database", async () => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      return { status: "skipped", detail: "no database configured for this deployment" };
    }
    // The Data API root rejects anonymous introspection, so probe the platform
    // health endpoint instead — it proves the project is reachable and awake.
    const response = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
    if (!response.ok) {
      return { status: "down", detail: `backend responded ${response.status}` };
    }
    return { status: "ok", detail: "backend reachable" };
  });
}

/** Pings the GraphQL sub-mesh with a minimal introspection query. */
export function checkGraphql(): Promise<CheckResult> {
  return timed("graphql", async () => {
    const endpoint = process.env["GRAPHQL_MESH_URL"];
    if (!endpoint) {
      return { status: "skipped", detail: "no graphql sub-mesh configured for this deployment" };
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env["GRAPHQL_MESH_TOKEN"]
          ? { authorization: `Bearer ${process.env["GRAPHQL_MESH_TOKEN"]}` }
          : {}),
      },
      body: JSON.stringify({ query: "{ __typename }" }),
    });
    if (!response.ok) return { status: "down", detail: `mesh responded ${response.status}` };
    const payload = (await response.json()) as { data?: { __typename?: string }; errors?: unknown };
    if (payload.errors) return { status: "degraded", detail: "mesh returned graphql errors" };
    if (!payload.data?.__typename) return { status: "degraded", detail: "unexpected mesh payload" };
    return { status: "ok", detail: "mesh introspection succeeded" };
  });
}

export async function runReadinessChecks() {
  const [database, graphql] = await Promise.all([checkDatabase(), checkGraphql()]);
  const checks: CheckResult[] = [checkApi(), database, graphql];
  const ready = checks.every((c) => c.status === "ok" || c.status === "skipped");
  const degraded = checks.some((c) => c.status === "degraded");
  return {
    status: ready ? (degraded ? "degraded" : "ready") : "not_ready",
    ready,
    checks,
    timestamp: new Date().toISOString(),
  };
}
