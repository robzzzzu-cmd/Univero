import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, CalendarDays, ClipboardList, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdmissionPill, Card, Checklist, EligibilityPill, meta, Progress, UniLogo } from "@/components/univero/bits";
import { applicationStatuses, completeness, daysUntil, getMatch, universities } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/dashboard")({ head: () => meta("Dashboard — Univero", "Your university admissions workspace: matches, shortlist, deadlines, documents and application progress."), component: Dashboard });

function Dashboard() {
  const { profile, saved, docs, ready, statusOf } = useUnivero();
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => { const h = new Date().getHours(); setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"); }, []);
  const c = completeness(profile, docs);
  const scored = universities.map(u => ({ u, m: getMatch(u, profile) }));
  const matches = scored.filter(x => x.m.eligibility !== "Not eligible" && x.m.score >= 70);
  const best = [...scored].filter(x => x.m.eligibility !== "Not eligible").sort((a, b) => b.m.score - a.m.score).slice(0, 4);
  const shortlisted = universities.filter(u => saved.includes(u.id));
  const planned = shortlisted.filter(u => ["Planning to apply", "Applying", "Submitted"].includes(statusOf(u.id)));
  const upcoming = shortlisted.map(u => ({ u, d: daysUntil(u.deadlineDate) })).filter(x => x.d > 0).sort((a, b) => a.d - b.d);
  const approaching = upcoming.filter(x => x.d <= 90);
  const missing = c.checks.filter(x => !x.done);
  const stats = [[GraduationCap, matches.length, "university matches", "/results"], [Bookmark, shortlisted.length, "shortlisted", "/shortlist"], [ClipboardList, planned.length, "applications planned", "/applications"], [CalendarDays, approaching.length, "deadlines approaching", "/shortlist"]] as const;
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase text-primary">Dashboard</p><h1 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">{greeting}{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}</h1><p className="mt-3 text-muted-foreground">Here’s where your applications stand today.</p></div>
      <Card className="w-full sm:w-72 !p-5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Profile completeness</span><strong className="text-primary">{ready ? c.percent : "—"}%</strong></div><Progress value={c.percent} className="mt-3" /><Link to="/profile" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Complete profile →</Link></Card></div>
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([Icon, n, label, to]) => <Link key={label} to={to} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"><Icon className="size-5 text-primary" /><strong className="mt-4 block font-display text-3xl text-ink">{ready ? n : "—"}</strong><span className="text-sm text-muted-foreground">{label}</span></Link>)}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-ink">Best matches</h2><Link to="/results" className="text-sm font-semibold text-primary hover:underline">See all</Link></div><ul className="mt-4 divide-y divide-border">{ready && best.map(({ u, m }) => <li key={u.id} className="flex items-center gap-3 py-3"><UniLogo university={u} size="sm" /><div className="min-w-0 flex-1"><Link to="/university/$id" params={{ id: u.id }} className="block truncate font-semibold text-ink hover:text-primary">{u.name}</Link><div className="mt-1 flex flex-wrap gap-1.5"><EligibilityPill value={m.eligibility} /><AdmissionPill value={m.admission} /></div></div><strong className="font-display text-xl text-primary">{m.score}%</strong></li>)}</ul></Card>
      <Card><h2 className="font-display text-lg font-bold text-ink">Upcoming deadlines</h2>{upcoming.length ? <ul className="mt-4 space-y-3">{upcoming.slice(0, 5).map(({ u, d }) => <li key={u.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold text-ink">{u.short}</span><span className={d <= 60 ? "font-semibold text-warning" : "text-muted-foreground"}>{u.deadline} · {d}d</span></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">Save universities to see their deadlines here.</p>}</Card>
      <Card><h2 className="font-display text-lg font-bold text-ink">Missing documents & details</h2>{missing.length ? <div className="mt-4"><Checklist items={missing} /></div> : <p className="mt-3 text-sm text-success">Everything is in place.</p>}<Button asChild variant="outline" size="sm" className="mt-5"><Link to="/documents">Open document vault</Link></Button></Card>
      <Card><h2 className="font-display text-lg font-bold text-ink">Application progress</h2>{shortlisted.length ? <ul className="mt-4 space-y-2.5">{applicationStatuses.map(s => { const n = shortlisted.filter(u => statusOf(u.id) === s).length; return <li key={s} className="flex items-center gap-3 text-sm"><span className="w-32 text-muted-foreground">{s}</span><Progress value={(n / shortlisted.length) * 100} className="flex-1" /><strong className="w-5 text-right text-ink">{n}</strong></li>; })}</ul> : <p className="mt-3 text-sm text-muted-foreground">No applications tracked yet.</p>}<Button asChild size="sm" className="mt-5"><Link to="/applications">Application board <ArrowRight /></Link></Button></Card>
    </div>
  </main>;
}
