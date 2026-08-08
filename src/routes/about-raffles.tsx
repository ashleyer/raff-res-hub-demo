import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { RAFFLES_NEWS, RAFFLES_STORY } from "@/lib/brand-data";
import heritageImg from "@/assets/raffles-heritage.jpg";

export const Route = createFileRoute("/about-raffles")({
  head: () => ({
    meta: [
      { title: "About Raffles — Heritage, Houses & Openings" },
      {
        name: "description",
        content:
          "The Raffles story from 1887 Singapore to Boston's Back Bay, plus openings and news from Raffles hotels and residences worldwide.",
      },
      { property: "og:title", content: "About Raffles — Heritage, Houses & Openings" },
      {
        property: "og:description",
        content:
          "A short history of the Raffles brand and the latest openings across its hotels and residences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutRafflesPage,
});

function AboutRafflesPage() {
  return (
    <PageShell
      eyebrow="The Brand"
      title="About Raffles"
      intro="Raffles has kept the same promise since a ten-room bungalow opened on Beach Road in 1887: a house of its city, run with unhurried personal service. Boston is the brand's first address in North America."
    >
      <figure className="mt-12">
        <img
          src={heritageImg}
          alt="A colonnaded Raffles-style heritage hotel at golden hour"
          width={1200}
          height={800}
          loading="lazy"
          className="aspect-[3/2] w-full border border-border object-cover"
        />
        <figcaption className="mt-3 text-xs text-muted-foreground">
          The colonial house that gave the collection its character. Illustrative image.
        </figcaption>
      </figure>

      <section aria-labelledby="story-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow">Heritage</p>
        <h2 id="story-heading" className="mt-3 text-3xl">
          A short history
        </h2>
        <div className="gold-rule mt-4" />
        <ol className="mt-8 space-y-6">
          {RAFFLES_STORY.map((m) => (
            <li
              key={m.year}
              className="grid gap-3 border-b border-border pb-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
            >
              <p className="font-display text-3xl text-primary">{m.year}</p>
              <div>
                <h3 className="text-xl">{m.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {m.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="news-heading" className="mt-20 border-t border-border pt-14">
        <p className="eyebrow">Across the collection</p>
        <h2 id="news-heading" className="mt-3 text-3xl">
          Openings & brand news
        </h2>
        <div className="gold-rule mt-4" />
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {RAFFLES_NEWS.map((n) => (
            <li key={n.id} className="flex h-full flex-col border border-border bg-card p-6">
              <p className="text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                {n.where} · {n.when}
              </p>
              <h3 className="mt-3 text-balance text-xl leading-snug">{n.headline}</h3>
              <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                {n.detail}
              </p>
              <a
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-6 self-start"
              >
                Read more
                <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
