import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { SiteHeader } from "./SiteHeader";

/**
 * The header's mobile/desktop layout switch is pure CSS (Tailwind breakpoint
 * classes) — jsdom doesn't evaluate @media queries, so that's covered by the
 * real-browser geometry checks in scripts/visual-header.mjs instead. What
 * belongs here is behavior jsdom *can* verify: the nav overlay's open/close
 * state, focus management, and keyboard/UX flow.
 */

const { signOutMock, usePortalMock, toastSuccessMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  usePortalMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("@/lib/portal-store", () => ({
  usePortal: () => usePortalMock(),
}));

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccessMock(...args), error: vi.fn() },
}));

function renderHeader() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: SiteHeader,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(<RouterProvider router={router as any} />);
}

function mockSignedOut() {
  usePortalMock.mockReturnValue({
    currentUser: null,
    signOut: signOutMock,
    notifications: [],
    unreadNotifications: 0,
    markNotificationsRead: vi.fn(),
    dismissNotification: vi.fn(),
  });
}

function mockSignedIn() {
  usePortalMock.mockReturnValue({
    currentUser: { id: "res-1", name: "A. Romano", unit: "22H", email: "a@example.test" },
    signOut: signOutMock,
    notifications: [],
    unreadNotifications: 0,
    markNotificationsRead: vi.fn(),
    dismissNotification: vi.fn(),
  });
}

describe("SiteHeader", () => {
  beforeEach(() => {
    signOutMock.mockClear();
    toastSuccessMock.mockClear();
    document.body.style.overflow = "";
  });

  it("shows resident sign-in and sign-up links to the right routes when signed out", async () => {
    mockSignedOut();
    renderHeader();

    const signInLink = await screen.findByRole("link", { name: /resident sign in/i });
    const signUpLink = screen.getByRole("link", { name: /resident sign up/i });

    expect(signInLink.getAttribute("href")).toContain("/login");
    expect(signInLink.getAttribute("href")).toContain("signin");
    expect(signUpLink.getAttribute("href")).toContain("/login");
    expect(signUpLink.getAttribute("href")).toContain("signup");
  });

  it("opens the primary navigation overlay, moves focus to Close, and closes on Escape", async () => {
    mockSignedOut();
    const user = userEvent.setup();
    renderHeader();

    const menuButton = await screen.findByRole("button", { name: /open navigation menu|^menu$/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    const nav = document.querySelector("#primary-navigation") as HTMLElement;
    expect(nav).toHaveAttribute("hidden");

    await user.click(menuButton);

    expect(nav).not.toHaveAttribute("hidden");
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");

    const closeButton = await screen.findByRole("button", { name: /close navigation menu/i });
    await waitFor(() => expect(closeButton).toHaveFocus());

    await user.keyboard("{Escape}");

    await waitFor(() => expect(nav).toHaveAttribute("hidden"));
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the overlay when a nav link inside it is activated", async () => {
    mockSignedOut();
    const user = userEvent.setup();
    renderHeader();

    const menuButton = await screen.findByRole("button", { name: /open navigation menu|^menu$/i });
    await user.click(menuButton);
    const nav = document.querySelector("#primary-navigation") as HTMLElement;
    expect(nav).not.toHaveAttribute("hidden");

    const amenitiesLinks = screen.getAllByRole("link", { name: /^amenities$/i });
    await user.click(amenitiesLinks[amenitiesLinks.length - 1]!);

    await waitFor(() => expect(nav).toHaveAttribute("hidden"));
  });

  it("shows the resident's unit and signs out on request when signed in", async () => {
    mockSignedIn();
    const user = userEvent.setup();
    renderHeader();

    expect(await screen.findByRole("link", { name: "22H" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /resident sign in/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledTimes(1);
  });
});
