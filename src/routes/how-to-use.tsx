import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Compass,
  Heart,
  KeyRound,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Vote,
  Wrench,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DEMO_ACCOUNT, DEMO_PASSCODE } from "@/lib/portal-data";

export const Route = createFileRoute("/how-to-use")({
  head: () => ({
    meta: [
      { title: "How to Use This Site, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "A quick orientation to the Raffles Boston Residences demo portal: how to sign in, what each area does, and what to try first.",
      },
      { property: "og:title", content: "How to Use This Site, Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Login directions, demo accounts and a tour of the residents' portal, all on one page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowToUsePage,
});

const TOUR: { icon: typeof Sparkles; title: string; body: string; to?: string }[] = [
  {
    icon: CalendarDays,
    title: "Amenities & events",
    body: "Reserve the Residents' Lounge, Nantucket Kitchen, Secret Garden Room, sports simulator or Emerald Lounge, and see which spaces are privately booked over the coming month. RSVP to house events on the Events page, or propose a gathering of your own for neighbours to upvote.",
    to: "/events",
  },
  {
    icon: Users,
    title: "Directory & messages",
    body: "The residents' directory is strictly opt-in: every household decides whether to be listed and whether neighbours can message them directly. Sign in, visit your profile on the Directory page, and switch on whatever you are comfortable sharing.",
    to: "/directory",
  },
  {
    icon: Heart,
    title: "Thank you notes",
    body: "The gratitude board credits the people and places that make the building run: staff, neighbours, pets, spaces and favourite Boston spots, with an optional photo or video attached. Signed or anonymous, every note is copied to the residences manager.",
    to: "/gratitude",
  },
  {
    icon: Vote,
    title: "Governance & proposals",
    body: "Board measures, live ballots and the governing documents sit in one place: one vote per residence, counted transparently. The Proposals page is where building suggestions gather neighbour support before the Board sees them.",
    to: "/governance",
  },
  {
    icon: MessageSquare,
    title: "Concierge desk",
    body: "Housekeeping, valet, guest arrivals, a security concern: lodge it with the concierge desk and get an on-screen receipt rather than hoping an email landed. The security alert button in the footer of every page is for anything that cannot wait.",
    to: "/concierge",
  },
  {
    icon: Wrench,
    title: "The hotel bridge",
    body: "A simulated bridge into the hotel's own systems: folios, priority tables and in-residence delivery, showing what a genuinely connected residence and hotel experience could feel like.",
    to: "/hotel-bridge",
  },
];

function HowToUsePage() {
  return (
    <PageShell
      eyebrow="Orientation"
      title="How to use this site"
      intro="Everything on this demo can be clicked, booked, posted or voted on, and nothing leaves your browser. This page is the two-minute orientation: how to get in, what each area does, and where to look first."
    >
      <section aria-labelledby="login-heading" className="mt-16 border-t border-border pt-14">
        <p className="eyebrow">First things first</p>
        <h2 id="login-heading" className="mt-3 font-display text-4xl sm:text-5xl">
          Getting signed in
        </h2>
        <div className="gold-rule mt-5" />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="border border-border bg-card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl leading-snug">The open demo account</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              The fastest way in: email{" "}
              <span className="font-medium text-foreground">{DEMO_ACCOUNT.email}</span> with
              password <span className="font-medium text-foreground">{DEMO_ACCOUNT.password}</span>.
              No residence number is required, and no sign-up at all. A few areas are limited in the
              demo login, but most of the portal opens up.
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl leading-snug">Register your own account</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Prefer the full experience? Create an account with any name, residence number, contact
              detail and password of your choosing. It is remembered on this device until you sign
              out, and unlocks the directory, gratitude board, gallery and messages exactly as a
              real resident account would.
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl leading-snug">Sessions, passcodes & resets</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              A session lasts 12 hours; "Remember me" pre-fills your details on this device for 30
              days. The demonstration residences share the preview passcode{" "}
              <span className="font-medium text-foreground">{DEMO_PASSCODE}</span>, and the password
              reset flow is fully simulated on screen. Raffles personnel use the separate staff
              sign-in linked in the footer.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="tour-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow">The grand tour</p>
        <h2 id="tour-heading" className="mt-3 font-display text-4xl sm:text-5xl">
          What each area does
        </h2>
        <div className="gold-rule mt-5" />
        <ul
          aria-labelledby="tour-heading"
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TOUR.map((t) => (
            <li key={t.title} className="flex flex-col border border-border bg-card p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10">
                <t.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl leading-snug">{t.title}</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
                {t.body}
              </p>
              {t.to && (
                <Link
                  to={t.to}
                  className="nav-link mt-4 inline-flex min-h-11 items-center text-sm text-primary"
                >
                  Visit this area
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="good-to-know-heading"
        className="mt-20 border-t border-border pt-14"
      >
        <p className="eyebrow">Good to know</p>
        <h2 id="good-to-know-heading" className="mt-3 font-display text-4xl sm:text-5xl">
          A few honest notes
        </h2>
        <div className="gold-rule mt-5" />
        <div className="measure mt-8 space-y-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
          <p>
            This is a demonstration, not a production system. Everything you post, book or vote on
            lives only in your browser and resets when the page reloads; nothing is sent to a
            server, and the named residents are fictional profiles rather than real neighbours.
          </p>
          <p>
            The site is built to load correctly on every screen size, from a phone held in one hand
            to a wide desktop monitor, and to meet WCAG 2.2 AA accessibility guidance throughout.
            Automated visual, unit and accessibility checks run against this codebase the same way
            they would for a production product.
          </p>
          <p>
            Curious why any of this exists?{" "}
            <Link to="/about-this-app" className="text-primary underline underline-offset-4">
              Read the story behind the app
            </Link>
            , or say hello directly via the contact links at the bottom of that page.
          </p>
          <p className="border-l-2 border-primary/50 pl-5 italic">
            <Compass className="mr-2 inline h-4 w-4 text-primary" aria-hidden="true" />
            Suggested first stops: sign in with the demo account, RSVP to an event, thank someone on
            the gratitude board, and cast a vote on an open measure. Four clicks and you will have
            seen the whole idea.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="explore-heading"
        className="mt-20 border-t border-border pt-14 text-center"
      >
        <h2 id="explore-heading" className="font-display text-3xl sm:text-4xl">
          Ready when you are
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
          <Link
            to="/login"
            search={{ mode: "signin" }}
            className="btn-outline inline-flex min-h-12 items-center justify-center px-8"
          >
            Sign in to explore
          </Link>
          <Link
            to="/login"
            search={{ mode: "signup" }}
            className="nav-link inline-flex min-h-11 items-center text-base text-foreground hover:text-primary"
          >
            <MapPin className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Or create an account first
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
