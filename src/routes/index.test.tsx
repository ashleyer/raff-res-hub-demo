import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
import { Route as IndexRoute } from "./index";

/**
 * Renders the real Index route component inside a memory router so that any
 * missing/undefined component (e.g. AccountAccess) surfaces as a failing test
 * rather than a blank screen in production.
 */
function renderIndexRoute() {
  const IndexComponent = IndexRoute.options.component!;

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <PortalProvider>
          <Outlet />
        </PortalProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: IndexComponent,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<RouterProvider router={router as any} />);
}

describe("Index route", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders without reference errors", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderIndexRoute();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /resident account access/i })).toBeInTheDocument();
    });

    const referenceErrors = errorSpy.mock.calls.filter((call) =>
      call.some((arg) => String(arg).includes("is not defined")),
    );
    expect(referenceErrors).toHaveLength(0);
    errorSpy.mockRestore();
  });

  it("shows the sign-up card ahead of the sign-in card", async () => {
    renderIndexRoute();

    const signUpHeading = await screen.findByRole("heading", { name: /create your account/i });
    const signInHeading = await screen.findByRole("heading", { name: /resident sign in/i });

    expect(signUpHeading).toBeInTheDocument();
    expect(signInHeading).toBeInTheDocument();
    expect(
      signUpHeading.compareDocumentPosition(signInHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("links both cards to the login route with the right mode", async () => {
    renderIndexRoute();

    const section = (
      await screen.findByRole("heading", { name: /resident account access/i })
    ).closest("section")!;
    const within = (name: RegExp) =>
      Array.from(section.querySelectorAll("a")).find((a) => name.test(a.textContent ?? ""))!;
    const signUpLink = within(/^sign up$/i);
    const signInLink = within(/^sign in$/i);

    expect(signUpLink).toHaveAttribute("href", expect.stringContaining("/login"));
    expect(signUpLink.getAttribute("href")).toContain("signup");
    expect(signInLink.getAttribute("href")).toContain("signin");
  });
});
