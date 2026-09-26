import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Checklist, meta, PageHeader, Progress } from "@/components/univero/bits";
import { DocumentVault } from "@/components/univero/document-vault";
import { completeness, docTypes, emptyEntry, subjectCount, uid, type Profile } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/documents")({ head: () => meta("Document vault — Univero", "Keep your CV, transcripts, certificates, letters and ID ready for every university application."), component: Documents });

// Simulated extraction used until real document parsing is connected
function mockExtract(p: Profile) {
  const subjects = p.years.flatMap(y => y.subjects).length ? [] : [["Mathematics", "5/5"], ["English", "5/5"], ["Physics", "4/5"], ["Chemistry", "4/5"], ["History", "5/5"], ["Economics", "5/5"], ["Biology", "4/5"], ["Estonian", "4/5"], ["German", "4/5"], ["Computer Science", "5/5"], ["Art", "5/5"], ["Physical Education", "5/5"]] as [string, string][];
  const activities = p.activities.length ? [] : [["Student Council", "President"], ["Model United Nations", "Head delegate"], ["School Football Team", "Member"]] as [string, string][];
  return { subjects, activities, leadership: activities.filter(a => /president|head|captain/i.test(a[1])).length, ielts: p.ielts || "7.5", sat: p.sat || "1380" };
}

function Documents() {
  const { profile, docs, updateDoc, updateProfile } = useUnivero();
  const [analysis, setAnalysis] = useState<ReturnType<typeof mockExtract> | null>(null); const [analyzing, setAnalyzing] = useState(false);
  const c = completeness(profile, docs);
  const canAnalyze = docs.some(d => ["CV / Resume", "Academic transcript", "Predicted grades"].includes(d.type));
  const analyze = () => { setAnalyzing(true); setTimeout(() => { setAnalysis(mockExtract(profile)); setAnalyzing(false); }, 1400); };
  const confirm = () => { if (!analysis) return; const next: Profile = { ...profile, ielts: profile.ielts || analysis.ielts, sat: profile.sat || analysis.sat,
    years: analysis.subjects.length ? [...profile.years, { id: uid(), label: "Grade 11", kind: "Final", subjects: analysis.subjects.map(([name, grade]) => ({ id: uid(), name, grade })) }] : profile.years,
    gradeScale: analysis.subjects.length ? "1–5" : profile.gradeScale,
    activities: [...profile.activities, ...analysis.activities.map(([title, role]) => ({ ...emptyEntry(), title, role, org: profile.school }))] };
    updateProfile(next); docs.forEach(d => updateDoc(d.id, { status: "Confirmed" })); setAnalysis(null); toast.success("Confirmed information added to your profile"); };
  return <main className="page-shell min-h-[70vh] py-12 md:py-16">
    <PageHeader eyebrow="Documents" title="Document vault" subtitle="Everything universities will ask for, organised in one place. Files stay in this browser for the prototype." />
    <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-6">
      <DocumentVault />

      {canAnalyze && !analysis && <Card className="flex flex-wrap items-center justify-between gap-4 bg-accent/50"><div className="flex items-center gap-3"><Sparkles className="size-6 text-primary" /><div><h2 className="font-display font-bold text-ink">Analyze my profile</h2><p className="text-sm text-muted-foreground">Pull subjects, activities and scores from your CV and transcript.</p></div></div><Button onClick={analyze} disabled={analyzing}>{analyzing ? "Analyzing…" : "Analyze documents"}</Button></Card>}
      {analysis && <Card className="border-primary"><p className="text-xs font-bold uppercase text-primary">Simulated analysis · please review</p><h2 className="mt-2 font-display text-xl font-bold text-ink">We found:</h2><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><li>• {analysis.subjects.length || subjectCount(profile)} academic subjects</li><li>• {analysis.activities.length || profile.activities.length} extracurricular activities</li><li>• {analysis.leadership} leadership positions</li><li>• IELTS {analysis.ielts}</li><li>• SAT {analysis.sat}</li></ul>{analysis.subjects.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{analysis.subjects.map(s => `${s[0]} ${s[1]}`).join(" · ")}</p>}<p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">Extracted information is a prototype simulation and may be wrong. Nothing is added to your profile until you confirm.</p><div className="mt-4 flex gap-2"><Button onClick={confirm}><Check /> Confirm and add to profile</Button><Button variant="ghost" onClick={() => setAnalysis(null)}>Discard</Button></div></Card>}
    </div>
      <aside className="space-y-4"><Card><div className="flex justify-between"><h2 className="font-display text-lg font-bold text-ink">Profile completeness</h2><strong className="text-primary">{c.percent}%</strong></div><Progress value={c.percent} className="my-4" /><Checklist items={c.checks} /></Card>
        <Card><h2 className="text-sm font-bold text-ink">Commonly requested</h2><ul className="mt-3 space-y-1.5 text-sm">{docTypes.slice(0, 11).map(t => <li key={t} className={`flex items-center gap-2 ${docs.some(d => d.type === t) ? "text-foreground" : "text-muted-foreground"}`}>{docs.some(d => d.type === t) ? <Check className="size-4 text-success" /> : <span className="size-4 rounded-full border border-border" />}{t}</li>)}</ul></Card></aside>
    </div></main>;
}
