import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/health/ready")({
  server: {
    handlers: {
      GET: async () => {
        const { runReadinessChecks } = await import("@/lib/health.server");
        const result = await runReadinessChecks();
        return Response.json(result, {
          status: result.ready ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
