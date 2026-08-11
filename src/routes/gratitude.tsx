import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Sparkles, X } from "lucide-react";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { ThankYouCarousel } from "@/components/ThankYouCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  GRATITUDE_GALLERY,
  SEED_THANK_YOU_NOTES,
  THANKABLE_GROUPS,
  THANKABLE_OTHER,
  THANKABLE_STAFF,
  type ThankYouNote,
} from "@/lib/gratitude-data";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/gratitude")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Thank You Notes, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "A residents' board for thanking outstanding staff, neighbours, pets, spaces and Boston favourites, with a photo or video, signed or anonymous.",
      },
      { property: "og:title", content: "Thank You Notes, Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Publicly thank the concierge, engineering, housekeeping and valet teams, a neighbour, a pet or a favourite corner of the building, anonymously if you prefer.",
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
      intro="A public board for crediting the people, pets, places and moments that make the building feel like home. Notes appear for every resident to read, with an optional photograph or video; leave your residence number off if you would rather thank someone quietly."
    >
      <section
        aria-labelledby="carousel-heading"
        className="mt-12 border border-primary/40 bg-primary/5 p-6 sm:p-8"
      >
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          The board, highlighted
        </p>
        <h2 id="carousel-heading" className="mt-3 text-2xl">
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
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex flex-col border border-primary/30 bg-card shadow-[0_0_0_1px_oklch(from_var(--primary)_l_c_h_/_0.08)]"
            >
              {note.attachment?.kind === "image" && (
                <img
                  src={note.attachment.src}
                  alt={`Photograph attached to the note for ${note.recipient}`}
                  loading="lazy"
                  className="h-44 w-full object-cover"
                />
              )}
              {note.attachment?.kind === "video" && (
                <video
                  src={note.attachment.src}
                  controls
                  preload="metadata"
                  aria-label={`Video attached to the note for ${note.recipient}`}
                  className="h-44 w-full bg-black object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-pretty text-sm leading-relaxed">{note.body}</p>
                <p className="mt-4 text-sm font-medium text-primary">{note.recipient}</p>
                <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                  {note.anonymous ? "Posted anonymously" : note.author} · {note.at}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

function NoteForm({ onPost }: { onPost: (note: ThankYouNote) => void }) {
  const { currentUser } = usePortal();
  const fileRef = useRef<HTMLInputElement>(null);
  const [recipient, setRecipient] = useState<string>(THANKABLE_STAFF[0]);
  const [otherRecipient, setOtherRecipient] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [galleryPick, setGalleryPick] = useState<string>("");
  const [attachment, setAttachment] = useState<{ src: string; kind: "image" | "video" } | null>(
    null,
  );

  const pickFile = (file?: File) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Please choose a photograph or video file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Please choose a file under 25 MB.");
      return;
    }
    setGalleryPick("");
    setAttachment({ src: URL.createObjectURL(file), kind: isVideo ? "video" : "image" });
  };

  const clearAttachment = () => {
    setAttachment(null);
    setGalleryPick("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecipient =
      recipient === THANKABLE_OTHER ? otherRecipient.trim().slice(0, 150) : recipient;
    if (!finalRecipient) {
      toast.error("Tell us who or what you are thanking.");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Please write a line or two so the team knows what to celebrate.");
      return;
    }
    onPost({
      id: Date.now(),
      recipient: finalRecipient,
      role: finalRecipient.split(", ")[1]?.trim() ?? "With thanks",
      body: body.trim().slice(0, 600),
      author: currentUser?.unit
        ? `Residence ${currentUser.unit}`.replace("Residence Residence", "Residence")
        : "A resident",
      anonymous,
      at: "Just now",
      ...(attachment ? { attachment } : {}),
    });
    setBody("");
    setOtherRecipient("");
    clearAttachment();
    toast.success("Posted to the board, and copied to the residences manager.");
  };

  return (
    <section
      aria-labelledby="post-heading"
      className="mt-16 border border-primary/40 bg-card p-6 sm:p-8"
    >
      <p className="eyebrow">Add a note</p>
      <h2 id="post-heading" className="mt-3 text-2xl">
        Thank someone or something
      </h2>
      <div className="gold-rule mt-4" />

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="ty-recipient">Who or what would you like to thank?</Label>
          <select
            id="ty-recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
          >
            {THANKABLE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={THANKABLE_OTHER}>{THANKABLE_OTHER}</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Staff are listed first, followed by neighbours, pets, events, spaces in the property,
            other Raffles and Accor hotels, and Boston landmarks, transport, businesses and
            experiences.
          </p>
        </div>

        {recipient === THANKABLE_OTHER && (
          <div className="space-y-2">
            <Label htmlFor="ty-other">Name the person, place or thing</Label>
            <Input
              id="ty-other"
              value={otherRecipient}
              maxLength={150}
              onChange={(e) => setOtherRecipient(e.target.value)}
              placeholder="The pianist in the Long Bar on Fridays"
              className="min-h-11"
            />
          </div>
        )}

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

        <fieldset className="space-y-4 border border-border p-4 sm:p-5">
          <legend className="px-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Attach a photograph or video (optional)
          </legend>

          {attachment ? (
            <div className="space-y-3">
              {attachment.kind === "image" ? (
                <img
                  src={attachment.src}
                  alt="Preview of the photograph attached to this note"
                  className="max-h-56 w-full border border-border object-cover"
                />
              ) : (
                <video
                  src={attachment.src}
                  controls
                  preload="metadata"
                  aria-label="Preview of the video attached to this note"
                  className="max-h-56 w-full border border-border bg-black object-cover"
                />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={clearAttachment}
                className="min-h-11 tracking-[0.16em] uppercase"
              >
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
                Remove attachment
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="ty-file" className="inline-flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-primary" aria-hidden="true" />
                  Upload from this device
                </Label>
                <Input
                  id="ty-file"
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="min-h-11"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                  aria-describedby="ty-file-hint"
                />
                <p id="ty-file-hint" className="text-xs text-muted-foreground">
                  Files stay in your browser for this demo; nothing is uploaded to a server.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ty-gallery">Or pick one from the residence gallery</Label>
                <select
                  id="ty-gallery"
                  value={galleryPick}
                  onChange={(e) => {
                    const src = e.target.value;
                    setGalleryPick(src);
                    setAttachment(src ? { src, kind: "image" } : null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">No gallery photograph</option>
                  {GRATITUDE_GALLERY.map((g) => (
                    <option key={g.src} value={g.src}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  A preloaded set of hotel and residence photographs from this site, ready to
                  illustrate a note.
                </p>
              </div>
            </>
          )}
        </fieldset>

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
