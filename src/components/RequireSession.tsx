import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { usePortal } from "@/lib/portal-store";

/**
 * Demo access gate. This preview keeps everything in the browser, so this is a
 * presentation-level gate rather than server-enforced authentication.
 */
export function RequireSession({ area, children }: { area: string; children: ReactNode }) {
  const { currentUser } = usePortal();

  if (currentUser) return <>{children}</>;

  return (
    <div className="mt-12 border border-border bg-secondary/40 p-10">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="eyebrow">Residents Only</p>
      </div>
      <h2 className="mt-4 text-2xl">Sign in to view {area}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This part of the portal is reserved for registered deed-holders and long-term leaseholders.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex min-h-11 items-center border border-primary px-6 py-3 text-xs tracking-[0.18em] text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Resident sign in
      </Link>
    </div>
  );
}
