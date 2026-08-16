import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Cable, CircleDot, Loader2, ReceiptText, Timer } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RequireSession } from "@/components/RequireSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeChipPicker, timeOptionsFromWindow } from "@/components/TimeChipPicker";
import {
  getHotelFolio,
  requestInResidenceDelivery,
  requestPriorityTable,
} from "@/lib/pms.functions";
import {
  OUTLETS,
  type FolioSnapshot,
  type InResidenceDelivery,
  type OutletId,
  type PriorityReservation,
} from "@/lib/pms-types";

export const Route = createFileRoute("/hotel-bridge")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Hotel Bridge · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Priority tables, in-residence delivery and a single house-account folio across La Padrona, Emerald Lounge, Blind Duck and Café Pastel.",
      },
      { property: "og:title", content: "Hotel Bridge · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Residence-to-hotel service bridge: priority reservations, in-residence delivery and consolidated folio charges.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HotelBridgePage,
});

function HotelBridgePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 md:py-20"
      >
        <p className="eyebrow">Hotel &amp; Residences Bridge</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Seamless hotel service</h1>
        <div className="gold-rule mt-5" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your residence is connected to the hotel's property-management and point-of-sale systems.
          Reserve a priority table, send an order up to your residence, and see every outlet charge
          consolidated on one house account. In this demonstration the bridge is simulated, with the
          same response cache and fault tolerance the live integration uses.
        </p>

        <RequireSession area="the hotel bridge">
          <BridgeConsole />
        </RequireSession>
      </main>
      <SiteFooter />
    </div>
  );
}

