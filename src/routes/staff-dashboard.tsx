import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, ThumbsUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { currentStaff, signOutStaff, type StaffAccount } from "@/lib/staff-store";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/staff-dashboard")({
  head: () => ({
    meta: [
      { title: "Personnel Dashboard · Raffles Residences Boston" },
      {
        name: "description",
        content: "Internal dashboard for Raffles Boston personnel at the Residences.",
      },
      { property: "og:title", content: "Personnel Dashboard · Raffles Residences Boston" },
      {
        property: "og:description",
        content: "Internal staff workspace for Raffles Residences Boston.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffDashboardPage,
});

function StaffDashboardPage() {
  const navigate = useNavigate();
  const { eventIdeas } = usePortal();
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const staff = currentStaff();
    setAccount(staff);
    setChecked(true);
    if (!staff) void navigate({ to: "/staff-signin" });
  }, [navigate]);

  return (
    <PageShell
      eyebrow="Raffles Personnel"
      title="Personnel dashboard"
      intro="Your internal workspace. Tools for your department will appear here."
    >
      {!checked ? null : account ? (
        <div className="mt-12 space-y-10">
          <div className="max-w-xl border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="mt-2 text-2xl">{account.name}</p>
            <p className="text-sm text-muted-foreground">
              {account.role} · {account.department}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
            <Button
              variant="outline"
              className="mt-6 min-h-11 tracking-[0.18em] uppercase"
              onClick={() => {
                signOutStaff();
                void navigate({ to: "/staff-signin" });
              }}
            >
              Sign out
            </Button>
          </div>

          <section aria-labelledby="event-proposals-heading">
            <p className="eyebrow">Events Committee</p>
            <h2 id="event-proposals-heading" className="mt-3 text-2xl">
              Proposed by residents
            </h2>
            <div className="gold-rule mt-4" />
            <ul className="mt-6 max-w-3xl space-y-4">
              {eventIdeas.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-6"
                >
                  <div className="max-w-xl">
                    <h3 className="flex items-center gap-2 text-xl leading-snug">
                      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                      {i.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
                    <p className="mt-3 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                      {i.anonymous ? "Submitted anonymously" : i.unit}
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm tracking-[0.18em] uppercase">
                    <ThumbsUp className="h-4 w-4 text-primary" aria-hidden="true" />
                    {i.interest}
                  </p>
                </li>
              ))}
              {eventIdeas.length === 0 && (
                <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No proposals from residents yet.
                </li>
              )}
            </ul>
          </section>
        </div>
      ) : (
        <p className="mt-12 text-sm text-muted-foreground">Redirecting to personnel sign in…</p>
      )}
    </PageShell>
  );
}
