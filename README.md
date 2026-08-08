# Raffles Residences Boston — Resident Intranet

A private online home for residents of Raffles Residences Boston: reserve amenities,
request the concierge, pay condo fees, meet neighbours, shop the marketplace, and take
part in building governance — all in one place.

> **Demo site only.** Everything shown is simulated — accounts, statements, bookings,
> messages, and even the property-management/hotel integration. No real residents,
> money, or data are involved, and everything lives in your browser (`localStorage`),
> not a server.

## What you can do

| Section | What it's for |
| --- | --- |
| **Home** (`/`) | A quiet landing page that leads you into each part of the residence, plus a "For You" band of personalized picks. |
| **Amenities** (`/amenities`) | Photos, descriptions and reservation requests for the Residents' Lounge (Floor 21), private dining, spa and more, with a visual time-slot grid, in-residence dining orders, and a directory of hotel venues. |
| **Concierge** (`/concierge`) | Submit a service request and follow its status. |
| **Hotel Bridge** (`/hotel-bridge`) | A simulated link to the hotel's property-management system: pull up your folio, reserve a priority table, or order in-residence delivery. Includes a "simulate outage" toggle that trips a real circuit-breaker, just to show how the app degrades gracefully. |
| **Events** (`/events`) | RSVP to resident events (with capacity limits), suggest new ones, and browse a carousel of past events. |
| **Account** (`/account`) | View monthly statements, pay condo fees, see payment history, and a market-value snapshot for the unit. |
| **Services** (`/services`) | Valet the car, report a maintenance issue, request a package/parcel, and log a lost & found item. |
| **Directory** (`/directory`) | Your resident profile with opt-in visibility, household members and pets, plus neighbours who choose to be listed. |
| **Messages** (`/messages`) | Private and group conversations between residents. |
| **Community** (`/community`) | Interest groups, discussion topics, and a "Thank You" notes board for staff. |
| **Gallery** (`/gallery`) | A resident photo wall — uploads stay in your own browser and are never sent anywhere. |
| **Marketplace** (`/marketplace`) | Buy, sell, give away, or ask neighbours for recommendations. |
| **Proposals** (`/proposals`) | Resident ideas that everyone can vote up or down. |
| **Governance** (`/governance`) | Board measures, live ballots, and the governing documents. |
| **Management** (`/management`) | Board and staff photos and bios, announcements, the resident handbook, and the monthly satisfaction survey. |
| **For You** (`/for-you`) | The full personalized-recommendations feed, with the "why this fits you" signal for each pick made visible. |
| **About / Press / Sales & Leasing** | Brand heritage, press coverage, and current sale/lease/parking listings. |

Most pages render for everyone; the interactive parts (booking, posting, voting, messaging,
your account) ask you to sign in first.

## Signing in

This is a **resident preview**, not a real login system — accounts and sessions are
stored only in your browser and reset if you clear site data. There's no public sign-up
gate: pick whichever way you'd like to explore.

- **Any listed resident** — use one of the resident emails shown on the sign-in page
  (e.g. `ashleye.romano@gmail.com`, Residence 22H) with the shared preview passcode
  **`raffles2026`**.
- **Open demo account** — sign in with **`demo@demo.com`** / **`checkitout02116`** (no
  residence number needed). Not every feature is available on this account.
- **Register your own household** — the sign-up tab creates a new resident on this
  device only; it's remembered until you sign out.
- **Forgot password** (`/reset-password`) works too — it's fully simulated: a one-time
  code is shown on screen instead of emailed, and expires after 15 minutes or on reload.

### Staff / building personnel

There's a second, separate account system for building staff, reached via
**Personnel Sign Up / Sign In** at the bottom of the login page (`/staff-signup`,
`/staff-signin`). It's independent of resident accounts and doesn't currently grant any
extra access — it exists to show what an internal staff directory could look like.

Two internal tools are instead protected by a shared access phrase shown right on the
page:

- **Concierge Desk** (`/concierge-desk`) — the staff-side queue for triaging resident
  requests.
- **Survey results** (inside `/management`) — the monthly satisfaction survey dashboard.

Both use the demo code **`residences-office`**.

## Accessibility

The interface is built to WCAG 2.2 AA: keyboard-navigable throughout, visible focus
outlines, screen-reader labels, and contrast-checked colour throughout. A visual
regression check (`npm run test:visual`) specifically guards the header's sign-in
controls against overlapping the logo or shrinking below tap-target size on small
screens.

## Questions or feedback

Built with 🤍 in Raffles Residences Boston, Unit 22H by Ashley Romano —
[ashleye.romano@gmail.com](mailto:ashleye.romano@gmail.com) · [978-857-5775](tel:978-857-5775)

---

## For Developers

### Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (file-based routing via
  TanStack Router) on React 19, server-rendered with a Nitro server entry
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) primitives
  (`new-york` style, Radix UI underneath) in `src/components/ui/`
