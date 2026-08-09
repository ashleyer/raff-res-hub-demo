import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

/**
 * A slim, site-wide strip at the end of every page (mirroring the DemoBanner's
 * treatment at the top) pointing to the non-technical "About this app" story —
 * who built it, why, and how. Rendered globally in __root.tsx, after <Outlet />,
 * so it appears at the true end of every route regardless of whether that route
 * also renders <SiteFooter />.
 */
export function AboutAppBar() {
  return (
    <div className="chrome-dark border-t border-border/60">
      <Link
        to="/about-this-app"
        className="mx-auto flex min-h-11 max-w-7xl items-center justify-center gap-2 px-5 py-2.5 text-[0.6875rem] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <Sparkles className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
        About this app — why it exists, and who built it
      </Link>
    </div>
  );
}
