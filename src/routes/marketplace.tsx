import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { ForYou } from "@/components/ForYou";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import type { Listing } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/marketplace")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Residents' Marketplace · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Ask neighbours for service recommendations (dog sitters, cleaners, tutors) and buy, sell or give away household items.",
      },
      { property: "og:title", content: "Residents' Marketplace · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Service recommendations and resident-to-resident listings at 40 Trinity Place.",
      },
    ],
  }),
  component: MarketplacePage,
});

const KINDS: Listing["kind"][] = [
  "Recommendation wanted",
  "Activity partner",
  "For sale",
  "To give away",
];

function MarketplacePage() {
  return (
    <PageShell
      eyebrow="Marketplace"
      title="Recommendations & resident listings"
      intro="Ask the building who they trust for a dog sitter or a house cleaner, and pass on furnishings you no longer need."
    >
      <RequireSession area="the residents' marketplace">
        <MarketplaceBody />
      </RequireSession>
    </PageShell>
  );
}

function MarketplaceBody() {
  const { listings, addListing, addListingReply, currentUser } = usePortal();
  const [filter, setFilter] = useState<"All" | Listing["kind"]>("All");
  const [kind, setKind] = useState<Listing["kind"]>("Recommendation wanted");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const visible = listings.filter((l) => filter === "All" || l.kind === filter);

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="text-2xl">
          Open listings
        </h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["All", ...KINDS] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
                filter === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <ul className="mt-8 space-y-5" aria-live="polite">
          {visible.map((l) => (
            <li key={l.id} className="border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="eyebrow">{l.kind}</p>
                {typeof l.price === "number" && (
                  <p className="font-display text-2xl">
                    {l.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                )}
              </div>
              <h3 className="mt-2 text-2xl leading-snug">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
              <p className="mt-3 text-xs tracking-wider text-muted-foreground uppercase">
                {l.author} · {l.at}
              </p>

              {l.replies.length > 0 && (
                <ul className="mt-5 space-y-3 border-t border-border pt-4">
                  {l.replies.map((r) => (
                    <li key={r.id} className="border-l-2 border-primary/40 pl-4 text-sm">
                      <p>{r.body}</p>
                      <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                        {r.author} · {r.at}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="mt-5 flex flex-wrap items-end gap-3 border-t border-border pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const draft = (drafts[l.id] ?? "").trim();
                  if (!draft) {
                    toast.error("Write a reply first.");
                    return;
                  }
                  addListingReply(l.id, draft, `${currentUser?.name} · ${currentUser?.unit}`);
                  setDrafts((prev) => ({ ...prev, [l.id]: "" }));
                }}
              >
                <div className="min-w-[16rem] flex-1 space-y-2">
                  <Label htmlFor={`m-reply-${l.id}`}>Answer “{l.title}”</Label>
                  <Input
                    id={`m-reply-${l.id}`}
                    value={drafts[l.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [l.id]: e.target.value }))}
                    className="min-h-11"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="min-h-11 tracking-[0.16em] uppercase"
                >
                  Reply
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form
          className="border border-border bg-card p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) {
              toast.error("A title and description are required.");
              return;
            }
            const parsed = Number(price);
            addListing({
              kind,
              title: title.trim(),
              body: body.trim(),
              ...(kind === "For sale" && price.trim() && !Number.isNaN(parsed)
                ? { price: parsed }
                : {}),
              author: anonymous
                ? "Anonymous deed-holder"
                : `${currentUser?.name} · ${currentUser?.unit}`,
            });
            setTitle("");
            setBody("");
            setPrice("");
            toast.success("Listing posted to the marketplace.");
          }}
        >
          <h2 className="text-2xl">Post a listing</h2>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="l-kind">Type</Label>
              <select
                id="l-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as Listing["kind"])}
                className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-title">Title</Label>
              <Input
                id="l-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-body">Details</Label>
              <Textarea
                id="l-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            {kind === "For sale" && (
              <div className="space-y-2">
                <Label htmlFor="l-price">Asking price (USD)</Label>
                <Input
                  id="l-price"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="min-h-11"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <Label htmlFor="l-anon" className="text-sm font-normal">
                Post anonymously
              </Label>
              <Switch id="l-anon" checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
              Publish listing
            </Button>
          </div>
        </form>
      </aside>
      <div className="col-span-full">
        <ForYou variant="inline" area="marketplace" />
      </div>
    </div>
  );
}
