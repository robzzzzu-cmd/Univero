import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Circle, X } from "lucide-react";
import type { Admission, Check as CheckItem, Eligibility, Requirement, University } from "@/lib/univero";

export function UniLogo({ university: u, size = "md" }: { university: University; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const box = size === "lg" ? "size-20 p-3 text-2xl" : size === "sm" ? "size-10 p-1.5 text-sm" : "size-14 p-2.5 text-lg";
  const initials = u.short.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map(w => w[0]).slice(0, 3).join("").toUpperCase() || u.name.slice(0, 2);
  return <div className={`${box} flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card`}>
    {failed ? <span className="font-display font-bold text-primary">{initials}</span> : <img src={u.logo} alt={`${u.name} logo`} loading="lazy" className="size-full object-contain" onError={() => setFailed(true)} onLoad={e => { if (e.currentTarget.naturalWidth <= 16) setFailed(true); }} />}
  </div>;
}

export function EligibilityPill({ value }: { value: Eligibility }) {
  const cls = value === "Eligible" ? "bg-success-soft text-success" : value === "Not eligible" ? "bg-warning-soft text-warning" : value === "Missing information" ? "bg-muted text-muted-foreground" : "bg-secondary text-primary";
  return <span className={`pill ${cls}`}>{value}</span>;
}
export function AdmissionPill({ value }: { value: Admission }) {
  const cls = value === "Strong" ? "bg-success-soft text-success" : value === "Reach" ? "bg-accent text-primary" : value === "Unknown" ? "bg-muted text-muted-foreground" : "bg-muted text-foreground";
  return <span className={`pill ${cls}`} title="Admission outlook — not a probability">{value}</span>;
}

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return <div className={`h-1.5 overflow-hidden rounded-full bg-secondary ${className}`}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} /></div>;
}

export function Checklist({ items }: { items: CheckItem[] }) {
  return <ul className="space-y-2">{items.map(c => <li key={c.label} className="flex items-center justify-between gap-3 text-sm">
    <span className={`flex items-center gap-2 ${c.done ? "text-foreground" : "text-muted-foreground"}`}>{c.done ? <Check className="size-4 text-success" /> : <Circle className="size-4" />}{c.label}</span>
    {!c.done && c.to && <Link to={c.to} className="text-xs font-semibold text-primary hover:underline">Add</Link>}
  </li>)}</ul>;
}

export function RequirementList({ items }: { items: Requirement[] }) {
  return <ul className="space-y-2">{items.map(r => <li key={r.label} className="flex items-start gap-2 text-sm">
    {r.status === "met" ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : r.status === "unmet" ? <X className="mt-0.5 size-4 shrink-0 text-warning" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
    <span className={r.status === "met" ? "text-foreground" : r.status === "unmet" ? "text-warning" : "text-muted-foreground"}>{r.label}</span>
  </li>)}</ul>;
}

export function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase text-primary">{eyebrow}</p><h1 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">{title}</h1>{subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}</div>{children && <div className="flex flex-wrap gap-2">{children}</div>}</div>;
}

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`rounded-lg border border-border bg-card p-5 md:p-6 ${className}`}>{children}</div>;

export const meta = (title: string, description: string) => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] });
