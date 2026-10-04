import { EU_COUNTRIES, universities, getUniversityById, type Program, type University } from "./catalog";
export { universities, countries, subjects, EU_COUNTRIES, getUniversityById, searchGlobalUniversities, dynamicUniversityCache, type University, type Program, type Scholarship } from "./catalog";

export type SubjectGrade = { id: string; name: string; grade: string };
export type SchoolYear = { id: string; label: string; kind: "Final" | "Predicted"; subjects: SubjectGrade[] };
export type TestEntry = { id: string; name: string; score: string; date: string; status: "Taken" | "Planned"; certificate?: string };
export type Entry = { id: string; title: string; role: string; org: string; start: string; end: string; description: string; hours: string; link: string };
export type LanguageSkill = { id: string; name: string; level: string };

export type Profile = {
  name: string; dob: string; nationality: string; school: string;
  country: string; curriculum: string; gpa: string; gradeScale: string; graduation: string;
  sat: string; act: string; ielts: string; toefl: string; noTests: boolean;
  subject: string; program: string; degree: string; countries: string[]; careerGoal: string;
  budget: number; scholarship: boolean; preferences: string[]; math: boolean;
  years: SchoolYear[]; tests: TestEntry[];
  work: Entry[]; activities: Entry[]; awards: Entry[]; projects: Entry[]; volunteering: Entry[];
  skills: string[]; languages: LanguageSkill[];
};

export const defaultProfile: Profile = {
  name: "", dob: "", nationality: "", school: "",
  country: "", curriculum: "", gpa: "", gradeScale: "4.0 GPA", graduation: "2027", sat: "", act: "", ielts: "", toefl: "", noTests: false,
  subject: "Business", program: "", degree: "Bachelor’s", countries: [], careerGoal: "", budget: 20000, scholarship: false, preferences: [], math: true,
  years: [], tests: [], work: [], activities: [], awards: [], projects: [], volunteering: [], skills: [], languages: [],
};

export const curricula = ["IB", "A-Levels", "Estonian curriculum", "German Abitur", "French Baccalaureate", "American High School Diploma", "European Baccalaureate", "Other"];
export const gradeScales = ["4.0 GPA", "1–5", "1–7 (IB)", "1–10", "A*–E", "Percentage"];
export const testNames = ["SAT", "ACT", "IELTS", "TOEFL", "Cambridge English", "Goethe", "DELF/DALF", "LNAT", "BMAT/UCAT", "Other"];
export const languageLevels = ["Native", "A1", "A2", "B1", "B2", "C1", "C2"];
export const applicationStatuses = ["Interested", "Researching", "Planning to apply", "Applying", "Submitted", "Accepted", "Waitlisted", "Rejected"] as const;
export type AppStatus = (typeof applicationStatuses)[number];

export const docTypes = ["CV / Resume", "Academic transcript", "Predicted grades", "Diploma", "SAT certificate", "IELTS certificate", "Language certificate", "Recommendation letter", "Motivation letter", "Personal statement", "Passport / ID", "Portfolio", "Research paper", "Extracurricular certificate", "Award", "Other"] as const;
export type DocType = (typeof docTypes)[number];
export type Doc = { id: string; type: DocType; fileName: string; size: number; uploaded: string; status: "Uploaded" | "Confirmed" };

export const uid = () => Math.random().toString(36).slice(2, 10);
export const money = (value: number) => (value === 0 ? "€0" : `€${value.toLocaleString("en-US")}`);
export const emptyEntry = (): Entry => ({ id: uid(), title: "", role: "", org: "", start: "", end: "", description: "", hours: "", link: "" });

