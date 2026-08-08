import { useState } from "react";
import { BookOpen, ChevronDown, Info } from "lucide-react";
import { HANDBOOK, HANDBOOK_EDITION, HANDBOOK_TITLE } from "@/lib/handbook-data";

/**
 * Browsable dummy Residence Handbook. Used on the Management page and
 * beside the Board's governing documents on Governance.
 */
export function ResidenceHandbook({ headingId = "handbook-heading" }: { headingId?: string }) {
  const [open, setOpen] = useState<string | null>(HANDBOOK[0]?.id ?? null);

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-start gap-3 border border-border bg-secondary/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Demo document: this handbook is invented for demonstration and is not the governing
          instrument of any real building.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Residences Office
          </p>
          <h2 id={headingId} className="mt-3 text-2xl">
            {HANDBOOK_TITLE}
          </h2>
          <p className="mt-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {HANDBOOK_EDITION}
          </p>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          The house rules as adopted by the Board of Trustees: arrival and access, life in
          residence, the amenity floors, common charges, safety and governance.
        </p>
      </div>
      <div className="gold-rule mt-5" />

      <ul className="mt-8 space-y-3">
        {HANDBOOK.map((chapter) => {
          const expanded = open === chapter.id;
          return (
            <li key={chapter.id} className="border border-border bg-card">
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`handbook-panel-${chapter.id}`}
                  onClick={() => setOpen(expanded ? null : chapter.id)}
                  className="flex min-h-11 w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span>
                    <span className="eyebrow block text-[0.6rem]">{chapter.article}</span>
                    <span className="mt-2 block font-display text-xl leading-snug font-light">
                      {chapter.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {chapter.summary}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-primary transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>
              <div
                id={`handbook-panel-${chapter.id}`}
                hidden={!expanded}
                className="border-t border-border px-6 pb-6"
              >
                <dl className="mt-5 space-y-5">
                  {chapter.clauses.map((clause) => (
                    <div key={clause.id}>
                      <dt className="text-sm">
                        <span className="text-primary">{clause.number}</span> {clause.title}
                      </dt>
                      <dd className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {clause.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
