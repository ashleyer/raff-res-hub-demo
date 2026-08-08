import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: async () => {
        const { checkApi } = await import("@/lib/health.server");
        return Response.json(
          {
            status: "ok",
            service: "raffles-residences-intranet",
            api: checkApi(),
            timestamp: new Date().toISOString(),
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
