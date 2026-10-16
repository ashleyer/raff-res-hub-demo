import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudOff,
  ExternalLink,
  Minus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ProvenanceBadge } from "@/components/buildinglink/ProvenanceBadge";
import { formatAge, formatSyncTime } from "@/integrations/buildinglink/format";
import {
  useAnnouncements,
  usePackages,
  useRoster,
  useRosterVerification,
  useServiceRequests,
  useSyncStatus,
} from "@/integrations/buildinglink/hooks";
import type { SyncFlow, SyncRecord, SyncStatus } from "@/integrations/buildinglink/types";
import { cn } from "@/lib/utils";

/* The BuildingLink section of the personnel dashboard. Five panels, all fed by
 * the same hooks the resident pages use, so a request lodged on /concierge or a
 * notice shown on /management is the same object staff see here. */

const FLOW_LABEL: Record<SyncFlow, string> = {
  roster: "Roster",
  announcements: "Announcements",
  events: "Calendar",
  packages: "Packages",
  "service-requests": "Service requests",
};

const STATUS_ICON: Record<SyncStatus, typeof CheckCircle2> = {
  ok: CheckCircle2,
  partial: AlertTriangle,
  failed: CloudOff,
  "pending access": Clock,
  "never run": Minus,
};

/** A clock that ticks so "age" columns stay honest without a refetch. */
function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(timer);
  }, [everyMs]);
  return now;
}

function Panel({
  id,
  eyebrow,
  title,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3 id={`${id}-heading`} className="mt-3 text-2xl">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="gold-rule mt-4" />
      {children}
    </section>
  );
}

