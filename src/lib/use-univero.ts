import { useEffect, useState } from "react";
import { defaultProfile, readCompare, readDocs, readProfile, readSaved, readStatuses, type AppStatus, type Doc, type Profile } from "./univero";

const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export function useUnivero() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => { setProfile(readProfile()); setSaved(readSaved()); setCompare(readCompare()); setDocs(readDocs()); setStatuses(readStatuses()); setReady(true); }, []);

  const updateProfile = (next: Profile) => { setProfile(next); save("univero-profile", next); };
  const toggleSaved = (id: string) => setSaved(prev => { const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]; save("univero-saved", next); return next; });
  const toggleCompare = (id: string) => setCompare(prev => { const next = prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev; save("univero-compare", next); return next; });
  const setStatus = (id: string, status: AppStatus) => setStatuses(prev => { const next = { ...prev, [id]: status }; save("univero-application", next); return next; });
  const addDocs = (items: Doc[]) => setDocs(prev => { const next = [...items, ...prev]; save("univero-docs", next); return next; });
  const updateDoc = (id: string, patch: Partial<Doc>) => setDocs(prev => { const next = prev.map(d => (d.id === id ? { ...d, ...patch } : d)); save("univero-docs", next); return next; });
  const removeDoc = (id: string) => setDocs(prev => { const next = prev.filter(d => d.id !== id); save("univero-docs", next); return next; });
  const statusOf = (id: string): AppStatus => statuses[id] ?? "Interested";

  return { profile, saved, compare, docs, statuses, ready, updateProfile, toggleSaved, toggleCompare, setStatus, statusOf, addDocs, updateDoc, removeDoc };
}
