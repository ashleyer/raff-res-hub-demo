# BuildingLink integration

How this demo works alongside BuildingLink, what is simulated today, and what waits on access being granted.

The short version: BuildingLink stays the staff system of record. The Hub is the resident-facing layer. Four narrow flows connect them: the roster (read, daily), announcements and events (read, daily), packages (read, on arrival), and service requests (write, live once access is granted, emailed to the desk until then). Nothing else crosses the line.

## Repo map

1. Framework: TanStack Start on React 19 with a Nitro server entry and the Vercel preset. Not a plain Vite SPA. Server routes (`/health`) and server functions (the hotel bridge) already exist, so a backend proxy can live in this repo later.
2. Simulated data: `src/lib/portal-data.ts` (residents, announcements, parcels, maintenance tickets) and `src/lib/intranet-data.ts` (events, concierge requests, bookings). Seeds are plain exported arrays.
3. State: one React context, `PortalProvider` in `src/lib/portal-store.tsx`. Accounts, sessions, directory, notifications, and the concierge queue persist to localStorage. Everything else is in memory and resets on reload.
4. Staff accounts: `src/lib/staff-store.ts`, localStorage only, no session expiry. `/staff-dashboard` showed a Concierge summary only to the Concierge department; the BuildingLink section now shows for every department.
5. Resident routes touched by this work: `/login` (sign-up), `/concierge` (receipt dialog), `/services` (maintenance, parcels), `/events`, `/management` (announcements tab), `/messages`, `/account`.
6. Staff routes: `/staff-signin`, `/staff-dashboard`, and `/concierge-desk`, which is gated by a shared phrase rather than a staff account.
7. Sign-up already asks for a residence number and a surname, so roster verification fits without new fields.
8. Environment: only the Supabase scaffolding read `VITE_*` variables before. The front end now also reads `VITE_BUILDINGLINK_MODE`, and nothing else.
9. Tests: Vitest with jsdom for `src/**/*.test.{ts,tsx}`. Playwright smoke, visual, and axe suites in `scripts/` run against a built preview. CI runs all of it on pull requests.
10. Known oddities: `.history/` (six old README snapshots) is tracked despite being gitignored, and `.gitignore` ignores `.env*`, which blocks the `.env.example` the README refers to.

## What BuildingLink has said it offers

Read on 16 October 2026 from BuildingLink's "For Developers" page (`prelive.buildinglink.com/Public/buildinglink/TechnologyAndInnovation/Developers.aspx`; the `www` host redirects to `buildinglink.io`, which has no developer page). It describes an API interface for outside programs to import calendar events, announcements, package information, and reservation availability, and says maintenance request data can be imported into BuildingLink from an external program. It does not list a resident roster read; resident lists are described as imported into BuildingLink from accounting systems such as Yardi, MRI, and RealPage. It does not say how access is granted or whether endpoint documentation exists. The building is requesting access as the account holder.

That one gap matters. The roster read is the only flow here that the public page does not back. The adapter keeps `getRoster` and `verifyResident` because the Hub needs them, `http/MAPPING.md` marks them "not listed on the developer page", and the desk's verification queue is the working path until BuildingLink confirms.

## The adapter

`src/integrations/buildinglink/`:

- `types.ts`: the Hub's own shapes. None claims to mirror a BuildingLink field.
- `client.ts`: `BuildingLinkClient`, the one interface every page and panel reads through. Method set: `getRoster`, `verifyResident`, `listAnnouncements`, `listEvents`, `listPackages`, `createServiceRequest`, `getServiceRequest`, `listServiceRequests`, `getSyncStatus`, and `retrySync`. The last two are Hub-side bookkeeping, not BuildingLink capabilities.
- `mock/`: a deterministic simulation. Fixtures are computed from the clock so they always read as current, and the same clock always gives the same data. The roster reuses the demo's fictional residents, so no new names or units appear anywhere. Latency is seeded. Requests lodged through the Hub move from Submitted to Received to In progress on a clock and never complete on their own. One notice is marked as a failed mirror so the dashboard has something real to retry. An outage switch makes every read and write fail so the fallback can be watched.
- `http/`: a skeleton. It talks to exactly one thing, the Hub's own proxy at `/api/buildinglink/*`, and reads a missing proxy (the app's HTML 404) as "not deployed, access pending". Every method carries a `TODO(buildinglink)` where the real mapping goes. `MAPPING.md` lists each method, the capability it depends on, and its status.
- `fallback.ts`: turns a request into a desk email under a reference of the form `RRH-YYYYMMDD-NNN`. The demo opens it as a `mailto:` link; `toDeskPostPayload` is the shape a small backend mailer would accept later.
- `index.ts`: selects mock or http from `VITE_BUILDINGLINK_MODE`, defaulting to mock.
- `provider.tsx` and `hooks.ts`: one provider owns the client and a per-session cache, so resident pages and the personnel dashboard render the same objects. Hooks: `useRosterVerification`, `useAnnouncements`, `useEvents`, `usePackages`, `useServiceRequests`, `useSyncStatus`, plus `useRoster` for the dashboard. Each returns data, loading, error, lastSyncedAt, and source, with a manual refresh.

### Why an interface and two implementations

The demo has to be convincing today and honest about tomorrow. A mock behind the same interface lets every page be built against the real shape of the integration without inventing a single BuildingLink fact. When access arrives, the proxy gets written, the http skeleton gets its mapping, and the pages do not change.

