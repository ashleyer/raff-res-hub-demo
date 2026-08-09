import { ExternalLink } from "lucide-react";
import { ForYou } from "@/components/ForYou";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroTower from "@/assets/hero-tower.jpg";
import residentsLounge from "@/assets/residents-lounge.jpg";
import longBar from "@/assets/long-bar.jpg";
import privateDining from "@/assets/private-dining.jpg";
import laPadrona from "@/assets/la-padrona.jpg";
import boardRoom from "@/assets/board-room.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";

import { HouseDirectory } from "@/components/HouseDirectory";
import { AccountAccess } from "@/components/AccountAccess";
import { ContactLink } from "@/components/ContactLink";
import { RouteErrorFallback, RouteNotFound } from "@/components/RouteErrorFallback";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raffles Boston Residences — Residents' Intranet" },
      {
        name: "description",
        content:
          "Private portal for Raffles Boston Residences: board broadcasts, amenity reservations, house account, concierge services, directory and the member forum.",
      },
      { property: "og:title", content: "Raffles Boston Residences — Residents' Intranet" },
      {
        property: "og:description",
        content:
          "Board broadcasts, reservations, house account, concierge services and the resident community register for 40 Trinity Place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  errorComponent: RouteErrorFallback,
  notFoundComponent: RouteNotFound,
});

const PATHS = [
  {
    to: "/amenities",
    image: residentsLounge,
    alt: "The Residents' Lounge on floor twenty-one, set for morning coffee",
    eyebrow: "Reservations",
    title: "Amenities",
    cta: "Reserve",
  },
  {
    to: "/events",
    image: longBar,
    alt: "The Long Bar dressed for a resident gathering",
    eyebrow: "Resident Life",
    title: "Events",
    cta: "See the calendar",
  },
  {
    to: "/services",
    image: privateDining,
    alt: "A private dining table laid in a residence",
    eyebrow: "In Residence",
    title: "Concierge",
    cta: "Make a request",
  },
  {
    to: "/community",
    image: laPadrona,
    alt: "Residents in conversation at a warmly lit dining room",
    eyebrow: "Community",
    title: "Neighbours",
    cta: "Enter the community",
  },
  {
    to: "/management",
    image: boardRoom,
    alt: "The residents' boardroom at dusk",
    eyebrow: "Governance",
    title: "The Board",
    cta: "Meet the board",
  },
] as const;

function Index() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <SiteHeader variant="overlay" />

      {/* Cinematic full-viewport opening */}
      <section className="chrome-dark relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden">
        <img
          src={heroTower}
          alt="The Raffles Residences Boston at 40 Trinity Place, illuminated above Back Bay at dusk"
          width={1600}
          height={912}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="panel-scrim absolute inset-0 -z-10" />

        <div />

        <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
          <Reveal>
            <h1 className="font-display text-[clamp(2rem,6.4vw,5rem)] leading-[1.06] tracking-[0.06em] uppercase">
              For Your Home in Boston
            </h1>
            <p className="mt-5 text-[0.7rem] tracking-[0.34em] uppercase sm:text-xs">
              Cultivated around the world
            </p>
            <p className="measure mx-auto mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The Secure Intra-Resident Portal for Raffles Residences Boston at Forty Trinity Place
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col items-center gap-4 pb-10 sm:pb-14">
          <a
            href="#select-your-path"
            className="script inline-flex min-h-11 items-center text-xl sm:text-2xl"
          >
            Select your path
          </a>
          <span className="scroll-cue-line" aria-hidden="true" />
        </div>
      </section>

      <main id="main-content" className="flex-1">
        <h2 id="select-your-path" className="sr-only">
          Select your path
        </h2>

        {/* Full-bleed panels, one per portal territory */}
        {PATHS.map((p, i) => (
          <section
            key={p.to}
            aria-labelledby={`panel-${p.to.slice(1)}`}
            className="chrome-dark relative isolate flex min-h-[82svh] items-end overflow-hidden"
          >
            <img
              src={p.image}
              alt={p.alt}
              width={1600}
              height={1000}
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <div className="panel-scrim absolute inset-0 -z-10" />

            <div className="mx-auto w-full max-w-7xl px-5 pt-24 pb-14 sm:px-8 sm:pb-20">
              <Reveal
                className={i % 2 === 1 ? "sm:ml-auto sm:max-w-xl sm:text-right" : "sm:max-w-xl"}
              >
                <p className="eyebrow">{p.eyebrow}</p>
                <h3 id={`panel-${p.to.slice(1)}`} className="display-section mt-4">
                  {p.title}
                </h3>
                <Link to={p.to} className="btn-outline mt-8">
                  {p.cta}
                </Link>
              </Reveal>
            </div>
          </section>
        ))}
        <section className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <ForYou variant="band" />
        </section>

        <AccountAccess />

        <section
          aria-label="Contact the residences team"
          className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-20 sm:px-8 md:grid-cols-2"
        >
          <div className="flex flex-col border border-border bg-card px-5 py-8 text-center sm:px-10 md:col-span-2">
            <p className="eyebrow">At your service</p>
            <h2 id="contact-concierge" className="mt-3 text-balance text-xl sm:text-2xl">
              Contact the concierge
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              Reservations, deliveries, transport or anything else — the desk replies daily.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ContactLink
                href="tel:+16175891480"
                value="617-589-1480"
                kind="tel"
                className="btn-outline w-full sm:w-auto"
                ariaLabel="Call the concierge at 617-589-1480"
              >
                617-589-1480
              </ContactLink>
              <ContactLink
                href="mailto:ResidencesConcierge.Boston@raffles.com?subject=Resident%20request"
                value="ResidencesConcierge.Boston@raffles.com"
                kind="mail"
                className="btn-outline w-full sm:w-auto"
                ariaLabel="Email the concierge at Residences Concierge dot Boston at raffles dot com"
              >
                ResidencesConcierge.Boston@raffles.com
              </ContactLink>
            </div>
          </div>

          <div className="flex flex-col border border-border bg-card px-5 py-8 text-center sm:px-10 md:col-span-2">
            <p className="eyebrow">Resident benefit</p>
            <h2 id="accor-loyalty" className="mt-3 text-balance text-xl sm:text-2xl">
              ALL — Accor Live Limitless
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              Live a rewarding life while exploring the world. Residents may enrol in Accor&rsquo;s
              loyalty programme for points, member rates and recognition across Raffles and the
              wider Accor collection.
            </p>
            <a
              href="https://all.accor.com/a/en/loyalty-program/accor-live-limitless-hotel-loyalty-program.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-6 w-full self-center sm:w-auto"
            >
              Explore the loyalty programme
              <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </section>

        <HouseDirectory />
      </main>

      <SiteFooter />
    </div>
  );
}