// ---------- Profile helpers ----------
const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const testScore = (p: Profile, name: string) => Math.max(0, ...p.tests.filter(t => t.status === "Taken" && t.name === name).map(t => num(t.score)));
export const bestSat = (p: Profile) => Math.max(num(p.sat), testScore(p, "SAT"), num(p.act) ? Math.round(num(p.act) * 42.5) : 0, testScore(p, "ACT") * 42.5);
export function englishScore(p: Profile) {
  const toefl = Math.max(num(p.toefl), testScore(p, "TOEFL"));
  const cambridge = testScore(p, "Cambridge English"); // scale score 160–230
  return Math.max(num(p.ielts), testScore(p, "IELTS"), toefl ? Math.min(9, Math.round((toefl / 120) * 9 * 2) / 2 + 0.5) : 0, cambridge ? Math.min(9, (cambridge - 100) / 15) : 0);
}
export const isEU = (p: Profile) => EU_COUNTRIES.includes(p.nationality);
export const tuitionFor = (u: University | Program, p: Profile) => (isEU(p) && "tuitionEU" in u && (("country" in u && EU_COUNTRIES.includes(u.country)) || !("country" in u)) ? u.tuitionEU : u.tuition);

export function normaliseGrade(grade: string, scale: string): number | null {
  const g = grade.trim().toUpperCase(); if (!g) return null;
  const frac = g.match(/^([\d.]+)\s*\/\s*([\d.]+)$/); if (frac) return num(frac[1]!) / num(frac[2]!);
  const letters: Record<string, number> = { "A*": 1, A: 0.9, B: 0.8, C: 0.7, D: 0.6, E: 0.5 }; if (letters[g] !== undefined) return letters[g];
  const n = num(g); if (!n) return null;
  const max = scale === "1–5" ? 5 : scale === "1–7 (IB)" ? 7 : scale === "1–10" ? 10 : scale === "Percentage" ? 100 : scale === "4.0 GPA" ? 4 : n > 10 ? 100 : n > 7 ? 10 : 5;
  return Math.min(1, n / max);
}
export function subjectStatus(p: Profile, subject: string): "met" | "unmet" | "missing" {
  const grades = p.years.flatMap(y => y.subjects).filter(s => s.name.toLowerCase().includes(subject.toLowerCase().slice(0, 5))).map(s => normaliseGrade(s.grade, p.gradeScale)).filter((v): v is number => v !== null);
  if (grades.length) return Math.max(...grades) >= 0.6 ? "met" : "unmet";
  if (subject === "Mathematics" && p.math && p.gpa) return "met";
  return "missing";
}
export const subjectCount = (p: Profile) => new Set(p.years.flatMap(y => y.subjects.map(s => s.name.toLowerCase()).filter(Boolean))).size;

// ---------- Matching ----------
export type Requirement = { label: string; status: "met" | "unmet" | "missing"; fix?: string };
export type Eligibility = "Eligible" | "Potentially eligible" | "Not eligible" | "Missing information";
export type Admission = "Strong" | "Competitive" | "Reach" | "Unknown";

export function bestProgram(u: University, p: Profile): Program {
  const q = p.program.toLowerCase();
  return (q && u.programs.find(pr => pr.name.toLowerCase().includes(q))) || u.programs.find(pr => pr.subject.toLowerCase() === p.subject.toLowerCase()) || u.programs[0]!;
}