function BridgeConsole() {
  const folioFn = useServerFn(getHotelFolio);
  const tableFn = useServerFn(requestPriorityTable);
  const deliveryFn = useServerFn(requestInResidenceDelivery);

  const [unit, setUnit] = useState("Residence 22H");
  const [folio, setFolio] = useState<FolioSnapshot | null>(null);
  const [folioBusy, setFolioBusy] = useState(false);
  const [bridgeFault, setBridgeFault] = useState<string | null>(null);

  const [outletId, setOutletId] = useState<OutletId>(OUTLETS[0]!.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [party, setParty] = useState("2");
  const [reservation, setReservation] = useState<PriorityReservation | null>(null);
  const [tableBusy, setTableBusy] = useState(false);

  const [deliveryOutlet, setDeliveryOutlet] = useState<OutletId>(
    OUTLETS.find((o) => o.supportsInResidence)!.id,
  );
  const [items, setItems] = useState("");
  const [delivery, setDelivery] = useState<InResidenceDelivery | null>(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);

  const loadFolio = async (simulateFault: boolean) => {
    setFolioBusy(true);
    try {
      const result = await folioFn({ data: { unit: unit.trim(), simulateFault } });
      if (result.ok) {
        setFolio(result.folio);
        setBridgeFault(null);
        toast.success(
          result.folio.cached ? "Folio served from the bridge cache." : "Folio refreshed.",
        );
      } else {
        setBridgeFault(result.message);
        toast.error(result.message);
      }
    } finally {
      setFolioBusy(false);
    }
  };

  const submitTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Choose a date for the table.");
      return;
    }
    setTableBusy(true);
    try {
      const result = await tableFn({
        data: { outletId, date, time, party: Math.max(1, Number(party) || 1) },
      });
      if (result.ok) {
        setReservation(result.reservation);
        toast.success(`${result.reservation.status}: ${result.reservation.reference}`);
      } else {
        toast.error(result.message);
      }
    } finally {
      setTableBusy(false);
    }
  };

  const submitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.trim()) {
      toast.error("Add what you would like sent up.");
      return;
    }
    setDeliveryBusy(true);
    try {
      const result = await deliveryFn({
        data: { outletId: deliveryOutlet, unit: unit.trim(), items: items.trim() },
      });
      if (result.ok) {
        setDelivery(result.delivery);
        setItems("");
        setFolio(null);
        toast.success(`Order placed. Arriving in about ${result.delivery.etaMinutes} minutes.`);
      } else {
        toast.error(result.message);
      }
    } finally {
      setDeliveryBusy(false);
    }
  };

  return (
    <div className="mt-12 space-y-12">
      <section aria-labelledby="outlets">
        <h2 id="outlets" className="text-2xl">
          Connected outlets
        </h2>
        <div className="gold-rule mt-4" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {OUTLETS.map((o) => (
            <li key={o.id} className="border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-lg">
                <Cable className="h-4 w-4 text-primary" aria-hidden="true" />
                {o.name}
              </p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                {o.kind} · {o.location}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Service {o.serviceWindow}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Terminal {o.posTerminal} ·{" "}
                {o.supportsInResidence ? "In-residence delivery" : "On-premise only"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="folio" className="border border-border bg-card p-7">
        <h2 id="folio" className="flex items-center gap-2 text-2xl">
          <ReceiptText className="h-5 w-5 text-primary" aria-hidden="true" />
          House account folio
        </h2>
        <div className="gold-rule mt-4" />
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="folio-unit">Residence number</Label>
            <Input id="folio-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <Button
            type="button"
            onClick={() => void loadFolio(false)}
            disabled={folioBusy || !unit.trim()}
            size="cta"
            className="min-h-11"
          >
            {folioBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Retrieve folio
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void loadFolio(true)}
            disabled={folioBusy || !unit.trim()}
            size="cta"
            className="min-h-11"
          >
            Simulate outage
          </Button>
        </div>

        {bridgeFault && (
          <p
            role="status"
            className="mt-5 flex items-start gap-2 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {bridgeFault}
          </p>
        )}

        {folio && (
          <div className="mt-6">
            <p className="flex flex-wrap items-center gap-3 text-xs tracking-wider text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5">
                <CircleDot
                  className={
                    folio.breaker.state === "closed"
                      ? "h-3.5 w-3.5 text-primary"
                      : "h-3.5 w-3.5 text-destructive"
                  }
                  aria-hidden="true"
                />
                Bridge {folio.breaker.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                {folio.cached ? "Served from cache" : "Live from the hotel system"}
              </span>
            </p>
            <ul className="mt-4 divide-y divide-border border border-border">
              {folio.charges.map((c) => (
                <li key={c.id} className="flex flex-wrap justify-between gap-3 p-4 text-sm">
                  <span>
                    <span className="block">{c.description}</span>
                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                      {c.outletName} · {c.postedAt}
                    </span>
                  </span>
                  <span>{formatCurrency(c.amount)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(folio.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service charge (20%)</dt>
                <dd>{formatCurrency(folio.serviceCharge)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt>Total posted</dt>
                <dd>{formatCurrency(folio.total)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="priority" className="border border-border bg-card p-7">
          <h2 id="priority" className="text-2xl">
            Priority reservation
          </h2>
          <div className="gold-rule mt-4" />
          <form onSubmit={submitTable} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="pos-outlet">Outlet</Label>
              <select
                id="pos-outlet"
                value={outletId}
                onChange={(e) => {
                  const nextId = e.target.value as OutletId;
                  setOutletId(nextId);
                  const nextOutlet = OUTLETS.find((o) => o.id === nextId);
                  const nextOptions = nextOutlet ? timeOptionsFromWindow(nextOutlet.serviceWindow) : [];
                  if (nextOptions.length > 0 && !nextOptions.includes(time)) {
                    setTime(nextOptions[0]!);
                  }
                }}
                className="h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                {OUTLETS.map((o) => (
                  <option key={o.id} value={o.id} className="bg-card">
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pos-date">Date</Label>
                <DatePicker id="pos-date" value={date} onChange={setDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos-party">Party</Label>
                <Input
                  id="pos-party"
                  type="number"
                  min={1}
                  max={40}
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos-time">Time</Label>
              <TimeChipPicker
                window={OUTLETS.find((o) => o.id === outletId)!.serviceWindow}
                selected={time}
                onSelect={setTime}
              />
              <input type="hidden" id="pos-time" value={time} readOnly />
            </div>
            <Button
              type="submit"
              disabled={tableBusy}
              size="cta"
              className="min-h-12 w-full"
            >
              {tableBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Request table
            </Button>
          </form>
          {reservation && (
            <div role="status" className="mt-6 border border-primary/40 bg-secondary/40 p-5">
              <p className="eyebrow">{reservation.status}</p>
              <p className="mt-2 text-lg">
                {reservation.outletName} · {reservation.date} at {reservation.time}
              </p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                Reference {reservation.reference} · Party of {reservation.party}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{reservation.note}</p>
            </div>
          )}
        </section>

        <section aria-labelledby="ird" className="border border-border bg-card p-7">
          <h2 id="ird" className="text-2xl">
            In-residence delivery
          </h2>
          <div className="gold-rule mt-4" />
          <form onSubmit={submitDelivery} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ird-outlet">Kitchen</Label>
              <select
                id="ird-outlet"
                value={deliveryOutlet}
                onChange={(e) => setDeliveryOutlet(e.target.value as OutletId)}
                className="h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                {OUTLETS.filter((o) => o.supportsInResidence).map((o) => (
                  <option key={o.id} value={o.id} className="bg-card">
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ird-items">Order</Label>
              <Textarea
                id="ird-items"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Two tasting plates, a bottle of Barolo, service for 8:30 PM…"
              />
            </div>
            <Button
              type="submit"
              disabled={deliveryBusy}
              size="cta"
              className="min-h-12 w-full"
            >
              {deliveryBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Send to my residence
            </Button>
          </form>
          {delivery && (
            <div role="status" className="mt-6 border border-primary/40 bg-secondary/40 p-5">
              <p className="eyebrow">Order received</p>
              <p className="mt-2 text-lg">
                {delivery.outletName} → {delivery.unit}
              </p>
              <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                Reference {delivery.reference} · About {delivery.etaMinutes} minutes
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{delivery.items}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Charged to your house account folio.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
