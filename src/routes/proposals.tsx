import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import { CATEGORIES } from "@/lib/intranet-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/proposals")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Resident Proposals & Voting — Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Proposed requests from residents of The Raffles Residences Boston, where neighbours vote for or against before the Board takes them up.",
      },
      { property: "og:title", content: "Resident Proposals — Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Up and down voting on resident requests before they reach the Board.",
      },
    ],
  }),
  component: ProposalsPage,
});

function ProposalsPage() {
  return (
    <PageShell
      eyebrow="Community Register"
      title="Proposed requests"
      intro="Every proposal lodged by a household sits here for neighbours to support or oppose. Items carrying clear support are taken to the Board of Trustees."
    >
      <RequireSession area="the proposals register">
        <ProposalsBody />
      </RequireSession>
    </PageShell>
  );
}

function ProposalsBody() {
  const { proposals, votes, castVote, addProposal, currentUser } = usePortal();
  const [filter, setFilter] = useState<string>("All");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [anonymous, setAnonymous] = useState(true);

  const visible = proposals
    .filter((p) => filter === "All" || p.category === filter)
    .sort((a, b) => b.up - b.down - (a.up - a.down));

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <section aria-labelledby="proposals-heading">
        <h2 id="proposals-heading" className="text-2xl">
          Before the residence
        </h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`min-h-11 border px-4 text-xs tracking-[0.16em] uppercase transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <ul className="mt-8 space-y-4" aria-live="polite">
          {visible.map((p) => {
            const vote = votes[p.id];
            return (
              <li key={p.id} className="border border-border bg-card p-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => castVote(p.id, "up")}
                      aria-pressed={vote === "up"}
                      className={`flex min-h-11 w-14 flex-col items-center justify-center gap-1 border py-2 transition-colors ${
                        vote === "up"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                      <span className="font-display text-lg leading-none">{p.up}</span>
                      <span className="sr-only">Vote in favour of {p.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => castVote(p.id, "down")}
                      aria-pressed={vote === "down"}
                      className={`flex min-h-11 w-14 flex-col items-center justify-center gap-1 border py-2 transition-colors ${
                        vote === "down"
                          ? "border-destructive bg-destructive text-destructive-foreground"
                          : "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                      <span className="font-display text-lg leading-none">{p.down}</span>
                      <span className="sr-only">Vote against {p.title}</span>
                    </button>
                  </div>
                  <div>
                    <p className="eyebrow">{p.category}</p>
                    <h3 className="mt-2 text-2xl leading-snug">{p.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                    <p className="mt-3 text-xs tracking-wider text-muted-foreground uppercase">
                      {p.author} · {p.at} · net support {p.up - p.down}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No proposals filed under this category.
            </li>
          )}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <form
          className="border border-border bg-card p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) {
              toast.error("A title and a short description are required.");
              return;
            }
            addProposal({
              title: title.trim(),
              body: body.trim(),
              category,
              author: anonymous ? "Anonymous deed-holder" : (currentUser?.unit ?? "Residence"),
            });
            setTitle("");
            setBody("");
            toast.success("Proposal lodged for neighbours to consider.");
          }}
        >
          <h2 className="text-2xl">Lodge a proposal</h2>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="p-title">Title</Label>
              <Input
                id="p-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Category</Label>
              <select
                id="p-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-body">Details</Label>
              <Textarea
                id="p-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <Label htmlFor="p-anon" className="text-sm font-normal">
                Submit anonymously
              </Label>
              <Switch id="p-anon" checked={anonymous} onCheckedChange={setAnonymous} />
            </div>
            <Button type="submit" className="min-h-11 w-full tracking-[0.18em] uppercase">
              Lodge proposal
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
