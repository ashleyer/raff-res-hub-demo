import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ThankYouNote } from "@/lib/gratitude-data";

/** Rotating display of residents' notes of thanks to the house team. */
export function ThankYouCarousel({
  notes,
  label = "Notes of thanks from residents",
}: {
  notes: ThankYouNote[];
  label?: string;
}) {
  if (notes.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No notes yet. Be the first to thank a member of the team.
      </p>
    );
  }

  return (
    <Carousel
      opts={{ align: "start", loop: notes.length > 2 }}
      aria-label={label}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {notes.map((note) => (
          <CarouselItem key={note.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
            <figure className="flex h-full flex-col border border-primary/30 bg-card">
              {note.attachment?.kind === "image" && (
                <img
                  src={note.attachment.src}
                  alt={`Photograph attached to the note for ${note.recipient}`}
                  loading="lazy"
                  className="h-36 w-full object-cover"
                />
              )}
              {note.attachment?.kind === "video" && (
                <video
                  src={note.attachment.src}
                  controls
                  preload="metadata"
                  aria-label={`Video attached to the note for ${note.recipient}`}
                  className="h-36 w-full bg-black object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <Quote className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed">
                  {note.body}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-medium text-primary">{note.recipient}</p>
                  <p className="mt-1 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                    {note.anonymous ? "Anonymous" : note.author} · {note.at}
                  </p>
                </figcaption>
              </div>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-end gap-3">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}
