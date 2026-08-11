import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { currentStaff, signOutStaff, type StaffAccount } from "@/lib/staff-store";

export const Route = createFileRoute("/staff-dashboard")({
  head: () => ({
    meta: [
      { title: "Personnel Dashboard, Raffles Residences Boston" },
      {
        name: "description",
        content: "Internal dashboard for Raffles Boston personnel at the Residences.",
      },
      { property: "og:title", content: "Personnel Dashboard, Raffles Residences Boston" },
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
        <div className="mt-12 max-w-xl border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-2 text-2xl">{account.name}</p>
          <p className="text-sm text-muted-foreground">
            {account.role} · {account.department}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            This dashboard is intentionally empty for now.
          </p>
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
      ) : (
        <p className="mt-12 text-sm text-muted-foreground">Redirecting to personnel sign in…</p>
      )}
    </PageShell>
  );
}
