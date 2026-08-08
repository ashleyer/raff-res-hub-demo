import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { usePortal } from "@/lib/portal-store";
import {
  buildRecommendations,
  type Recommendation,
  type RecommendationArea,
} from "@/lib/recommendations";
import { polishRecommendations } from "@/lib/recommendations.functions";

export function useRecommendations() {
  const {
    currentUser,
    activity,
    joined,
    listings,
    topics,
    statements,
    maintenance,
    parcels,
    hasAnsweredSurvey,
  } = usePortal();

  return useMemo(() => {
    if (!currentUser) return [] as Recommendation[];
    return buildRecommendations({
      user: currentUser,
      activity,
      joined,
      listings,
      topicsAuthored: topics.filter((t) => t.author.includes(currentUser.name)).length,
      statements,
      openMaintenance: maintenance.filter((m) => m.status !== "Scheduled").length,
      parcelsWaiting: parcels.filter((p) => p.status === "Awaiting collection").length,
      hasAnsweredSurvey,
    });
  }, [
    currentUser,
    activity,
    joined,
    listings,
    topics,
    statements,
    maintenance,
    parcels,
    hasAnsweredSurvey,
  ]);
}

/**
 * Suggestions are chosen by deterministic rules; the AI layer only rewrites
 * the reason line. If the model is slow or unavailable the rule copy stands.
 */
function usePolishedReasons(items: Recommendation[], enabled: boolean) {
  const { currentUser } = usePortal();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [nonce, setNonce] = useState(0);

  const signature = items.map((i) => i.id).join("|");

  useEffect(() => {
    if (!enabled || !currentUser || items.length === 0) return;
    let cancelled = false;
    setState("loading");
    polishRecommendations({
      data: {
        residentName: currentUser.name,
        interests: currentUser.interests,
        items: items.slice(0, 6).map((i) => ({
          id: i.id,
          title: i.title,
          fact: i.reason,
          signals: i.signals,
        })),
      },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.error || res.items.length === 0) {
          setState("error");
          return;
        }
        setReasons(Object.fromEntries(res.items.map((i) => [i.id, i.reason])));
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, enabled, currentUser?.id, nonce]);

  return { reasons, state, refresh: () => setNonce((n) => n + 1) };
}

const AREA_LABEL: Record<RecommendationArea, string> = {
  amenities: "Amenities",
  events: "Events",
  community: "Community",
  marketplace: "Marketplace",
  account: "House account",
  services: "Services",
};

function Card({
  item,
  reason,
  showSignals,
}: {
  item: Recommendation;
  reason: string;
  showSignals?: boolean;
}) {
  return (
    <li className="flex flex-col border border-border bg-card p-5">
      <p className="eyebrow text-[0.62rem]">{AREA_LABEL[item.area]}</p>
      <h3 className="mt-3 text-lg leading-snug">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{reason}</p>
      {showSignals && item.signals.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Why you are seeing this">
          {item.signals.map((s) => (
            <li
              key={s}
              className="border border-border px-2 py-1 text-[0.66rem] tracking-wide text-muted-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <Link
        to={item.to}
        className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-xs tracking-[0.18em] text-primary uppercase hover:underline"
      >
        {item.cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </li>
  );
}

export function ForYou({
  variant = "band",
  area,
  limit,
  showSignals = false,
}: {
  variant?: "band" | "full" | "inline";
  area?: RecommendationArea;
  limit?: number;
  showSignals?: boolean;
}) {
  const { currentUser } = usePortal();
  const all = useRecommendations();

  const items = useMemo(() => {
    const filtered = area ? all.filter((r) => r.area === area) : all;
    return filtered.slice(0, limit ?? (variant === "full" ? 12 : 3));
  }, [all, area, limit, variant]);

  const { reasons, state, refresh } = usePolishedReasons(items, Boolean(currentUser));

  if (!currentUser || items.length === 0) return null;

  const heading = variant === "inline" ? "Suggested for you" : "Chosen for you";

  return (
    <section
      className={
        variant === "inline"
          ? "mt-10 border-t border-border pt-8"
          : "mt-14 border border-border bg-secondary/30 p-5 sm:p-8"
      }
      aria-labelledby="for-you-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Personalised
          </p>
          <h2 id="for-you-heading" className="mt-3 text-2xl sm:text-3xl">
            {heading}, {currentUser.name.split(" ")[0]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Drawn from your reservations, RSVPs, circles and house account. Nothing leaves the demo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {state === "loading"
              ? "Personalising…"
              : state === "error"
                ? "Showing standard wording"
                : state === "done"
                  ? "Tailored for you"
                  : ""}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border px-3 text-primary"
            aria-label="Refresh suggestions"
          >
            <RefreshCw
              className={`h-4 w-4 ${state === "loading" ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.id}
            item={item}
            reason={reasons[item.id] ?? item.reason}
            showSignals={showSignals}
          />
        ))}
      </ul>

      {variant !== "full" && (
        <Link
          to="/for-you"
          className="mt-6 inline-flex min-h-11 items-center text-xs tracking-[0.18em] text-primary uppercase hover:underline"
        >
          See all suggestions
        </Link>
      )}
    </section>
  );
}
