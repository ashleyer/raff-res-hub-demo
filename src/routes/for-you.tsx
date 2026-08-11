import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { ForYou } from "@/components/ForYou";

export const Route = createFileRoute("/for-you")({
  ssr: false,
  beforeLoad: requireResidentSession,
  component: ForYouPage,
  head: () => ({
    meta: [
      { title: "Chosen for You | Raffles Residences Boston" },
      {
        name: "description",
        content:
          "Personalised amenity, event, community and house-account suggestions drawn from your own activity in the residents' portal.",
      },
      { property: "og:title", content: "Chosen for You | Raffles Residences Boston" },
      {
        property: "og:description",
        content:
          "Suggestions tailored to each resident from reservations, RSVPs, circles and account activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ForYouPage() {
  return (
    <PageShell
      eyebrow="Personalised"
      title="Chosen for you"
      intro="Suggestions assembled from the data points you have already given the portal · your stated interests, amenity reservations, event RSVPs, community circles, marketplace activity and house account. Rules choose what appears; the wording is drafted automatically."
    >
      <RequireSession area="your personalised suggestions">
        <ForYou variant="full" showSignals />
      </RequireSession>
    </PageShell>
  );
}