- **Build tool**: Vite 8, configured through `@lovable.dev/vite-tanstack-config`
  (this project is connected to [Lovable](https://lovable.dev) — see `AGENTS.md`)
- **Forms/validation**: `react-hook-form` + `zod`
- **Testing**: Vitest + Testing Library (unit), Playwright (visual regression + smoke test)

### Architecture notes

This app intentionally has **no real backend for its core features**. That's a
deliberate choice for a portfolio/demo project, not an oversight:

- **Resident & staff data** (`src/lib/portal-store.tsx`, `src/lib/portal-data.ts`,
  `src/lib/staff-store.ts`) live in a React Context, persisted to `localStorage` for
  accounts/sessions/directory data and held purely in memory (reset on reload) for
  everything else — messages, statements, valet/maintenance requests, listings,
  proposals, and votes. There is no database.
- **Supabase** is wired into the framework (`src/integrations/supabase/`,
  `src/start.ts`) but not actually provisioned or used for auth — the `Database` type
  has no tables, and `/health/ready` reports it as `"skipped"` because no Supabase
  credentials are configured. It's scaffolding left in place, not a live dependency.
- **Hotel/PMS integration** (`src/lib/pms.server.ts`, `pms.functions.ts`) is a
  simulated adapter with a deterministic folio generator, a real circuit-breaker
  (trips after 3 failures, half-open retry after 15s), and a short-lived cache — built
  to mirror the shape of a production integration without calling one. Powers
  `/hotel-bridge`.
- **"For You" recommendations** (`src/lib/recommendations.ts`) are rule-based:
  scored from a resident's stated interests, bookings, RSVPs, and open tickets. An
  optional AI pass (`src/lib/recommendations.functions.ts`,
  `src/lib/ai-gateway.server.ts`) rewrites the top reasons via Lovable's AI Gateway
  (Gemini) if a `LOVABLE_API_KEY` is set — it falls back to the rule-written copy
  otherwise, so the app works fully without any AI key.
- **Error handling**: a server middleware (`src/start.ts`) and client boundary
  (`src/components/AppErrorBoundary.tsx`) catch failures and render a static fallback
  page instead of a blank screen; a runtime logger
  (`src/lib/runtime-error-logger.ts`) also watches for blank-screen conditions and
  reports into the Lovable editor when running there.
- **Health checks**: `GET /health` (liveness) and `GET /health/ready` (readiness —
  reports which optional integrations are actually configured).

### Environment variables

Copy or edit `.env` at the project root:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Supabase project URL (currently scaffolded, not required for the app to run) |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_PROJECT_ID` / `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `LOVABLE_API_KEY` | Optional — enables the AI-polished wording on "For You" recommendation cards |
| `GRAPHQL_MESH_URL` | Optional — reported by `/health/ready` if set; not otherwise used |

None of these are required to run the app locally — every feature works with them unset.

### Getting started locally

Requires **Node.js ≥ 22**.

```sh
git clone <this-repository-url>
cd raffles-residence-hub
npm install
npm run dev
```

The dev server runs at **`http://localhost:8080`** by default (the port Vite reports
on startup may differ if 8080 is in use). Sign in with any resident email + passcode
`raffles2026`, or the open demo account `demo@demo.com` / `checkitout02116`.

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check, lint, then build for production |
| `npm run build:dev` | Same, but built in development mode |
| `npm run preview` | Preview a production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run format` | Prettier, write mode |
| `npm run check` | `typecheck` + `lint` (what `build` runs first) |
| `npm test` | Run the Vitest unit test suite once |
| `npm run test:visual` | Playwright visual-regression check on the header, across 6 breakpoints |
| `npm run test:visual:update` | Re-record the visual-regression baseline |

There's also `node scripts/smoke-test.mjs [url]` — an unwired end-to-end script that
hits `/health`, `/health/ready`, and the main routes over plain HTTP, then (if
Playwright is installed) drives a headless browser through the demo sign-in flow and
checks the primary nav for console errors. Handy after a deploy.

### Project structure

```text
src/
  routes/         File-based routes (TanStack Router) — one file per URL, see src/routes/README.md
  components/     Page-level components; src/components/ui/ holds shadcn primitives
  lib/             Data models, business logic, and server functions (portal store, PMS, recommendations, auth, etc.)
  integrations/    Supabase client setup (scaffolded, not actively used)
  assets/          Images
scripts/           Smoke test and visual-regression tooling
tests/visual/      Visual-regression baseline and output
```

Routing follows TanStack Start's file-based conventions — see
[src/routes/README.md](src/routes/README.md) for the naming rules. `src/routeTree.gen.ts`
is auto-generated; don't edit it by hand.

### Contributing

I welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Run `npm run check` and `npm test` before pushing
4. Commit your changes (`git commit -am 'Add feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request with a clear description

### Report bugs or suggest features

Found an issue or have a suggestion? Please contact Ashley:

- **Email**: [ashleye.romano@gmail.com](mailto:ashleye.romano@gmail.com)
- **Phone**: [978-857-5775](tel:978-857-5775)

Include as much detail as possible about the bug or feature request.
