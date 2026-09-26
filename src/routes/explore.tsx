import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdmissionPill, Card, EligibilityPill, meta, PageHeader, UniLogo } from "@/components/univero/bits";
import { countries, getMatch, money, subjects, universities } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/explore")({ head: () => meta("Explore universities — Univero", "Search 90+ universities across Europe, the UK, North America and the Baltics by subject, country, cost and fit."), component: Explore });

const tierLabel = { 1: "Most selective", 2: "Highly selective", 3: "Selective", 4: "Accessible" } as const;
function Explore() {
  const { profile, saved, ready, toggleSaved } = useUnivero();
  const [q, setQ] = useState(""); const [f, setF] = useState({ country: "", subject: "", tuition: "", language: "", tier: "", size: "", score: "", elig: "" });
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+|,/).filter(w => w && !["in", "the", "of", "and", "at"].includes(w));
    return universities.map(u => ({ u, m: getMatch(u, profile) })).filter(({ u, m }) => {
      const hay = [u.name, u.short, u.city, u.country, ...u.programs.map(p => `${p.name} ${p.subject}`)].join(" ").toLowerCase();
      return words.every(w => hay.includes(w)) && (!f.country || u.country === f.country) && (!f.subject || u.programs.some(p => p.subject === f.subject)) && (!f.tuition || m.tuition <= Number(f.tuition)) && (!f.language || u.programs.some(p => p.language.includes(f.language))) && (!f.tier || String(u.tier) === f.tier) && (!f.size || u.size === f.size) && (!f.score || m.score >= Number(f.score)) && (!f.elig || m.eligibility === f.elig);
    }).sort((a, b) => b.m.score - a.m.score);
  }, [q, f, profile]);
  const selects: [keyof typeof f, string, [string, string][]][] = [
    ["country", "All countries", countries.map(c => [c, c])], ["subject", "All subjects", subjects.map(s => [s, s])],
    ["tuition", "Any tuition", ["2000", "10000", "20000", "40000"].map(v => [v, `Under ${money(Number(v))}`])], ["language", "Any language", [["English", "English"], ["German", "German"]]],
    ["tier", "Any selectivity", ([1, 2, 3, 4] as const).map(t => [String(t), tierLabel[t]])], ["size", "Any size", [["Large university", "Large"], ["Smaller community", "Smaller"]]],
    ["score", "Any match", ["60", "70", "80", "90"].map(v => [v, `${v}%+ match`])], ["elig", "Any eligibility", ["Eligible", "Potentially eligible", "Missing information", "Not eligible"].map(v => [v, v])],
  ];
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Explore" title="Explore universities" subtitle={`Search ${universities.length} universities and ${universities.reduce((n, u) => n + u.programs.length, 0)} programs. Try “Business in Netherlands” or “Engineering Munich”.`} />
    <div className="relative mt-8"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Business in Netherlands" className="input-field h-14 pl-12 text-base" aria-label="Search universities" /></div>
    <div className="mt-4 flex flex-wrap gap-2">{selects.map(([k, all, opts]) => <select key={k} aria-label={all} value={f[k]} onChange={e => set(k)(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"><option value="">{all}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>)}{Object.values(f).some(Boolean) && <Button size="sm" variant="ghost" onClick={() => setF({ country: "", subject: "", tuition: "", language: "", tier: "", size: "", score: "", elig: "" })}>Clear</Button>}</div>
    <p className="mt-6 text-sm text-muted-foreground">{results.length} universities</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ready && results.map(({ u, m }) => <Card key={u.id} className="flex flex-col !p-5">
      <div className="flex items-start gap-3"><UniLogo university={u} size="sm" /><div className="min-w-0 flex-1"><Link to="/university/$id" params={{ id: u.id }} className="font-display font-bold leading-snug text-ink hover:text-primary">{u.name}</Link><p className="mt-0.5 text-xs text-muted-foreground"><span aria-hidden>{u.flag}</span> {u.city} · {tierLabel[u.tier]}</p></div><span className="font-display text-xl font-bold text-primary">{m.score}%</span></div>
      <p className="mt-3 line-clamp-1 text-sm text-foreground">{m.program.name}</p>
      <div className="mt-3 flex flex-wrap gap-1.5"><EligibilityPill value={m.eligibility} /><AdmissionPill value={m.admission} />{u.scholarship && <span className="pill bg-accent text-primary">Scholarships</span>}</div>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 mt-4 text-xs"><span className="text-muted-foreground">Tuition <strong className="text-ink">{money(m.tuition)}</strong></span><button onClick={() => toggleSaved(u.id)} className="flex items-center gap-1 font-semibold text-primary" aria-label={saved.includes(u.id) ? "Remove from shortlist" : "Save to shortlist"}><Bookmark className={`size-4 ${saved.includes(u.id) ? "fill-current" : ""}`} />{saved.includes(u.id) ? "Saved" : "Save"}</button></div>
    </Card>)}</div>
    <p className="mt-8 text-xs text-muted-foreground">Logos are loaded from each university’s official website. Tuition, requirements and deadlines are illustrative prototype data.</p>
  </main>;
}
