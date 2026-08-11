import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LegalDocument, type LegalSection } from "@/components/LegalDocument";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Terms of use for the Raffles Boston Residences resident portal: eligibility, resident conduct, bookings and requests, and demo limitations.",
      },
      { property: "og:title", content: "Terms of Use · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Conditions for using the resident portal, including conduct in shared spaces, bookings, marketplace listings and demo limitations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "Eligibility",
    body: [
      "The portal is intended for residents, owners and authorised occupants of The Raffles Residences Boston, together with residences management and hotel staff acting in their professional capacity.",
      "Access codes and sign-in details are personal to you and should not be shared outside your household.",
    ],
  },
  {
    heading: "Requests and reservations",
    body: [
      "Concierge, valet, dining, maintenance and amenity requests submitted through the portal are subject to availability and to house rules set out in the Residence Handbook.",
      "Amenity reservations may be adjusted or released by management where a space is required for building operations.",
    ],
  },
  {
    heading: "Community conduct",
    body: [
      "The directory, forum, marketplace, gallery and thank-you notes are shared resident spaces. Content should be courteous and relevant to the building; commercial solicitation outside the marketplace is not permitted.",
      "Management may remove content that is unlawful, harassing or discloses another household's information without consent.",
    ],
  },
  {
    heading: "Marketplace",
    body: [
      "Recommendations, services and items listed by residents are offered resident-to-resident. Raffles, Accor and residences management are not party to those arrangements and make no warranty regarding them.",
    ],
  },
  {
    heading: "Demo limitations",
    body: [
      "This is a preview environment. Residents, staff, listings, billing figures and press items shown here are simulated. Telephone extensions and demo email addresses do not connect, and no payment is ever processed.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        <LegalDocument
          eyebrow="Resident portal"
          title="Terms of Use"
          updated="Last updated 1 August 2026"
          sections={SECTIONS}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
