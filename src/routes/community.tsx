import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { SocialFeed } from "@/components/SocialFeed";
import { ThankYouCarousel } from "@/components/ThankYouCarousel";
import { SEED_THANK_YOU_NOTES } from "@/lib/gratitude-data";
import { ForYou } from "@/components/ForYou";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import { SUB_COMMUNITIES } from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/community")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Member Forum & Interest Groups · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Discuss community topics and join interest groups (wine, dogs, books, wellness and families) at The Raffles Residences Boston.",
      },
      { property: "og:title", content: "Member Forum · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Resident discussion and sub-communities built around shared interests.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <PageShell
      eyebrow="Member Forum"
      title="Community & interest groups"
      intro="A place for neighbours to talk. Join the circles that interest you and follow only those conversations."
    >
      <section aria-labelledby="thanks-heading" className="mt-12">
        <p className="eyebrow">Notes of thanks</p>
        <h2 id="thanks-heading" className="mt-3 text-2xl">
          Residents thanking the house team
        </h2>
        <div className="gold-rule mt-4" />
        <div className="mt-6">
          <ThankYouCarousel notes={SEED_THANK_YOU_NOTES} />
        </div>
        <Link to="/gratitude" className="btn-outline mt-6 inline-flex min-h-11 items-center">
          Visit Thank You Notes
        </Link>
      </section>

      <RequireSession area="the member forum">
        <CommunityBody />
        <SocialFeed />
      </RequireSession>
    </PageShell>
  );
}

function CommunityBody() {
  const { topics, addTopic, addReply, joined, toggleJoin, currentUser } = usePortal();
  const [filter, setFilter] = useState<string>("all");
  const [community, setCommunity] = useState<string>(SUB_COMMUNITIES[0]!.id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const visible = topics.filter((t) => filter === "all" || t.community === filter);
  const author = anonymous
    ? "Anonymous deed-holder"
    : `${currentUser?.name} · ${currentUser?.unit}`;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-2xl">
          Discussions
        </h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {[{ id: "all", name: "All topics" }, ...SUB_COMMUNITIES].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
              className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
                filter === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <ul className="mt-8 space-y-5" aria-live="polite">
          {visible.map((t) => {
            const group = SUB_COMMUNITIES.find((c) => c.id === t.community);
            return (
              <li key={t.id} className="border border-border bg-card p-6">
                <p className="eyebrow">{group?.name ?? "General"}</p>
                <h3 className="mt-2 text-2xl leading-snug">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                <p className="mt-3 text-xs tracking-wider text-muted-foreground uppercase">
                  {t.author} · {t.at}
                </p>

                {t.replies.length > 0 && (
                  <ul className="mt-5 space-y-3 border-t border-border pt-4">
                    {t.replies.map((r) => (
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
                    const draft = (replyDrafts[t.id] ?? "").trim();
                    if (!draft) {
                      toast.error("Write a reply first.");
                      return;
                    }
                    addReply(t.id, draft, `${currentUser?.name} · ${currentUser?.unit}`);
                    setReplyDrafts((prev) => ({ ...prev, [t.id]: "" }));
                  }}
                >
                  <div className="min-w-[16rem] flex-1 space-y-2">
                    <Label htmlFor={`reply-${t.id}`}>Reply to “{t.title}”</Label>
                    <Input
                      id={`reply-${t.id}`}
                      value={replyDrafts[t.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      className="min-h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="min-h-11 tracking-[0.16em] uppercase"
                  >
                    Post reply
                  </Button>
                </form>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No discussions in this circle yet.
            </li>
          )}
        </ul>
      </section>

      <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
        <section aria-labelledby="groups-heading" className="border border-border bg-card p-7">
          <h2 id="groups-heading" className="text-2xl">
            Sub-communities
          </h2>
          <ul className="mt-5 space-y-4">
            {SUB_COMMUNITIES.map((c) => {
              const isMember = joined.includes(c.id);
              return (
                <li key={c.id} className="border-t border-border pt-4">
                  <h3 className="text-lg">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                    {c.members} members
                  </p>
                  <Button
                    variant={isMember ? "default" : "outline"}
                    className="mt-3 min-h-11 tracking-[0.16em] uppercase"
                    onClick={() => {
                      toggleJoin(c.id);
                      toast.success(isMember ? `Left ${c.name}.` : `Joined ${c.name}.`);
                    }}
                  >
                    {isMember ? "Joined" : "Join"}
                    <span className="sr-only"> {c.name}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>

        <form
          className="border border-border bg-card p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) {
              toast.error("A title and a few words are required.");
              return;
            }
            addTopic({ community, title: title.trim(), body: body.trim(), author });
            setTitle("");
            setBody("");
            toast.success("Topic posted to the forum.");
          }}
        >
          <h2 className="text-2xl">Start a discussion</h2>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="t-community">Circle</Label>
              <select
                id="t-community"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                {SUB_COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-title">Title</Label>
              <Input
                id="t-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-body">Message</Label>
              <Textarea
                id="t-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <Label htmlFor="t-anon" className="text-sm font-normal">
                Post anonymously
              </Label>
              <Switch id="t-anon" checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
              Post topic
            </Button>
          </div>
        </form>
      </aside>
      <div className="col-span-full">
        <ForYou variant="inline" area="community" />
      </div>
    </div>
  );
}