export function getMatch(u: University, p: Profile, programId?: string) {
  const program = (programId && u.programs.find(pr => pr.id === programId)) || bestProgram(u, p);
  const gpa = num(p.gpa); const sat = bestSat(p); const english = englishScore(p);
  const tuition = tuitionFor(u, p);
  const requirements: Requirement[] = [];
  requirements.push(!gpa ? { label: `Academic record (indicative GPA ${program.minGpa.toFixed(1)}+)`, status: "missing", fix: "Add your GPA" } : gpa >= program.minGpa ? { label: `GPA meets indicative ${program.minGpa.toFixed(1)} minimum`, status: "met" } : { label: `GPA below indicative ${program.minGpa.toFixed(1)} minimum`, status: "unmet", fix: "Consider programs with lower thresholds" });
  if (program.sat) requirements.push(!sat ? (p.noTests && !u.satRequired ? { label: "SAT optional — test-free route accepted", status: "met" } : { label: `SAT score (indicative ${program.sat}+)`, status: "missing", fix: "Add a SAT or ACT score" }) : sat >= program.sat ? { label: `SAT above indicative ${program.sat}`, status: "met" } : { label: `SAT score above required threshold (${program.sat})`, status: u.satRequired ? "unmet" : "missing", fix: "Retake or add a stronger SAT score" });
  requirements.push(!english ? { label: `English requirement (IELTS ${program.ielts} or equivalent)`, status: "missing", fix: "Add IELTS, TOEFL or Cambridge score" } : english >= program.ielts ? { label: "English requirement met", status: "met" } : { label: `English score below IELTS ${program.ielts}`, status: "unmet", fix: "Retake your English test" });
  requirements.push(p.curriculum ? { label: `${p.curriculum} diploma accepted`, status: "met" } : { label: "Secondary school diploma", status: "missing", fix: "Add your curriculum" });
  program.requiredSubjects.forEach(s => { const st = subjectStatus(p, s); requirements.push({ label: st === "met" ? `${s} requirement met` : st === "unmet" ? `${s} grade below required level` : `Required ${s.toLowerCase()} level is missing from your academic profile`, status: st, fix: `Add your ${s} grade` }); });
  program.otherTests.forEach(t => { const has = p.tests.some(x => x.name === t || (t === "Admissions assessment" && x.name === "Other")); requirements.push({ label: `${t} ${has ? "registered" : "required"}`, status: has ? "met" : "missing", fix: `Plan your ${t}` }); });

  const unmetReqs = requirements.filter(r => r.status === "unmet"); const missing = requirements.filter(r => r.status === "missing");
  const eligibility: Eligibility = unmetReqs.length ? "Not eligible" : !gpa && !p.curriculum ? "Missing information" : missing.length ? "Potentially eligible" : "Eligible";

  const ec = Math.min(0.3, (p.activities.length + p.awards.length + p.work.length) * 0.08);
  const margin = gpa ? (gpa - program.minGpa) * 2 + (sat && program.sat ? (sat - program.sat) / 250 : 0) + (u.tier <= 2 ? ec : 0) : 0;
  let admission: Admission = !gpa ? "Unknown" : margin >= 0.5 ? "Strong" : margin >= 0 ? "Competitive" : "Reach";
  if (u.tier === 1 && admission === "Strong") admission = margin >= 0.9 ? "Competitive" : "Reach";

  const clamp = (v: number) => Math.round(Math.max(1, Math.min(10, v)) * 10) / 10;
  const matchesLoc = !p.countries.length || p.countries.includes("Anywhere") || p.countries.includes(u.country) || (p.countries.includes("Europe") && !["United States", "Canada"].includes(u.country)) || (p.countries.includes("Scandinavia") && ["Denmark", "Sweden", "Finland"].includes(u.country)) || (p.countries.includes("Baltics") && ["Estonia", "Latvia", "Lithuania"].includes(u.country));
  const overlap = u.tags.filter(t => p.preferences.includes(t)).length;
  const goal = p.careerGoal.toLowerCase();
  const fit = {
    academic: clamp(gpa ? 6 + margin * 3 + (subjectCount(p) >= 5 ? 0.5 : 0) : 5.5),
    financial: clamp(tuition <= p.budget ? 9 + (tuition + u.living <= p.budget + 12000 ? 1 : 0) : 9 - ((tuition - p.budget) / Math.max(p.budget, 5000)) * 6 + (p.scholarship && u.scholarship ? 1 : 0)),
    location: matchesLoc ? 10 : 3,
    program: program.subject.toLowerCase() === p.subject.toLowerCase() ? (p.program && program.name.toLowerCase().includes(p.program.toLowerCase()) ? 10 : 9.4) : 4,
    career: clamp(6 + (u.tags.includes("Strong career opportunities") ? 1.5 : 0) + (u.tier <= 2 ? 1 : 0) + (goal && (goal.includes(program.subject.toLowerCase().slice(0, 4)) || /consult|financ|startup|entrepreneur|manage/.test(goal) && ["Business", "Economics"].includes(program.subject)) ? 1.5 : 0)),
    personal: clamp(p.preferences.length ? 4 + (6 * overlap) / p.preferences.length : 7),
  };
  const language = !english ? 7 : english >= program.ielts ? 10 : 3;
  const raw = fit.academic * 3 + fit.program * 2.5 + fit.financial * 1.5 + fit.location + language + fit.personal * 0.5 + fit.career * 0.5;
  const score = Math.max(25, Math.min(98, Math.round(raw)));

  const reasons = [
    ...(fit.program >= 9 ? ["Matches your study interests"] : []), ...(tuition <= p.budget ? ["Within your tuition budget"] : []),
    ...(isEU(p) && tuition < u.tuition ? ["EU tuition rate applies to you"] : []), ...(matchesLoc && p.countries.length ? ["Fits your preferred location"] : []),
    ...(fit.academic >= 7.5 ? ["Your grades exceed the indicative profile"] : []), ...u.tags.filter(t => p.preferences.includes(t)).slice(0, 2),
  ];
  return {
    score, eligibility, admission, requirements, program, tuition, fit, reasons,
    unmet: unmetReqs.map(r => r.label), missing: missing.map(r => r.label),
    affordability: tuition <= p.budget ? "Within budget" : tuition <= p.budget * 1.15 ? "Slightly above budget" : "Above budget",
  };
}
export type Match = ReturnType<typeof getMatch>;

