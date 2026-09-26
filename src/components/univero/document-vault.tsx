import { useRef, useState } from "react";
import { Check, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/univero/bits";
import { docTypes, uid, type Doc, type DocType } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

const guessType = (name: string): DocType => { const n = name.toLowerCase(); if (/cv|resume/.test(n)) return "CV / Resume"; if (/transcript/.test(n)) return "Academic transcript"; if (/predicted/.test(n)) return "Predicted grades"; if (/ielts/.test(n)) return "IELTS certificate"; if (/sat/.test(n)) return "SAT certificate"; if (/toefl|goethe|delf|cambridge|language/.test(n)) return "Language certificate"; if (/recommend|reference/.test(n)) return "Recommendation letter"; if (/motivation/.test(n)) return "Motivation letter"; if (/statement/.test(n)) return "Personal statement"; if (/passport|id/.test(n)) return "Passport / ID"; if (/diploma/.test(n)) return "Diploma"; if (/portfolio/.test(n)) return "Portfolio"; if (/award/.test(n)) return "Award"; return "Other"; };

export function DocumentVault({ title = "Upload documents", hint = "Drag files here, or choose them. PDF, DOCX or images." }: { title?: string; hint?: string }) {
  const { docs, addDocs, updateDoc, removeDoc } = useUnivero();
  const input = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocType | "auto">("auto");
  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items: Doc[] = [...files].map(f => ({ id: uid(), type: type === "auto" ? guessType(f.name) : type, fileName: f.name, size: f.size, uploaded: new Date().toISOString(), status: "Uploaded" }));
    addDocs(items);
    toast.success(`${items.length} document${items.length > 1 ? "s" : ""} added to your vault`);
    if (input.current) input.current.value = "";
  };
  return <Card>
    <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onFiles(e.dataTransfer.files); }} className="rounded-md border-2 border-dashed border-border px-6 py-10 text-center">
      <Upload className="mx-auto size-8 text-primary" /><h2 className="mt-3 font-display text-lg font-bold text-ink">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2"><select aria-label="Document type" value={type} onChange={e => setType(e.target.value as DocType | "auto")} className="h-12 rounded-md border border-border bg-card px-3 text-sm"><option value="auto">Detect type from file name</option>{docTypes.map(t => <option key={t}>{t}</option>)}</select><Button size="lg" onClick={() => input.current?.click()}><Upload /> Choose files</Button></div>
      <input ref={input} type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => onFiles(e.target.files)} />
    </div>
    <h3 className="mt-6 font-display text-base font-bold text-ink">Your documents <span className="text-muted-foreground">({docs.length})</span></h3>
    {docs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No documents yet. Start with your CV and latest transcript.</p> :
      <ul className="mt-3 divide-y divide-border">{docs.map(d => <li key={d.id} className="flex flex-wrap items-center gap-3 py-3"><FileText className="size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{d.fileName}</p><p className="text-xs text-muted-foreground">{new Date(d.uploaded).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {Math.max(1, Math.round(d.size / 1024))} KB</p></div>
        <select aria-label="Document type" value={d.type} onChange={e => updateDoc(d.id, { type: e.target.value as DocType })} className="h-9 rounded-md border border-border bg-card px-2 text-xs">{docTypes.map(t => <option key={t}>{t}</option>)}</select>
        <span className="pill bg-success-soft text-success"><Check className="size-3.5" />{d.status}</span><Button size="icon" variant="ghost" onClick={() => removeDoc(d.id)} aria-label={`Delete ${d.fileName}`}><Trash2 /></Button></li>)}</ul>}
  </Card>;
}
