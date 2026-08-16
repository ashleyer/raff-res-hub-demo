import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Info, Lock } from "lucide-react";
import { DemoTag } from "@/components/DemoTag";
import { PageShell, TabBar, TabPanel } from "@/components/PageShell";
import { usePortal } from "@/lib/portal-store";
import { RequireSession } from "@/components/RequireSession";
import { ResidenceHandbook } from "@/components/ResidenceHandbook";

import {
  ANNOUNCEMENTS,
  BOARD,
  MANAGEMENT_ACCESS_CODE,
  STAFF,
  SURVEY_NAME,
  SURVEY_QUESTIONS,
  monthLabel,
  type Person,
} from "@/lib/portal-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/management")({
  head: () => ({
    meta: [
      { title: "Management, Board & Announcements · Raffles Boston Residences" },
      {
        name: "description",
        content:
          "Meet the Board of Trustees and the residences team, read announcements from management, and complete the Monthly Residence Happiness Survey.",
      },
      { property: "og:title", content: "Management & Board · Raffles Boston Residences" },
      {
        property: "og:description",
        content:
          "Board of Trustees, residences staff, announcements and the Monthly Residence Happiness Survey.",
      },
    ],
  }),
  component: ManagementPage,
});

const TABS = [
  { id: "announcements", label: "Announcements" },
  { id: "board", label: "Meet the board" },
  { id: "staff", label: "Meet the staff" },
  { id: "handbook", label: "Residence handbook" },
  { id: "survey", label: "Happiness survey" },
];

function ManagementPage() {
  const [tab, setTab] = useState("announcements");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#survey") setTab("survey");
  }, []);

  return (
    <PageShell
      eyebrow="Residences Office"
      title="Management & the Board"
      intro="Notices from the Residences Office, the people who look after the building, and the monthly measure of how we are doing."
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} label="Management sections" />

      <TabPanel id="announcements" active={tab}>
        <section aria-labelledby="ann-heading">
          <h2 id="ann-heading" className="text-2xl">
            Announcements from management
          </h2>
          <ul className="mt-6 space-y-4">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.id} className="border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="eyebrow">{a.author}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
                <h3 className="mt-3 text-2xl leading-snug">
                  {a.title}
                  {a.pinned && (
                    <span className="ml-3 border border-primary px-2 py-1 align-middle text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                      Pinned
                    </span>
                  )}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </TabPanel>

      <TabPanel id="board" active={tab}>
        <PersonaNotice active={tab === "board"} storageKey="board" />
        <PeopleGrid
          headingId="board-heading"
          heading="Board of Trustees"
          description="Elected by the deed-holders and responsible for the budget, the reserve and the house rules."
          people={BOARD}
        />
      </TabPanel>

      <TabPanel id="staff" active={tab}>
        <PersonaNotice active={tab === "staff"} storageKey="staff" />
        <PeopleGrid
          headingId="staff-heading"
          heading="The residences team"
          description="The Raffles team on site every day, from the concierge desk to building engineering."
          people={STAFF}
        />
      </TabPanel>

      <TabPanel id="handbook" active={tab}>
        <ResidenceHandbook />
      </TabPanel>

      <TabPanel id="survey" active={tab}>
        <RequireSession area={SURVEY_NAME}>
          <SurveySection />
        </RequireSession>
      </TabPanel>
    </PageShell>
  );
}

