import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdmissionPill, Card, EligibilityPill, meta, PageHeader, UniLogo } from "@/components/univero/bits";
import { getMatch, money, universities, getUniversityById } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/compare")({ head: () => meta("Compare universities — Univero", "Compare 2–4 universities side by side: match, eligibility, costs, scholarships, deadlines and fit."), component: Compare });

type Row = { label: string; values: (string | number)[]; best?: "high" | "low"; raw?: number[]; node?: (i: number) => React.ReactNode };
function Compare() {
  const { profile, compare, saved, ready, toggleCompare } = useUnivero();
  const items = compare.map(id => getUniversityById(id)).filter((u): u is NonNullable<typeof u> => !!u);
  const ms = items.map(u => getMatch(u, profile));
  const suggestions = universities.filter(u => !compare.includes(u.id)).sort((a, b) => Number(saved.includes(b.id)) - Number(saved.includes(a.id)) || a.name.localeCompare(b.name));
  const rows: Row[] = [
    { label: "Match Score", values: ms.map(m => `${m.score}%`), raw: ms.map(m => m.score), best: "high" },
    { label: "Eligibility", values: ms.map(m => m.eligibility), node: i => <EligibilityPill value={ms[i]!.eligibility} /> },
    { label: "Admission outlook", values: ms.map(m => m.admission), node: i => <AdmissionPill value={ms[i]!.admission} /> },
    { label: "Program", values: ms.map(m => m.program.name) },
    { label: "Tuition / year*", values: ms.map(m => money(m.tuition)), raw: ms.map(m => m.tuition), best: "low" },
    { label: "Living costs / year*", values: items.map(u => money(u.living)), raw: items.map(u => u.living), best: "low" },
    { label: "Scholarships", values: items.map(u => (u.scholarships.length ? `${u.scholarships.length} listed` : "None listed")), raw: items.map(u => u.scholarships.length), best: "high" },
    { label: "Deadline*", values: items.map(u => u.deadline) },
    { label: "Language", values: ms.map(m => m.program.language) },
    { label: "Duration", values: ms.map(m => m.program.duration) },
    { label: "University size", values: items.map(u => `${u.students} students`) },
    { label: "City", values: items.map(u => `${u.flag} ${u.city}`) },
    { label: "Academic fit", values: ms.map(m => `${m.fit.academic}/10`), raw: ms.map(m => m.fit.academic), best: "high" },
    { label: "Career fit", values: ms.map(m => `${m.fit.career}/10`), raw: ms.map(m => m.fit.career), best: "high" },
    { label: "Personal fit", values: ms.map(m => `${m.fit.personal}/10`), raw: ms.map(m => m.fit.personal), best: "high" },
  ];
  const bestIdx = (r: Row) => { if (!r.raw || !r.best || items.length < 2) return -1; const target = r.best === "high" ? Math.max(...r.raw) : Math.min(...r.raw); return r.raw.filter(v => v === target).length === r.raw.length ? -1 : r.raw.indexOf(target); };
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Side by side" title="Compare universities" subtitle="Choose 2–4 universities. The strongest value in each row is highlighted.">{compare.length < 4 && <label className="flex items-center gap-2"><Plus className="size-4 text-primary" /><select aria-label="Add university" value="" onChange={e => e.target.value && toggleCompare(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm font-semibold"><option value="">Add a university…</option>{suggestions.map(u => <option key={u.id} value={u.id}>{saved.includes(u.id) ? "★ " : ""}{u.name}</option>)}</select></label>}</PageHeader>
    {ready && items.length < 2 && <Card className="mt-9 text-center !py-12"><h2 className="font-display text-xl font-bold">Add {items.length ? "one more university" : "at least two universities"}</h2><p className="mt-2 text-sm text-muted-foreground">Use “Compare” on any match, or pick from the list above.</p><Button asChild className="mt-5"><Link to="/results">Browse matches <ArrowRight /></Link></Button></Card>}
    {ready && items.length > 0 && <div className="mt-9 overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[720px] text-sm"><thead><tr><th className="w-44 p-4" />{items.map(u => <th key={u.id} className="p-4 text-left align-top"><div className="flex items-start justify-between gap-2"><UniLogo university={u} size="sm" /><button onClick={() => toggleCompare(u.id)} aria-label={`Remove ${u.name}`} className="text-muted-foreground hover:text-primary"><X className="size-4" /></button></div><Link to="/university/$id" params={{ id: u.id }} className="mt-3 block font-display font-bold text-ink hover:text-primary">{u.name}</Link></th>)}</tr></thead>
      <tbody>{rows.map(r => { const b = bestIdx(r); return <tr key={r.label} className="border-t border-border"><th className="p-4 text-left text-xs font-bold uppercase text-muted-foreground">{r.label}</th>{r.values.map((v, i) => <td key={i} className={`p-4 ${i === b ? "bg-success-soft font-bold text-success" : "text-ink"}`}>{r.node ? r.node(i) : v}</td>)}</tr>; })}</tbody></table></div>}
    <p className="mt-4 text-xs text-muted-foreground">*Illustrative prototype data. Confirm details with each university.</p>
  </main>;
}
