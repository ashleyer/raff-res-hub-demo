import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/NotificationBell";
import { usePortal } from "@/lib/portal-store";
import { AboutAppLink } from "@/components/AboutAppLink";
import rafflesLogo from "@/assets/raffles-logo.png";

const NAV_GROUPS = [
  {
    heading: "The Residence",
    items: [
      { label: "Residence", to: "/" },
      { label: "Chosen for you", to: "/for-you" },
      { label: "Amenities", to: "/amenities" },
      { label: "Events", to: "/events" },
      { label: "Concierge", to: "/concierge" },
      { label: "In the press", to: "/press" },
      { label: "About Raffles", to: "/about-raffles" },
    ],
  },
  {
    heading: "In Residence",
    items: [
      { label: "Services", to: "/services" },
      { label: "Hotel bridge", to: "/hotel-bridge" },
      { label: "House account", to: "/account" },

      { label: "Directory", to: "/directory" },
      { label: "Messages", to: "/messages" },
      { label: "Sales & leasing", to: "/sales-and-leasing" },
    ],
  },
  {
    heading: "Community",
    items: [
      { label: "Community", to: "/community" },
      { label: "Residence gallery", to: "/gallery" },
      { label: "Social", to: "/social" },
      { label: "Thank you notes", to: "/gratitude" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "Proposals", to: "/proposals" },
      {
        label: "Instagram",
        href: "https://www.instagram.com/rafflesresidencesboston/",
      },
    ],
  },

  {
    heading: "Governance",
    items: [
      { label: "Governance", to: "/governance" },
      { label: "Management", to: "/management" },
    ],
  },
] as const;

const PRIMARY = [
  { label: "Amenities", to: "/amenities" },
  { label: "Events", to: "/events" },
  { label: "Services", to: "/services" },
  { label: "Community", to: "/community" },
] as const;

export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "overlay" }) {
  const [open, setOpen] = useState(false);
  const { currentUser, signOut } = usePortal();
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlay = variant === "overlay";

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={
          overlay
            ? "chrome-dark absolute inset-x-0 top-0 z-40 bg-transparent"
            : "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm"
        }
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 px-5 py-4 sm:px-8 md:py-6">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="primary-navigation"
              className="nav-link inline-flex min-h-11 items-center gap-3"
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
              </span>
              <span className="hidden sm:inline">Menu</span>
              <span className="sr-only sm:hidden">Open navigation menu</span>
            </button>
          </div>

          <Link
            to="/"
            className="justify-self-center"
            aria-label="The Raffles Residences Boston, home"
          >
            <img
              src={rafflesLogo}
              alt="The Raffles Residences Boston"
              width={1200}
              height={896}
              className={`h-14 w-auto sm:h-16 md:h-20 ${overlay ? "brightness-0 invert" : ""}`}
            />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/directory"
                  hash="my-profile"
                  className="nav-link hidden min-h-11 items-center sm:inline-flex"
                >
                  {currentUser.unit}
                </Link>
                <NotificationBell />

                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    toast.success("Signed out. Your details are saved; just sign in next time.");
                  }}
                  className="btn-outline shrink-0 whitespace-nowrap"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Link
                  to="/login"
                  search={{ mode: "signin" }}
                  className="btn-outline shrink-0 justify-center text-center whitespace-nowrap"
                >
                  <span className="lg:hidden">Sign in</span>
                  <span className="hidden lg:inline">Resident sign in</span>
                </Link>
                <Link
                  to="/login"
                  search={{ mode: "signup" }}
                  className="btn-outline shrink-0 justify-center text-center whitespace-nowrap"
                >
                  <span className="lg:hidden">Sign up</span>
                  <span className="hidden lg:inline">Resident sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Slim desktop rail of primary destinations */}
        {!overlay && (
          <nav aria-label="Featured sections" className="hidden border-t border-border lg:block">
            <ul className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-8 py-3">
              {PRIMARY.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeProps={{ className: "nav-link is-active", "aria-current": "page" }}
                    className="nav-link inline-flex min-h-11 items-center"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Full-screen navigation overlay */}
      <div
        id="primary-navigation"
        hidden={!open}
        className="fixed inset-0 z-50 overflow-y-auto bg-background"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 md:py-6">
          <img src={rafflesLogo} alt="" aria-hidden="true" className="h-14 w-auto sm:h-16" />
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="nav-link inline-flex min-h-11 min-w-11 items-center justify-center gap-3"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close navigation menu</span>
          </button>
        </div>

        <nav aria-label="Primary" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="grid gap-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading}>
                <p className="eyebrow">{group.heading}</p>
                <ul className="mt-5 space-y-1">
                  {group.items.map((item) =>
                    "href" in item ? (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 items-center gap-2 font-display text-2xl transition-colors hover:text-primary sm:text-3xl"
                        >
                          {item.label}
                          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ) : (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          activeOptions={{ exact: item.to === "/" }}
                          activeProps={{ className: "text-primary", "aria-current": "page" }}
                          className="flex min-h-11 items-center font-display text-2xl transition-colors hover:text-primary sm:text-3xl"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-border pt-8 text-center">
            <AboutAppLink
              className="inline-flex min-h-11 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            />
          </div>
        </nav>
      </div>
    </>
  );
}
