// Prototype exchange/study-abroad opportunities for students already enrolled at a university.
// Derived from the same illustrative catalogue used for first-degree matching (dataStatus: "illustrative").
import { EU_COUNTRIES, universities, type University } from "./catalog";

export type ExchangeTerm = "Fall semester" | "Spring semester" | "Full academic year";
export type ExchangeType = "Erasmus+" | "Bilateral agreement" | "Free mover";

export type ExchangeProgram = {
  id: string;
  university: University;
  type: ExchangeType;
  terms: ExchangeTerm[];
  subjects: string[];
  languageRequirement: string;
  minGpa: number;
  spots: number;
  deadline: string;
  deadlineDate: string;
  funding: string;
};

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function exchangeType(u: University): ExchangeType {
  if (EU_COUNTRIES.includes(u.country)) return "Erasmus+";
  if (["United Kingdom", "Switzerland"].includes(u.country)) return "Bilateral agreement";
  return hash(u.id) % 3 === 0 ? "Free mover" : "Bilateral agreement";
}

function funding(u: University, type: ExchangeType): string {
  if (type === "Erasmus+") return "Erasmus+ mobility grant (~€300–€450/month) + travel top-up, home tuition applies";
  if (type === "Free mover") return "No exchange grant — home tuition applies, arrange your own visa/insurance";
  return "Home tuition continues; check your international office for mobility grants";
}

const ALL_TERMS: ExchangeTerm[] = ["Fall semester", "Spring semester", "Full academic year"];

function build(u: University, i: number): ExchangeProgram {
  const type = exchangeType(u);
  const h = hash(u.id);
  const termCount = 1 + (h % 2);
  const terms = [ALL_TERMS[h % 3]!, ...(termCount > 1 ? [ALL_TERMS[(h + 1) % 3]!] : [])];
  const subjects = [...new Set(u.programs.map(p => p.subject))];
  const deadline = EU_COUNTRIES.includes(u.country) ? "31 March" : "15 February";
  const deadlineDate = EU_COUNTRIES.includes(u.country) ? "2027-03-31" : "2027-02-15";
  return {
    id: `${u.id}-exchange`,
    university: u,
    type,
    terms,
    subjects,
    languageRequirement: u.programs[0]!.language.includes("German") ? "B2 German or B2 English" : `B2 English (IELTS ${Math.max(5.5, u.ielts - 1).toFixed(1)}+)`,
    minGpa: Math.max(2.5, Math.round((u.minGpa - 0.3) * 100) / 100),
    spots: 2 + (h % 9),
    deadline,
    deadlineDate,
    funding: funding(u, type),
  };
}

// Not every partner takes exchange students in this prototype — roughly matches real bilateral coverage.
export const exchangePrograms: ExchangeProgram[] = universities.filter(u => hash(u.id) % 5 !== 0).map(build);
export const exchangeSubjects = [...new Set(exchangePrograms.flatMap(e => e.subjects))].sort();
