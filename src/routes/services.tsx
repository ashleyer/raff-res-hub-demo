import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell, TabBar, TabPanel } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import {
  MAINTENANCE_CATEGORIES,
  type MaintenanceTicket,
  type ValetRequest,
} from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SERVICE_TABS = ["valet", "maintenance", "mail", "lost"] as const;

export const Route = createFileRoute("/services")({
  ssr: false,
  beforeLoad: requireResidentSession,
  validateSearch: (search: Record<string, unknown>): { tab?: (typeof SERVICE_TABS)[number] } => {
    const tab = SERVICE_TABS.find((t) => t === search["tab"]);
    return tab ? { tab } : {};
  },
  head: () => ({
    meta: [
      { title: "Resident Services · Valet, Maintenance, Mail & Lost Property" },
      {
        name: "description",
        content:
          "Request your car from valet, report a maintenance issue, track parcel deliveries and search lost property at The Raffles Residences Boston.",
      },
      { property: "og:title", content: "Resident Services · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Valet, maintenance, mail and package handling, and the lost-and-found register.",
      },
    ],
  }),
  component: ServicesPage,
});

const TABS = [
  { id: "valet", label: "Valet" },
  { id: "maintenance", label: "Maintenance" },
  { id: "mail", label: "Mail & packages" },
  { id: "lost", label: "Lost & found" },
];

function ServicesPage() {
  const { tab: initialTab } = Route.useSearch();
  const [tab, setTab] = useState<string>(initialTab ?? "valet");

  return (
    <PageShell
      eyebrow="Resident Services"
      title="Valet, maintenance & delivery"
      intro="Everything the building does for your household in one place · vehicle requests, engineering work, parcel handling and lost property."
    >
      <RequireSession area="resident services">
        <TabBar tabs={TABS} active={tab} onChange={setTab} label="Resident service sections" />
        <TabPanel id="valet" active={tab}>
          <ValetSection />
        </TabPanel>
        <TabPanel id="maintenance" active={tab}>
          <MaintenanceSection />
        </TabPanel>
        <TabPanel id="mail" active={tab}>
          <MailSection />
        </TabPanel>
        <TabPanel id="lost" active={tab}>
          <LostFoundSection />
        </TabPanel>
      </RequireSession>
    </PageShell>
  );
}

function ValetSection() {
  const { valet, addValet, cancelValet } = usePortal();
  const [kind, setKind] = useState<ValetRequest["kind"]>("Retrieve vehicle");
  const [vehicle, setVehicle] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="valet-list-heading">
        <h2 id="valet-list-heading" className="text-2xl">
          Vehicle requests
        </h2>
        <ul className="mt-6 space-y-4" aria-live="polite">
          {valet.map((r) => (
            <li key={r.id} className="border border-border bg-card p-6">
              <p className="eyebrow">{r.kind}</p>
              <h3 className="mt-2 text-xl">{r.vehicle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.when}</p>
              {r.notes && <p className="mt-2 text-sm text-muted-foreground">{r.notes}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="border border-primary px-3 py-1 text-xs tracking-[0.16em] text-primary uppercase">
                  {r.status}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    cancelValet(r.id);
                    toast.success("Valet request withdrawn.");
                  }}
                  className="min-h-11 text-xs tracking-[0.16em] text-muted-foreground uppercase underline underline-offset-4 hover:text-primary"
                >
                  Cancel this request
                </button>
              </div>
            </li>
          ))}
          {valet.length === 0 && (
            <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No vehicle requests outstanding.
            </li>
          )}
        </ul>
      </section>

      <form
        className="border border-border bg-card p-7 lg:sticky lg:top-8 lg:self-start"
        onSubmit={(e) => {
          e.preventDefault();
          if (!vehicle.trim() || !when.trim()) {
            toast.error("Tell us the vehicle and the time.");
            return;
          }
          addValet({
            kind,
            vehicle: vehicle.trim(),
            when: when.trim(),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          });
          setVehicle("");
          setWhen("");
          setNotes("");
          toast.success("The arrival court has been notified.");
        }}
      >
        <h2 className="text-2xl">Request the car</h2>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="valet-kind">Request type</Label>
            <select
              id="valet-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as ValetRequest["kind"])}
              className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              <option>Retrieve vehicle</option>
              <option>Return to garage</option>
              <option>Guest arrival</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valet-vehicle">Vehicle or guest</Label>
            <Input
              id="valet-vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valet-when">When</Label>
            <Input
              id="valet-when"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="Today, 6:15 PM"
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valet-notes">Notes for the attendant (optional)</Label>
            <Textarea
              id="valet-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
            Send to valet
          </Button>
        </div>
      </form>
    </div>
  );
}

