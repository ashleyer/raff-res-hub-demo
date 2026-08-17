# Resident Portal — Design Review

**Reviewed 2026-08-15** · live demo, desktop (1440×900) + mobile (390×844), signed-in and
signed-out states, 20 screens · [annotated version with full write-up →](https://claude.ai/code/artifact/af6cc0b6-9137-465d-96f0-c56740d4256f)

**Status, 2026-08-16: all seven findings below are fixed and closed** (#9–#15), verified
against `npm run typecheck`, `lint`, `test`, `test:a11y` (22/22 clean), and
`test:visual` (18/18) — see each item for what shipped.

A hospitality-software and UX critique of the resident portal, done by driving the live
demo with Playwright rather than reading the source in isolation. Findings below were
tracked as GitHub issues (linked inline) rather than left as prose, so they didn't go stale.

## Verdict

This is an unusually complete piece of hospitality software for a solo build. The visual
language, the content voice, and the information architecture all clear a bar most funded
proptech doesn't reach — in places it's genuinely mistakable for a real Raffles product.
The gaps that remain aren't taste problems; they're the specific seams where a bespoke
interface meets browser defaults, and where transactional moments still borrow the pacing
of a marketing page.

## Scorecard

| Dimension | Read | Note |
| --- | --- | --- |
| Brand & visual fidelity | ●●●● | Could sit next to rafflesresidencesboston.com without flinching. |
| Hospitality voice | ●●●● | Concierge notes and resident quotes read like a real desk log, not filler copy. |
| Information architecture | ●●●○ | Fourteen resident domains, all two clicks away; the mega-menu earns its keep. |
| Transactional UX | ~~●●○○~~ ●●●○ | *As of 2026-08-16:* real date/time pickers, legible CTAs. |
| Accessibility discipline | ●●●○ | Contrast bugs get caught and documented, not just silently patched. |
| Mobile experience | ●●●○ | Header survives real stress-testing; forms feel less tailored under 768px. |
| Staff-side operations | ~~●○○○~~ ●●○○ | *As of 2026-08-16:* Concierge dashboard is live; other departments still generic. |

## What's already five-star

**The homepage as thesis.** One cinematic photograph, a headline set in a light
transitional serif, a single soft prompt — *Choose Your Experience* — instead of a wall of
navigation. It borrows the actual rhythm of luxury-hospitality marketing sites.

![Homepage hero: full-bleed dusk photograph of the Raffles tower over Boston](assets/01-home-hero.jpg)

**The personalization engine shows its work.** Every card on `/for-you` carries the reason
it appeared — *"Matched to your profile: wine & spirits circle member,"* *"You belong to 2
circles but have not posted yet."* Most consumer software treats recommendations as a
black box; this treats them as a concierge's reasoning, said out loud.

![For You page showing personalized cards each labeled with the reason it was suggested](assets/02-for-you.jpg)

**The Hotel Bridge outage toggle.** PMS integrations are one of the most failure-prone
parts of real hospitality tech. Hotel Bridge is built on an actual circuit-breaker pattern
and ships a "Simulate outage" switch that shows graceful degradation instead of pretending
failure never happens — the clearest piece of leader-level systems thinking in the build.

**Micro-copy that thinks like a concierge, not a database.** RSVP cards state exact
scarcity — *"11 of 14 places taken · 3 remaining"* — instead of a vague "almost full"
badge; governance ballots show real vote counts. That precision is carried consistently
across events, ballots, and reservations.

![Events page cards showing exact capacity counts next to an RSVP button](assets/03-events-scarcity.jpg)

**Accessibility as a practiced habit, not a checkbox.** `src/styles.css` documents a gold
accent color that was deliberately darkened after it measured 4.31:1 against a panel
background — short of WCAG AA's 4.5:1 — caught by the automated audit. Paired with the
visual-regression suite guarding the header across six breakpoints, this reads like a team
with a QA discipline, not a single designer's taste.

## Findings — all resolved

Ranked by how much each one cost the illusion, not by how hard it was to fix.

1. ✅ **Browser-native inputs inside a couture interface** — every date/time field
   (Amenities, Concierge, Hotel Bridge) dropped to the raw OS picker. `react-day-picker` was
   already a dependency and unused exactly where it was needed most. → [#9, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/9) — added a
   `DatePicker` (Popover + the existing Calendar) and a `TimeChipPicker` deriving valid
   chip times from each outlet's own service window.

   ![Amenities booking form showing a raw unstyled operating-system date input](assets/04-amenities-date-input.jpg)

2. ✅ **Button type sized for browsing, not for spending money** — transactional CTAs
   (*Send to the Desk*, *Place Order*, *Publish Listing*) ran at the same ~10–11px tracked
   caps as marketing-page buttons. → [#10, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/10) — new `size="cta"` Button
   variant, applied site-wide (~50 call sites, 22 files) rather than only the pages this
   review happened to cover.

3. ✅ **Uneven column weight leaves dead space on wide screens** — Concierge's two-column
   layout left a wide field of blank space before the footer when the request list was
   short. → [#11, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/11) — `items-start` cleanup plus real added
   content (richer empty state, a standing service-standard panel) so the column's natural
   height closes the gap.

   ![Concierge page showing a large empty area of blank space before the footer](assets/05-concierge-gap.jpg)

4. ✅ **Two "this isn't real" interruptions before anything real is seen** — the banner and
   the first-visit modal restated the same fact, and the modal's only dismissal was a
   small unlabeled corner icon. → [#12, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/12) — modal now states a fact the
   banner doesn't, with an explicit primary "Understood" button.

5. ✅ **Currency formatting overstates precision** — the house-value snapshot on Account
   rendered seven-figure numbers to the cent (`$6,240,000.00`). → [#13, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/13) — new shared
   `formatCurrency()` util; six round-number stats (two more than originally spotted) now
   render as whole dollars, statements and folio charges correctly stayed at 2 decimals.

Bonus: re-running the a11y audit as part of verifying these fixes turned up one more
pre-existing violation on Concierge (two inline links only underlined on hover) — fixed
to match the always-underlined convention already used elsewhere in the app.

## What shipped from "next sprint"

Both forward-looking ideas below were picked up immediately rather than deferred:

- ✅ **Build out the staff side.** → [#14, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/14) — corrected the premise first:
  Concierge Desk turned out to already be a fully working triage queue, not a stub. The
  real gap was `/staff-dashboard`'s generic placeholder; it now shows a live
  Lodged/In-progress/Priority summary for signed-in Concierge-department staff, linking to
  the desk queue, without touching the two intentionally-separate staff-auth systems.
- ✅ **Carry the visible-logic idea further.** → [#15, closed](https://github.com/ashleyer/raff-res-hub-demo/issues/15) — Concierge requests and
  Governance measures now narrate their status/outcome in a short line, the same pattern
  "For You" already used.

---

*None of this reads as a portfolio piece pretending to be software. It reads as software
that happens to also be a portfolio piece — which is the harder thing to build.*
