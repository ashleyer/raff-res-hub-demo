import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Gavel } from "lucide-react";
import { toast } from "sonner";
import { GOVERNANCE_DOCUMENTS, MEASURES, type GovernanceMeasure } from "@/lib/intranet-data";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResidenceHandbook } from "@/components/ResidenceHandbook";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance & Ballots — Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Board measures, ballot standings and governing documents for deed-holders of Raffles Boston Residences.",
      },
      { property: "og:title", content: "Governance & Ballots — Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Trustee measures, resident ballots and the residence's governing instruments.",
      },
    ],
  }),
  component: GovernancePage,
});

function GovernancePage() {
  const [measures, setMeasures] = useState<GovernanceMeasure[]>(MEASURES);
  const [ballots, setBallots] = useState<Record<number, "for" | "against">>({});

  const cast = (m: GovernanceMeasure, choice: "for" | "against") => {
    if (m.status !== "Open for ballot") {
      toast.error("This measure is not open for ballot.");
      return;
    }
    if (ballots[m.id]) {
      toast.error("Your ballot for this measure is already recorded.");
      return;
    }
    setBallots((prev) => ({ ...prev, [m.id]: choice }));
    setMeasures((prev) =>
      prev.map((x) =>
        x.id === m.id
          ? {
              ...x,
              inFavour: x.inFavour + (choice === "for" ? 1 : 0),
              against: x.against + (choice === "against" ? 1 : 0),
            }
          : x,
      ),
    );
    toast.success(
      `Ballot recorded — ${choice === "for" ? "in favour" : "against"} ${m.reference}.`,
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 md:py-20"
      >
        <p className="eyebrow">Board of Trustees</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Governance & ballots</h1>
        <div className="gold-rule mt-5" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Measures before the residence, the standing of each ballot, and the instruments by which
          the association is governed. One ballot is held per registered residence.
        </p>

        <div className="mt-12 grid gap-10 md:gap-12 lg:grid-cols-[1.6fr_1fr]">
          <section aria-labelledby="measures">
            <h2 id="measures" className="text-2xl">
              Measures before the residence
            </h2>
            <ul className="mt-6 space-y-5">
              {measures.map((m) => {
                const total = m.inFavour + m.against;
                const pct = total === 0 ? 0 : Math.round((m.inFavour / total) * 100);
                const open = m.status === "Open for ballot";
                return (
                  <li key={m.id} className="border border-border bg-card p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs tracking-[0.2em] text-primary uppercase">
                        <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                        {m.reference}
                      </span>
                      <span className="border border-primary/50 px-2.5 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                        {m.status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl leading-snug">{m.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {m.summary}
                    </p>

                    <div className="mt-6">
                      <div className="h-1.5 w-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-2 text-xs tracking-wider text-muted-foreground uppercase">
                        {m.inFavour} in favour · {m.against} against · {pct}% · Closes {m.closes}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        onClick={() => cast(m, "for")}
                        disabled={!open || Boolean(ballots[m.id])}
                        className="min-h-11 tracking-[0.18em] uppercase"
                      >
                        {ballots[m.id] === "for" ? "Ballot cast" : "In favour"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => cast(m, "against")}
                        disabled={!open || Boolean(ballots[m.id])}
                        className="min-h-11 tracking-[0.18em] uppercase"
                      >
                        {ballots[m.id] === "against" ? "Ballot cast" : "Against"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="border border-border bg-card p-7">
              <p className="eyebrow">Register</p>
              <h2 className="mt-3 text-2xl">Governing documents</h2>
              <div className="gold-rule mt-4" />
              <ul className="mt-6 space-y-4">
                {GOVERNANCE_DOCUMENTS.map((d) => (
                  <li
                    key={d.id}
                    className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm leading-snug">{d.title}</p>
                      <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                        {d.kind} · {d.issued}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border bg-secondary/40 p-7">
              <p className="eyebrow">Quorum</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                A measure carries on a simple majority of ballots cast, provided sixty per cent of
                registered residences have voted. Proxy instruments may be lodged with the concierge
                desk.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <ResidenceHandbook />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
