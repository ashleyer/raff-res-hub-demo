import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LegalDocument, type LegalSection } from "@/components/LegalDocument";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy, Raffles Boston Residences" },
      {
        name: "description",
        content:
          "How the Raffles Boston Residences resident portal handles resident information, directory visibility, messaging and demo data.",
      },
      { property: "og:title", content: "Privacy Policy, Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Resident portal privacy practices: what is collected, how directory visibility works, and how information is retained.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: LegalSection[] = [
  {
    heading: "Information we hold",
    body: [
      "The portal stores the residence number, display name and contact details you provide when you create a profile, together with the requests, reservations, posts and survey responses you submit.",
      "In this preview environment, all of that information is held in your own browser. Nothing is transmitted to Raffles, Accor or any third party.",
    ],
  },
  {
    heading: "Directory visibility",
    body: [
      "Listing your household in the Residents' Directory is entirely optional. Nothing about your household appears there unless you switch it on, and contact details are shown only to neighbours you have opted in to hear from.",
      "You may withdraw your listing at any time from your household profile; the change takes effect immediately.",
    ],
  },
  {
    heading: "How information is used",
    body: [
      "Resident information is used to route concierge, valet, maintenance and dining requests, to operate governance ballots and events, and to provide the personalised suggestions shown on your home screen.",
      "Monthly Residence Happiness Survey responses are reported to management in aggregate.",
    ],
  },
  {
    heading: "Retention and removal",
    body: [
      "Clearing your browser data removes everything the portal has stored about you. Signing out with \u201cRemember me\u201d switched off clears your saved residence and contact details as well.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy may be directed to the concierge desk at 617-589-1480 or ResidencesConcierge.Boston@raffles.com.",
    ],
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content">
        <LegalDocument
          eyebrow="Resident portal"
          title="Privacy Policy"
          updated="Last updated 1 August 2026"
          sections={SECTIONS}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
