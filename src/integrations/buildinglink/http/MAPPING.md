# HTTP client mapping

Status of every adapter method against what BuildingLink has said it offers. Nothing in this table is confirmed against a real endpoint. The Hub paths are the Hub's own backend proxy, which is not built yet. BuildingLink's paths, field names, auth, and rate limits are unknown to this project and are not guessed anywhere in the code.

Source for the capability column: BuildingLink's "For Developers" page, read on 16 October 2026 at `prelive.buildinglink.com/Public/buildinglink/TechnologyAndInnovation/Developers.aspx`. It describes an API interface for importing calendar events, announcements, package information, and reservation availability into outside developer programs, and says maintenance request data can be imported into BuildingLink from an external program. It does not list a resident roster read, and it does not say how access is granted or whether endpoint documentation exists.

| Adapter method                   | Hub proxy path                               | BuildingLink capability it depends on                                                                                                                                                   | Status         | Works today through                                                |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------ |
| `getRoster()`                    | `GET /api/buildinglink/roster`               | Not listed on the developer page. Resident lists are described as imported into BuildingLink from accounting systems, not read out. Confirm with BuildingLink when access is requested. | pending access | Mock roster built from the demo's fictional residents              |
| `verifyResident(unit, lastName)` | `POST /api/buildinglink/roster/verify`       | Same as above. The proxy would match server-side so the browser never holds the roster.                                                                                                 | pending access | Mock match, and the desk's verification queue                      |
| `listAnnouncements(since)`       | `GET /api/buildinglink/announcements`        | "Announcements" in the API interface list.                                                                                                                                              | pending access | Mock notices, labelled "Posted via BuildingLink"                   |
| `listEvents(range)`              | `GET /api/buildinglink/events`               | "Calendar events" in the API interface list.                                                                                                                                            | pending access | Mock calendar, labelled "From the building calendar"               |
| `listPackages(unitId)`           | `GET /api/buildinglink/packages`             | "Packages info" in the API interface list. A per-unit filter is assumed, not confirmed.                                                                                                 | pending access | Mock log, labelled "Logged by the desk"                            |
| `createServiceRequest(input)`    | `POST /api/buildinglink/service-requests`    | "Maintenance requests ... imported from an external program." Whether the import accepts non-maintenance categories (floristry, valet) is not stated.                                   | pending access | Desk email with an `RRH-YYYYMMDD-NNN` reference (`../fallback.ts`) |
| `getServiceRequest(id)`          | `GET /api/buildinglink/service-requests/:id` | Status read-back after import is not described.                                                                                                                                         | pending access | Mock status that advances on a clock                               |
| `listServiceRequests(filter)`    | `GET /api/buildinglink/service-requests`     | Not described. Needed only for the personnel dashboard.                                                                                                                                 | pending access | Mock list, desk-logged items labelled                              |
| `getSyncStatus()`                | `GET /api/buildinglink/sync`                 | None. This is the proxy's own bookkeeping.                                                                                                                                              | pending proxy  | Mock records computed from the clock                               |
| `retrySync(flow, itemId)`        | `POST /api/buildinglink/sync/:flow/retry`    | None. Proxy bookkeeping.                                                                                                                                                                | pending proxy  | Mock clears the simulated failure                                  |

Reservation availability is the one listed capability the Hub does not use. Amenity reservations stay Hub-native in this pass.

## What the proxy must guarantee

- Holds the building's property-level BuildingLink credential. The browser never sees it. The only variable the front end reads is `VITE_BUILDINGLINK_MODE`.
- Answers JSON on every route. Anything else, including the app's own 404 page, is read by the client as "proxy absent" and the hooks fall back.
- Writes nothing into BuildingLink except service requests.
- Keeps the sync log, because a sync nobody can see is a sync nobody trusts.

## TODO markers

Every method in `client.ts` carries a `TODO(buildinglink)` comment at the line where the real field mapping goes. Search for that string before the first live test.
