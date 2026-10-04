import { useRef, useState } from "react";
import { Check, FileText, Trash2, Upload, FileCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/univero/bits";
import { docTypes, uid, type Doc, type DocType } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

const guessType = (name: string): DocType => {
  const n = name.toLowerCase();
  if (/cv|resume/.test(n)) return "CV / Resume";
  if (/transcript|grades|grade/.test(n)) return "Academic transcript";
  if (/predicted/.test(n)) return "Predicted grades";
  if (/ielts/.test(n)) return "IELTS certificate";
  if (/sat/.test(n)) return "SAT certificate";
  if (/toefl|goethe|delf|cambridge|language/.test(n)) return "Language certificate";
  if (/recommend|reference|letter/.test(n)) return "Recommendation letter";
  if (/motivation/.test(n)) return "Motivation letter";
  if (/statement/.test(n)) return "Personal statement";
  if (/passport|id|identity|license/.test(n)) return "Passport / ID";
  if (/diploma|certificate/.test(n)) return "Diploma";
  if (/portfolio/.test(n)) return "Portfolio";
  if (/award|honor/.test(n)) return "Award";
  return "Other";
};

export function DocumentVault({
  title = "Upload documents",
  hint = "Drag files here, or choose them. PDF, DOCX or images.",
  defaultType = "auto",
  filterTypes,
}: {
  title?: string;
  hint?: string;
  defaultType?: DocType | "auto";
  filterTypes?: DocType[];
}) {
  const { docs, addDocs, updateDoc, removeDoc } = useUnivero();
  const input = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocType | "auto">(defaultType);

  const displayedDocs = filterTypes
    ? docs.filter(d => filterTypes.includes(d.type))
    : docs;

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items: Doc[] = [...files].map(f => ({
      id: uid(),
      type: type === "auto" ? guessType(f.name) : type,
      fileName: f.name,
      size: f.size,
      uploaded: new Date().toISOString(),
      status: "Uploaded",
    }));
    addDocs(items);
    toast.success(`${items.length} document${items.length > 1 ? "s" : ""} uploaded and saved to your account`);
    if (input.current) input.current.value = "";
  };

  return (
    <Card>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        className="rounded-md border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary/50"
      >
        <Upload className="mx-auto size-8 text-primary" />
        <h2 className="mt-3 font-display text-lg font-bold text-ink">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

        <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
          <select
            aria-label="Document type"
            value={type}
            onChange={e => setType(e.target.value as DocType | "auto")}
            className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"
          >
            <option value="auto">Auto-detect from file name</option>
            {docTypes.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button size="default" onClick={() => input.current?.click()} className="gap-2">
            <Upload className="size-4" /> Choose files
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={e => onFiles(e.target.files)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">
          {filterTypes ? "Relevant documents" : "Uploaded documents"}{" "}
          <span className="text-muted-foreground">({displayedDocs.length})</span>
        </h3>
      </div>

      {displayedDocs.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {filterTypes
            ? "No files in this category yet. Upload them above to include in your applications."
            : "No documents yet. Upload your transcripts, test certificates, passport, or CV."}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {displayedDocs.map(d => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
              <FileText className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{d.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(d.uploaded).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {Math.max(1, Math.round(d.size / 1024))} KB ·{" "}
                  <span className="font-medium text-foreground">{d.type}</span>
                </p>
              </div>
              <select
                aria-label="Document type"
                value={d.type}
                onChange={e => updateDoc(d.id, { type: e.target.value as DocType })}
                className="h-8 rounded-md border border-border bg-card px-2 text-xs"
              >
                {docTypes.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <span className="pill bg-success-soft text-success text-[11px]">
                <Check className="size-3" />
                {d.status}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeDoc(d.id)}
                aria-label={`Delete ${d.fileName}`}
                className="size-8"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
