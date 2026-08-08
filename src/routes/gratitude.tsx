import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { ThankYouCarousel } from "@/components/ThankYouCarousel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SEED_THANK_YOU_NOTES, THANKABLE_STAFF, type ThankYouNote } from "@/lib/gratitude-data";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/gratitude")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Thank You Notes — Raffles Boston Residences" },
      {
        name: "description",
        content:
          "A residents' message board for thanking outstanding members of the house team at 40 Trinity Place — signed or anonymous.",
      },
      { property: "og:title", content: "Thank You Notes — Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Publicly thank the concierge, engineering, housekeeping and valet teams — anonymously if you prefer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GratitudePage,
});

function GratitudePage() {
  const [notes, setNotes] = useState<ThankYouNote[]>(SEED_THANK_YOU_NOTES);

  return (
    <PageShell
      eyebrow="Notes of Thanks"
      title="Thank You Notes"
      intro="A public board for crediting the people who look after the building. Notes appear for every resident to read; leave your residence number off if you would rather thank someone quietly."
    >
      <section aria-labelledby="carousel-heading" className="mt-12">
        <h2 id="carousel-heading" className="text-2xl">
          Recently posted
        </h2>
        <div className="mt-6">
          <ThankYouCarousel notes={notes} />
        </div>
      </section>

      <RequireSession area="Thank You Notes">
        <NoteForm onPost={(note) => setNotes((prev) => [note, ...prev])} />
      </RequireSession>

      <section aria-labelledby="board-heading" className="mt-20 border-t border-border pt-14">
        <h2 id="board-heading" className="text-2xl">
          The full board
        </h2>
        <ul className="mt-6 space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="border border-border bg-card p-6">
              <p className="text-pretty text-sm leading-relaxed">{note.body}</p>
              <p className="mt-4 text-sm">{note.recipient}</p>
              <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                {note.anonymous ? "Posted anonymously" : note.author} · {note.at}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

function NoteForm({ onPost }: { onPost: (note: ThankYouNote) => void }) {
  const { currentUser } = usePortal();
  const [recipient, setRecipient] = useState<string>(THANKABLE_STAFF[0]);
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 10) {
      toast.error("Please write a line or two so the team knows what to celebrate.");
      return;
    }
    onPost({
      id: Date.now(),
      recipient,
      role: recipient.split("—")[1]?.trim() ?? "House team",
      body: body.trim().slice(0, 600),
      author: currentUser?.unit
        ? `Residence ${currentUser.unit}`.replace("Residence Residence", "Residence")
        : "A resident",
      anonymous,
      at: "Just now",
    });
    setBody("");
    toast.success("Posted to the board — and copied to the residences manager.");
  };

  return (
    <section
      aria-labelledby="post-heading"
      className="mt-16 border border-border bg-card p-6 sm:p-8"
    >
      <p className="eyebrow">Add a note</p>
      <h2 id="post-heading" className="mt-3 text-2xl">
        Thank someone
      </h2>
      <div className="gold-rule mt-4" />

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="ty-recipient">Who would you like to thank?</Label>
          <select
            id="ty-recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
          >
            {THANKABLE_STAFF.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ty-body">Your note</Label>
          <Textarea
            id="ty-body"
            rows={5}
            maxLength={600}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What they did, and why it mattered."
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0 flex-1">
            <Label htmlFor="ty-anon" className="text-sm font-normal">
              Post anonymously
            </Label>
            <p id="ty-anon-hint" className="mt-1 text-pretty text-xs text-muted-foreground">
              Your residence number is hidden from the board. Management still sees the note
              attributed.
            </p>
          </div>
          <Switch
            id="ty-anon"
            checked={anonymous}
            onCheckedChange={setAnonymous}
            aria-describedby="ty-anon-hint"
          />
        </div>

        <Button type="submit" className="min-h-12 w-full tracking-[0.18em] uppercase sm:w-auto">
          Post note
        </Button>
      </form>
    </section>
  );
}
