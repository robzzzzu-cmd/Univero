export type Profile = {
  country: string; curriculum: string; gpa: string; graduation: string;
  sat: string; act: string; ielts: string; toefl: string; noTests: boolean;
  subject: string; program: string; degree: string; countries: string[];
  budget: number; scholarship: boolean; preferences: string[]; math: boolean;
};

export const defaultProfile: Profile = {
  country: "", curriculum: "", gpa: "", graduation: "2027", sat: "", act: "", ielts: "", toefl: "", noTests: false,
  subject: "Business", program: "", degree: "Bachelor’s", countries: [], budget: 20000, scholarship: false, preferences: [], math: true,
};

export type University = {
  id: string; name: string; program: string; country: string; city: string; subject: string; tuition: number;
  language: string; minGpa: number; sat: number; ielts: number; math: boolean; scholarship: boolean;
  size: string; setting: string; tags: string[]; competitiveness: "Strong" | "Competitive" | "Reach";
  deadline: string; living: number; students: string; career: string;
};

export const universities: University[] = [
  { id: "erasmus", name: "Erasmus University Rotterdam", program: "BSc International Business Administration", country: "Netherlands", city: "Rotterdam", subject: "Business", tuition: 13500, language: "English", minGpa: 3.2, sat: 1250, ielts: 6.5, math: true, scholarship: true, size: "Large university", setting: "Big city", tags: ["International environment", "Strong career opportunities", "Study abroad opportunities"], competitiveness: "Competitive", deadline: "15 January", living: 14500, students: "39,000", career: "Strong international business network" },
  { id: "tilburg", name: "Tilburg University", program: "BSc International Business Administration", country: "Netherlands", city: "Tilburg", subject: "Business", tuition: 12500, language: "English", minGpa: 3.0, sat: 1200, ielts: 6.0, math: true, scholarship: true, size: "Smaller community", setting: "Smaller university town", tags: ["Affordable living costs", "International environment", "Campus life"], competitiveness: "Strong", deadline: "1 May", living: 11500, students: "19,000", career: "European employer partnerships" },
  { id: "bocconi", name: "Bocconi University", program: "BSc International Economics and Management", country: "Italy", city: "Milan", subject: "Business", tuition: 16500, language: "English", minGpa: 3.6, sat: 1350, ielts: 6.5, math: true, scholarship: true, size: "Smaller community", setting: "Big city", tags: ["Prestige/ranking", "Strong career opportunities", "International environment"], competitiveness: "Reach", deadline: "24 January", living: 16000, students: "15,000", career: "Leading finance and consulting recruitment" },
  { id: "esade", name: "ESADE", program: "Bachelor of Business Administration", country: "Spain", city: "Barcelona", subject: "Business", tuition: 21900, language: "English", minGpa: 3.2, sat: 1250, ielts: 6.5, math: false, scholarship: true, size: "Smaller community", setting: "Big city", tags: ["Strong career opportunities", "Study abroad opportunities", "International environment"], competitiveness: "Competitive", deadline: "30 April", living: 15000, students: "16,000", career: "Industry-focused internships" },
  { id: "ie", name: "IE University", program: "Bachelor in Business Administration", country: "Spain", city: "Madrid", subject: "Business", tuition: 28000, language: "English", minGpa: 3.0, sat: 1200, ielts: 6.5, math: false, scholarship: true, size: "Smaller community", setting: "Big city", tags: ["International environment", "Strong career opportunities", "Study abroad opportunities"], competitiveness: "Competitive", deadline: "Rolling admissions", living: 15000, students: "10,000", career: "Entrepreneurship and global network" },
  { id: "uva", name: "University of Amsterdam", program: "BSc Business Administration", country: "Netherlands", city: "Amsterdam", subject: "Business", tuition: 14000, language: "English", minGpa: 3.3, sat: 1280, ielts: 6.5, math: true, scholarship: true, size: "Large university", setting: "Big city", tags: ["International environment", "Prestige/ranking", "Campus life"], competitiveness: "Competitive", deadline: "15 January", living: 17000, students: "42,000", career: "Amsterdam business ecosystem" },
  { id: "cbs", name: "Copenhagen Business School", program: "BSc International Business", country: "Denmark", city: "Copenhagen", subject: "Business", tuition: 15900, language: "English", minGpa: 3.5, sat: 1300, ielts: 7.0, math: true, scholarship: false, size: "Large university", setting: "Big city", tags: ["Prestige/ranking", "International environment", "Strong career opportunities"], competitiveness: "Reach", deadline: "15 March", living: 18500, students: "20,000", career: "Nordic business connections" },
  { id: "warwick", name: "University of Warwick", program: "BSc Management", country: "United Kingdom", city: "Coventry", subject: "Business", tuition: 29600, language: "English", minGpa: 3.6, sat: 1350, ielts: 7.0, math: true, scholarship: true, size: "Large university", setting: "Smaller university town", tags: ["Prestige/ranking", "Campus life", "Strong career opportunities"], competitiveness: "Reach", deadline: "29 January", living: 13500, students: "29,000", career: "Highly regarded graduate outcomes" },
  { id: "kcl", name: "King’s College London", program: "BSc Business Management", country: "United Kingdom", city: "London", subject: "Business", tuition: 32400, language: "English", minGpa: 3.5, sat: 1320, ielts: 7.0, math: true, scholarship: true, size: "Large university", setting: "Big city", tags: ["Prestige/ranking", "International environment", "Strong career opportunities"], competitiveness: "Reach", deadline: "29 January", living: 20500, students: "35,000", career: "London employer access" },
  { id: "bu", name: "Boston University", program: "BS Business Administration", country: "United States", city: "Boston", subject: "Business", tuition: 58000, language: "English", minGpa: 3.5, sat: 1370, ielts: 7.0, math: false, scholarship: true, size: "Large university", setting: "Big city", tags: ["Campus life", "Strong career opportunities", "International environment"], competitiveness: "Reach", deadline: "6 January", living: 22000, students: "37,000", career: "Boston innovation ecosystem" },
  { id: "northeastern", name: "Northeastern University", program: "BS Business Administration", country: "United States", city: "Boston", subject: "Business", tuition: 62000, language: "English", minGpa: 3.6, sat: 1400, ielts: 7.0, math: false, scholarship: true, size: "Large university", setting: "Big city", tags: ["Strong career opportunities", "Study abroad opportunities", "Campus life"], competitiveness: "Reach", deadline: "1 January", living: 22000, students: "28,000", career: "Experiential co-op program" },
  { id: "miami", name: "University of Miami", program: "BBA Business Administration", country: "United States", city: "Coral Gables", subject: "Business", tuition: 59000, language: "English", minGpa: 3.2, sat: 1250, ielts: 6.5, math: false, scholarship: true, size: "Large university", setting: "Big city", tags: ["Campus life", "International environment", "Study abroad opportunities"], competitiveness: "Competitive", deadline: "6 January", living: 21000, students: "20,000", career: "Americas-focused business network" },
];

