// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pinned so a Vercel-triggered build always emits Vercel's Build Output API
  // format (server functions + SSR intact) instead of falling back to this
  // package's Cloudflare default. Vercel's "Application Preset: Vite" in its
  // dashboard has no bearing on this — it only affects suggested build/output
  // settings, and gets overridden the moment `.vercel/output/` exists.
  nitro: { preset: "vercel" },
});
