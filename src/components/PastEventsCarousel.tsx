import { DemoTag } from "@/components/DemoTag";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PAST_EVENT_PHOTOS } from "@/lib/venue-extras";

/** Photographs from gatherings already held in the residences. */
export function PastEventsCarousel() {
  return (
    <section aria-labelledby="past-events-heading" className="mt-20 border-t border-border pt-14">
      <p className="eyebrow">Looking back</p>
      <h2 id="past-events-heading" className="mt-3 text-3xl">
        Photographs from past gatherings
      </h2>
      <div className="gold-rule mt-4" />
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        A season of evenings across Floor 21, the arrival lobby and the terrace. Images are
        illustrative in this demonstration.
      </p>

      <Carousel
        opts={{ align: "start", loop: true }}
        aria-label="Photographs from past resident events"
        className="mt-8"
      >
        <CarouselContent className="-ml-4">
          {PAST_EVENT_PHOTOS.map((photo) => (
            <CarouselItem key={photo.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
              <figure className="relative h-full border border-border bg-card">
                <DemoTag label="Demo photo" title="Illustrative photo, not a real event" />
                <img
                  src={photo.image}
                  alt={photo.alt}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover"
                />
                <figcaption className="p-5">
                  <p className="text-lg">{photo.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {photo.caption}
                  </p>
                  <p className="mt-3 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
                    {photo.when}
                  </p>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-6 flex justify-end gap-3">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}
