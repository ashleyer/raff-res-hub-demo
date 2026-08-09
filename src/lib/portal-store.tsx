import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_ACCOUNT,
  DEMO_PASSCODE,
  RESIDENTS,
  SEED_LISTINGS,
  SEED_LOST_FOUND,
  SEED_MAINTENANCE,
  SEED_PARCELS,
  SEED_PROPOSALS,
  SEED_SURVEY_RESPONSES,
  SEED_THREADS,
  SEED_TOPICS,
  SEED_VALET,
  STATEMENTS,
  type Listing,
  type LostFoundItem,
  type MaintenanceTicket,
  type Parcel,
  type PaymentRecord,
  type Proposal,
  type Resident,
  type Statement,
  type SurveyResponse,
  type Thread,
  type ForumTopic,
  type ValetRequest,
} from "./portal-data";
import {
  MEASURES,
  SEED_REQUESTS,
  type ConciergeRequest,
  type GovernanceMeasure,
} from "./intranet-data";
import type { ActivityEvent } from "./recommendations";

type Vote = "up" | "down";
type Ballot = "for" | "against";

type PortalValue = {
  /* session */
  currentUser: Resident | null;
  signIn: (
    email: string,
    passcode: string,
    remember?: boolean,
    unit?: string,
  ) => { ok: boolean; error?: string };
  signUp: (input: {
    name: string;
    email: string;
    unit: string;
    phone: string;
    password: string;
    confirm: string;
    remember?: boolean;
  }) => { ok: boolean; error?: string };
  signOut: () => void;
  /* Demo password reset: a code is issued in the browser, then redeemed. */
  requestPasswordReset: (email: string) => { ok: boolean; code?: string; error?: string };
  resetPassword: (input: { email: string; code: string; password: string; confirm: string }) => {
    ok: boolean;
    error?: string;
  };
  /* Erase the remembered residence and contact details kept in this browser. */
  clearSavedDetails: () => void;
  rememberedEmail: string | null;
  rememberedUnit: string | null;
  /* Privacy toggle: when off, nothing is persisted between sign-ins. */
  rememberEnabled: boolean;
  setRememberEnabled: (enabled: boolean) => void;

  /* directory & profile */
  residents: Resident[];
  updateProfile: (patch: Partial<Resident>) => void;

  /* messaging */
  threads: Thread[];
  sendMessage: (threadId: number, body: string) => void;
  createThread: (kind: Thread["kind"], name: string, participants: string[]) => number;

  /* billing */
  statements: Statement[];
  payments: PaymentRecord[];
  payStatement: (statementId: number, method: string) => void;

  /* services */
  valet: ValetRequest[];
  addValet: (r: Omit<ValetRequest, "id" | "status">) => void;
  cancelValet: (id: number) => void;
  maintenance: MaintenanceTicket[];
  addMaintenance: (t: Omit<MaintenanceTicket, "id" | "status" | "reportedAt">) => void;
  parcels: Parcel[];
  requestParcelDelivery: (id: number) => void;
  lostFound: LostFoundItem[];
  addLostFound: (i: Omit<LostFoundItem, "id" | "status">) => void;
  resolveLostFound: (id: number) => void;

  /* community */
  topics: ForumTopic[];
  addTopic: (t: Omit<ForumTopic, "id" | "at" | "replies">) => void;
  addReply: (topicId: number, body: string, author: string) => void;
  joined: string[];
  toggleJoin: (communityId: string) => void;

  /* marketplace */
  listings: Listing[];
  addListing: (l: Omit<Listing, "id" | "at" | "replies">) => void;
  addListingReply: (listingId: number, body: string, author: string) => void;

  /* proposals */
  proposals: Proposal[];
  votes: Record<number, Vote>;
  castVote: (id: number, vote: Vote) => void;
  addProposal: (p: Omit<Proposal, "id" | "at" | "up" | "down">) => void;

  /* governance — measures and one ballot per residence, shared so it survives navigation */
  measures: GovernanceMeasure[];
  ballots: Record<number, Ballot>;
  castBallot: (measureId: number, choice: Ballot) => void;

  /* activity signals for personalisation */
  activity: ActivityEvent[];
  logActivity: (e: Omit<ActivityEvent, "id" | "at">) => void;

  /* concierge desk — shared between residents and staff */
  conciergeRequests: ConciergeRequest[];
  /** Returns the new request's id, so the caller can show an on-screen receipt. */
  addConciergeRequest: (
    r: Omit<ConciergeRequest, "id" | "status" | "placedAt" | "replies">,
  ) => number;
  setConciergeStatus: (id: number, status: ConciergeRequest["status"]) => void;
  assignConciergeRequest: (id: number, staff: string) => void;
  replyToConciergeRequest: (id: number, body: string, author: string) => void;

  /* in-app notifications raised when the desk touches a resident's request */
  notifications: PortalNotification[];
  unreadNotifications: number;
  markNotificationsRead: () => void;
  dismissNotification: (id: number) => void;

  /* surveys */
  surveyResponses: SurveyResponse[];
  submitSurvey: (r: Omit<SurveyResponse, "id">) => void;
  hasAnsweredSurvey: boolean;
};

