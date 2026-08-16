import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Minus,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  AMENITIES,
  CATERING_OPTIONS,
  IN_RESIDENCE_DINING,
  IN_RESIDENCE_MENU,
  VENUES,
} from "@/lib/intranet-data";
import { HOUSE_AMENITIES } from "@/lib/venue-extras";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePortal } from "@/lib/portal-store";
import { ForYou } from "@/components/ForYou";
import { SpatialBookingGrid } from "@/components/SpatialBookingGrid";
import { DatePicker } from "@/components/ui/date-picker";

export const Route = createFileRoute("/amenities")({
  head: () => ({
    meta: [
      { title: "Amenity Reservations · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Reserve the Residents' Lounge on Floor 21, Nantucket Kitchen, Secret Garden Room, sports simulator and Emerald Lounge, order in-residence dining, and find hotel venue menus and hours.",
      },
      { property: "og:title", content: "Amenity Reservations · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Residents' booking desk: lounge and amenity rooms with hotel catering, in-residence dining orders, and hotel venue menus.",
      },
    ],
  }),
  component: AmenitiesPage,
});

function AmenitiesPage() {
  const { logActivity, bookings, addBooking, releaseBooking } = usePortal();
  const [amenityId, setAmenityId] = useState(AMENITIES[0]!.id);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(AMENITIES[0]!.slots[0]!);
  const [guests, setGuests] = useState("2");
  const [unit, setUnit] = useState("");
  const [catering, setCatering] = useState<string>(CATERING_OPTIONS[0]);
  const [notes, setNotes] = useState("");

  const amenity = useMemo(
    () => AMENITIES.find((a) => a.id === amenityId) ?? AMENITIES[0]!,
    [amenityId],
  );

  const selectAmenity = (id: string) => {
    const next = AMENITIES.find((a) => a.id === id) ?? AMENITIES[0]!;
    setAmenityId(next.id);
    setSlot(next.slots[0]!);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !unit.trim()) {
      toast.error("A date and residence number are required.");
      return;
    }
    if (bookings.some((b) => b.amenityId === amenity.id && b.date === date && b.slot === slot)) {
      toast.error("That sitting is already held. Please choose another window.");
      return;
    }
    addBooking({
      amenityId: amenity.id,
      amenityName: amenity.name,
      date,
      slot,
      guests: Math.max(1, Number(guests) || 1),
      unit: unit.trim(),
      catering,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    setDate("");
    setUnit("");
    setNotes("");
    logActivity({ kind: "booking", refId: amenity.id, label: amenity.name });
    toast.success(`Request lodged for ${amenity.name}. The concierge will confirm shortly.`);
  };

  const release = (id: number) => {
    releaseBooking(id);
    toast.success("Reservation released.");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 md:py-20"
      >
        <p className="eyebrow">Residents' Booking Desk</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Reservation requests</h1>
        <div className="gold-rule mt-5" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The Residents' Lounge on Floor 21 and its amenity rooms (the Nantucket Kitchen, Secret
          Garden Room, sports simulator and sports lounge), along with the Emerald Lounge, may be
          reserved here, with catering supplied by the hotel kitchen. Hotel venues below are open to
          residents but are not reservable through this desk.
        </p>

        <div className="mt-12 grid gap-10 md:gap-12 lg:grid-cols-[1.5fr_1fr]">
          <section aria-labelledby="rooms">
            <h2 id="rooms" className="text-2xl">
              Reservable spaces
            </h2>

            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {AMENITIES.map((a) => (
                <li key={a.id}>
                  <article
                    className={`flex h-full flex-col border transition-colors ${
                      a.id === amenityId
                        ? "border-primary bg-card"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={a.image}
                      alt={`${a.name} at The Raffles Residences Boston`}
                      width={1200}
                      height={800}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-2xl leading-snug">{a.name}</h3>
                      <p className="mt-2 flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {a.location}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {a.description}
                      </p>
                      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {a.hours}
                      </p>
                      {a.service && (
                        <p className="mt-3 flex gap-2 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground">
                          <Info
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {a.service}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => selectAmenity(a.id)}
                        size="cta"
                        className="mt-5 w-full"
                      >
                        {a.id === amenityId ? "Selected" : "Request this room"}
                      </Button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-2xl">Current bookings</h2>
            <div className="gold-rule mt-4" />
            <ul className="mt-6 space-y-3">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-5"
                >
                  <div>
                    <p className="flex items-center gap-2 text-lg">
                      <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                      {b.amenityName}
                    </p>
                    <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                      {b.date} · {b.slot} · {b.guests} guests · {b.unit}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <UtensilsCrossed className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {b.catering}
                    </p>
                    {b.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">{b.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => release(b.id)}
                    size="cta"
                  >
                    Release
                  </Button>
                </li>
              ))}
              {bookings.length === 0 && (
                <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No sittings currently held.
                </li>
              )}
            </ul>
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <form onSubmit={submit} className="border border-border bg-card p-7">
              <p className="eyebrow">Reservation request</p>
              <h2 className="mt-3 text-2xl">{amenity.name}</h2>
              <div className="gold-rule mt-4" />

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="amenity">Room or service</Label>
                  <select
                    id="amenity"
                    value={amenityId}
                    onChange={(e) => selectAmenity(e.target.value)}
                    className="h-11 w-full border border-input bg-transparent px-3 text-sm"
                  >
                    {AMENITIES.map((a) => (
                      <option key={a.id} value={a.id} className="bg-card">
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker id="date" value={date} onChange={setDate} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot">Sitting</Label>
                  <SpatialBookingGrid
                    slots={amenity.slots}
                    bookings={bookings}
                    amenityId={amenity.id}
                    date={date}
                    selected={slot}
                    onSelect={setSlot}
                  />
                  <input type="hidden" id="slot" value={slot} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catering">Catering</Label>
                  <select
                    id="catering"
                    value={catering}
                    onChange={(e) => setCatering(e.target.value)}
                    className="h-11 w-full border border-input bg-transparent px-3 text-sm"
                  >
                    {CATERING_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-card">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={60}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Residence number</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Residence 34B"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes for the concierge</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Dietary requirements, seating, floristry…"
                  />
                </div>

                <Button type="submit" size="cta" className="min-h-12 w-full">
                  Submit request
                </Button>
              </div>
            </form>
          </aside>
        </div>

        <InResidenceDining />

        <section aria-labelledby="hotel-venues" className="mt-16">
          <h2 id="hotel-venues" className="text-2xl">
            Hotel venues
          </h2>
          <div className="gold-rule mt-4" />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These rooms belong to the hotel and are not reservable in their entirety through the
            residences desk. Menus and booking are held by each venue.
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {VENUES.map((v) => (
              <li key={v.id}>
                <article className="flex h-full flex-col border border-border bg-card">
                  <img
                    src={v.image}
                    alt={`${v.name} at Raffles Boston`}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl leading-snug">{v.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {v.location}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>
                    <ul className="mt-4 space-y-1">
                      {v.hours.map((h) => (
                        <li
                          key={h}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 flex gap-2 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground">
                      <Info
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {v.note}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {v.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn-outline inline-flex min-h-11 items-center gap-2"
                        >
                          {l.label}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="house-amenities-heading"
          className="mt-20 border-t border-border pt-14"
        >
          <p className="eyebrow">Open daily</p>
          <h2 id="house-amenities-heading" className="mt-3 text-3xl">
            House amenities
          </h2>
          <div className="gold-rule mt-4" />
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These spaces are open to residents without a reservation. The concierge can arrange
            registrations, training and celebration orders where noted.
          </p>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {HOUSE_AMENITIES.map((a) => (
              <li key={a.id}>
                <article className="flex h-full flex-col border border-border bg-card">
                  <img
                    src={a.image}
                    alt={a.name}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl">{a.name}</h3>
                    <p className="mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                      {a.location}
                    </p>
                    <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {a.description}
                    </p>
                    <ul className="mt-4 space-y-1">
                      {a.hours.map((h) => (
                        <li
                          key={h}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 flex gap-2 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground">
                      <Info
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {a.note}
                    </p>
                    {a.links && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {a.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="btn-outline inline-flex min-h-11 items-center gap-2"
                          >
                            {l.label}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <ForYou variant="inline" area="amenities" />
      </main>
      <SiteFooter />
    </div>
  );
}

function InResidenceDining() {
  const { logActivity } = usePortal();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [unit, setUnit] = useState("");
  const [when, setWhen] = useState("As soon as possible");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState<
    { id: number; when: string; total: number; lines: string[] }[]
  >([]);

  const lines = useMemo(
    () =>
      IN_RESIDENCE_MENU.flatMap((section) =>
        section.items
          .filter((i) => (quantities[i.id] ?? 0) > 0)
          .map((i) => ({ ...i, qty: quantities[i.id] ?? 0 })),
      ),
    [quantities],
  );
  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  const change = (id: string, delta: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));

  const order = (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("Add at least one dish to the order.");
      return;
    }
    if (!unit.trim()) {
      toast.error("A residence number is required.");
      return;
    }
    setPlaced((prev) => [
      {
        id: Date.now(),
        when,
        total,
        lines: lines.map((l) => `${l.qty} × ${l.name}`),
      },
      ...prev,
    ]);
    setQuantities({});
    setNotes("");
    logActivity({ kind: "booking", refId: "private-dining", label: IN_RESIDENCE_DINING.name });
    toast.success("Order sent to In-Room Dining. The kitchen will confirm shortly.");
  };

  return (
    <section aria-labelledby="in-residence-dining" className="mt-16">
      <h2 id="in-residence-dining" className="text-2xl">
        {IN_RESIDENCE_DINING.name}
      </h2>
      <div className="gold-rule mt-4" />
      <p className="mt-4 flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        {IN_RESIDENCE_DINING.location}
      </p>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        {IN_RESIDENCE_DINING.hours}
      </p>
      <p className="mt-3 flex max-w-2xl gap-2 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        {IN_RESIDENCE_DINING.note}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {IN_RESIDENCE_MENU.map((section) => (
            <div key={section.id} className="border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl">{section.label}</h3>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  {section.hours}
                </p>
              </div>
              <ul className="mt-4 divide-y divide-border">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4"
                  >
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-base">{item.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">${item.price}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() => change(item.id, -1)}
                          aria-label={`Remove one ${item.name}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span aria-live="polite" className="w-8 text-center text-sm">
                          {quantities[item.id] ?? 0}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() => change(item.id, 1)}
                          aria-label={`Add one ${item.name}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <form onSubmit={order} className="border border-border bg-card p-7">
            <p className="eyebrow">Your order</p>
            <h3 className="mt-3 text-2xl">In-Room Dining</h3>
            <div className="gold-rule mt-4" />

            <ul className="mt-5 space-y-2" aria-live="polite">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-4 text-sm text-muted-foreground">
                  <span>
                    {l.qty} × {l.name}
                  </span>
                  <span>${l.qty * l.price}</span>
                </li>
              ))}
              {lines.length === 0 && (
                <li className="text-sm text-muted-foreground">No dishes selected yet.</li>
              )}
            </ul>
            <p className="mt-4 flex justify-between border-t border-border pt-3 text-sm">
              <span className="tracking-wider uppercase">Subtotal</span>
              <span>${total}</span>
            </p>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dining-when">Delivery</Label>
                <select
                  id="dining-when"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="h-11 w-full border border-input bg-transparent px-3 text-sm"
                >
                  {[
                    "As soon as possible",
                    "In 30 minutes",
                    "In 1 hour",
                    "This evening",
                    "Tomorrow morning",
                  ].map((w) => (
                    <option key={w} value={w} className="bg-card">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dining-unit">Residence number</Label>
                <Input
                  id="dining-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Residence 34B"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dining-notes">Notes for the kitchen</Label>
                <Textarea
                  id="dining-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Allergies, table setting, timing…"
                />
              </div>
              <Button type="submit" size="cta" className="min-h-12 w-full">
                Place order
              </Button>
            </div>

            {placed.length > 0 && (
              <div className="mt-7 border-t border-border pt-5">
                <p className="eyebrow">Orders placed</p>
                <ul className="mt-3 space-y-3">
                  {placed.map((o) => (
                    <li key={o.id} className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        {o.when} · ${o.total}
                      </span>
                      <span className="mt-1 block">{o.lines.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </aside>
      </div>
    </section>
  );
}
