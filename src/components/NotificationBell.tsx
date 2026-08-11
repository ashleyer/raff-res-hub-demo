import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "@/lib/portal-store";

/**
 * Bell in the header: alerts a resident when the concierge desk replies to,
 * assigns, or changes the status of one of their requests.
 */
export function NotificationBell() {
  const {
    currentUser,
    notifications,
    unreadNotifications,
    markNotificationsRead,
    dismissNotification,
  } = usePortal();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSeenId = useRef<number | null>(null);

  /* Announce anything new that arrives while the resident is on the site. */
  useEffect(() => {
    const latest = notifications[0];
    if (!latest) return;
    if (lastSeenId.current === null) {
      lastSeenId.current = latest.id;
      return;
    }
    if (latest.id !== lastSeenId.current) {
      lastSeenId.current = latest.id;
      if (!latest.read) toast(latest.title, { description: latest.body });
    }
  }, [notifications]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!currentUser) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadNotifications > 0) markNotificationsRead();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={
          unreadNotifications > 0
            ? `Notifications · ${unreadNotifications} unread`
            : "Notifications · none unread"
        }
        className="nav-link relative inline-flex min-h-11 min-w-11 items-center justify-center"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        {unreadNotifications > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] leading-none text-primary-foreground"
          >
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2.5rem))] border border-border bg-card p-4 text-left shadow-lg"
        >
          <p className="eyebrow text-[0.6rem]">Concierge updates</p>
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing yet. The desk will alert you here when someone picks up or answers a request.
            </p>
          ) : (
            <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm">{n.title}</p>
                  <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase">
                      {n.at}
                    </span>
                    <button
                      type="button"
                      onClick={() => dismissNotification(n.id)}
                      className="min-h-11 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
                    >
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/concierge"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex min-h-11 items-center text-xs tracking-[0.18em] uppercase underline underline-offset-4"
          >
            Open concierge requests
          </Link>
        </div>
      ) : null}
    </div>
  );
}
