export type LegalSection = {
  heading: string;
  body: string[];
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
};

/** Shared typographic shell for the Privacy Policy and Terms pages. */
export function LegalDocument({ eyebrow, title, updated, sections }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pt-16 pb-24 sm:px-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-section mt-4">{title}</h1>
      <p className="mt-4 text-xs tracking-[0.16em] text-muted-foreground uppercase">{updated}</p>

      <p className="mt-8 border border-border bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        Demo site only: this document is illustrative sample text for a preview environment and is
        not a legal agreement.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl sm:text-2xl">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
