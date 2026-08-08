import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONCIERGE_SERVICES, type ConciergeRequest } from "@/lib/intranet-data";
import { MANAGEMENT_ACCESS_CODE, STAFF } from "@/lib/portal-data";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/concierge-desk")({
  head: () => ({
    meta: [
      { title: "Concierge Desk Queue — Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Internal concierge management view for the residences team: queue, filter and respond to resident requests by category.",
      },
      { property: "og:title", content: "Concierge Desk Queue — Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Staff-only triage board for resident concierge requests at Raffles Boston Residences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeskPage,
});

const UNLOCK_KEY = "raffles-desk-unlocked";
const STATUSES = ["Lodged", "In progress", "Completed"] as const;

function DeskPage() {
  return (
    <PageShell
      eyebrow="Residences Team"
      title="Concierge desk queue"
      intro="Internal triage board. Every request lodged by a residence arrives here — filter by category, priority or state, assign an attendant, and reply to the residence in the same place."
    >
      <DeskGate />
    </PageShell>
  );
}

function DeskGate() {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (unlocked) return <DeskQueue />;

  return (
    <section className="mt-12 max-w-xl border border-border bg-card p-7">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="eyebrow">Staff only</p>
      </div>
      <h2 className="mt-4 text-2xl">Desk sign-in</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This queue holds residence details, so it is open to the residences team only. Enter the
        staff access code.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim().toLowerCase() !== MANAGEMENT_ACCESS_CODE) {
            setError("That access code is not recognised.");
            return;
          }
          setError(null);
          setUnlocked(true);
          try {
            sessionStorage.setItem(UNLOCK_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
      >
        <Label htmlFor="desk-code">Staff access code</Label>
        <Input
          id="desk-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-describedby={error ? "desk-code-error" : undefined}
          placeholder="Access code"
        />
        {error && (
          <p id="desk-code-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="min-h-12 w-full tracking-[0.18em] uppercase">
          Open the queue
        </Button>
        <p className="text-xs text-muted-foreground">
          Demo code: <span className="font-mono">{MANAGEMENT_ACCESS_CODE}</span>
        </p>
      </form>
    </section>
  );
}

function DeskQueue() {
  const { conciergeRequests, setConciergeStatus, assignConciergeRequest, replyToConciergeRequest } =
    usePortal();

  const [category, setCategory] = useState<"All" | string>("All");
  const [status, setStatus] = useState<"All" | ConciergeRequest["status"]>("All");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of conciergeRequests) {
      if (r.status === "Completed") continue;
      map[r.service] = (map[r.service] ?? 0) + 1;
    }
    return map;
  }, [conciergeRequests]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank: Record<ConciergeRequest["status"], number> = {
      Lodged: 0,
      "In progress": 1,
      Completed: 2,
    };
    return conciergeRequests
      .filter((r) => category === "All" || r.service === category)
      .filter((r) => status === "All" || r.status === status)
      .filter((r) => !priorityOnly || r.priority === "Priority")
      .filter(
        (r) =>
          !q ||
          r.detail.toLowerCase().includes(q) ||
          r.unit.toLowerCase().includes(q) ||
          r.service.toLowerCase().includes(q),
      )
      .slice()
      .sort(
        (a, b) =>
          rank[a.status] - rank[b.status] ||
          (a.priority === b.priority ? 0 : a.priority === "Priority" ? -1 : 1),
      );
  }, [conciergeRequests, category, status, priorityOnly, query]);

  const open = conciergeRequests.filter((r) => r.status !== "Completed").length;
  const urgent = conciergeRequests.filter(
    (r) => r.status !== "Completed" && r.priority === "Priority",
  ).length;

  return (
    <div className="mt-12">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open in queue" value={open} />
        <Stat label="Priority waiting" value={urgent} />
        <Stat
          label="Closed today"
          value={conciergeRequests.filter((r) => r.status === "Completed").length}
        />
      </div>

      <section aria-labelledby="filters" className="mt-10 border border-border bg-card p-6">
        <h2 id="filters" className="eyebrow">
          Filter the queue
        </h2>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["All", ...CONCIERGE_SERVICES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
              {c !== "All" && counts[c] ? ` (${counts[c]})` : ""}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by state">
            {(["All", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
                  status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPriorityOnly((p) => !p)}
            aria-pressed={priorityOnly}
            className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
              priorityOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            Priority only
          </button>

          <div className="min-w-[16rem] flex-1 space-y-2">
            <Label htmlFor="desk-search" className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search residence or detail
            </Label>
            <Input
              id="desk-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Residence 34B, airport, peony…"
            />
          </div>
        </div>
      </section>

      <ul className="mt-8 space-y-4">
        {visible.map((r) => (
          <QueueCard
            key={r.id}
            request={r}
            onStatus={(s) => {
              setConciergeStatus(r.id, s);
              toast.success(`${r.service} marked ${s.toLowerCase()}.`);
            }}
            onAssign={(staff) => assignConciergeRequest(r.id, staff)}
            onReply={(body, author) => {
              replyToConciergeRequest(r.id, body, author);
              toast.success("Reply sent to the residence.");
            }}
          />
        ))}
        {visible.length === 0 && (
          <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nothing in the queue matches these filters.
          </li>
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-4xl">{value}</p>
    </div>
  );
}

function QueueCard({
  request,
  onStatus,
  onAssign,
  onReply,
}: {
  request: ConciergeRequest;
  onStatus: (status: ConciergeRequest["status"]) => void;
  onAssign: (staff: string) => void;
  onReply: (body: string, author: string) => void;
}) {
  const attendants = STAFF.map((s) => s.name);
  const [reply, setReply] = useState("");
  const [author, setAuthor] = useState(attendants[0] ?? "Concierge Desk");

  return (
    <li className="border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">
            {request.service}
            {request.service === "Other" ? " · needs routing" : ""}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {request.detail}
          </p>
          <p className="mt-3 text-xs tracking-wider text-muted-foreground uppercase">
            {request.unit} · {request.priority} · {request.placedAt}
            {request.assignedTo ? ` · ${request.assignedTo}` : " · unassigned"}
          </p>
        </div>
        <span className="border border-primary/50 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
          {request.status}
        </span>
      </div>

      {(request.replies ?? []).length > 0 && (
        <ul className="mt-5 space-y-3 border-l border-primary/40 pl-4">
          {(request.replies ?? []).map((r) => (
            <li key={r.id}>
              <p className="text-xs tracking-wider text-primary uppercase">
                {r.author} · {r.at}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-5 border-t border-border pt-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`assign-${request.id}`}>Assign attendant</Label>
            <select
              id={`assign-${request.id}`}
              value={request.assignedTo ?? ""}
              onChange={(e) => onAssign(e.target.value)}
              className="h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              <option value="" className="bg-card">
                Unassigned
              </option>
              {attendants.map((name) => (
                <option key={name} value={name} className="bg-card">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.filter((s) => s !== request.status).map((s) => (
              <Button
                key={s}
                variant="ghost"
                onClick={() => onStatus(s)}
                className="min-h-11 tracking-[0.18em] uppercase"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reply.trim()) {
              toast.error("Write a reply for the residence first.");
              return;
            }
            onReply(reply.trim(), author);
            setReply("");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`author-${request.id}`}>Replying as</Label>
            <select
              id={`author-${request.id}`}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              {attendants.map((name) => (
                <option key={name} value={name} className="bg-card">
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`reply-${request.id}`}>Reply to the residence</Label>
            <Textarea
              id={`reply-${request.id}`}
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Confirm timing, assignment or next steps"
            />
          </div>
          <Button type="submit" className="min-h-11 tracking-[0.18em] uppercase">
            Send reply
          </Button>
        </form>
      </div>
    </li>
  );
}
