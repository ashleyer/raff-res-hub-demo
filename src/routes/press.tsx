import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  PRESS_CONTACT,
  PRESS_ITEMS,
  PRESS_ROOM_URL,
  PRESS_SCOPES,
  type PressScope,
} from "@/lib/press-data";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "In the Press · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "National and international coverage of Raffles Boston: Travel + Leisure, Esquire, Condé Nast Traveler, Forbes, Robb Report, Architectural Digest and more.",
      },
      { property: "og:title", content: "In the Press · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Where Raffles Boston, its residences, restaurants and spa have been written about around the world.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PressPage,
});

function PressPage() {
  const [scope, setScope] = useState<PressScope | "All">("All");

  const items = useMemo(() => {
    const list = scope === "All" ? PRESS_ITEMS : PRESS_ITEMS.filter((i) => i.scope === scope);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [scope]);

  const featured = PRESS_ITEMS.filter((i) => i.featured);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="section-band border-b border-border">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="eyebrow">40 Trinity Place</p>
            <h1 className="display-section mt-4">In the press</h1>
            <p className="measure mt-6 text-base leading-relaxed text-muted-foreground">
              Coverage of Raffles Boston (the hotel, the residences, Long Bar, La Padrona, Blind
              Duck, the Guerlain Spa and the patisserie) as gathered in the building's official
              press room. Each headline links to the article as published.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-muted-foreground">
              Press enquiries: {PRESS_CONTACT}
              <span className="text-[0.625rem] font-medium tracking-[0.1em] text-destructive uppercase">
                Demo contact only
              </span>
            </p>
          </div>
        </section>

        {/* Featured */}
        <section className="section-band border-b border-border">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="eyebrow">Selected coverage</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item) => (
                <li key={item.url + item.title} className="border border-border bg-card p-6">
                  <p className="eyebrow">{item.outlet}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl leading-snug font-light">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {item.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </h3>
                  <p className="mt-4 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    {item.dateLabel}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Archive */}
        <section className="section-band">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="display-section text-3xl">Press archive</h2>
              <div
                role="group"
                aria-label="Filter coverage by reach"
                className="flex flex-wrap gap-2"
              >
                {(["All", ...PRESS_SCOPES] as const).map((s) => {
                  const active = scope === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScope(s)}
                      aria-pressed={active}
                      className={`min-h-11 border px-4 text-[0.6875rem] tracking-[0.18em] uppercase transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="mt-10 divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.url + item.title}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-11 flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8"
                  >
                    <span className="eyebrow shrink-0 sm:w-56">{item.outlet}</span>
                    <span className="flex-1 text-base leading-relaxed underline-offset-4 group-hover:underline">
                      {item.title}
                      <ExternalLink
                        className="ml-2 inline h-3 w-3 align-baseline"
                        aria-hidden="true"
                      />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                    <span className="shrink-0 text-xs tracking-[0.18em] text-muted-foreground uppercase sm:w-40 sm:text-right">
                      {item.dateLabel}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={PRESS_ROOM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-10 w-full sm:w-auto"
            >
              View the full press room
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
