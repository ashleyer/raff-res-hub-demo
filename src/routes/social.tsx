import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SocialFeed } from "@/components/SocialFeed";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Social · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "The latest from the building's social channels at 40 Trinity Place, gathered in one place for residents.",
      },
      { property: "og:title", content: "Social · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "The latest from the building's social channels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SocialPage,
});

function SocialPage() {
  return (
    <PageShell
      eyebrow="Social"
      title="From the residences"
      intro="The latest from the building's social channels. In this demo the posts are illustrative rather than live."
    >
      <SocialFeed />
    </PageShell>
  );
}
