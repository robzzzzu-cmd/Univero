import type { AppStatus, Doc, Profile } from "./univero";

export type UserAccount = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type UserUserData = {
  profile: Profile;
  saved: string[];
  compare: string[];
  docs: Doc[];
  statuses: Record<string, AppStatus>;
  updatedAt: string;
};

const ACCOUNTS_STORAGE_KEY = "univero_cloud_accounts";
const ACTIVE_USER_KEY = "univero_active_user";
const USER_DATA_PREFIX = "univero_user_data_";

/**
 * Register a new student account
 */
export async function apiRegister(email: string, password: string, name: string): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) throw new Error("Email and password are required.");
  
  // Try server endpoint if hosted
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password, name }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // Fall back to client storage database if running serverless without persistent DB configured
  }

  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

  if (accounts.some(a => a.email === cleanEmail)) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  const newAccount: UserAccount & { passwordHash: string } = {
    id: `usr_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split("@")[0] || "Student",
    createdAt: new Date().toISOString(),
    passwordHash: btoa(password), // basic hash for client DB
  };

  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify({ id: newAccount.id, email: newAccount.email, name: newAccount.name, createdAt: newAccount.createdAt }));

  return { id: newAccount.id, email: newAccount.email, name: newAccount.name, createdAt: newAccount.createdAt };
}

/**
 * Log in an existing student
 */
export async function apiLogin(email: string, password: string): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Try server endpoint if available
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // Fallback to client database
  }

  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];
  const found = accounts.find(a => a.email === cleanEmail && a.passwordHash === btoa(password));

  if (!found) {
    throw new Error("Invalid email or password. Please try again.");
  }

  const user: UserAccount = { id: found.id, email: found.email, name: found.name, createdAt: found.createdAt };
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Get active user from session
 */
export function getActiveUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ACTIVE_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Log out active user
 */
export function apiLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_USER_KEY);
}

/**
 * Fetch student data (profile, saved, applications, docs) from database
 */
export async function fetchUserDataFromDb(userId: string): Promise<UserUserData | null> {
  try {
    const res = await fetch(`/api/user/data?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall through
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(`${USER_DATA_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

/**
 * Save student data (profile, saved, applications, docs) to database
 */
export async function saveUserDataToDb(userId: string, data: Omit<UserUserData, "updatedAt">): Promise<void> {
  const payload: UserUserData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(payload));
  }

  try {
    await fetch("/api/user/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, data: payload }),
    });
  } catch {
    // Non-blocking sync
  }
}
