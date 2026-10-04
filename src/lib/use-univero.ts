import { useEffect, useState, useCallback, useRef } from "react";
import { defaultProfile, readCompare, readDocs, readProfile, readSaved, readStatuses, type AppStatus, type Doc, type Profile } from "./univero";
import { apiLogin, apiLogout, apiRegister, apiVerifyEmail, apiResendVerification, fetchUserDataFromDb, getActiveUser, saveUserDataToDb, type UserAccount } from "./db";

const saveLocal = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export type SyncState = "synced" | "syncing" | "local" | "error";

export function useUnivero() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [ready, setReady] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("local");

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to database if user is logged in
  const scheduleDbSync = useCallback((
    u: UserAccount | null,
    p: Profile,
    s: string[],
    c: string[],
    d: Doc[],
    st: Record<string, AppStatus>
  ) => {
    if (!u) {
      setSyncState("local");
      return;
    }

    setSyncState("syncing");
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserDataToDb(u.id, {
          profile: p,
          saved: s,
          compare: c,
          docs: d,
          statuses: st,
        });
        setSyncState("synced");
      } catch (err) {
        console.error("Database sync failed:", err);
        setSyncState("error");
      }
    }, 400);
  }, []);

  // Initialize on mount
  useEffect(() => {
    async function init() {
      const active = getActiveUser();
      setUser(active);

      if (active) {
        setSyncState("syncing");
        const cloudData = await fetchUserDataFromDb(active.id);
        if (cloudData) {
          setProfile(cloudData.profile || defaultProfile);
          setSaved(cloudData.saved || []);
          setCompare(cloudData.compare || []);
          setDocs(cloudData.docs || []);
          setStatuses(cloudData.statuses || {});
          setSyncState("synced");
          setReady(true);
          return;
        }
      }

      // Fall back to local data
      const localProfile = readProfile();
      const localSaved = readSaved();
      const localCompare = readCompare();
      const localDocs = readDocs();
      const localStatuses = readStatuses();

      setProfile(localProfile);
      setSaved(localSaved);
      setCompare(localCompare);
      setDocs(localDocs);
      setStatuses(localStatuses);
      setSyncState(active ? "synced" : "local");
      setReady(true);
    }

    init();
  }, []);

  const updateProfile = useCallback((next: Profile) => {
    setProfile(next);
    saveLocal("univero-profile", next);
    scheduleDbSync(user, next, saved, compare, docs, statuses);
  }, [user, saved, compare, docs, statuses, scheduleDbSync]);

  const toggleSaved = useCallback((id: string) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      saveLocal("univero-saved", next);
      scheduleDbSync(user, profile, next, compare, docs, statuses);
      return next;
    });
  }, [user, profile, compare, docs, statuses, scheduleDbSync]);

  const toggleCompare = useCallback((id: string) => {
    setCompare(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev;
      saveLocal("univero-compare", next);
      scheduleDbSync(user, profile, saved, next, docs, statuses);
      return next;
    });
  }, [user, profile, saved, docs, statuses, scheduleDbSync]);

  const setStatus = useCallback((id: string, status: AppStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [id]: status };
      saveLocal("univero-application", next);
      scheduleDbSync(user, profile, saved, compare, docs, next);
      return next;
    });
  }, [user, profile, saved, compare, docs, scheduleDbSync]);

  const addDocs = useCallback((items: Doc[]) => {
    setDocs(prev => {
      const next = [...items, ...prev];
      saveLocal("univero-docs", next);
      scheduleDbSync(user, profile, saved, compare, next, statuses);
      return next;
    });
  }, [user, profile, saved, compare, statuses, scheduleDbSync]);

  const updateDoc = useCallback((id: string, patch: Partial<Doc>) => {
    setDocs(prev => {
      const next = prev.map(d => (d.id === id ? { ...d, ...patch } : d));
      saveLocal("univero-docs", next);
      scheduleDbSync(user, profile, saved, compare, next, statuses);
      return next;
    });
  }, [user, profile, saved, compare, statuses, scheduleDbSync]);

  const removeDoc = useCallback((id: string) => {
    setDocs(prev => {
      const next = prev.filter(d => d.id !== id);
      saveLocal("univero-docs", next);
      scheduleDbSync(user, profile, saved, compare, next, statuses);
      return next;
    });
  }, [user, profile, saved, compare, statuses, scheduleDbSync]);

  const statusOf = useCallback((id: string): AppStatus => statuses[id] ?? "Interested", [statuses]);

  // Account operations
  const registerUser = async (email: string, pass: string, name: string) => {
    const { user: newAcc, verificationCode } = await apiRegister(email, pass, name);
    setUser(newAcc);
    // Migrate current state into newly created user account
    await saveUserDataToDb(newAcc.id, {
      profile,
      saved,
      compare,
      docs,
      statuses,
    });
    setSyncState("synced");
    return { user: newAcc, verificationCode };
  };

  const verifyEmail = async (code: string) => {
    if (!user) throw new Error("No user to verify");
    const updated = await apiVerifyEmail(user.email, code);
    setUser(updated);
    return updated;
  };

  const resendVerification = async () => {
    if (!user) throw new Error("No user logged in");
    const code = await apiResendVerification(user.email);
    setUser({ ...user, verificationCode: code });
    return code;
  };

  const loginUser = async (email: string, pass: string) => {
    const acc = await apiLogin(email, pass);
    setUser(acc);
    // Fetch user cloud data
    const cloud = await fetchUserDataFromDb(acc.id);
    if (cloud) {
      setProfile(cloud.profile || defaultProfile);
      setSaved(cloud.saved || []);
      setCompare(cloud.compare || []);
      setDocs(cloud.docs || []);
      setStatuses(cloud.statuses || {});
    } else {
      // First time sync for this user
      await saveUserDataToDb(acc.id, { profile, saved, compare, docs, statuses });
    }
    setSyncState("synced");
    return acc;
  };

  const logoutUser = () => {
    apiLogout();
    setUser(null);
    setSyncState("local");
  };

  return {
    user,
    profile,
    saved,
    compare,
    docs,
    statuses,
    ready,
    syncState,
    updateProfile,
    toggleSaved,
    toggleCompare,
    setStatus,
    statusOf,
    addDocs,
    updateDoc,
    removeDoc,
    registerUser,
    verifyEmail,
    resendVerification,
    loginUser,
    logoutUser,
  };
}
