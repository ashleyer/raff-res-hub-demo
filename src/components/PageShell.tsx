import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 md:py-20"
      >
        <header className="text-center sm:text-left">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-section mt-4">{title}</h1>
          <div className="gold-rule mt-5 mx-auto sm:mx-0" />
          {intro && (
            <p className="measure mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {intro}
            </p>
          )}
        </header>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="border border-border bg-card p-5 sm:p-7"
      aria-labelledby={`${id ?? title}-heading`}
    >
      <h2 id={`${id ?? title}-heading`} className="text-xl sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Accessible tab bar: roving links between in-page panels. */
export function TabBar({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-5 mt-10 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {tabs.map((t) => {
        const selected = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === active);
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const next =
                  tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                if (next) {
                  onChange(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }
              }
            }}
            className={`min-h-11 shrink-0 snap-start border px-4 py-2 text-[0.65rem] tracking-[0.14em] whitespace-nowrap uppercase transition-colors sm:px-5 sm:text-xs sm:tracking-[0.16em] ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: string;
  children: ReactNode;
}) {
  if (id !== active) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="mt-10 focus:outline-none"
    >
      {children}
    </div>
  );
}