/** Pop-up plus inline banner making clear these people are invented for the demo. */
function PersonaNotice({ active, storageKey }: { active: boolean; storageKey: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    try {
      const key = `raffles-persona-notice-${storageKey}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setOpen(true);
  }, [active, storageKey]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">These people are not real</DialogTitle>
            <DialogDescription>
              Every name, title, biography and portrait on this page is invented for demonstration
              purposes only. No actual trustee, employee or resident is represented.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button size="cta" className="min-h-11" onClick={() => setOpen(false)}>
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-8 flex items-start gap-3 border border-border bg-secondary/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Demo personas: the people listed below are fictional, with placeholder portraits, and
          exist only to show how this page works.
        </p>
      </div>
    </>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function PeopleGrid({
  heading,
  headingId,
  description,
  people,
}: {
  heading: string;
  headingId: string;
  description: string;
  people: Person[];
}) {
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-2xl">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <li key={p.id} className="relative border border-border bg-card">
            <DemoTag label="Not a real person" />
            <div
              role="img"
              aria-label={`Placeholder portrait for ${p.name}, ${p.role}. No photograph is shown in this demo.`}
              className="flex aspect-[4/5] w-full items-center justify-center bg-secondary/60"
            >
              <span className="font-display text-4xl tracking-[0.18em] text-muted-foreground/70">
                {initials(p.name)}
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl leading-snug">{p.name}</h3>
              <p className="mt-1 text-xs tracking-[0.16em] text-primary uppercase">{p.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SurveySection() {
  const { surveyResponses, submitSurvey, hasAnsweredSurvey } = usePortal();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const month = monthLabel();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="survey-heading">
        <h2 id="survey-heading" className="text-2xl">
          {SURVEY_NAME} · {month}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Five questions, rated one (poor) to five (excellent). The survey opens automatically on
          the last day of each month and keeps prompting until you complete it. Responses reach
          management without your name attached.
        </p>

        {hasAnsweredSurvey ? (
          <p className="mt-8 border border-primary/50 bg-secondary/40 p-8 text-sm">
            Thank you. Your response for {month} has been recorded.
          </p>
        ) : (
          <form
            className="mt-8 space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (Object.keys(ratings).length < SURVEY_QUESTIONS.length) {
                toast.error("Please rate every question.");
                return;
              }
              submitSurvey({
                month,
                ratings,
                ...(comment.trim() ? { comment: comment.trim() } : {}),
                submittedBy: "Anonymous",
              });
              toast.success("Survey submitted anonymously.");
            }}
          >
            {SURVEY_QUESTIONS.map((q) => (
              <fieldset key={q.id}>
                <legend className="text-sm">{q.prompt}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className={`flex min-h-11 min-w-11 cursor-pointer items-center justify-center border px-4 text-sm transition-colors ${
                        ratings[q.id] === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={n}
                        checked={ratings[q.id] === n}
                        onChange={() => setRatings((prev) => ({ ...prev, [q.id]: n }))}
                        className="sr-only"
                      />
                      {n}
                      <span className="sr-only"> out of 5 for {q.prompt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="space-y-2">
              <Label htmlFor="survey-comment">Anything else for management? (optional)</Label>
              <Textarea
                id="survey-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <Button type="submit" size="cta" className="min-h-11">
              Submit survey
            </Button>
          </form>
        )}
      </section>

      <ManagementResults month={month} responses={surveyResponses} />
    </div>
  );
}

const UNLOCK_KEY = "raffles-management-results";

function ManagementResults({
  month,
  responses,
}: {
  month: string;
  responses: { id: number; month: string; ratings: Record<string, number>; comment?: string }[];
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY)) setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  const monthly = useMemo(() => responses.filter((r) => r.month === month), [responses, month]);
  const average = (id: string) =>
    monthly.length ? monthly.reduce((sum, r) => sum + (r.ratings[id] ?? 0), 0) / monthly.length : 0;
  const overall = monthly.length
    ? SURVEY_QUESTIONS.reduce((sum, q) => sum + average(q.id), 0) / SURVEY_QUESTIONS.length
    : 0;

  const downloadCsv = () => {
    const header = ["id", "month", ...SURVEY_QUESTIONS.map((q) => q.id), "comment"];
    const rows = monthly.map((r) => [
      r.id,
      r.month,
      ...SURVEY_QUESTIONS.map((q) => r.ratings[q.id] ?? ""),
      `"${(r.comment ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `happiness-survey-${month.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <aside className="border border-border bg-card p-7 lg:sticky lg:top-8 lg:self-start">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="eyebrow">Management only</p>
        </div>
        <h2 className="mt-4 text-2xl">Survey results</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Responses are visible to the Residences Office only. Enter the management access code to
          open the dashboard and dataset.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().toLowerCase() !== MANAGEMENT_ACCESS_CODE) {
              setError("That access code is not recognised.");
              return;
            }
            setError(null);
            setUnlocked(true);
            try {
              sessionStorage.setItem(UNLOCK_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
        >
          <Label htmlFor="mgmt-code">Management access code</Label>
          <Input
            id="mgmt-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-11"
            autoComplete="off"
          />
          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-destructive">
            {error}
          </p>
          <Button type="submit" size="cta" className="min-h-11 w-full">
            Open dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            Demo code: <span className="font-mono">{MANAGEMENT_ACCESS_CODE}</span>
          </p>
        </form>
      </aside>
    );
  }

  return (
    <aside className="border border-border bg-card p-7 lg:sticky lg:top-8 lg:self-start">
      <p className="eyebrow">Management dashboard</p>
      <h2 className="mt-3 text-2xl">{month} happiness</h2>
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {monthly.length} responses · overall {overall.toFixed(1)} / 5
      </p>

      <ul className="mt-6 space-y-5">
        {SURVEY_QUESTIONS.map((q) => {
          const avg = average(q.id);
          return (
            <li key={q.id}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm">{q.prompt}</p>
                <p className="font-display text-xl">{avg.toFixed(1)}</p>
              </div>
              <div
                role="img"
                aria-label={`${avg.toFixed(1)} out of 5 average`}
                className="mt-2 h-1.5 w-full bg-secondary"
              >
                <div className="h-full bg-primary" style={{ width: `${(avg / 5) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-8 text-lg">Response dataset</h3>
      <div className="mt-3 max-h-64 overflow-auto border border-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Anonymous {month} survey responses</caption>
          <thead className="bg-secondary/60">
            <tr>
              <th scope="col" className="p-2 font-normal">
                #
              </th>
              {SURVEY_QUESTIONS.map((q) => (
                <th key={q.id} scope="col" className="p-2 font-normal capitalize">
                  {q.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthly.map((r, index) => (
              <tr key={r.id} className="border-t border-border">
                <th scope="row" className="p-2 font-normal text-muted-foreground">
                  {index + 1}
                </th>
                {SURVEY_QUESTIONS.map((q) => (
                  <td key={q.id} className="p-2">
                    {r.ratings[q.id] ?? "–"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {monthly.some((r) => r.comment) && (
        <ul className="mt-4 space-y-2">
          {monthly
            .filter((r) => r.comment)
            .map((r) => (
              <li
                key={r.id}
                className="border-l-2 border-primary/60 pl-3 text-sm text-muted-foreground"
              >
                “{r.comment}”
              </li>
            ))}
        </ul>
      )}

      <Button
        variant="outline"
        size="cta"
        className="mt-6 min-h-11 w-full"
        onClick={downloadCsv}
      >
        Download dataset (CSV)
      </Button>
    </aside>
  );
}
