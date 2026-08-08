import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import rafflesLogo from "@/assets/raffles-logo.png";
import { NotifySecurity } from "@/components/NotifySecurity";
import { ContactLink } from "@/components/ContactLink";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SiteFooter() {
  const [devOpen, setDevOpen] = useState(false);
  return (
    <footer className="chrome-dark mt-24">
      <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8">
        <img
          src={rafflesLogo}
          alt="The Raffles Residences Boston"
          loading="lazy"
          width={1200}
          height={896}
          className="mx-auto h-16 w-auto invert sm:h-20"
        />
        <div className="mx-auto mt-10 h-px w-16 bg-border" />
        <p className="mx-auto mt-8 max-w-xl text-[0.6875rem] leading-loose tracking-[0.22em] text-muted-foreground uppercase">
          40 Trinity Place · Back Bay · Boston, Massachusetts 02116
          <span className="mt-2 block">Private Residents' Portal</span>
        </p>

        <div className="mx-auto mt-8 grid grid-cols-1 gap-y-1 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-8">
          <ContactLink
            href="tel:+16175891480"
            value="617-589-1480"
            kind="tel"
            ariaLabel="Call the Concierge at 617-589-1480"
            className="nav-link inline-flex min-h-12 w-full items-center justify-center px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:px-0"
          >
            Concierge · 617-589-1480
          </ContactLink>
          <ContactLink
            href="mailto:ResidencesConcierge.Boston@raffles.com"
            value="ResidencesConcierge.Boston@raffles.com"
            kind="mail"
            ariaLabel="Email the Concierge at ResidencesConcierge.Boston@raffles.com"
            className="nav-link inline-flex min-h-12 w-full items-center justify-center px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:px-0"
          >
            ResidencesConcierge.Boston@raffles.com
          </ContactLink>
        </div>

        <NotifySecurity className="btn-outline mx-auto mt-8 w-full max-w-xs sm:w-auto" />

        <nav
          aria-label="Raffles personnel access"
          className="mx-auto mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/staff-signup"
            className="btn-outline inline-flex min-h-12 w-full max-w-xs items-center justify-center px-5 text-center sm:w-auto"
          >
            Raffles Personnel Sign Up
          </Link>
          <Link
            to="/staff-signin"
            className="btn-outline inline-flex min-h-12 w-full max-w-xs items-center justify-center px-5 text-center sm:w-auto"
          >
            Raffles Personnel Sign In
          </Link>
        </nav>

        <nav aria-label="Raffles websites and resident pages" className="mx-auto mt-10 max-w-xl">
          <ul className="grid grid-cols-1 gap-y-1 divide-y divide-border/60 border-y border-border/60 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-3 sm:divide-y-0 sm:border-0">
            <li className="w-full sm:w-auto">
              <a
                href="https://rafflesresidencesboston.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Raffles Residences Boston Public Site
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li className="w-full sm:w-auto">
              <a
                href="https://www.raffles.com/boston/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Raffles Boston Hotel
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li className="w-full sm:w-auto">
              <a
                href="https://all.accor.com/loyalty-program/index.en.shtml"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                ALL — Accor loyalty
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li className="w-full sm:w-auto">
              <Link
                to="/press"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                In the press
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <Link
                to="/about-raffles"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                About Raffles
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <Link
                to="/sales-and-leasing"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Sales & leasing
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <Link
                to="/gallery"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Residence gallery
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <Link
                to="/gratitude"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Thank you notes
              </Link>
            </li>
            <li className="w-full sm:w-auto">
              <a
                href="https://www.instagram.com/rafflesresidencesboston/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex min-h-12 w-full items-center justify-center gap-2 px-3 text-center text-balance text-muted-foreground hover:text-foreground sm:min-h-11 sm:w-auto sm:justify-start sm:px-0"
              >
                Instagram
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>

        <p className="measure mx-auto mt-8 text-xs leading-relaxed text-muted-foreground">
          Preview environment — resident data shown here is illustrative and resets when the page
          reloads.
        </p>

        <nav aria-label="Legal" className="mx-auto mt-6 border-t border-border pt-5">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.6875rem] tracking-[0.16em] uppercase">
            <li>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:underline"
              >
                Privacy Policy
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              ·
            </li>
            <li>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:underline"
              >
                Terms
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>

        <p
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
          className="mt-10 text-[0.6875rem] text-[oklch(1_0_0)]"
        >
          built with{" "}
          <span role="img" aria-label="white heart">
            🤍
          </span>{" "}
          in Raffles Residences Boston, Unit 22H by{" "}
          <button
            type="button"
            onClick={() => setDevOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={devOpen}
            aria-label="Ashley Romano — contact the developer"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:no-underline"
          >
            Ashley Romano
          </button>
        </p>
      </div>

      <Dialog open={devOpen} onOpenChange={setDevOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              GitHub Repo/Comments/Questions for Dev?
            </DialogTitle>
          </DialogHeader>
          <ul className="space-y-3 text-sm">
            <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a className="text-primary underline underline-offset-4" href="tel:+19788575775">
                Call or text: 978-857-5775
              </a>
              <button
                type="button"
                onClick={async () => {
                  const number = "978-857-5775";
                  const legacyCopy = () => {
                    const el = document.createElement("textarea");
                    el.value = number;
                    el.setAttribute("readonly", "");
                    el.style.position = "fixed";
                    el.style.opacity = "0";
                    document.body.appendChild(el);
                    el.select();
                    const ok = document.execCommand("copy");
                    document.body.removeChild(el);
                    return ok;
                  };
                  try {
                    await navigator.clipboard.writeText(number);
                    toast.success(`Copied ${number}`);
                  } catch {
                    if (legacyCopy()) {
                      toast.success(`Copied ${number}`);
                    } else {
                      toast.info(`Copy unavailable — the number is ${number}`);
                    }
                  }
                }}

                className="inline-flex min-h-11 items-center gap-1.5 text-xs tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy phone number
              </button>
            </li>
          </ul>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
