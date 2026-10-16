import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { PortalProvider } from "@/lib/portal-store";
import { BuildingLinkProvider } from "@/integrations/buildinglink/provider";
import { Route as AboutRoute } from "./about-this-app";

/* The BuildingLink copy on the About page was supplied verbatim and must stay
   that way. JSX folds line breaks into single spaces, so compare collapsed text. */

const LIST_ITEM_TITLE = "Plays well with what the building already runs";
const LIST_ITEM_BODY =
  "A BuildingLink adapter reads the roster, announcements, and packages into this app, each labelled by source, and writes resident requests into the desk's existing queue. Anything that came from BuildingLink says so, with the time it was last synced, and the personnel dashboard shows every sync and what happened if one failed.";
const SECTION_EYEBROW = "How it fits the building";
const SECTION_HEADING = "Works alongside BuildingLink, not instead of it";
const SECTION_P1 =
  "The building's staff run on BuildingLink, and nothing here asks them to stop. BuildingLink stays the system of record for who lives where, packages, maintenance, and the front desk. This app is the resident-facing layer on top: reservations, concierge, community, governance, and the house account. The two talk through four narrow connections. The roster, announcements, and packages are read into the app and labelled by source. A request you lodge here is written into BuildingLink's queue, so staff keep one list, one status, and one history. Until BuildingLink grants that access, the same request reaches the desk by email with a reference number, and your receipt lives here either way.";
const SECTION_P2 =
  "What I will not do is log in as a resident to scrape data, keep a second copy of the roster, or write anything into BuildingLink beyond creating requests. The personnel dashboard shows every sync, when it last ran, and what the fallback did if it failed. A sync nobody can see is a sync nobody trusts.";

function renderAbout() {
  const AboutComponent = AboutRoute.options.component!;
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={new QueryClient()}>
        <PortalProvider>
          <BuildingLinkProvider>
            <Outlet />
          </BuildingLinkProvider>
        </PortalProvider>
      </QueryClientProvider>
    ),
  });
  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: AboutComponent,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([aboutRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<RouterProvider router={router as any} />);
}

const collapse = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

describe("About page BuildingLink copy", () => {
  it("carries the list item and the section verbatim, in the right places", async () => {
    renderAbout();
    const item = (await screen.findByRole("heading", { name: LIST_ITEM_TITLE })).closest("li")!;
    expect(collapse(item.querySelector("p")?.textContent)).toBe(LIST_ITEM_BODY);
    const features = screen.getByRole("list", { name: /what this demo does/i });
    const items = Array.from(features.querySelectorAll(":scope > li"));
    expect(items[items.length - 1]).toBe(item);

    const heading = screen.getByRole("heading", { name: SECTION_HEADING });
    const section = heading.closest("section")!;
    expect(collapse(section.querySelector(".eyebrow")?.textContent)).toBe(SECTION_EYEBROW);
    const paragraphs = Array.from(section.querySelectorAll(".measure > p")).map((p) =>
      collapse(p.textContent),
    );
    expect(paragraphs).toEqual([SECTION_P1, SECTION_P2]);

    const demoHeading = screen.getByRole("heading", { name: "What this demo does" });
    const whoHeading = screen.getByRole("heading", { name: "Meet Ashley Romano" });
    expect(
      demoHeading.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      heading.compareDocumentPosition(whoHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("notes the adapter's tests in the 'Built to hold up' item", async () => {
    renderAbout();
    const item = (await screen.findByRole("heading", { name: /Built to hold up/ })).closest("li")!;
    expect(item.textContent).toContain("The BuildingLink adapter is covered by unit tests too.");
  });
});
