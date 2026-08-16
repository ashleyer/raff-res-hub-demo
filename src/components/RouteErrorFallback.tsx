import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/* Friendly fallback shown when a route fails to render, so a missing component
   or data problem never leaves the resident staring at a blank screen. */
export function RouteErrorFallback({ error, reset }: Partial<ErrorComponentProps>) {
  const message = error instanceof Error ? error.message : undefined;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-6 py-20 text-center">
      <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground">
        Raffles Residences Boston
      </p>
      <h1 className="mt-4 text-3xl leading-tight">This page could not be displayed</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Something interrupted the page while it was loading. Your details are safe. Please try
        again, or return to the entrance and continue from there.
      </p>
      {message ? (
        <p className="mx-auto mt-6 max-w-xl border border-border bg-muted/40 p-4 text-left font-mono text-xs break-words text-muted-foreground">
          {message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => (reset ? reset() : window.location.reload())}
          size="cta"
          className="min-h-11"
        >
          Try again
        </Button>
        <Button asChild variant="outline" size="cta" className="min-h-11">
          <Link to="/">Return to the entrance</Link>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        If this continues, the concierge can be reached at{" "}
        <a href="tel:+16175891480" className="underline underline-offset-4">
          617-589-1480
        </a>
        .
      </p>
    </main>
  );
}

export function RouteNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-6 py-20 text-center">
      <p className="text-xs tracking-[0.28em] uppercase text-muted-foreground">
        Raffles Residences Boston
      </p>
      <h1 className="mt-4 text-3xl leading-tight">We could not find that page</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The page you asked for is not part of the residents' portal.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild size="cta" className="min-h-11">
          <Link to="/">Return to the entrance</Link>
        </Button>
      </div>
    </main>
  );
}
