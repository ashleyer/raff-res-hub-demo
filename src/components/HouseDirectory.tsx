import { Phone } from "lucide-react";
import { DemoTag } from "@/components/DemoTag";

/** Dummy in-house extensions for the demo. Numbers are not real. */
const EXTENSIONS = [
  {
    name: "Concierge desk",
    detail: "Requests, reservations, transport",
    ext: "2000",
    hours: "24 hours",
  },
  {
    name: "Front desk · Raffles Boston Hotel",
    detail: "Hotel operator",
    ext: "1000",
    hours: "24 hours",
  },
  {
    name: "In-Residence Dining",
    detail: "Private dining served in your residence",
    ext: "2400",
    hours: "24 hours",
  },
  {
    name: "Residents' Lounge, Floor 21",
    detail: "Nantucket Kitchen & lounge reservations",
    ext: "2100",
    hours: "24 hours",
  },
  {
    name: "Security desk",
    detail: "Safety concerns and incidents",
    ext: "2911",
    hours: "24 hours",
  },
  {
    name: "Valet & arrival court",
    detail: "Vehicle retrieval and guest arrivals",
    ext: "2200",
    hours: "24 hours",
  },
  {
    name: "Engineering",
    detail: "Maintenance and in-residence repairs",
    ext: "2300",
    hours: "7 AM – 7 PM",
  },
  {
    name: "Housekeeping",
    detail: "Cleaning, linen and dry cleaning",
    ext: "2350",
    hours: "8 AM – 6 PM",
  },
  {
    name: "Residences management office",
    detail: "House account, governance, documents",
    ext: "2050",
    hours: "Mon–Fri, 9 AM – 5 PM",
  },
  { name: "Guerlain Spa", detail: "Treatments and bookings", ext: "1600", hours: "9 AM – 8 PM" },
  { name: "La Padrona", detail: "Restaurant reservations", ext: "1700", hours: "From 4 PM" },
  { name: "The Blind Duck", detail: "Bar reservations", ext: "1750", hours: "From 4 PM" },
  { name: "Long Bar & Terrace", detail: "Bar enquiries", ext: "1720", hours: "From 6:30 AM" },
  { name: "Patisserie", detail: "Orders and collection", ext: "1800", hours: "7 AM – 6 PM" },
];

const HOUSE_LINE = "+1 (617) 555-0100";

/** House telephone directory with dummy extensions for the demo portal. */
export function HouseDirectory() {
  return (
    <section
      aria-labelledby="house-extensions"
      className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8"
    >
      <div className="border border-border bg-card px-5 py-10 sm:px-10">
        <p className="eyebrow text-center">By telephone</p>
        <h2 id="house-extensions" className="mt-3 text-balance text-center text-xl sm:text-2xl">
          House extensions
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-center text-sm leading-relaxed text-muted-foreground">
          Dial an extension from any residence handset, or call the house line{" "}
          <a
            href={`tel:${HOUSE_LINE.replace(/[^\d+]/g, "")}`}
            className="text-foreground underline underline-offset-4"
          >
            {HOUSE_LINE}
          </a>{" "}
          and ask for the extension below.
        </p>

        <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {EXTENSIONS.map((e) => (
            <li
              key={e.ext}
              className="relative flex items-start justify-between gap-4 bg-card p-5 pt-8"
            >
              <DemoTag label="Demo extension" title="Simulated extension · does not connect" />
              <div className="min-w-0">
                <h3 className="text-base leading-snug">{e.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {e.hours}
                </p>
              </div>
              <a
                href={`tel:${HOUSE_LINE.replace(/[^\d+]/g, "")},${e.ext}`}
                aria-label={`Call ${e.name} on extension ${e.ext}`}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-primary px-3 text-sm tracking-[0.14em] text-primary uppercase hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {e.ext}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo directory · extensions and the house line are simulated and do not connect. For
          emergencies, dial 911.
        </p>
      </div>
    </section>
  );
}
