import type { AppStatus, Doc, Profile } from "./univero";

export type UserAccount = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: number;
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
 * Register a new student account with email verification requirement
 */
export async function apiRegister(email: string, password: string, name: string): Promise<{ user: UserAccount; verificationCode: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) throw new Error("Email and password are required.");

  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

  if (accounts.some(a => a.email === cleanEmail)) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const newAccount: UserAccount & { passwordHash: string } = {
    id: `usr_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split("@")[0] || "Student",
    createdAt: new Date().toISOString(),
    passwordHash: btoa(password),
    emailVerified: false,
    verificationCode: code,
    verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };

  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

  const publicUser: UserAccount = {
    id: newAccount.id,
    email: newAccount.email,
    name: newAccount.name,
    createdAt: newAccount.createdAt,
    emailVerified: false,
    verificationCode: code,
  };

  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(publicUser));

  return { user: publicUser, verificationCode: code };
}

/**
 * Verify student email with 6-digit verification code
 */
export async function apiVerifyEmail(email: string, code: string): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

  const index = accounts.findIndex(a => a.email === cleanEmail);
  if (index === -1) {
    throw new Error("Account not found");
  }

  const account = accounts[index]!;
  if (account.verificationCode !== code.trim()) {
    throw new Error("Invalid 6-digit verification code. Please check your email or resend.");
  }

  account.emailVerified = true;
  account.verificationCode = undefined;
  account.verificationCodeExpiresAt = undefined;
  accounts[index] = account;

  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

  const updatedUser: UserAccount = {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
    emailVerified: true,
  };

  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

/**
 * Resend email verification code
 */
export async function apiResendVerification(email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

  const index = accounts.findIndex(a => a.email === cleanEmail);
  if (index === -1) throw new Error("Account not found");

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  accounts[index]!.verificationCode = newCode;
  accounts[index]!.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000;

  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  return newCode;
}

/**
 * Log in an existing student
 */
export async function apiLogin(email: string, password: string): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();

  const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const accounts: Array<UserAccount & { passwordHash: string }> = raw ? JSON.parse(raw) : [];
  const found = accounts.find(a => a.email === cleanEmail && a.passwordHash === btoa(password));

  if (!found) {
    throw new Error("Invalid email or password. Please try again.");
  }

  const user: UserAccount = {
    id: found.id,
    email: found.email,
    name: found.name,
    createdAt: found.createdAt,
    emailVerified: found.emailVerified ?? true,
    verificationCode: found.verificationCode,
  };

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
}
