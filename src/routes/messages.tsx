import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { requireResidentSession } from "@/lib/session-guard";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { RequireSession } from "@/components/RequireSession";
import { usePortal } from "@/lib/portal-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/messages")({
  ssr: false,
  beforeLoad: requireResidentSession,
  head: () => ({
    meta: [
      { title: "Resident Messaging · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Private and group messaging between residences at The Raffles Residences Boston, including interest groups and committees.",
      },
      { property: "og:title", content: "Resident Messaging · Raffles Boston Residences" },
      {
        property: "og:description",
        content: "Group and private conversations between neighbours at 40 Trinity Place.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <PageShell
      eyebrow="Communication Portal"
      title="Messages"
      intro="Group conversations for committees and interest circles, and private threads with neighbours who have opted in to direct contact."
    >
      <RequireSession area="resident messaging">
        <MessagesBody />
      </RequireSession>
    </PageShell>
  );
}

function MessagesBody() {
  const { threads, sendMessage, createThread, residents, currentUser } = usePortal();
  const [activeId, setActiveId] = useState<number | null>(threads[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"Group" | "Private">("Group");

  const active = threads.find((t) => t.id === activeId) ?? null;

  return (
    <div className="mt-12 grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
      <nav aria-label="Conversations" className="min-w-0 border border-border bg-card p-5">
        <h2 className="text-xl">Conversations</h2>
        <ul className="mt-4 space-y-1">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                aria-current={t.id === activeId ? "true" : undefined}
                className={`w-full border px-4 py-3 text-left text-sm transition-colors ${
                  t.id === activeId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent hover:border-primary"
                }`}
              >
                <span className="block text-[0.6rem] tracking-[0.2em] uppercase opacity-80">
                  {t.kind}
                </span>
                {t.name}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="mt-6 space-y-4 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) {
              toast.error("Give the conversation a name.");
              return;
            }
            const id = createThread(newKind, newName.trim(), currentUser ? [currentUser.name] : []);
            setActiveId(id);
            setNewName("");
            toast.success("Conversation started.");
          }}
        >
          <h3 className="text-lg">Start a conversation</h3>
          <div className="space-y-2">
            <Label htmlFor="thread-kind">Type</Label>
            <select
              id="thread-kind"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as "Group" | "Private")}
              className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
            >
              <option value="Group">Group conversation</option>
              <option value="Private">Private message</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="thread-name">{newKind === "Group" ? "Group name" : "Recipient"}</Label>
            {newKind === "Group" ? (
              <Input
                id="thread-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="min-h-11"
              />
            ) : (
              <select
                id="thread-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="min-h-11 w-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select a neighbour</option>
                {residents
                  .filter((r) => r.id !== currentUser?.id && r.contactOptIn)
                  .map((r) => (
                    <option key={r.id} value={`${r.name} · ${r.unit}`}>
                      {r.name} · {r.unit}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            size="cta"
            className="min-h-11 w-full"
          >
            Create
          </Button>
        </form>
      </nav>

      <section
        aria-labelledby="thread-heading"
        className="min-w-0 border border-border bg-card p-5 sm:p-7"
      >
        {active ? (
          <>
            <h2 id="thread-heading" className="text-xl break-words sm:text-2xl">
              {active.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {active.kind} ·{" "}
              {active.participants.length ? active.participants.join(", ") : "Just you, for now"}
            </p>

            <ul aria-live="polite" className="mt-6 space-y-4">
              {active.messages.map((m) => (
                <li key={m.id} className="border-l-2 border-primary/40 pl-4">
                  <p className="text-sm break-words">{m.body}</p>
                  <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                    {m.author} · {m.at}
                  </p>
                </li>
              ))}
              {active.messages.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No messages yet. Open the conversation below.
                </li>
              )}
            </ul>

            <form
              className="mt-8 space-y-3 border-t border-border pt-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) {
                  toast.error("Write a message first.");
                  return;
                }
                sendMessage(active.id, draft.trim());
                setDraft("");
              }}
            >
              <Label htmlFor="draft">Message</Label>
              <Textarea
                id="draft"
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button type="submit" size="cta" className="min-h-11">
                Send
              </Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select or start a conversation.</p>
        )}
      </section>
    </div>
  );
}
