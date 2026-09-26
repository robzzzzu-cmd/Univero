import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, Check, Circle, GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMatch, money, type Profile, type University } from "@/lib/univero";
import { AdmissionPill, EligibilityPill, UniLogo } from "./bits";

export function MatchCard({ university: u, profile, saved, compared, onSave, onCompare }: { university: University; profile: Profile; saved: boolean; compared: boolean; onSave: (id: string) => void; onCompare: (id: string) => void }) {
  const m = getMatch(u, profile);
  const gaps = m.requirements.filter(r => r.status !== "met");
  return <article className="rounded-lg border border-border bg-card p-5 subtle-shadow transition-transform hover:-translate-y-0.5 md:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
      <div className="flex min-w-0 gap-4"><UniLogo university={u} /><div className="min-w-0">
        <p className="text-xs font-bold uppercase text-primary"><span className="mr-1.5" aria-hidden>{u.flag}</span>{u.city}, {u.country}</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink"><Link to="/university/$id" params={{ id: u.id }} className="hover:text-primary">{u.name}</Link></h3>
        <p className="mt-1 text-sm text-muted-foreground">{m.program.name}{u.programs.length > 1 && <span className="text-xs"> · +{u.programs.length - 1} more programs</span>}</p>
      </div></div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-0"><span className="font-display text-3xl font-bold text-primary">{m.score}%</span><span className="text-xs font-bold uppercase text-muted-foreground">Match score</span></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-2"><EligibilityPill value={m.eligibility} /><AdmissionPill value={m.admission} /><span className={`pill ${m.affordability === "Within budget" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{m.affordability}</span>{u.scholarship && <span className="pill bg-accent text-primary">Scholarships</span>}</div>
    <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm sm:grid-cols-3"><div><span className="block text-xs text-muted-foreground">Tuition / year*</span><strong className="mt-1 block text-ink">{money(m.tuition)}</strong></div><div><span className="block text-xs text-muted-foreground">Deadline*</span><strong className="mt-1 block text-ink">{u.deadline}</strong></div><div className="hidden sm:block"><span className="block text-xs text-muted-foreground">Duration</span><strong className="mt-1 block text-ink">{m.program.duration}</strong></div></div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div><p className="text-xs font-bold uppercase text-muted-foreground">Why it matches</p><div className="mt-2 space-y-1">{(m.reasons.length ? m.reasons : ["General profile fit"]).slice(0, 3).map(r => <span key={r} className="flex items-center gap-1.5 text-xs text-foreground"><Check className="size-3.5 text-success" />{r}</span>)}</div></div>
      {gaps.length > 0 && <div><p className="text-xs font-bold uppercase text-muted-foreground">{m.eligibility === "Not eligible" ? "Why not yet" : "Missing"}</p><div className="mt-2 space-y-1">{gaps.slice(0, 3).map(r => <span key={r.label} className={`flex items-center gap-1.5 text-xs ${r.status === "unmet" ? "text-warning" : "text-muted-foreground"}`}>{r.status === "unmet" ? <X className="size-3.5" /> : <Circle className="size-3.5" />}{r.label}</span>)}</div></div>}
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-2"><Button size="sm" asChild><Link to="/university/$id" params={{ id: u.id }}>View university <ArrowUpRight /></Link></Button><Button size="sm" variant={compared ? "secondary" : "outline"} onClick={() => onCompare(u.id)}><GitCompareArrows /> {compared ? "Added" : "Compare"}</Button><Button size="sm" variant={saved ? "secondary" : "ghost"} onClick={() => onSave(u.id)}><Bookmark className={saved ? "fill-current" : ""} /> {saved ? "Saved" : "Save"}</Button>{gaps.length > 0 && <Button size="sm" variant="link" asChild className="ml-auto"><Link to="/profile">Update profile</Link></Button>}</div>
  </article>;
}