/** An in-app alert raised for one residence when the desk touches its request. */
export type PortalNotification = {
  id: number;
  /** Residence the alert belongs to, e.g. "Residence 22H". */
  unit: string;
  requestId: number;
  kind: "reply" | "status" | "assigned";
  title: string;
  body: string;
  at: string;
  read: boolean;
};

/** "22h" / "unit 22H" -> "Residence 22H" */
export function formatUnit(raw: string): string {
  const value = raw.trim().replace(/^(residence|unit|apt\.?|apartment)\s+/i, "");
  if (!value) return "";
  return `Residence ${value.toUpperCase()}`;
}

const unitKey = (u: string) =>
  u
    .replace(/^(residence|unit|apt\.?|apartment)\s+/i, "")
    .replace(/\s+/g, "")
    .toUpperCase();

/** A real residence number, as opposed to a placeholder. */
function isKnownUnit(u: string): boolean {
  return /\d/.test(u);
}

function sameUnit(a: string, b: string): boolean {
  return unitKey(a) === unitKey(b);
}

const PortalContext = createContext<PortalValue | null>(null);

const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

/* --------------------------------------------------------------- storage */
/* Demo persistence only: accounts live in this browser, never on a server. */

const ACCOUNTS_KEY = "raffles.accounts.v1";
const RESIDENTS_KEY = "raffles.residents.v1";
const SESSION_KEY = "raffles.session.v1";
const NOTIFICATIONS_KEY = "raffles.notifications.v1";
/* Last signed-in identity: kept after sign out so residents never re-register. */
const LAST_USER_KEY = "raffles.lastUser.v1";
/* Resident-controlled privacy switch for "Remember me" persistence. */
const REMEMBER_PREF_KEY = "raffles.rememberPref.v1";
const REQUESTS_KEY = "raffles.conciergeRequests.v1";

/* Expiring persistence. A live session lapses after 12 hours of inactivity and
   is refreshed while the resident is active; the remembered identity (email and
   residence, used only to pre-fill sign in) is discarded after 30 days. Both are
   cleared automatically the moment they lapse, on read and on a ticking timer. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EXPIRY_CHECK_MS = 60 * 1000;

type Expiring<T> = { value: T; expiresAt: number };

type Account = { email: string; password: string; residentId: string };

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session simply will not be remembered */
  }
}

