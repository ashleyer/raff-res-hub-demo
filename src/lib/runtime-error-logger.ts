export type RuntimeErrorRecord = {
  id: string;
  at: string;
  kind: "reference_error" | "runtime_error" | "unhandled_rejection" | "blank_screen";
  name: string;
  message: string;
  stack?: string;
  route: string;
  userAgent: string;
};

const STORAGE_KEY = "raffles.runtime-errors.v1";
const MAX_RECORDS = 25;
/** How long after load/navigation we allow the app to paint before calling it blank. */
const BLANK_SCREEN_DELAY_MS = 6000;
/** Minimum visible text length that counts as "the page rendered something". */
const MIN_VISIBLE_TEXT = 40;

let installed = false;
const recentKeys = new Map<string, number>();

function isDuplicate(key: string) {
  const now = Date.now();
  for (const [k, t] of recentKeys) if (now - t > 10_000) recentKeys.delete(k);
  if (recentKeys.has(key)) return true;
  recentKeys.set(key, now);
  return false;
}

export function readRuntimeErrorLog(): RuntimeErrorRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RuntimeErrorRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearRuntimeErrorLog() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function persist(record: RuntimeErrorRecord) {
  try {
    const next = [record, ...readRuntimeErrorLog()].slice(0, MAX_RECORDS);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
}

export function logRuntimeError(
  error: unknown,
  kind: RuntimeErrorRecord["kind"] = "runtime_error",
  extra: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const err = error instanceof Error ? error : new Error(String(error));
  const name = err.name || "Error";
  const resolvedKind: RuntimeErrorRecord["kind"] =
    kind === "runtime_error" && (name === "ReferenceError" || /is not defined/.test(err.message))
      ? "reference_error"
      : kind;

  const key = `${resolvedKind}:${name}:${err.message}`;
  if (isDuplicate(key)) return;

  const record: RuntimeErrorRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    kind: resolvedKind,
    name,
    message: err.message,
    ...(err.stack ? { stack: err.stack.slice(0, 4000) } : {}),
    route: window.location.pathname + window.location.search,
    userAgent: navigator.userAgent,
  };

  persist(record);
  console.error(`[runtime:${resolvedKind}]`, record.message, extra);
}

function visibleTextLength() {
  const root = document.body;
  if (!root) return 0;
  return (root.innerText || "").replace(/\s+/g, " ").trim().length;
}

/** Installs global listeners. Safe to call more than once. */
export function installRuntimeErrorLogging(): () => void {
  if (typeof window === "undefined" || installed) return () => {};
  installed = true;

  const onError = (event: ErrorEvent) => {
    logRuntimeError(event.error ?? event.message, "runtime_error", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    logRuntimeError(event.reason, "unhandled_rejection");
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const blankScreenTimer = window.setTimeout(() => {
    if (document.visibilityState !== "visible") return;
    if (visibleTextLength() >= MIN_VISIBLE_TEXT) return;
    if (document.querySelector("[role='alert']")) return; // fallback UI is showing
    logRuntimeError(
      new Error("Blank screen detected: no visible content after hydration"),
      "blank_screen",
      { visibleTextLength: visibleTextLength() },
    );
  }, BLANK_SCREEN_DELAY_MS);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.clearTimeout(blankScreenTimer);
    installed = false;
  };
}