### Why the proxy, and why it is out of scope

`VITE_` variables are public. A BuildingLink credential in the browser would be a credential on the internet. The credential is property-level, issued to the Hub, and lives with the proxy. This pass does not build the proxy because there is nothing to map it to yet; this repo can host it as a server route when the time comes.

### What the integration will not do

- Log in as a resident to scrape data. There is no resident-credential path in the code or the comments. The integration is a property-level credential issued to the Hub.
- Keep a second copy of the roster. The browser never downloads it for sign-up; `verifyResident` asks the adapter, which will ask the proxy, which will ask BuildingLink.
- Write anything into BuildingLink beyond creating requests.

## Provenance

Every item that came from BuildingLink carries a source label and a sync time: "Posted via BuildingLink", "From the building calendar", "Logged by the desk", "On the building roster", or "Sent to BuildingLink". Hub-native items carry nothing. The two are merged in one list by date on the events page and the announcements tab, and the label is the only difference, which is the point. `src/components/buildinglink/ProvenanceBadge.tsx` renders it.

## The fallback

Until BuildingLink grants access, a service request lodged in the Hub still reaches the desk. The provider catches `BuildingLinkUnavailableError` from `createServiceRequest`, issues the same `RRH-` reference, builds the desk email, and records the request with route "desk-email". The receipt shows the reference, the route taken ("Sent to BuildingLink" or "Emailed to the desk"), and a status. Reads that fail keep the last good copy on screen and say so in one quiet line; the staff dashboard carries the detail.

Sign-ups the roster cannot confirm, or cannot check, wait in the verification queue on the personnel dashboard. The resident sees one calm message and no reason. Approving lets that resident register on the next attempt; declining does nothing else. Both change demo state only, in memory, and reset on reload like the rest of the demo.

## The personnel dashboard

Five panels, one mode indicator, all fed by the same hooks the resident pages use:

1. Sync health: one row per flow with last run, next run, status, and what the fallback did if it failed. A demo-only outage switch, shown only in mock mode.
2. Open requests: source badge Hub or BuildingLink, status, age, and a placeholder "Open in BuildingLink" action that stays disabled until a record link exists.
3. Package log for today.
4. Roster verification queue, with approve and decline.
5. Announcement mirror: what mirrored, what failed, with a retry.

The mode indicator reads "Simulated" in mock mode and "Connected" in http mode. In http mode with no proxy it also says so in the line beneath.

## Decisions made without being asked, and why

- Announcements merge into `/management`, where the Hub already keeps them, and calendar entries merge into `/events`. The prompt said "events and announcements pages"; there is no separate announcements page.
- Concierge requests (every category) and the Services maintenance form write through `createServiceRequest`. Valet and lost and found stay Hub-native; the developer page names maintenance requests, and the desk queue is where concierge requests already go. The footer's security alert still uses the Hub's own queue and `REQ-` reference; it was out of this pass's list.
- "Deliver to my residence" on a desk-logged package creates a service request in the "Package & Courier" category rather than a new write type, so the "requests only" line holds.
- The hub's own `parcels` seed stays beside the desk-logged packages on the mail tab, unlabelled, because it is Hub-native. Note that the seeded parcels belong to Residence 34B and show for every signed-in resident; that is existing demo behaviour, not new.
- `retrySync` was added to the interface so the dashboard's retry control has an honest backing method; it is bookkeeping, and MAPPING.md says so.
- The axe audit now also scans `/about-this-app`, `/staff-signin`, `/staff-signup`, both Services tabs that gained forms, and `/staff-dashboard` after registering a throwaway staff account in the browser.
- Residence helpers moved to `src/lib/units.ts` so the store and the adapter agree on what the same unit means.

## Deferred until BuildingLink grants access

- [ ] Confirm whether a roster read exists at all, and if not, agree the verification queue as the permanent path.
- [ ] Build the backend proxy at `/api/buildinglink/*` holding the property-level credential; keep the sync log there.
- [ ] Fill the `TODO(buildinglink)` mappings in `http/client.ts` and update `http/MAPPING.md` from "pending access" as each one is confirmed.
- [ ] Confirm whether the maintenance request import accepts non-maintenance categories (floristry, valet, package delivery), and route the rest by email if not.
- [ ] Confirm status read-back after import, so the receipt's status is BuildingLink's and not the Hub's clock.
- [ ] Replace the `mailto:` fallback with a backend mailer accepting `DeskPostPayload`.
- [ ] Replace the disabled "Open in BuildingLink" placeholder with a real record link.
- [ ] Decide whether reservation availability, the one listed capability the Hub does not use, should replace the Hub's own amenity booking grid.

## Running it

- `VITE_BUILDINGLINK_MODE=mock` (default) runs the full resident flow and the personnel dashboard against the simulation.
- `VITE_BUILDINGLINK_MODE=http` compiles and, with no proxy deployed, degrades every flow to its fallback with a clear message. Sign-ups queue, requests go by email, and the dashboard shows one pending-access row per flow.
- Tests: `npm test` covers the mock adapter (determinism, shapes, fallback references), the http client against an absent proxy, the hooks (loading, error, provenance, fallback), the dashboard panels, and the verbatim About page copy. `npm run test:e2e` runs the smoke, visual, and axe suites against a built preview.