function StatusChip({ status }: { status: SyncStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className="inline-flex items-center gap-2 border border-primary/50 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

function RefreshButton({
  onClick,
  label,
  busy,
}: {
  onClick: () => void;
  label: string;
  busy?: boolean;
}) {
  return (
    <Button variant="outline" size="cta" className="min-h-11" onClick={onClick} disabled={busy}>
      <RefreshCw
        className={cn("mr-2 h-4 w-4", busy && "animate-spin motion-reduce:animate-none")}
        aria-hidden="true"
      />
      {label}
    </Button>
  );
}

/* ---------------------------------------------------------- mode indicator */

function ModeIndicator() {
  const sync = useSyncStatus();
  const connected = sync.mode === "http";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-primary/40 bg-primary/5 px-5 py-4">
      <div>
        <p className="eyebrow">BuildingLink</p>
        <p className="mt-2 text-xl">
          Mode: <span className="text-primary">{connected ? "Connected" : "Simulated"}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {connected
            ? sync.error
              ? "The Hub's BuildingLink proxy is not reachable. Every flow is on its fallback."
              : "Reading through the Hub's own proxy. Credentials never reach this browser."
            : "A deterministic simulation of BuildingLink. Nothing here touches a real building."}
        </p>
      </div>
      {sync.canSimulateOutage && (
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <Switch
            checked={sync.outage}
            onCheckedChange={sync.setOutage}
            aria-label="Simulate a BuildingLink outage"
          />
          <span>
            Simulate an outage
            <span className="block text-xs text-muted-foreground">Demo control</span>
          </span>
        </label>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- sync health */

function SyncRow({ record, now }: { record: SyncRecord; now: Date }) {
  return (
    <li className="grid gap-3 border-t border-border py-4 first:border-t-0 sm:grid-cols-[9rem_1fr_1fr_auto] sm:items-start">
      <div>
        <p className="text-base">{FLOW_LABEL[record.flow]}</p>
        <p className="text-xs text-muted-foreground">
          {record.direction}, {record.cadence}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground sm:block">
        <dt className="tracking-[0.16em] uppercase">Last run</dt>
        <dd className="text-foreground sm:mb-2">{formatSyncTime(record.lastRunAt, now)}</dd>
        <dt className="tracking-[0.16em] uppercase">Next run</dt>
        <dd className="text-foreground">
          {record.cadence === "daily" ? formatSyncTime(record.nextRunAt, now) : record.cadence}
        </dd>
      </dl>
      <div className="text-sm leading-relaxed text-muted-foreground">
        <p>{record.message}</p>
        {record.fallback && (
          <p className="mt-1 text-foreground">
            <span className="text-xs tracking-[0.16em] uppercase">Fallback: </span>
            {record.fallback}
          </p>
        )}
      </div>
      <div className="sm:justify-self-end">
        <StatusChip status={record.status} />
      </div>
    </li>
  );
}

function SyncHealthPanel() {
  const sync = useSyncStatus();
  const now = useNow();
  return (
    <Panel
      id="bl-sync"
      eyebrow="Sync health"
      title="Every flow, every run"
      action={
        <RefreshButton
          label="Refresh all"
          busy={sync.loading}
          onClick={() => void sync.refreshAll()}
        />
      }
    >
      {sync.error && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {sync.error}
        </p>
      )}
      <ul className="mt-2">
        {sync.data.map((r) => (
          <SyncRow key={r.flow} record={r} now={now} />
        ))}
        {sync.data.length === 0 && !sync.loading && (
          <li className="py-6 text-sm text-muted-foreground">No sync records to show.</li>
        )}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Last checked {formatSyncTime(sync.lastSyncedAt, now)}.
      </p>
    </Panel>
  );
}

/* ----------------------------------------------------------- open requests */

function OpenRequestsPanel() {
  const requests = useServiceRequests({ open: true });
  const now = useNow();
  return (
    <Panel
      id="bl-requests"
      eyebrow="Open requests"
      title="One queue, two sources"
      action={
        <RefreshButton
          label="Refresh"
          busy={requests.loading}
          onClick={() => void requests.refresh()}
        />
      }
    >
      {requests.error && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {requests.error}
        </p>
      )}
      <ul className="mt-2">
        {requests.data.map((r) => (
          <li
            key={r.id}
            className="grid gap-3 border-t border-border py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-start"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "border px-2 py-0.5 text-[0.6rem] tracking-[0.2em] uppercase",
                    r.source === "hub"
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {r.source === "hub" ? "Hub" : "BuildingLink"}
                </span>
                <p className="eyebrow">{r.category}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.detail}</p>
              <p className="mt-2 text-xs tracking-wider text-muted-foreground uppercase">
                {r.unit} · {r.priority} · {formatAge(r.createdAt, now)}
                {r.reference ? ` · ${r.reference}` : ""}
                {r.source === "hub"
                  ? r.route === "buildinglink"
                    ? " · sent to BuildingLink"
                    : " · emailed to the desk"
                  : ""}
              </p>
              {r.provenance && <ProvenanceBadge provenance={r.provenance} className="mt-2" />}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
              <span className="border border-primary/50 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                {r.status}
              </span>
              <Button
                variant="ghost"
                size="cta"
                disabled
                title="Available once BuildingLink grants access"
                aria-describedby="bl-open-note"
              >
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                Open in BuildingLink
              </Button>
            </div>
          </li>
        ))}
        {requests.data.length === 0 && !requests.loading && (
          <li className="py-6 text-sm text-muted-foreground">Nothing open right now.</li>
        )}
      </ul>
      <p id="bl-open-note" className="mt-2 text-xs text-muted-foreground">
        "Open in BuildingLink" is a placeholder until access is granted and a record link exists.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------------- packages */

function PackageLogPanel() {
  const packages = usePackages();
  const now = useNow();
  const today = packages.data.filter((p) => {
    const d = new Date(p.loggedAt);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
  return (
    <Panel
      id="bl-packages"
      eyebrow="Package log"
      title="Logged today"
      action={
        <RefreshButton
          label="Refresh"
          busy={packages.loading}
          onClick={() => void packages.refresh()}
        />
      }
    >
      {packages.error && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {packages.error}
        </p>
      )}
      <ul className="mt-2">
        {today.map((p) => (
          <li
            key={p.id}
            className="grid gap-2 border-t border-border py-4 first:border-t-0 sm:grid-cols-[8rem_1fr_auto] sm:items-center"
          >
            <p className="text-base">{p.unit}</p>
            <div>
              <p className="text-sm text-muted-foreground">
                {p.carrier}, {p.description}
              </p>
              <ProvenanceBadge provenance={p.provenance} className="mt-2" />
            </div>
            <span className="border border-primary/50 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase sm:justify-self-end">
              {p.status}
            </span>
          </li>
        ))}
        {today.length === 0 && !packages.loading && (
          <li className="py-6 text-sm text-muted-foreground">No packages logged today.</li>
        )}
      </ul>
    </Panel>
  );
}

/* --------------------------------------------------------- verification queue */

function VerificationQueuePanel() {
  const roster = useRoster();
  const { pending, all, approve, decline } = useRosterVerification();
  const now = useNow();
  const decided = all.filter((v) => v.status !== "pending");
  return (
    <Panel id="bl-verify" eyebrow="Roster verification" title="Sign-ups awaiting a match">
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {roster.error
          ? roster.error
          : roster.loading
            ? "Reading the roster."
            : `${roster.data.length} households on the roster, synced ${formatSyncTime(roster.lastSyncedAt, now)}.`}{" "}
        A sign-up the roster could not match waits here. Approving lets that resident register;
        declining does nothing else. Both change demo state only.
      </p>
      <ul className="mt-2">
        {pending.map((v) => (
          <li
            key={v.id}
            className="grid gap-3 border-t border-border py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p className="text-base">
                {v.lastName}, {v.unit}
              </p>
              <p className="text-xs text-muted-foreground">
                {v.email} · asked {formatAge(v.requestedAt, now)} ago
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="cta"
                className="min-h-11"
                onClick={() => {
                  approve(v.id);
                  toast.success(`${v.lastName}, ${v.unit} may now register.`);
                }}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                size="cta"
                className="min-h-11"
                onClick={() => {
                  decline(v.id);
                  toast.success("Declined. The resident can ask the desk in person.");
                }}
              >
                Decline
              </Button>
            </div>
          </li>
        ))}
        {pending.length === 0 && (
          <li className="py-6 text-sm text-muted-foreground">
            No sign-ups waiting. Try registering on the sign-in page with a surname the roster does
            not list.
          </li>
        )}
      </ul>
      {decided.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Decided this session:{" "}
          {decided.map((v) => `${v.lastName}, ${v.unit} (${v.status})`).join("; ")}.
        </p>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------- announcement mirror */

function AnnouncementMirrorPanel() {
  const announcements = useAnnouncements();
  const sync = useSyncStatus();
  const now = useNow();
  const [retrying, setRetrying] = useState<string | null>(null);
  const record = sync.data.find((r) => r.flow === "announcements");
  const failures = record?.failures ?? [];

  const retry = async (itemId: string) => {
    setRetrying(itemId);
    try {
      await sync.retry("announcements", itemId);
      toast.success("Mirrored on retry.");
    } finally {
      setRetrying(null);
    }
  };

  return (
    <Panel
      id="bl-mirror"
      eyebrow="Announcement mirror"
      title="What mirrored, what did not"
      action={
        <RefreshButton
          label="Refresh"
          busy={announcements.loading}
          onClick={() => void Promise.all([announcements.refresh(), sync.refresh()])}
        />
      }
    >
      {announcements.error && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {announcements.error}
        </p>
      )}
      <ul className="mt-2">
        {announcements.data.map((a) => (
          <li
            key={a.id}
            className="grid gap-2 border-t border-border py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p className="text-base">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.postedBy}</p>
              <ProvenanceBadge provenance={a.provenance} className="mt-2" />
            </div>
            <StatusChip status="ok" />
          </li>
        ))}
        {failures.map((f) => (
          <li
            key={f.itemId}
            className="grid gap-3 border-t border-border py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p className="text-base">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.reason}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip status="failed" />
              <Button
                variant="outline"
                size="cta"
                className="min-h-11"
                disabled={retrying === f.itemId}
                onClick={() => void retry(f.itemId)}
              >
                Retry
              </Button>
            </div>
          </li>
        ))}
        {announcements.data.length === 0 && failures.length === 0 && !announcements.loading && (
          <li className="py-6 text-sm text-muted-foreground">No notices to mirror.</li>
        )}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Mirror last ran {formatSyncTime(record?.lastRunAt, now)}.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ section */

export function BuildingLinkDashboard() {
  return (
    <section aria-labelledby="buildinglink-heading" className="space-y-6">
      <div>
        <p className="eyebrow">Building systems</p>
        <h2 id="buildinglink-heading" className="mt-3 text-2xl">
          BuildingLink
        </h2>
        <div className="gold-rule mt-4" />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          BuildingLink stays the system of record. This app reads the roster, notices, calendar, and
          packages, and writes resident requests into the desk&apos;s queue. Every sync is listed
          below with what happened if one failed.
        </p>
      </div>
      <ModeIndicator />
      <SyncHealthPanel />
      <OpenRequestsPanel />
      <PackageLogPanel />
      <VerificationQueuePanel />
      <AnnouncementMirrorPanel />
    </section>
  );
}
