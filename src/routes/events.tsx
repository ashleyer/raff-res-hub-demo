import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Sparkles, ThumbsUp, Users } from "lucide-react";
import { toast } from "sonner";
import {
  SEED_EVENTS,
  SEED_EVENT_IDEAS,
  type EventIdea,
  type ResidentEvent,
} from "@/lib/intranet-data";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePortal } from "@/lib/portal-store";
import { ForYou } from "@/components/ForYou";
import { PastEventsCarousel } from "@/components/PastEventsCarousel";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Resident Events & RSVP · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "The residents' calendar at 40 Trinity Place: wine salons, chef's tables and wellness mornings, with RSVP and a register for proposing new events.",
      },
      { property: "og:title", content: "Resident Events & RSVP · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "RSVP to residents' events and propose gatherings of your own on Floor 21 and beyond.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { logActivity } = usePortal();
  const [events, setEvents] = useState<ResidentEvent[]>(SEED_EVENTS);
  const [rsvped, setRsvped] = useState<Record<number, number>>({});
  const [ideas, setIdeas] = useState<EventIdea[]>(SEED_EVENT_IDEAS);
  const [supported, setSupported] = useState<number[]>([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [unit, setUnit] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [guestCount, setGuestCount] = useState("1");

  const rsvp = (event: ResidentEvent) => {
    const party = Math.max(1, Number(guestCount) || 1);
    if (rsvped[event.id]) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, attending: e.attending - rsvped[event.id]! } : e,
        ),
      );
      setRsvped((prev) => {
        const next = { ...prev };
        delete next[event.id];
        return next;
      });
      toast.success("RSVP withdrawn.");
      return;
    }
    if (event.attending + party > event.capacity) {
      toast.error("That gathering is at capacity. The concierge keeps a waiting list.");
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, attending: e.attending + party } : e)),
    );
    setRsvped((prev) => ({ ...prev, [event.id]: party }));
    logActivity({ kind: "rsvp", refId: String(event.id), label: event.title });
    toast.success(`Attending ${event.title} · party of ${party}.`);
  };

  const submitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("A title and description are required.");
      return;
    }
    if (!anonymous && !unit.trim()) {
      toast.error("Attributed proposals require a residence number.");
      return;
    }
    setIdeas((prev) => [
      {
        id: Date.now(),
        title: title.trim().slice(0, 150),
        body: body.trim().slice(0, 1000),
        anonymous,
        interest: 1,
        ...(anonymous ? {} : { unit: unit.trim() }),
      },
      ...prev,
    ]);
    setTitle("");
    setBody("");
    setUnit("");
    toast.success("Proposal lodged with the events committee.");
  };

  const support = (id: number) => {
    if (supported.includes(id)) {
      toast.error("You have already registered interest.");
      return;
    }
    setSupported((prev) => [...prev, id]);
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, interest: i.interest + 1 } : i)));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 md:py-20"
      >
        <p className="eyebrow">Residents' Calendar</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Events & gatherings</h1>
        <div className="gold-rule mt-5" />
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Gatherings hosted for Raffles Residents across the Raffles Boston Residences and Hotel
          property, as well as occasionally at special off-site venues. Check out upcoming Events,
          RSVP below, or propose an occasion of your own inspiration to be approved by the
          Management/Board, with your neighbours' upvote if they agree!
        </p>

        <div className="mt-10 flex flex-wrap items-end gap-4">
          <div className="w-40 space-y-2">
            <Label htmlFor="party">Party size</Label>
            <Input
              id="party"
              type="number"
              min={1}
              max={10}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
          <p className="pb-3 text-xs text-muted-foreground">Applied to each RSVP you place.</p>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const mine = rsvped[e.id];
            const remaining = e.capacity - e.attending;
            return (
              <li key={e.id}>
                <article className="flex h-full flex-col border border-border bg-card">
                  <img
                    src={e.image}
                    alt={`${e.title} at The Raffles Residences Boston`}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-2xl leading-snug">{e.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
                    <dl className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <dt className="sr-only">Date</dt>
                        <dd>{e.date}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <dt className="sr-only">Time</dt>
                        <dd>{e.time}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <dt className="sr-only">Location</dt>
                        <dd>{e.location}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <dt className="sr-only">Attendance</dt>
                        <dd>
                          {e.attending} of {e.capacity} places taken · {remaining} remaining
                        </dd>
                      </div>
                    </dl>
                    <Button
                      variant={mine ? "outline" : "default"}
                      onClick={() => rsvp(e)}
                      className="mt-6 min-h-11 w-full tracking-[0.18em] uppercase"
                    >
                      {mine ? `Attending · party of ${mine}` : "RSVP"}
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <section className="mt-20 grid gap-12 border-t border-border pt-14 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="eyebrow">Events Committee</p>
            <h2 className="mt-3 text-3xl">Proposed by residents</h2>
            <div className="gold-rule mt-4" />
            <ul className="mt-6 space-y-4">
              {ideas.map((i) => (
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
                  <Button
                    variant="outline"
                    onClick={() => support(i.id)}
                    className="tracking-[0.18em] uppercase"
                    aria-label={`Register interest in ${i.title}`}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" aria-hidden="true" />
                    {i.interest}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <form onSubmit={submitIdea} className="border border-border bg-card p-7">
              <p className="eyebrow">Suggest an event</p>
              <h2 className="mt-3 text-2xl">Propose a gathering</h2>
              <div className="gold-rule mt-4" />

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="idea-title">Title</Label>
                  <Input
                    id="idea-title"
                    value={title}
                    maxLength={150}
                    onChange={(ev) => setTitle(ev.target.value)}
                    placeholder="Autumn rooftop jazz trio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idea-body">Description</Label>
                  <Textarea
                    id="idea-body"
                    value={body}
                    maxLength={1000}
                    rows={5}
                    onChange={(ev) => setBody(ev.target.value)}
                    placeholder="What the occasion is, who it suits, and where it might be held."
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(ev) => setAnonymous(ev.target.checked)}
                    className="h-4 w-4 accent-current"
                  />
                  Submit anonymously
                </label>
                {!anonymous && (
                  <div className="space-y-2">
                    <Label htmlFor="idea-unit">Residence number</Label>
                    <Input
                      id="idea-unit"
                      value={unit}
                      onChange={(ev) => setUnit(ev.target.value)}
                      placeholder="Residence 34B"
                    />
                  </div>
                )}
                <Button type="submit" className="min-h-12 w-full tracking-[0.18em] uppercase">
                  Lodge proposal
                </Button>
              </div>
            </form>
          </aside>
        </section>

        <PastEventsCarousel />

        <ForYou variant="inline" area="events" />
      </main>
      <SiteFooter />
    </div>
  );
}