function clearStore(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* Write a value stamped with an absolute expiry. */
function writeExpiring(key: string, value: unknown, ttl: number) {
  writeStore(key, { value, expiresAt: Date.now() + ttl } satisfies Expiring<unknown>);
}

/* Read a stamped value, deleting it if the deadline has passed. Anything stored
   in the older un-stamped shape is treated as expired and removed. */
function readExpiring<T>(key: string): T | null {
  const raw = readStore<Expiring<T> | null>(key, null);
  if (
    !raw ||
    typeof raw !== "object" ||
    !("expiresAt" in raw) ||
    typeof raw.expiresAt !== "number"
  ) {
    if (raw) clearStore(key);
    return null;
  }
  if (Date.now() >= raw.expiresAt) {
    clearStore(key);
    return null;
  }
  return raw.value;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [rememberedUnit, setRememberedUnit] = useState<string | null>(null);
  const [rememberEnabled, setRememberEnabledState] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [statements, setStatements] = useState<Statement[]>(STATEMENTS);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [valet, setValet] = useState<ValetRequest[]>(SEED_VALET);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(SEED_MAINTENANCE);
  const [parcels, setParcels] = useState<Parcel[]>(SEED_PARCELS);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>(SEED_LOST_FOUND);
  const [topics, setTopics] = useState<ForumTopic[]>(SEED_TOPICS);
  const [joined, setJoined] = useState<string[]>(["wine", "books"]);
  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [votes, setVotes] = useState<Record<number, Vote>>({});
  const [measures, setMeasures] = useState<GovernanceMeasure[]>(MEASURES);
  const [ballots, setBallots] = useState<Record<number, Ballot>>({});
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(SEED_SURVEY_RESPONSES);
  const [answeredSurvey, setAnsweredSurvey] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>(SEED_REQUESTS);

  /* Restore any remembered residences and session after hydration. */
  useEffect(() => {
    try {
      const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (localStorage.getItem(`raffles-happiness-survey-${month}`)) setAnsweredSurvey(true);
    } catch {
      /* ignore */
    }
    const savedResidents = readStore<Resident[]>(RESIDENTS_KEY, []);
    if (savedResidents.length > 0) {
      setResidents((seed) => {
        const merged = [...seed];
        for (const r of savedResidents) {
          const i = merged.findIndex((x) => x.id === r.id);
          if (i >= 0) merged[i] = r;
          else merged.push(r);
        }
        return merged;
      });
    }
    setAccounts(readStore<Account[]>(ACCOUNTS_KEY, []));
    const prefOn = readStore<boolean>(REMEMBER_PREF_KEY, true);
    setRememberEnabledState(prefOn);
    const session = readExpiring<{ residentId: string; email: string }>(SESSION_KEY);
    const last = prefOn ? readExpiring<{ email: string; unit?: string }>(LAST_USER_KEY) : null;
    if (last) {
      setRememberedEmail(last.email);
      setRememberedUnit(last.unit ?? null);
    }
    if (session) {
      setCurrentUserId(session.residentId);
      setRememberedEmail(session.email);
      /* Returning within the window slides the deadline forward. */
      writeExpiring(SESSION_KEY, session, SESSION_TTL_MS);
    }
    const savedRequests = readStore<ConciergeRequest[] | null>(REQUESTS_KEY, null);
    if (savedRequests && savedRequests.length > 0) setConciergeRequests(savedRequests);
    setNotifications(readStore<PortalNotification[]>(NOTIFICATIONS_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStore(NOTIFICATIONS_KEY, notifications);
  }, [notifications, hydrated]);

  useEffect(() => {
    if (hydrated) writeStore(ACCOUNTS_KEY, accounts);
  }, [accounts, hydrated]);

  /* The desk queue is shared: resident submissions and staff replies persist. */
  useEffect(() => {
    if (hydrated) writeStore(REQUESTS_KEY, conciergeRequests);
  }, [conciergeRequests, hydrated]);

  /* Profile edits (directory listing, household members, pets) survive reloads. */
  useEffect(() => {
    if (hydrated) writeStore(RESIDENTS_KEY, residents);
  }, [residents, hydrated]);

  const currentUser = residents.find((r) => r.id === currentUserId) ?? null;

  const rememberSession = useCallback((resident: Resident, remember: boolean) => {
    setCurrentUserId(resident.id);
    /* The profile privacy switch always wins over the sign-in checkbox. */
    const allow = remember && readStore<boolean>(REMEMBER_PREF_KEY, true);
    setRememberedEmail(allow ? resident.email : null);
    setRememberedUnit(allow ? (resident.unit ?? null) : null);
    /* The session itself always survives a page reload, and always lapses after
       the session window; "remember me" only governs the longer-lived identity. */
    writeExpiring(SESSION_KEY, { residentId: resident.id, email: resident.email }, SESSION_TTL_MS);
    if (allow) {
      writeExpiring(LAST_USER_KEY, { email: resident.email, unit: resident.unit }, REMEMBER_TTL_MS);
    } else {
      clearStore(LAST_USER_KEY);
    }
  }, []);

  /* Slide the session deadline forward while the resident is actually using the
     portal, so an idle device lapses but an active one does not. */
  useEffect(() => {
    if (!hydrated || !currentUserId) return;
    let last = 0;
    const touch = () => {
      const now = Date.now();
      if (now - last < 30_000) return;
      last = now;
      const session = readExpiring<{ residentId: string; email: string }>(SESSION_KEY);
      if (session) writeExpiring(SESSION_KEY, session, SESSION_TTL_MS);
    };
    const events = ["pointerdown", "keydown", "focus"] as const;
    for (const e of events) window.addEventListener(e, touch);
    return () => {
      for (const e of events) window.removeEventListener(e, touch);
    };
  }, [hydrated, currentUserId]);

  /* Enforce the deadline while the tab stays open: when it passes, the stored
     session and remembered identity are removed and the resident is signed out. */
  useEffect(() => {
    if (!hydrated) return;
    const tick = () => {
      if (!readExpiring<{ email: string }>(LAST_USER_KEY)) {
        setRememberedEmail((v) => (v ? null : v));
        setRememberedUnit((v) => (v ? null : v));
      }
      if (!readExpiring<{ residentId: string }>(SESSION_KEY)) {
        setCurrentUserId((id) => (id ? null : id));
      }
    };
    const timer = window.setInterval(tick, EXPIRY_CHECK_MS);
    return () => window.clearInterval(timer);
  }, [hydrated]);

  const signIn = useCallback(
    (email: string, passcode: string, remember = true, unit?: string) => {
      const address = email.trim().toLowerCase();
      const residence = formatUnit(unit ?? "");
      if (!address.includes("@")) return { ok: false, error: "Enter a valid email address." };

      /* Open demonstration account — no residence number required. A password
         reset on this address stores an account row, which then takes over. */
      const storedForAddress = accounts.find((a) => a.email === address);
      if (
        address === DEMO_ACCOUNT.email &&
        (storedForAddress
          ? storedForAddress.password === passcode
          : passcode === DEMO_ACCOUNT.password)
      ) {
        const existing = residents.find((r) => r.email.toLowerCase() === DEMO_ACCOUNT.email);
        const demo: Resident = existing ?? {
          id: "demo-account",
          name: "Demo Visitor",
          unit: residence || "Demo",
          email: DEMO_ACCOUNT.email,
          phone: "",
          bio: "Exploring the residents' portal in demonstration mode.",
          interests: [],
          visibleInDirectory: false,
          contactOptIn: false,
          members: [],
          pets: [],
        };
        if (!existing) setResidents((prev) => [...prev, demo]);
        rememberSession(demo, remember);
        return { ok: true };
      }

      if (!residence) return { ok: false, error: "Enter your residence number." };
      if (!passcode.trim())
        return { ok: false, error: "Enter your password or the residence passcode." };

      const unitMatches = (resident: Resident) =>
        !isKnownUnit(resident.unit) || sameUnit(resident.unit, residence);

      // 1. An account created through sign up.
      const account = accounts.find((a) => a.email === address);
      if (account) {
        if (account.password !== passcode)
          return { ok: false, error: "That password is not correct." };
        const resident = residents.find((r) => r.id === account.residentId);
        if (!resident)
          return { ok: false, error: "That account could not be found. Please register again." };
        if (!unitMatches(resident)) {
          return { ok: false, error: "That residence number does not match the address on file." };
        }
        if (!isKnownUnit(resident.unit)) {
          setResidents((prev) =>
            prev.map((r) => (r.id === resident.id ? { ...r, unit: residence } : r)),
          );
        }
        rememberSession(resident, remember);
        return { ok: true };
      }

      // 2. A seeded residence, admitted with the shared preview passcode.
      if (passcode.trim() !== DEMO_PASSCODE) {
        return {
          ok: false,
          error: "No account found for that address. Create one, or use the preview passcode.",
        };
      }
      const match = residents.find((r) => r.email.toLowerCase() === address);
      if (match) {
        if (!unitMatches(match)) {
          return { ok: false, error: "That residence number does not match the address on file." };
        }
        rememberSession(match, remember);
        return { ok: true };
      }

      // 3. Guest access: the preview passcode admits any address.
      const id = `guest-${Date.now()}`;
      const fallbackName = (address.split("@")[0] ?? "")
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const guest: Resident = {
        id,
        name: fallbackName || "Guest Resident",
        unit: residence,
        email: address,
        phone: "",
        bio: "Exploring the residents' portal with guest access.",
        interests: [],
        visibleInDirectory: false,
        contactOptIn: false,
        members: [],
        pets: [],
      };
      setResidents((prev) => [...prev, guest]);
      rememberSession(guest, remember);
      return { ok: true };
    },

    [accounts, residents, rememberSession],
  );

  const signUp = useCallback<PortalValue["signUp"]>(
    ({ name, email, unit, phone, password, confirm, remember = true }) => {
      const address = email.trim().toLowerCase();
      const residence = formatUnit(unit ?? "");
      if (!name.trim()) return { ok: false, error: "Enter the name for your household." };
      if (!address.includes("@")) return { ok: false, error: "Enter a valid email address." };
      if (!residence) return { ok: false, error: "Enter your residence number." };
      if (!phone || phone.replace(/\D/g, "").length < 7)
        return { ok: false, error: "Enter a contact number for your household profile." };
      if (password.length < 8)
        return { ok: false, error: "Choose a password of at least eight characters." };
      if (password !== confirm) return { ok: false, error: "The two passwords do not match." };
      if (accounts.some((a) => a.email === address)) {
        return { ok: false, error: "An account already exists for that address. Please sign in." };
      }

      const existing = residents.find((r) => r.email.toLowerCase() === address);
      const resident: Resident = existing ?? {
        id: `res-${Date.now()}`,
        name: name.trim(),
        unit: residence,
        email: address,
        phone: phone.trim(),
        bio: "",
        interests: [],
        visibleInDirectory: false,
        contactOptIn: false,
        members: [],
        pets: [],
      };

      if (existing) {
        setResidents((prev) =>
          prev.map((r) =>
            r.id === existing.id
              ? { ...r, name: name.trim(), unit: residence, phone: phone.trim() }
              : r,
          ),
        );
      } else {
        setResidents((prev) => [...prev, resident]);
      }

      setAccounts((prev) => [...prev, { email: address, password, residentId: resident.id }]);
      rememberSession(resident, remember);
      return { ok: true };
    },
    [accounts, residents, rememberSession],
  );

  /* Demonstration password reset. No email leaves the browser: a short-lived
     code is issued on screen and redeemed on the reset page. */
  const resetCodes = useRef<Record<string, { code: string; expiresAt: number }>>({});

  const requestPasswordReset = useCallback<PortalValue["requestPasswordReset"]>(
    (email) => {
      const address = email.trim().toLowerCase();
      if (!address.includes("@")) return { ok: false, error: "Enter a valid email address." };
      const knownAddress =
        accounts.some((a) => a.email === address) ||
        address === DEMO_ACCOUNT.email ||
        residents.some((r) => r.email.toLowerCase() === address);
      if (!knownAddress) {
        return { ok: false, error: "No account exists for that address on this browser." };
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      resetCodes.current[address] = { code, expiresAt: Date.now() + 15 * 60 * 1000 };
      return { ok: true, code };
    },
    [accounts, residents],
  );

  const resetPassword = useCallback<PortalValue["resetPassword"]>(
    ({ email, code, password, confirm }) => {
      const address = email.trim().toLowerCase();
      const issued = resetCodes.current[address];
      if (!issued || issued.expiresAt < Date.now()) {
        return { ok: false, error: "That reset code has lapsed. Please request a new one." };
      }
      if (issued.code !== code.trim())
        return { ok: false, error: "That reset code is not correct." };
      if (password.length < 8)
        return { ok: false, error: "Choose a password of at least eight characters." };
      if (password !== confirm) return { ok: false, error: "The two passwords do not match." };
      setAccounts((prev) => {
        if (prev.some((a) => a.email === address)) {
          return prev.map((a) => (a.email === address ? { ...a, password } : a));
        }
        const resident = residents.find((r) => r.email.toLowerCase() === address);
        return [...prev, { email: address, password, residentId: resident?.id ?? "demo-account" }];
      });
      delete resetCodes.current[address];
      return { ok: true };
    },
    [residents],
  );

  /* Raise an alert for one residence; the desk is the only source of these. */
  const raiseNotification = useCallback((n: Omit<PortalNotification, "id" | "at" | "read">) => {
    setNotifications((prev) =>
      [{ ...n, id: nextId(), at: "Just now", read: false }, ...prev].slice(0, 60),
    );
  }, []);

  const myNotifications = useMemo(
    () =>
      currentUser?.unit
        ? notifications.filter((n) => unitKey(n.unit) === unitKey(currentUser.unit!))
        : [],
    [notifications, currentUser],
  );

  const value = useMemo<PortalValue>(
    () => ({
      currentUser,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      rememberedEmail,
      rememberedUnit,
      /* Sign out only ends the session: the account, profile and remembered
         email stay in this browser so the resident signs back in, never up. */
      signOut: () => {
        setCurrentUserId(null);
        clearStore(SESSION_KEY);
      },
      /* One click: forget the remembered residence and contact details. */
      clearSavedDetails: () => {
        clearStore(LAST_USER_KEY);
        setRememberedEmail(null);
        setRememberedUnit(null);
      },
      rememberEnabled,
      /* Turning the switch off stops persistence at once and wipes whatever is
         already saved on this device; the live session is left untouched. */
      setRememberEnabled: (enabled: boolean) => {
        setRememberEnabledState(enabled);
        writeStore(REMEMBER_PREF_KEY, enabled);
        if (!enabled) {
          clearStore(LAST_USER_KEY);
          clearStore(SESSION_KEY);
          setRememberedEmail(null);
          setRememberedUnit(null);
        } else if (currentUser) {
          writeExpiring(
            LAST_USER_KEY,
            { email: currentUser.email, unit: currentUser.unit },
            REMEMBER_TTL_MS,
          );
          writeExpiring(
            SESSION_KEY,
            { residentId: currentUser.id, email: currentUser.email },
            SESSION_TTL_MS,
          );
          setRememberedEmail(currentUser.email);
          setRememberedUnit(currentUser.unit ?? null);
        }
      },

      residents,
      updateProfile: (patch) =>
        setResidents((prev) => prev.map((r) => (r.id === currentUserId ? { ...r, ...patch } : r))),

      threads,
      sendMessage: (threadId, body) =>
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { id: nextId(), author: currentUser?.name ?? "You", body, at: "Just now" },
                  ],
                }
              : t,
          ),
        ),
      createThread: (kind, name, participants) => {
        const id = nextId();
        setThreads((prev) => [{ id, kind, name, participants, messages: [] }, ...prev]);
        return id;
      },

      statements,
      payments,
      payStatement: (statementId, method) => {
        const statement = statements.find((s) => s.id === statementId);
        if (!statement) return;
        setStatements((prev) =>
          prev.map((s) => (s.id === statementId ? { ...s, status: "Paid" } : s)),
        );
        setPayments((prev) => [
          {
            id: nextId(),
            statementPeriod: statement.period,
            amount: statement.amount,
            method,
            at: "Just now",
          },
          ...prev,
        ]);
      },

      valet,
      addValet: (r) => setValet((prev) => [{ ...r, id: nextId(), status: "Requested" }, ...prev]),
      cancelValet: (id) => setValet((prev) => prev.filter((r) => r.id !== id)),
      maintenance,
      addMaintenance: (t) =>
        setMaintenance((prev) => [
          { ...t, id: nextId(), status: "Reported", reportedAt: "Just now" },
          ...prev,
        ]),
      parcels,
      requestParcelDelivery: (id) =>
        setParcels((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "Concierge delivery requested" } : p)),
        ),
      lostFound,
      addLostFound: (i) =>
        setLostFound((prev) => [{ ...i, id: nextId(), status: "Open" }, ...prev]),
      resolveLostFound: (id) =>
        setLostFound((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Reunited" } : i))),

      topics,
      addTopic: (t) =>
        setTopics((prev) => [{ ...t, id: nextId(), at: "Just now", replies: [] }, ...prev]),
      addReply: (topicId, body, author) =>
        setTopics((prev) =>
          prev.map((t) =>
            t.id === topicId
              ? { ...t, replies: [...t.replies, { id: nextId(), author, body, at: "Just now" }] }
              : t,
          ),
        ),
      joined,
      toggleJoin: (communityId) =>
        setJoined((prev) =>
          prev.includes(communityId)
            ? prev.filter((c) => c !== communityId)
            : [...prev, communityId],
        ),

      listings,
      addListing: (l) =>
        setListings((prev) => [{ ...l, id: nextId(), at: "Just now", replies: [] }, ...prev]),
      addListingReply: (listingId, body, author) =>
        setListings((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? { ...l, replies: [...l.replies, { id: nextId(), author, body, at: "Just now" }] }
              : l,
          ),
        ),

      proposals,
      votes,
      castVote: (id, vote) => {
        const existing = votes[id];
        setVotes((prev) => {
          const next = { ...prev };
          if (existing === vote) delete next[id];
          else next[id] = vote;
          return next;
        });
        setProposals((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;
            let { up, down } = p;
            if (existing === "up") up -= 1;
            if (existing === "down") down -= 1;
            if (existing !== vote) {
              if (vote === "up") up += 1;
              else down += 1;
            }
            return { ...p, up, down };
          }),
        );
      },
      addProposal: (p) =>
        setProposals((prev) => [{ ...p, id: nextId(), at: "Just now", up: 1, down: 0 }, ...prev]),

      measures,
      ballots,
      /* One ballot per residence per measure — matches condo governance rules, so a cast ballot cannot be changed. */
      castBallot: (measureId, choice) => {
        const measure = measures.find((m) => m.id === measureId);
        if (!measure || measure.status !== "Open for ballot" || ballots[measureId]) return;
        setBallots((prev) => ({ ...prev, [measureId]: choice }));
        setMeasures((prev) =>
          prev.map((m) =>
            m.id === measureId
              ? {
                  ...m,
                  inFavour: m.inFavour + (choice === "for" ? 1 : 0),
                  against: m.against + (choice === "against" ? 1 : 0),
                }
              : m,
          ),
        );
      },

      activity,
      logActivity: (e) => setActivity((prev) => [{ ...e, id: nextId(), at: "Just now" }, ...prev]),
      /* Concierge desk queue: residents lodge, staff triage and reply. */
      conciergeRequests,
      addConciergeRequest: (r) => {
        const id = nextId();
        setConciergeRequests((prev) => [
          { ...r, id, status: "Lodged", placedAt: "Just now", replies: [] },
          ...prev,
        ]);
        return id;
      },
      setConciergeStatus: (id, status) => {
        const target = conciergeRequests.find((r) => r.id === id);
        if (!target || target.status === status) return;
        setConciergeRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        raiseNotification({
          unit: target.unit,
          requestId: id,
          kind: "status",
          title: `${target.service} — ${status.toLowerCase()}`,
          body:
            status === "Completed"
              ? "The concierge desk has marked your request complete."
              : "The concierge desk has updated the status of your request.",
        });
      },
      assignConciergeRequest: (id, staff) => {
        const target = conciergeRequests.find((r) => r.id === id);
        if (!target || target.assignedTo === staff) return;
        setConciergeRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, assignedTo: staff } : r)),
        );
        raiseNotification({
          unit: target.unit,
          requestId: id,
          kind: "assigned",
          title: `${target.service} — assigned`,
          body: `${staff} is now looking after your request.`,
        });
      },
      replyToConciergeRequest: (id, body, author) => {
        const target = conciergeRequests.find((r) => r.id === id);
        setConciergeRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: r.status === "Lodged" ? "In progress" : r.status,
                  replies: [...(r.replies ?? []), { id: nextId(), body, author, at: "Just now" }],
                }
              : r,
          ),
        );
        /* Only desk replies alert the residence — not the resident's own. */
        if (target && unitKey(author) !== unitKey(target.unit)) {
          raiseNotification({
            unit: target.unit,
            requestId: id,
            kind: "reply",
            title: `${author} replied`,
            body: body.slice(0, 160),
          });
        }
      },

      notifications: myNotifications,
      unreadNotifications: myNotifications.filter((n) => !n.read).length,
      markNotificationsRead: () =>
        setNotifications((prev) =>
          prev.map((n) =>
            currentUser?.unit && unitKey(n.unit) === unitKey(currentUser.unit)
              ? { ...n, read: true }
              : n,
          ),
        ),
      dismissNotification: (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),

      surveyResponses,

      submitSurvey: (r) => {
        setSurveyResponses((prev) => [{ ...r, id: nextId() }, ...prev]);
        setAnsweredSurvey(true);
        try {
          localStorage.setItem(`raffles-happiness-survey-${r.month}`, "done");
        } catch {
          /* ignore */
        }
      },
      hasAnsweredSurvey: answeredSurvey,
    }),
    [
      currentUser,
      currentUserId,
      signIn,
      signUp,
      rememberedEmail,
      rememberedUnit,
      rememberEnabled,
      residents,
      threads,
      statements,
      payments,
      valet,
      maintenance,
      parcels,
      lostFound,
      topics,
      joined,
      listings,
      proposals,
      votes,
      measures,
      ballots,
      surveyResponses,
      answeredSurvey,
      conciergeRequests,
      myNotifications,
      raiseNotification,
      activity,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used inside PortalProvider");
  return ctx;
}
