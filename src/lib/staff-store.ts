/* Raffles personnel accounts. Like the resident portal, this demonstration keeps
   everything in the browser — no staff details leave this device. */

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  password: string;
  createdAt: string;
}

const ACCOUNTS_KEY = "raffles.staff.accounts.v1";
const SESSION_KEY = "raffles.staff.session.v1";

export const STAFF_DEPARTMENTS = [
  "Concierge",
  "Residences Management",
  "Engineering",
  "Housekeeping",
  "Security",
  "Food & Beverage",
  "Spa & Wellness",
  "Finance",
] as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session simply will not persist */
  }
}

export function listStaffAccounts(): StaffAccount[] {
  return read<StaffAccount[]>(ACCOUNTS_KEY, []);
}

export interface StaffResult {
  ok: boolean;
  error?: string;
  account?: StaffAccount;
}

export function registerStaff(input: {
  name: string;
  email: string;
  department: string;
  role: string;
  password: string;
  confirm: string;
}): StaffResult {
  const email = input.email.trim().toLowerCase();
  if (input.name.trim().length < 2) return { ok: false, error: "Enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid work email address." };
  if (!input.department.trim()) return { ok: false, error: "Choose your department." };
  if (input.role.trim().length < 2) return { ok: false, error: "Enter your position title." };
  if (input.password.length < 8)
    return { ok: false, error: "Choose a password of at least eight characters." };
  if (input.password !== input.confirm)
    return { ok: false, error: "The two passwords do not match." };

  const accounts = listStaffAccounts();
  if (accounts.some((a) => a.email === email))
    return { ok: false, error: "An account already exists for that address. Please sign in." };

  const account: StaffAccount = {
    id: `staff-${Date.now()}`,
    name: input.name.trim(),
    email,
    department: input.department.trim(),
    role: input.role.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  write(ACCOUNTS_KEY, [...accounts, account]);
  write(SESSION_KEY, account.id);
  return { ok: true, account };
}

export function signInStaff(email: string, password: string): StaffResult {
  const address = email.trim().toLowerCase();
  const account = listStaffAccounts().find((a) => a.email === address);
  if (!account)
    return { ok: false, error: "No personnel account found for that address. Please register." };
  if (account.password !== password) return { ok: false, error: "That password is not correct." };
  write(SESSION_KEY, account.id);
  return { ok: true, account };
}

export function currentStaff(): StaffAccount | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return listStaffAccounts().find((a) => a.id === id) ?? null;
}

export function signOutStaff() {
  write(SESSION_KEY, null);
}
