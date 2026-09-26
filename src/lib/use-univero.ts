import { useEffect, useState } from "react";
import { defaultProfile, readCompare, readProfile, readSaved, type Profile } from "./univero";

export function useUnivero() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { setProfile(readProfile()); setSaved(readSaved()); setCompare(readCompare()); setReady(true); }, []);
  const updateProfile = (next: Profile) => { setProfile(next); localStorage.setItem("univero-profile", JSON.stringify(next)); };
  const toggleSaved = (id: string) => setSaved(previous => { const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]; localStorage.setItem("univero-saved", JSON.stringify(next)); return next; });
  const toggleCompare = (id: string) => setCompare(previous => { const next = previous.includes(id) ? previous.filter(item => item !== id) : previous.length < 3 ? [...previous, id] : previous; localStorage.setItem("univero-compare", JSON.stringify(next)); return next; });
  return { profile, saved, compare, ready, updateProfile, toggleSaved, toggleCompare };
}