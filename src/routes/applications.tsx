import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, meta, PageHeader, Progress, UniLogo } from "@/components/univero/bits";
import { applicationStatuses, daysUntil, readiness, universities, type AppStatus } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/applications")({ head: () => meta("Applications — Univero", "Track every university application from interest to decision on a simple drag-and-drop board."), component: Applications });

function Applications() {
  const { profile, saved, docs, ready, statusOf, setStatus } = useUnivero();
  const [over, setOver] = useState<AppStatus | null>(null);
  const items = universities.filter(u => saved.includes(u.id));
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Applications" title="Application tracker" subtitle="Drag cards between columns, or use the status menu on each card." />
    {ready && !items.length ? <Card className="mt-9 !py-14 text-center"><h2 className="font-display text-xl font-bold">No applications yet</h2><p className="mt-2 text-sm text-muted-foreground">Save universities to your shortlist to start tracking them here.</p><Button asChild className="mt-5"><Link to="/results">Find matches <ArrowRight /></Link></Button></Card> :
      <div className="mt-9 flex gap-4 overflow-x-auto pb-4">{applicationStatuses.map(s => { const col = items.filter(u => statusOf(u.id) === s); return <section key={s} onDragOver={e => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)} onDrop={e => { const id = e.dataTransfer.getData("text/plain"); if (id) setStatus(id, s); setOver(null); }} className={`w-64 shrink-0 rounded-lg border p-3 transition-colors ${over === s ? "border-primary bg-accent/50" : "border-border bg-muted/50"}`} aria-label={s}>
        <h2 className="flex items-center justify-between px-1 text-xs font-bold uppercase text-muted-foreground">{s}<span className="rounded-sm bg-card px-1.5 py-0.5 text-foreground">{col.length}</span></h2>
        <div className="mt-3 min-h-24 space-y-2">{col.map(u => { const r = readiness(u, profile, docs); const d = daysUntil(u.deadlineDate); return <article key={u.id} draggable onDragStart={e => e.dataTransfer.setData("text/plain", u.id)} className="cursor-grab rounded-md border border-border bg-card p-3 active:cursor-grabbing">
          <div className="flex items-start gap-2"><GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground" /><UniLogo university={u} size="sm" /><Link to="/university/$id" params={{ id: u.id }} className="text-sm font-bold leading-snug text-ink hover:text-primary">{u.name}</Link></div>
          <p className={`mt-2 text-xs ${d <= 60 && d > 0 ? "font-semibold text-warning" : "text-muted-foreground"}`}>{u.deadline} · {d > 0 ? `${d}d` : "passed"}</p>
          <div className="mt-2 flex items-center gap-2"><Progress value={r.percent} className="flex-1" /><span className="text-xs font-bold text-primary">{r.percent}%</span></div>
          <select aria-label={`Status for ${u.name}`} value={s} onChange={e => setStatus(u.id, e.target.value as AppStatus)} className="mt-2 h-8 w-full rounded border border-border bg-card px-2 text-xs">{applicationStatuses.map(x => <option key={x}>{x}</option>)}</select>
        </article>; })}</div>
      </section>; })}</div>}
  </main>;
}
