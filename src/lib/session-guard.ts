import { redirect } from "@tanstack/react-router";

/* Must match SESSION_KEY in portal-store: this demo keeps the session in the
   browser only, so the route guard reads the same expiring record. */
const SESSION_KEY = "raffles.session.v1";

/** True when an unexpired resident session exists in this browser. */
export function hasResidentSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { value?: { residentId?: string }; expiresAt?: number };
    if (!parsed || typeof parsed.expiresAt !== "number") return false;
    if (Date.now() >= parsed.expiresAt) return false;
    return Boolean(parsed.value?.residentId);
  } catch {
    return false;
  }
}

/** Keeps only same-origin paths, so the redirect cannot be pointed off site. */
export function safeRedirectPath(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}

/**
 * Route guard for resident-only pages. Runs client-side (these routes set
 * `ssr: false`, since the session lives in localStorage) and sends signed-out
 * visitors to sign in, remembering where they were headed.
 */
export function requireResidentSession({ location }: { location: { href: string } }) {
  if (hasResidentSession()) return;
  throw redirect({
    to: "/login",
    search: { mode: "signin" as const, redirect: location.href },
  });
}
