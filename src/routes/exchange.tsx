import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, meta, PageHeader, UniLogo } from "@/components/univero/bits";
import { exchangePrograms, exchangeSubjects, type ExchangeTerm, type ExchangeType } from "@/lib/exchange";
import { countries } from "@/lib/univero";

export const Route = createFileRoute("/exchange")({
  head: () => meta("Exchange & study abroad — Univero", "Already studying at a university? Browse exchange and study-abroad opportunities across our partner network by subject, country and term."),
  component: Exchange,
});

const terms: ExchangeTerm[] = ["Fall semester", "Spring semester", "Full academic year"];
const types: ExchangeType[] = ["Erasmus+", "Bilateral agreement", "Free mover"];
const typePillClass: Record<ExchangeType, string> = { "Erasmus+": "bg-accent text-primary", "Bilateral agreement": "bg-secondary text-primary", "Free mover": "bg-muted text-foreground" };

function Exchange() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState(""); const [country, setCountry] = useState(""); const [term, setTerm] = useState(""); const [type, setType] = useState("");

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return exchangePrograms.filter(e => {
      const hay = [e.university.name, e.university.short, e.university.city, e.university.country, ...e.subjects].join(" ").toLowerCase();
      return words.every(w => hay.includes(w)) && (!subject || e.subjects.includes(subject)) && (!country || e.university.country === country) && (!term || e.terms.includes(term as ExchangeTerm)) && (!type || e.type === type);
    }).sort((a, b) => a.university.tier - b.university.tier);
  }, [q, subject, country, term, type]);

  const hasFilters = subject || country || term || type;
  const clear = () => { setSubject(""); setCountry(""); setTerm(""); setType(""); };

  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Already at a university?" title="Exchange & study abroad opportunities" subtitle={`Browse ${exchangePrograms.length} partner universities across ${new Set(exchangePrograms.map(e => e.university.country)).size} countries. Find where you could spend a semester or year of your current degree.`} />

    <div className="relative mt-8"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Computer Science in Germany" className="input-field h-14 pl-12 text-base" aria-label="Search exchange opportunities" /></div>
    <div className="mt-4 flex flex-wrap gap-2">
      <select aria-label="All subjects" value={subject} onChange={e => setSubject(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"><option value="">All subjects</option>{exchangeSubjects.map(s => <option key={s}>{s}</option>)}</select>
      <select aria-label="All countries" value={country} onChange={e => setCountry(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"><option value="">All countries</option>{countries.map(c => <option key={c}>{c}</option>)}</select>
      <select aria-label="Any term" value={term} onChange={e => setTerm(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"><option value="">Any term</option>{terms.map(t => <option key={t}>{t}</option>)}</select>
      <select aria-label="Any exchange type" value={type} onChange={e => setType(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"><option value="">Any exchange type</option>{types.map(t => <option key={t}>{t}</option>)}</select>
      {hasFilters && <Button size="sm" variant="ghost" onClick={clear}>Clear</Button>}
    </div>

    <p className="mt-6 text-sm text-muted-foreground">{results.length} opportunities</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map(e => <Card key={e.id} className="flex flex-col !p-5">
      <div className="flex items-start gap-3"><UniLogo university={e.university} size="sm" /><div className="min-w-0 flex-1"><Link to="/university/$id" params={{ id: e.university.id }} className="font-display font-bold leading-snug text-ink hover:text-primary">{e.university.name}</Link><p className="mt-0.5 text-xs text-muted-foreground"><span aria-hidden>{e.university.flag}</span> {e.university.city}, {e.university.country}</p></div></div>
      <div className="mt-3 flex flex-wrap gap-1.5"><span className={`pill ${typePillClass[e.type]}`}>{e.type}</span>{e.terms.map(t => <span key={t} className="pill bg-muted text-foreground">{t}</span>)}</div>
      <p className="mt-3 line-clamp-1 text-sm text-foreground">{e.subjects.join(" · ")}</p>
      <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between gap-2"><dt>Language</dt><dd className="text-right font-semibold text-ink">{e.languageRequirement}</dd></div>
        <div className="flex justify-between gap-2"><dt>Indicative GPA</dt><dd className="text-right font-semibold text-ink">{e.minGpa.toFixed(1)}+</dd></div>
        <div className="flex justify-between gap-2"><dt>Nomination spots</dt><dd className="text-right font-semibold text-ink">{e.spots}</dd></div>
        <div className="flex justify-between gap-2"><dt>Nomination deadline</dt><dd className="text-right font-semibold text-ink">{e.deadline}</dd></div>
      </dl>
      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{e.funding}</p>
    </Card>)}</div>
    {results.length === 0 && <p className="mt-8 text-sm text-muted-foreground">No opportunities match those filters yet — try widening your search.</p>}
    <p className="mt-8 text-xs text-muted-foreground">Nominate through your home university's international office — actual bilateral agreements, deadlines and funding vary. This is illustrative prototype data.</p>
  </main>;
}