// ---------- Readiness & completeness ----------
export type Check = { label: string; done: boolean; to?: "/profile" | "/documents" };
const hasDoc = (docs: Doc[], ...types: DocType[]) => docs.some(d => types.includes(d.type));

export function readiness(u: University, p: Profile, docs: Doc[]) {
  const checks: Check[] = [
    { label: "Academic profile complete", done: !!p.gpa && !!p.curriculum, to: "/profile" },
    { label: "Transcript uploaded", done: hasDoc(docs, "Academic transcript", "Predicted grades"), to: "/documents" },
    { label: "English certificate uploaded", done: hasDoc(docs, "IELTS certificate", "Language certificate"), to: "/documents" },
    ...(u.satRequired || u.programs[0]!.sat ? [{ label: "SAT certificate uploaded", done: hasDoc(docs, "SAT certificate"), to: "/documents" as const }] : []),
    u.countryCode === "GB" ? { label: "Personal statement", done: hasDoc(docs, "Personal statement"), to: "/documents" } : { label: "Motivation letter", done: hasDoc(docs, "Motivation letter", "Personal statement"), to: "/documents" },
    { label: "Recommendation letter", done: hasDoc(docs, "Recommendation letter"), to: "/documents" },
    { label: "CV / Resume", done: hasDoc(docs, "CV / Resume"), to: "/documents" },
    { label: "Passport / ID", done: hasDoc(docs, "Passport / ID"), to: "/documents" },
  ];
  return { checks, percent: Math.round((checks.filter(c => c.done).length / checks.length) * 100) };
}

export function completeness(p: Profile, docs: Doc[]) {
  const checks: Check[] = [
    { label: "Personal information", done: !!(p.name && p.nationality && p.country), to: "/profile" },
    { label: "Academic information", done: !!(p.gpa && p.curriculum && p.years.length), to: "/profile" },
    { label: "Test scores", done: p.noTests || p.tests.length > 0 || !!(p.sat || p.ielts || p.toefl), to: "/profile" },
    { label: "Preferences", done: p.preferences.length > 0 && !!p.subject, to: "/profile" },
    { label: "CV", done: hasDoc(docs, "CV / Resume") || p.activities.length + p.work.length > 0, to: "/documents" },
    { label: "Transcript", done: hasDoc(docs, "Academic transcript", "Predicted grades"), to: "/documents" },
    { label: "Recommendation letter", done: hasDoc(docs, "Recommendation letter"), to: "/documents" },
    { label: "Language certificate", done: hasDoc(docs, "IELTS certificate", "Language certificate"), to: "/documents" },
  ];
  return { checks, percent: Math.round((checks.filter(c => c.done).length / checks.length) * 100) };
}

export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
export const universityById = (id: string) => getUniversityById(id);

// ---------- Local storage ----------
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export const readProfile = (): Profile => ({ ...defaultProfile, ...read<Partial<Profile>>("univero-profile", {}) });
export const readSaved = () => read<string[]>("univero-saved", []);
export const readCompare = () => read<string[]>("univero-compare", []);
export const readDocs = () => read<Doc[]>("univero-docs", []);
export const readStatuses = (): Record<string, AppStatus> => {
  const raw = read<Record<string, string>>("univero-application", {});
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, (v === "Applied" ? "Submitted" : applicationStatuses.includes(v as AppStatus) ? v : "Interested") as AppStatus]));
};