export const money = (value: number) => `€${value.toLocaleString("en-US")}`;

export function getMatch(u: University, p: Profile) {
  const gpa = Number(p.gpa);
  const sat = Number(p.sat);
  const ielts = Number(p.ielts);
  const unmet: string[] = [];
  if (gpa && gpa < u.minGpa) unmet.push("GPA below indicative minimum");
  if (sat && sat < u.sat) unmet.push("SAT below indicative minimum");
  if (ielts && ielts < u.ielts) unmet.push("English score below indicative minimum");
  if (u.math && !p.math) unmet.push("Mathematics background required");
  const eligibility = unmet.length ? "Not eligible" : (!gpa || (!sat && !p.noTests) || (!ielts && !p.toefl)) ? "Possibly eligible" : "Eligible";
  const academic = Math.max(10, Math.min(35, 27 + (gpa ? (gpa - u.minGpa) * 10 : 3) + (sat ? (sat - u.sat) / 80 : 0)));
  const program = p.subject.toLowerCase() === u.subject.toLowerCase() ? 25 : 9;
  const affordability = u.tuition <= p.budget ? 15 : Math.max(1, 15 - (u.tuition - p.budget) / 2800);
  const location = !p.countries.length || p.countries.includes("Anywhere") || p.countries.includes(u.country) || (p.countries.includes("Europe") && !["United States", "United Kingdom"].includes(u.country)) || (p.countries.includes("Scandinavia") && u.country === "Denmark") ? 10 : 2;
  const language = ielts && ielts < u.ielts ? 3 : 10;
  const preferences = p.preferences.length ? 5 * u.tags.filter(tag => p.preferences.includes(tag)).length / p.preferences.length : 4;
  const score = Math.max(25, Math.min(98, Math.round(academic + program + affordability + location + language + preferences)));
  const reasons = ["Matches your study interests", ...(u.tuition <= p.budget ? ["Within your tuition budget"] : []), ...(location === 10 ? ["Fits your preferred location"] : []), ...(u.tags.filter(tag => p.preferences.includes(tag)).slice(0, 2))];
  return { score, eligibility, unmet, reasons, affordability: u.tuition <= p.budget ? "Within budget" : u.tuition <= p.budget * 1.15 ? "Slightly above budget" : "Above budget" };
}

export function readProfile(): Profile {
  if (typeof window === "undefined") return defaultProfile;
  try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem("univero-profile") || "{}") }; } catch { return defaultProfile; }
}
export function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("univero-saved") || "[]"); } catch { return []; }
}
export function readCompare(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("univero-compare") || "[]"); } catch { return []; }
}