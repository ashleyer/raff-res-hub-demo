# BuildingLink integration

How this demo works alongside BuildingLink, what is simulated today, and what waits on access being granted.

## Repo map

1. Framework: TanStack Start on React 19 with a Nitro server entry and the Vercel preset. Not a plain Vite SPA. Server routes (`/health`) and server functions (the hotel bridge) already exist, so a backend proxy can live in this repo later.
2. Simulated data: `src/lib/portal-data.ts` (residents, announcements, parcels, maintenance tickets) and `src/lib/intranet-data.ts` (events, concierge requests, bookings). Seeds are plain exported arrays.
3. State: one React context, `PortalProvider` in `src/lib/portal-store.tsx`. Accounts, sessions, directory, notifications, and the concierge queue persist to localStorage. Everything else is in memory and resets on reload.
4. Staff accounts: `src/lib/staff-store.ts`, localStorage only, no session expiry. `/staff-dashboard` shows a Concierge summary only to the Concierge department.
5. Resident routes touched by this work: `/login` (sign-up), `/concierge` (receipt dialog), `/services` (maintenance, parcels), `/events`, `/management` (announcements tab), `/messages`, `/account`.
6. Staff routes: `/staff-signin`, `/staff-dashboard`, and `/concierge-desk`, which is gated by a shared phrase rather than a staff account.
7. Sign-up already asks for a residence number and a surname, so roster verification fits without new fields.
8. Environment: only the Supabase scaffolding reads `VITE_*` variables. The front end now also reads `VITE_BUILDINGLINK_MODE`.
9. Tests: Vitest with jsdom for `src/**/*.test.{ts,tsx}`. Playwright smoke, visual, and axe suites in `scripts/` run against a built preview. CI runs all of it on pull requests.
10. Known oddities: `.history/` (six old README snapshots) is tracked despite being gitignored, and `.gitignore` ignores `.env*`, which blocks the `.env.example` the README refers to.
