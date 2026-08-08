# Raffles Residences Boston — Resident Intranet

A private online home for residents of Raffles Residences Boston: reserve amenities,
request the concierge, pay condo fees, meet neighbours, shop the marketplace, and take
part in building governance — all in one place.

> **Demo site only.** Everything shown is simulated — accounts, statements, bookings,
> messages, and even the property-management/hotel integration. No real residents,
> money, or data are involved, and everything lives in your browser (`localStorage`),
> not a server.

## What you can do

A full residential-living experience, rebuilt end-to-end for the browser: real-time-feeling
bookings, a private social network for the building, live governance, and a lightweight
recommendations engine — all dressed in Raffles' quiet, editorial visual language.

### Daily living

| Feature | What it does |
| --- | --- |
| **Amenities** (`/amenities`) | Browse the Residents' Lounge (Floor 21), private dining, spa and more, then reserve a time slot on a visual availability grid, place an in-residence dining order, or explore the full directory of hotel venues — La Padrona, the Long Bar, Guerlain Spa, and beyond. |
| **Hotel Bridge** (`/hotel-bridge`) | A live-feeling bridge into the hotel's property-management system: pull up your folio, reserve a priority table, or order delivery. Built on a genuine circuit-breaker pattern with caching and retry, so it demonstrates *resilient* integration design — flip the "simulate outage" switch and watch the app degrade gracefully instead of breaking. |
| **Concierge** (`/concierge`) | Lodge a service request and track it through to completion, with live status updates. |
| **Account** (`/account`) | Review monthly statements, pay condo fees, browse payment history, and check a live market-value snapshot for the unit. |
| **Services** (`/services`) | Call the valet, report a maintenance issue, request parcel delivery, or log a lost & found item — each with its own status tracking. |

### Community & social

| Feature | What it does |
| --- | --- |
| **Directory** (`/directory`) | An opt-in resident directory: control your own visibility and contact preferences, manage household members and pets, and browse neighbours who've chosen to be listed. |
| **Messages** (`/messages`) | Private one-to-one and group conversations between residents. |
| **Community** (`/community`) | A resident forum with interest circles to join, a "Thank You" notes board for building staff, and a curated social feed styled after the building's Instagram presence. |
| **Gallery** (`/gallery`) | A resident photo wall — uploads are rendered entirely client-side and never leave your browser. |
| **Marketplace** (`/marketplace`) | Buy, sell, give away, or crowdsource recommendations from neighbours, with threaded replies on every listing. |
| **Events** (`/events`) | RSVP to upcoming events with live capacity limits, pitch new ones, and browse a carousel of highlights from past gatherings. |

### Governance & feedback

| Feature | What it does |
| --- | --- |
| **Proposals** (`/proposals`) | A resident idea board — submit, browse, and upvote/downvote what the building should do next. |
| **Governance** (`/governance`) | Board measures and live ballots, plus the governing documents themselves, embedded and searchable. |
| **Management** (`/management`) | Board and staff bios, building announcements, the full resident handbook, and a monthly satisfaction survey with a staff-only results dashboard. |

### Personalization

| Feature | What it does |
| --- | --- |
| **For You** (site-wide band + full page at `/for-you`) | A recommendations engine that scores amenities, events, communities, and marketplace listings against your stated interests, bookings, and activity — then, when configured, has an AI pass rewrite the "why this fits you" line for extra polish. The signal behind every pick is shown, not hidden, and the feature works identically with or without the AI enabled. |

### Discover the building

**About**, **Press**, and **Sales & Leasing** round things out with brand heritage, press coverage, and current sale/lease/parking listings — no sign-in required.

### Thoughtful details, everywhere

- **Notification bell** (header, site-wide) — surfaces an in-app alert the moment the concierge desk replies to, assigns, or updates one of your requests.
- **Explicit consent for "Remember me"** (`/login`) — turning it on opens a plain-language dialog explaining exactly what gets stored and for how long, before anything is written to your device.
- **One-click "forget me"** (`/directory`) — clears any remembered sign-in details from the browser on demand.
- **Accessible password strength meter** — strength is conveyed through icons and readable text, never colour alone.
- **Demo tags everywhere it matters** — a small "Demo" marker sits on any invented photo, bio, or listing so nothing on screen is ever mistaken for a real resident or real information.

Most pages render for everyone; the interactive parts (booking, posting, voting, messaging,
your account) ask you to sign in first.

## Signing in

This is a **resident preview**, not a real login system — there's no server and no
database. Accounts and sessions live only in `localStorage` on the device you're using,
and disappear if you clear site data or switch browsers. There's no sign-up gate either:
pick whichever of these gets you in fastest.

- **Any listed resident, no registration** — use one of the resident emails shown on the
  sign-in page (e.g. `a.romano@residents.raffles-boston.test`, Residence 22H) with the shared preview
  passcode **`raffles2026`**. This always works, with no account required, for as long as
  the demo exists.
- **Open demo account** — sign in with **`demo@demo.com`** / **`checkitout02116`** (no
  residence number needed). Not every feature is available on this account.
- **Guest passcode access** — type *any* email address with the passcode `raffles2026`
  and a lightweight resident record is created for you on the spot. It's saved to this
  browser, so the same combination keeps working on later visits — but it's a passcode,
  not a personal password.
- **Register your own household** ("Create account") — this is a real, persistent
  account: a proper email + password saved to this browser's storage. Once created, you
  sign back in with your own password every time — you never have to register twice on
  the same device.
- **Forgot password** (`/reset-password`) is fully simulated end to end: a one-time code
  is shown on screen instead of being emailed, and it expires after 15 minutes or the
  moment you reload the page.

Whichever way you sign in, your **session** lapses automatically after 12 hours of
inactivity (sliding forward while you're active) — at that point you sign in again, you
don't lose or need to recreate the account itself. Turning on **"Remember me"** just
pre-fills your email and residence number on this browser for up to 30 days; it never
stores a password, and it asks for explicit confirmation before saving anything (see
`src/components/RememberMeConsent.tsx`). Because everything is local, a real account only
exists on the device that created it — clearing site data, opening a private window, or
switching machines means starting over, though the always-available seeded emails and the
`raffles2026` passcode remain a fallback that never requires registering anything.

### Staff / building personnel

There's a second, entirely separate account system for building staff, reached via
**Personnel Sign Up / Sign In** at the bottom of the login page (`/staff-signup`,
`/staff-signin`). No staff accounts are seeded — you register once per browser, after
which sign-in works with your own password indefinitely. Unlike resident sessions, a
staff session has **no expiry at all**; you stay signed in until you explicitly sign out.
That said, `/staff-dashboard` is currently an intentionally empty placeholder, and
signing in as staff grants no elevated access anywhere else in the app — it exists to
demonstrate what an internal personnel directory could look like, not to gate any real
functionality.

Two internal tools are protected separately, by a shared access phrase shown right on the
page itself — unrelated to staff accounts entirely:

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
[978-857-5775](tel:978-857-5775)

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

- **Phone**: [978-857-5775](tel:978-857-5775)

Include as much detail as possible about the bug or feature request.
