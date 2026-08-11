import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, TabBar, TabPanel } from "@/components/PageShell";
import {
  LEASE_LISTINGS,
  PARKING_LISTINGS,
  SALE_LISTINGS,
  type LeaseListing,
  type SaleListing,
} from "@/lib/market-data";

export const Route = createFileRoute("/sales-and-leasing")({
  head: () => ({
    meta: [
      { title: "Residences for Sale & Lease, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Availability at 40 Trinity Place: residences for sale, pending and recently sold, homes available to lease, and deeded or licensed parking spaces.",
      },
      { property: "og:title", content: "Residences for Sale & Lease, Raffles Boston" },
      {
        property: "og:description",
        content: "Current sale, pending, sold and leasing availability, including parking spaces.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesAndLeasingPage,
});

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TABS = [
  { id: "sales", label: "For sale & sold" },
  { id: "leasing", label: "Leasing" },
  { id: "parking", label: "Parking" },
];

function SalesAndLeasingPage() {
  const [tab, setTab] = useState("sales");

  return (
    <PageShell
      eyebrow="Availability"
      title="Sales & leasing"
      intro="What is on the market within the building, what is under agreement and what has recently closed, together with parking spaces available by deed or licence. Figures in this demonstration are illustrative."
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} label="Availability categories" />

      <TabPanel id="sales" active={tab}>
        <ul className="grid gap-6 md:grid-cols-2">
          {SALE_LISTINGS.map((l) => (
            <li key={l.id}>
              <SaleCard listing={l} />
            </li>
          ))}
        </ul>
      </TabPanel>

      <TabPanel id="leasing" active={tab}>
        <ul className="grid gap-6 md:grid-cols-2">
          {LEASE_LISTINGS.map((l) => (
            <li key={l.id}>
              <LeaseCard listing={l} />
            </li>
          ))}
        </ul>
      </TabPanel>

      <TabPanel id="parking" active={tab}>
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Parking spaces available for sale or lease</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <th scope="col" className="p-4">
                  Space
                </th>
                <th scope="col" className="p-4">
                  Offering
                </th>
                <th scope="col" className="p-4">
                  Status
                </th>
                <th scope="col" className="p-4 text-right">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {PARKING_LISTINGS.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 align-top">
                  <td className="p-4">
                    <span className="block">{p.space}</span>
                    <span className="block text-xs text-muted-foreground">{p.level}</span>
                  </td>
                  <td className="p-4">
                    <span className="block">
                      {p.kind === "Sale" ? "Deeded sale" : "Monthly licence"}
                    </span>
                    <span className="block text-xs text-muted-foreground">{p.note}</span>
                  </td>
                  <td className="p-4">
                    <StatusChip status={p.status} />
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {money(p.price)}
                    {p.kind === "Lease" && (
                      <span className="text-xs text-muted-foreground"> / month</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabPanel>

      <p className="mt-12 border border-dashed border-border p-6 text-sm leading-relaxed text-muted-foreground">
        Enquiries and private viewings are arranged through the residences office. Every transfer,
        lease and parking licence is subject to board review under the condominium documents.
      </p>
    </PageShell>
  );
}

function StatusChip({ status }: { status: string }) {
  const closed = status === "Sold" || status === "Leased" || status === "Recently sold";
  const pending =
    status === "Pending" || status === "Under agreement" || status === "Application pending";
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[0.65rem] tracking-[0.16em] uppercase ${
        closed
          ? "border-border text-muted-foreground"
          : pending
            ? "border-destructive text-destructive"
            : "border-primary text-primary"
      }`}
    >
      {status}
    </span>
  );
}

function SaleCard({ listing }: { listing: SaleListing }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card">
      <img
        src={listing.image}
        alt={`Interior view representative of ${listing.unit}`}
        width={1200}
        height={800}
        loading="lazy"
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{listing.unit}</h2>
          <StatusChip status={listing.status} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{listing.exposure}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Beds</dt>
            <dd>{listing.beds}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Baths</dt>
            <dd>{listing.baths}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Sq ft</dt>
            <dd>{listing.sqft.toLocaleString("en-US")}</dd>
          </div>
        </dl>
        <p className="mt-5 font-display text-3xl">
          {money(listing.closedPrice ?? listing.price)}
          {listing.closedPrice && (
            <span className="ml-2 align-middle text-sm text-muted-foreground">
              closed · asked {money(listing.price)}
            </span>
          )}
        </p>
        <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
          {listing.note}
        </p>
        <p className="mt-4 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
          {listing.listed}
        </p>
      </div>
    </article>
  );
}

function LeaseCard({ listing }: { listing: LeaseListing }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card">
      <img
        src={listing.image}
        alt={`Interior view representative of ${listing.unit}`}
        width={1200}
        height={800}
        loading="lazy"
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{listing.unit}</h2>
          <StatusChip status={listing.status} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {listing.beds} bed · {listing.baths} bath · {listing.sqft.toLocaleString("en-US")} sq ft
        </p>
        <p className="mt-5 font-display text-3xl">
          {money(listing.monthly)}
          <span className="ml-2 align-middle text-sm text-muted-foreground">per month</span>
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {listing.furnished} · {listing.term}
        </p>
        <p className="mt-4 text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase">
          {listing.available}
        </p>
      </div>
    </article>
  );
}