function MaintenanceSection() {
  const { maintenance, addMaintenance, currentUser } = usePortal();
  const [category, setCategory] = useState<string>(MAINTENANCE_CATEGORIES[0]);
  const [detail, setDetail] = useState("");
  const [urgency, setUrgency] = useState<MaintenanceTicket["urgency"]>("Routine");
  const [entry, setEntry] = useState(true);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="tickets-heading">
        <h2 id="tickets-heading" className="text-2xl">
          Reported issues
        </h2>
        <ul className="mt-6 space-y-4" aria-live="polite">
          {maintenance.map((t) => (
            <li key={t.id} className="border border-border bg-card p-6">
              <p className="eyebrow">{t.category}</p>
              <h3 className="mt-2 text-xl leading-snug">{t.detail}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.unit} · {t.urgency} · reported {t.reportedAt} ·{" "}
                {t.permissionToEnter
                  ? "Entry permitted in your absence"
                  : "Entry only when at home"}
              </p>
              <span className="mt-4 inline-block border border-primary px-3 py-1 text-xs tracking-[0.16em] text-primary uppercase">
                {t.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="border border-border bg-card p-7 lg:sticky lg:top-8 lg:self-start"
        onSubmit={(e) => {
          e.preventDefault();
          if (!detail.trim()) {
            toast.error("Please describe the issue.");
            return;
          }
          addMaintenance({
            category,
            detail: detail.trim(),
            unit: currentUser?.unit ?? "Residence",
            urgency,
            permissionToEnter: entry,
          });
          setDetail("");
          toast.success("Reported to the engineering desk.");
        }}
      >
        <h2 className="text-2xl">Report an issue</h2>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="m-category">Category</Label>
            <select
              id="m-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              {MAINTENANCE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-detail">What needs attention?</Label>
            <Textarea
              id="m-detail"
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-urgency">Urgency</Label>
            <select
              id="m-urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MaintenanceTicket["urgency"])}
              className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              <option>Routine</option>
              <option>Same day</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Label htmlFor="m-entry" className="text-sm font-normal">
              Engineering may enter in my absence
            </Label>
            <Switch id="m-entry" checked={entry} onCheckedChange={setEntry} />
          </div>
          <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
            Submit report
          </Button>
        </div>
      </form>
    </div>
  );
}

function MailSection() {
  const { parcels, requestParcelDelivery } = usePortal();

  return (
    <section aria-labelledby="mail-heading">
      <h2 id="mail-heading" className="text-2xl">
        Mail & package notifications
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Deliveries are received at the concierge desk and appear here as soon as they are logged.
        Request delivery to your residence or collect at your convenience.
      </p>
      <ul className="mt-8 space-y-4" aria-live="polite">
        {parcels.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-6"
          >
            <div>
              <p className="eyebrow">{p.carrier}</p>
              <h3 className="mt-2 text-xl">{p.description}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Logged {p.arrived} · {p.unit}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="border border-primary px-3 py-1 text-xs tracking-[0.16em] text-primary uppercase">
                {p.status}
              </span>
              {p.status === "Awaiting collection" && (
                <Button
                  variant="outline"
                  className="min-h-11 tracking-[0.16em] uppercase"
                  onClick={() => {
                    requestParcelDelivery(p.id);
                    toast.success("A concierge will bring it up.");
                  }}
                >
                  Deliver to my residence
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LostFoundSection() {
  const { lostFound, addLostFound, resolveLostFound } = usePortal();
  const [kind, setKind] = useState<"Lost" | "Found">("Lost");
  const [item, setItem] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const { currentUser } = usePortal();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="lf-heading">
        <h2 id="lf-heading" className="text-2xl">
          Lost & found register
        </h2>
        <ul className="mt-6 space-y-4" aria-live="polite">
          {lostFound.map((i) => (
            <li key={i.id} className="border border-border bg-card p-6">
              <p className="eyebrow">{i.kind}</p>
              <h3 className="mt-2 text-xl">{i.item}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {i.location} · {i.when} · {i.contact}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="border border-border px-3 py-1 text-xs tracking-[0.16em] uppercase">
                  {i.status}
                </span>
                {i.status === "Open" && (
                  <button
                    type="button"
                    onClick={() => {
                      resolveLostFound(i.id);
                      toast.success("Marked as reunited.");
                    }}
                    className="min-h-11 text-xs tracking-[0.16em] text-primary uppercase underline underline-offset-4"
                  >
                    Mark as reunited
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="border border-border bg-card p-7 lg:sticky lg:top-8 lg:self-start"
        onSubmit={(e) => {
          e.preventDefault();
          if (!item.trim() || !location.trim()) {
            toast.error("Describe the item and where it was.");
            return;
          }
          addLostFound({
            kind,
            item: item.trim(),
            location: location.trim(),
            when: when.trim() || "Today",
            contact:
              kind === "Found" ? "Held at the concierge desk" : (currentUser?.unit ?? "Residence"),
          });
          setItem("");
          setLocation("");
          setWhen("");
          toast.success("Logged with the concierge desk.");
        }}
      >
        <h2 className="text-2xl">Report an item</h2>
        <div className="mt-6 space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-sm">I have</legend>
            <div className="flex gap-2">
              {(["Lost", "Found"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={`min-h-11 flex-1 border px-4 text-xs tracking-[0.16em] uppercase ${
                    kind === k
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {k} something
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="lf-item">Item</Label>
            <Input
              id="lf-item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lf-location">Where</Label>
            <Input
              id="lf-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lf-when">When (optional)</Label>
            <Input
              id="lf-when"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="min-h-11"
            />
          </div>
          <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
            Log with the concierge
          </Button>
        </div>
      </form>
    </div>
  );
}
