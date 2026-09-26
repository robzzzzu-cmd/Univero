import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/univero/match-card";
import { Card, meta, PageHeader } from "@/components/univero/bits";
import { countries, getMatch, money, subjects, universities } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/results")({ head: () => meta("Your university matches — Univero", "Personalized university matches with transparent eligibility, missing requirements, tuition and fit scores."), component: Results });

const eligOrder = { Eligible: 0, "Potentially eligible": 1, "Missing information": 2, "Not eligible": 3 };
function Results() {
  const { profile, saved, compare, ready, toggleSaved, toggleCompare } = useUnivero();
  const [country, setCountry] = useState("All countries"); const [subject, setSubject] = useState("My subject"); const [tuition, setTuition] = useState("Any tuition"); const [elig, setElig] = useState("Any eligibility"); const [admission, setAdmission] = useState("Any outlook"); const [scholarships, setScholarships] = useState(false); const [limit, setLimit] = useState(15);
  const scored = useMemo(() => universities.map(u => ({ u, m: getMatch(u, profile) })), [profile]);
  const results = useMemo(() => scored.filter(({ u, m }) => (country === "All countries" || u.country === country) && (subject === "All subjects" || (subject === "My subject" ? u.programs.some(p => p.subject === profile.subject) : u.programs.some(p => p.subject === subject))) && (tuition === "Any tuition" || m.tuition <= Number(tuition)) && (elig === "Any eligibility" || m.eligibility === elig) && (admission === "Any outlook" || m.admission === admission) && (!scholarships || u.scholarship)).sort((a, b) => eligOrder[a.m.eligibility] - eligOrder[b.m.eligibility] || b.m.score - a.m.score), [scored, country, subject, tuition, elig, admission, scholarships, profile.subject]);
  const reset = () => { setCountry("All countries"); setSubject("All subjects"); setTuition("Any tuition"); setElig("Any eligibility"); setAdmission("Any outlook"); setScholarships(false); };
  const filters: [string, string, (v: string) => void, string[]][] = [
    ["Country", country, setCountry, ["All countries", ...countries]], ["Subject", subject, setSubject, ["My subject", "All subjects", ...subjects]],
    ["Tuition", tuition, setTuition, ["Any tuition", "5000", "15000", "25000", "40000"]], ["Eligibility", elig, setElig, ["Any eligibility", "Eligible", "Potentially eligible", "Missing information", "Not eligible"]],
    ["Outlook", admission, setAdmission, ["Any outlook", "Strong", "Competitive", "Reach", "Unknown"]],
  ];
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Your next chapter" title="Your university matches" subtitle="Ranked by fit with your academic profile, goals, budget and preferences. Eligible options first."><Button variant="outline" asChild><Link to="/profile">Edit profile</Link></Button></PageHeader>
    <div className="mt-9 flex flex-wrap items-center gap-3 border-y border-border py-5"><SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
      {filters.map(([label, value, setter, options]) => <label key={label}><span className="sr-only">{label}</span><select value={value} onChange={e => { setter(e.target.value); setLimit(15); }} className="h-10 max-w-[190px] rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground">{options.map(o => <option key={o} value={o}>{label === "Tuition" && o !== "Any tuition" ? `Under ${money(Number(o))}` : label === "Subject" && o === "My subject" ? `My subject (${profile.subject})` : o}</option>)}</select></label>)}
      <label className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold"><input type="checkbox" checked={scholarships} onChange={e => setScholarships(e.target.checked)} className="accent-primary" /> Scholarships</label>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_285px]"><div>
      <p className="mb-4 text-sm text-muted-foreground">{results.length} universities found · Sorted by eligibility, then match</p>
      <div className="grid gap-4">{ready && results.slice(0, limit).map(({ u }) => <MatchCard key={u.id} university={u} profile={profile} saved={saved.includes(u.id)} compared={compare.includes(u.id)} onSave={toggleSaved} onCompare={toggleCompare} />)}
        {ready && results.length > limit && <Button variant="outline" onClick={() => setLimit(limit + 15)}>Show more ({results.length - limit} left)</Button>}
        {ready && !results.length && <Card className="p-12 text-center"><h2 className="font-display text-xl font-bold">No matches for these filters</h2><p className="mt-2 text-sm text-muted-foreground">Try widening your search to see more options.</p><Button className="mt-5" variant="outline" onClick={reset}>Clear filters</Button></Card>}
      </div></div>
      <aside className="space-y-4"><Card><p className="text-xs font-bold uppercase text-primary">Your profile</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Interest</dt><dd className="font-semibold">{profile.subject}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">GPA</dt><dd className="font-semibold">{profile.gpa || "—"}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Budget</dt><dd className="font-semibold">{money(profile.budget)}/yr</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Destinations</dt><dd className="text-right font-semibold">{profile.countries.length ? profile.countries.join(", ") : "Open to all"}</dd></div></dl><Button variant="outline" size="sm" asChild className="mt-5 w-full"><Link to="/profile">Update my profile</Link></Button></Card>
        <div className="rounded-lg bg-ink p-6 text-primary-foreground"><h2 className="font-display text-lg font-bold">Compare side by side</h2><p className="mt-2 text-sm leading-6 text-primary-foreground/75">Pick 2–4 universities and see the differences that matter.</p><Button size="sm" asChild className="mt-5 bg-card text-ink hover:bg-secondary"><Link to="/compare">Compare {compare.length ? `(${compare.length})` : ""} <ArrowRight /></Link></Button></div>
        <p className="px-1 text-xs leading-5 text-muted-foreground">*Illustrative prototype data — not verified. Match Score measures fit; Strong / Competitive / Reach is an outlook, never an admission probability.</p></aside>
    </div></main>;
}
