// Prototype university catalogue. All admissions figures, tuition, deadlines and scholarships are
// ILLUSTRATIVE mock values (dataStatus: "illustrative") structured so verified data can replace them later.

export type Program = {
  id: string; name: string; degree: string; subject: string; duration: string; language: string;
  tuition: number; tuitionEU: number; deadline: string; deadlineDate: string;
  requiredSubjects: string[]; minGpa: number; sat: number | null; ielts: number; otherTests: string[]; documents: string[];
};
export type Scholarship = { name: string; amount: string; eligibility: string; deadline: string };
export type University = {
  id: string; name: string; short: string; domain: string; logo: string; country: string; countryCode: string; flag: string; city: string;
  type: "Public" | "Private"; tier: 1 | 2 | 3 | 4; campus: string; setting: string; size: string; students: string; intl: number;
  programs: Program[]; scholarships: Scholarship[]; tags: string[]; living: number; accommodation: number; career: string;
  dataStatus: "illustrative";
  // Convenience fields mirroring the headline program (kept for existing views)
  program: string; subject: string; tuition: number; tuitionEU: number; language: string; minGpa: number; sat: number; ielts: number;
  math: boolean; scholarship: boolean; competitiveness: "Strong" | "Competitive" | "Reach"; deadline: string; deadlineDate: string; satRequired: boolean;
};

const COUNTRY: Record<string, string> = { GB: "United Kingdom", NL: "Netherlands", IT: "Italy", ES: "Spain", DE: "Germany", DK: "Denmark", SE: "Sweden", FI: "Finland", FR: "France", US: "United States", EE: "Estonia", LV: "Latvia", LT: "Lithuania", CH: "Switzerland", IE: "Ireland", BE: "Belgium", AT: "Austria", PT: "Portugal", CA: "Canada" };
export const EU_COUNTRIES = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"];
const flag = (cc: string) => String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt(0)));

// [intl tuition public, EU tuition public, private tuition, living/yr, deadline label, deadline ISO, duration yrs]
const RULES: Record<string, [number, number, number, number, string, string, number]> = {
  GB: [27000, 27000, 27000, 15000, "29 January", "2027-01-29", 3], NL: [14500, 2600, 14500, 13500, "15 January", "2027-01-15", 3],
  IT: [3900, 3900, 16500, 12000, "Round 1 · 15 November", "2026-11-15", 3], ES: [5000, 2500, 22500, 11500, "30 April", "2027-04-30", 4],
  DE: [350, 350, 16000, 11500, "15 July", "2027-07-15", 3], DK: [15000, 0, 15000, 16000, "15 March", "2027-03-15", 3],
  SE: [14500, 0, 14500, 13000, "15 January", "2027-01-15", 3], FI: [13000, 0, 13000, 12000, "10 January", "2027-01-10", 3],
  FR: [2900, 180, 22000, 13000, "13 March", "2027-03-13", 3], US: [45000, 45000, 62000, 21000, "1 January", "2027-01-01", 4],
  EE: [4500, 3500, 6500, 8000, "15 June", "2027-06-15", 3], LV: [4000, 3000, 5500, 7500, "15 June", "2027-06-15", 3],
  LT: [4200, 3200, 5500, 7500, "15 June", "2027-06-15", 3], CH: [1500, 1500, 3200, 22000, "30 April", "2027-04-30", 3],
  IE: [22000, 3000, 22000, 16000, "1 February", "2027-02-01", 4], BE: [6500, 1000, 6500, 11500, "1 March", "2027-03-01", 3],
  AT: [1500, 0, 1500, 12500, "15 March", "2027-03-15", 3], PT: [7000, 3500, 7000, 9500, "31 March", "2027-03-31", 3],
  CA: [38000, 38000, 38000, 17000, "15 January", "2027-01-15", 4],
};
const EXPENSIVE_CITIES: Record<string, number> = { London: 20500, Amsterdam: 17000, Milan: 15000, Munich: 14500, Paris: 16500, Copenhagen: 17000, Stockholm: 15000, Zurich: 24000, Boston: 23000, "New York": 25000, Cambridge: 17000, Stanford: 24000, Berkeley: 22000, "Los Angeles": 22000, Dublin: 18000, Oxford: 17000 };

const SUBJECTS: Record<string, { subject: string; names: string[]; req: string[]; deg: string }> = {
  B: { subject: "Business", names: ["International Business Administration", "Business Administration", "Management"], req: ["Mathematics"], deg: "BSc" },
  E: { subject: "Economics", names: ["Economics", "International Economics", "Economics and Business Economics"], req: ["Mathematics"], deg: "BSc" },
  C: { subject: "Computer Science", names: ["Computer Science", "Data Science and AI"], req: ["Mathematics"], deg: "BSc" },
  N: { subject: "Engineering", names: ["Mechanical Engineering", "Electrical Engineering", "Industrial Engineering"], req: ["Mathematics", "Physics"], deg: "BSc" },
  L: { subject: "Law", names: ["Law", "International and European Law"], req: [], deg: "LLB" },
  P: { subject: "Politics", names: ["Politics and International Relations", "Global Governance"], req: [], deg: "BA" },
  Y: { subject: "Psychology", names: ["Psychology"], req: ["Mathematics"], deg: "BSc" },
};

// Named programmes that differ from the generic templates
const PROGRAM_OVERRIDES: Record<string, [string, string][]> = {
  bocconi: [["B", "International Economics and Management"], ["E", "Economics and Management"], ["C", "Economics, Management and Computer Science"], ["L", "Law (LLB)"]],
  erasmus: [["B", "International Business Administration"], ["E", "International Economics and Business Economics"], ["Y", "International Bachelor in Psychology"]],
  esade: [["B", "Bachelor in Business Administration (BBA)"], ["P", "Global Governance, Economics and Legal Order"], ["L", "Global Law"]],
};

// id, name, short, city, cc, domain, private?, tier, students(k), intl%, subjects, setting(B big city, T town, C campus)
type Row = [string, string, string, string, string, string, 0 | 1, 1 | 2 | 3 | 4, number, number, string, "B" | "T" | "C"];
const ROWS: Row[] = [
  ["oxford", "University of Oxford", "Oxford", "Oxford", "GB", "ox.ac.uk", 0, 1, 26, 25, "ECLPNY", "T"],
  ["cambridge", "University of Cambridge", "Cambridge", "Cambridge", "GB", "cam.ac.uk", 0, 1, 24, 25, "ECLPNY", "T"],
  ["lse", "London School of Economics", "LSE", "London", "GB", "lse.ac.uk", 0, 1, 12, 70, "BELP", "B"],
  ["imperial", "Imperial College London", "Imperial", "London", "GB", "imperial.ac.uk", 0, 1, 22, 60, "BCNE", "B"],
  ["ucl", "University College London", "UCL", "London", "GB", "ucl.ac.uk", 0, 1, 46, 55, "BECLPNY", "B"],
  ["kcl", "King’s College London", "King’s", "London", "GB", "kcl.ac.uk", 0, 2, 38, 45, "BELPY", "B"],
  ["warwick", "University of Warwick", "Warwick", "Coventry", "GB", "warwick.ac.uk", 0, 2, 29, 40, "BECLN", "C"],
  ["manchester", "University of Manchester", "Manchester", "Manchester", "GB", "manchester.ac.uk", 0, 2, 46, 35, "BECLNY", "B"],
  ["edinburgh", "University of Edinburgh", "Edinburgh", "Edinburgh", "GB", "ed.ac.uk", 0, 2, 41, 40, "BECLPY", "B"],
  ["bristol", "University of Bristol", "Bristol", "Bristol", "GB", "bristol.ac.uk", 0, 2, 29, 30, "BECLNY", "B"],
  ["durham", "Durham University", "Durham", "Durham", "GB", "durham.ac.uk", 0, 2, 21, 30, "BELP", "T"],
  ["bath", "University of Bath", "Bath", "Bath", "GB", "bath.ac.uk", 0, 2, 19, 30, "BECNY", "C"],
  ["standrews", "University of St Andrews", "St Andrews", "St Andrews", "GB", "st-andrews.ac.uk", 0, 2, 11, 45, "BEPY", "T"],
  ["glasgow", "University of Glasgow", "Glasgow", "Glasgow", "GB", "gla.ac.uk", 0, 3, 40, 35, "BECLNY", "B"],
  ["exeter", "University of Exeter", "Exeter", "Exeter", "GB", "exeter.ac.uk", 0, 3, 30, 25, "BELPY", "C"],
  ["uva", "University of Amsterdam", "UvA", "Amsterdam", "NL", "uva.nl", 0, 2, 42, 25, "BECLPY", "B"],
  ["erasmus", "Erasmus University Rotterdam", "Erasmus", "Rotterdam", "NL", "eur.nl", 0, 2, 39, 25, "BEY", "B"],
  ["tilburg", "Tilburg University", "Tilburg", "Tilburg", "NL", "tilburguniversity.edu", 0, 3, 20, 20, "BELY", "T"],
  ["maastricht", "Maastricht University", "Maastricht", "Maastricht", "NL", "maastrichtuniversity.nl", 0, 3, 22, 55, "BELPY", "T"],
  ["groningen", "University of Groningen", "Groningen", "Groningen", "NL", "rug.nl", 0, 3, 36, 25, "BECLNY", "T"],
  ["vu", "Vrije Universiteit Amsterdam", "VU Amsterdam", "Amsterdam", "NL", "vu.nl", 0, 3, 30, 15, "BECLY", "B"],
  ["twente", "University of Twente", "Twente", "Enschede", "NL", "utwente.nl", 0, 3, 12, 30, "BCNY", "C"],
  ["tue", "Eindhoven University of Technology", "TU/e", "Eindhoven", "NL", "tue.nl", 0, 3, 13, 25, "CN", "T"],
  ["delft", "Delft University of Technology", "TU Delft", "Delft", "NL", "tudelft.nl", 0, 2, 27, 25, "CN", "T"],
  ["leiden", "Leiden University", "Leiden", "Leiden", "NL", "universiteitleiden.nl", 0, 2, 34, 20, "LPY", "T"],
  ["bocconi", "Bocconi University", "Bocconi", "Milan", "IT", "unibocconi.it", 1, 2, 15, 20, "BECL", "B"],
  ["bologna", "University of Bologna", "Bologna", "Bologna", "IT", "unibo.it", 0, 3, 90, 8, "BECLNP", "B"],
  ["polimi", "Politecnico di Milano", "PoliMi", "Milan", "IT", "polimi.it", 0, 2, 47, 15, "CN", "B"],
  ["luiss", "LUISS Guido Carli", "LUISS", "Rome", "IT", "luiss.edu", 1, 3, 10, 10, "BELP", "B"],
  ["padua", "University of Padua", "Padua", "Padua", "IT", "unipd.it", 0, 3, 60, 6, "BECNY", "T"],
  ["sapienza", "Sapienza University of Rome", "Sapienza", "Rome", "IT", "uniroma1.it", 0, 3, 110, 6, "BECNP", "B"],
  ["esade", "ESADE", "ESADE", "Barcelona", "ES", "esade.edu", 1, 3, 16, 45, "BLP", "B"],
  ["ie", "IE University", "IE", "Madrid", "ES", "ie.edu", 1, 3, 10, 75, "BCELP", "B"],
  ["ub", "University of Barcelona", "UB", "Barcelona", "ES", "ub.edu", 0, 3, 60, 10, "BELY", "B"],
  ["upf", "Pompeu Fabra University", "UPF", "Barcelona", "ES", "upf.edu", 0, 2, 17, 20, "BELP", "B"],
  ["uab", "Autonomous University of Barcelona", "UAB", "Barcelona", "ES", "uab.cat", 0, 3, 40, 12, "BECY", "C"],
  ["uc3m", "Carlos III University of Madrid", "UC3M", "Madrid", "ES", "uc3m.es", 0, 3, 20, 15, "BECLN", "B"],
  ["tum", "Technical University of Munich", "TUM", "Munich", "DE", "tum.de", 0, 2, 50, 38, "BCN", "B"],
  ["lmu", "LMU Munich", "LMU", "Munich", "DE", "lmu.de", 0, 2, 52, 17, "BEY", "B"],
  ["mannheim", "University of Mannheim", "Mannheim", "Mannheim", "DE", "uni-mannheim.de", 0, 2, 12, 15, "BEC", "T"],
  ["fs", "Frankfurt School of Finance & Management", "Frankfurt School", "Frankfurt", "DE", "frankfurt-school.de", 1, 3, 3, 30, "BE", "B"],
  ["hu", "Humboldt University of Berlin", "Humboldt", "Berlin", "DE", "hu-berlin.de", 0, 3, 36, 18, "EPY", "B"],
  ["fu", "Free University of Berlin", "FU Berlin", "Berlin", "DE", "fu-berlin.de", 0, 3, 33, 20, "EPY", "B"],
  ["rwth", "RWTH Aachen University", "RWTH", "Aachen", "DE", "rwth-aachen.de", 0, 3, 47, 25, "CN", "T"],
  ["cbs", "Copenhagen Business School", "CBS", "Copenhagen", "DK", "cbs.dk", 0, 2, 20, 20, "BE", "B"],
  ["ku", "University of Copenhagen", "UCPH", "Copenhagen", "DK", "ku.dk", 0, 2, 37, 12, "ECPY", "B"],
  ["sse", "Stockholm School of Economics", "SSE", "Stockholm", "SE", "hhs.se", 1, 2, 2, 20, "BE", "B"],
  ["su", "Stockholm University", "Stockholm U", "Stockholm", "SE", "su.se", 0, 3, 28, 10, "BEPY", "B"],
  ["lund", "Lund University", "Lund", "Lund", "SE", "lu.se", 0, 2, 40, 20, "BECNP", "T"],
  ["aalto", "Aalto University", "Aalto", "Espoo", "FI", "aalto.fi", 0, 2, 12, 20, "BCN", "C"],
  ["helsinki", "University of Helsinki", "Helsinki", "Helsinki", "FI", "helsinki.fi", 0, 2, 31, 8, "ECY", "B"],
  ["hec", "HEC Paris", "HEC", "Paris", "FR", "hec.edu", 1, 1, 5, 50, "B", "C"],
  ["essec", "ESSEC Business School", "ESSEC", "Paris", "FR", "essec.edu", 1, 2, 7, 40, "B", "C"],
  ["escp", "ESCP Business School", "ESCP", "Paris", "FR", "escp.eu", 1, 2, 10, 50, "B", "B"],
  ["sciencespo", "Sciences Po", "Sciences Po", "Paris", "FR", "sciencespo.fr", 1, 2, 14, 50, "EP", "B"],
  ["saclay", "Paris-Saclay University", "Paris-Saclay", "Paris", "FR", "universite-paris-saclay.fr", 0, 2, 48, 18, "CNE", "C"],
  ["harvard", "Harvard University", "Harvard", "Cambridge", "US", "harvard.edu", 1, 1, 23, 25, "ECPY", "T"],
  ["stanford", "Stanford University", "Stanford", "Stanford", "US", "stanford.edu", 1, 1, 17, 24, "ECNPY", "C"],
  ["mit", "Massachusetts Institute of Technology", "MIT", "Cambridge", "US", "mit.edu", 1, 1, 12, 33, "CNE", "C"],
  ["upenn", "University of Pennsylvania", "Penn", "Philadelphia", "US", "upenn.edu", 1, 1, 28, 20, "BECN", "B"],
  ["columbia", "Columbia University", "Columbia", "New York", "US", "columbia.edu", 1, 1, 36, 40, "ECNP", "B"],
  ["cornell", "Cornell University", "Cornell", "Ithaca", "US", "cornell.edu", 1, 1, 26, 25, "BECN", "C"],
  ["berkeley", "UC Berkeley", "Berkeley", "Berkeley", "US", "berkeley.edu", 0, 1, 45, 17, "BECNP", "C"],
  ["nyu", "New York University", "NYU", "New York", "US", "nyu.edu", 1, 2, 60, 27, "BECP", "B"],
  ["ucla", "UCLA", "UCLA", "Los Angeles", "US", "ucla.edu", 0, 2, 47, 12, "ECNPY", "C"],
  ["umich", "University of Michigan", "Michigan", "Ann Arbor", "US", "umich.edu", 0, 2, 51, 15, "BECN", "C"],
  ["usc", "University of Southern California", "USC", "Los Angeles", "US", "usc.edu", 1, 2, 48, 25, "BCNP", "C"],
  ["bu", "Boston University", "BU", "Boston", "US", "bu.edu", 1, 2, 37, 25, "BECP", "B"],
  ["northeastern", "Northeastern University", "Northeastern", "Boston", "US", "northeastern.edu", 1, 2, 28, 20, "BCN", "B"],
  ["miami", "University of Miami", "Miami", "Coral Gables", "US", "miami.edu", 1, 3, 20, 15, "BEP", "C"],
  ["babson", "Babson College", "Babson", "Wellesley", "US", "babson.edu", 1, 3, 4, 30, "B", "C"],
  ["tartu", "University of Tartu", "Tartu", "Tartu", "EE", "ut.ee", 0, 4, 13, 10, "BECLY", "T"],
  ["taltech", "Tallinn University of Technology", "TalTech", "Tallinn", "EE", "taltech.ee", 0, 4, 9, 15, "BCN", "B"],
  ["tlu", "Tallinn University", "Tallinn U", "Tallinn", "EE", "tlu.ee", 0, 4, 7, 10, "BPY", "B"],
  ["ebs", "Estonian Business School", "EBS", "Tallinn", "EE", "ebs.ee", 1, 4, 1, 35, "B", "B"],
  ["rtu", "Riga Technical University", "RTU", "Riga", "LV", "rtu.lv", 0, 4, 13, 12, "BCN", "B"],
  ["lu", "University of Latvia", "LU", "Riga", "LV", "lu.lv", 0, 4, 14, 8, "BELP", "B"],
  ["vilnius", "Vilnius University", "Vilnius U", "Vilnius", "LT", "vu.lt", 0, 4, 23, 8, "BELP", "B"],
  ["eth", "ETH Zurich", "ETH", "Zurich", "CH", "ethz.ch", 0, 1, 25, 40, "CN", "B"],
  ["epfl", "EPFL", "EPFL", "Lausanne", "CH", "epfl.ch", 0, 1, 12, 50, "CN", "C"],
  ["hsg", "University of St. Gallen", "HSG", "St. Gallen", "CH", "unisg.ch", 0, 2, 9, 25, "BEL", "T"],
  ["tcd", "Trinity College Dublin", "Trinity", "Dublin", "IE", "tcd.ie", 0, 2, 20, 30, "BECLP", "B"],
  ["ucd", "University College Dublin", "UCD", "Dublin", "IE", "ucd.ie", 0, 3, 38, 30, "BECLN", "C"],
  ["kuleuven", "KU Leuven", "KU Leuven", "Leuven", "BE", "kuleuven.be", 0, 2, 60, 20, "BECLNY", "T"],
  ["wu", "WU Vienna University of Economics and Business", "WU Vienna", "Vienna", "AT", "wu.ac.at", 0, 3, 21, 25, "BEL", "B"],
  ["nova", "Nova School of Business and Economics", "Nova SBE", "Lisbon", "PT", "novasbe.unl.pt", 0, 3, 3, 45, "BE", "C"],
  ["toronto", "University of Toronto", "U of T", "Toronto", "CA", "utoronto.ca", 0, 2, 97, 25, "BECNPY", "B"],
  ["mcgill", "McGill University", "McGill", "Montreal", "CA", "mcgill.ca", 0, 2, 40, 30, "BECLNP", "B"],
  ["ubc", "University of British Columbia", "UBC", "Vancouver", "CA", "ubc.ca", 0, 2, 70, 30, "BECNY", "C"],
];

const TIER = {
  1: { gpa: 3.85, sat: 1500, ielts: 7.5, comp: "Reach" as const },
  2: { gpa: 3.5, sat: 1380, ielts: 7.0, comp: "Reach" as const },
  3: { gpa: 3.2, sat: 1260, ielts: 6.5, comp: "Competitive" as const },
  4: { gpa: 2.9, sat: 1150, ielts: 6.0, comp: "Strong" as const },
};
const SPECIAL_DEADLINES: Record<string, [string, string]> = { oxford: ["15 October", "2026-10-15"], cambridge: ["15 October", "2026-10-15"], bocconi: ["Round 1 · 5 November", "2026-11-05"], esade: ["Round 1 · 15 December", "2026-12-15"], ie: ["Rolling admissions", "2027-05-01"], tilburg: ["1 May", "2027-05-01"], erasmus: ["15 January", "2027-01-15"] };

function build(row: Row): University {
  const [id, name, short, city, cc, domain, priv, tier, studentsK, intl, subj, setting] = row;
  const country = COUNTRY[cc]!; const r = RULES[cc]!; const t = TIER[tier];
  let tuition = priv ? r[2] : r[0]; let tuitionEU = priv ? r[2] : r[1];
  if (cc === "GB") { tuition = tuitionEU = r[0] + (tier === 1 ? 10000 : tier === 2 ? 5000 : 0); }
  if (id === "tum") tuition = 6000;
  if (cc === "US" && priv && tier === 1) tuition = tuitionEU = 66000;
  const [deadline, deadlineDate] = SPECIAL_DEADLINES[id] ?? [r[4], r[5]];
  const duration = `${cc === "GB" && ["edinburgh", "glasgow", "standrews"].includes(id) ? 4 : r[6]} years`;
  const satRequired = cc === "US" ? tier <= 2 : false;
  const codes = PROGRAM_OVERRIDES[id] ?? subj.split("").filter(c => SUBJECTS[c]).map(c => [c, SUBJECTS[c]!.names[(id.length + c.charCodeAt(0)) % SUBJECTS[c]!.names.length]] as [string, string]);
  const programs: Program[] = codes.map(([c, pname], i) => {
    const s = SUBJECTS[c]!; const deg = cc === "US" ? (s.deg === "LLB" ? "BA" : s.deg.replace("BSc", "BS")) : cc === "GB" || cc === "IE" ? s.deg : pname.includes("(") ? "Bachelor" : s.deg === "LLB" ? "LLB" : "BSc";
    const bump = i === 0 ? 0 : (i % 2 ? -0.05 : 0.05);
    return {
      id: `${id}-${c.toLowerCase()}${i}`, name: `${deg} ${pname}`, degree: "Bachelor’s", subject: s.subject, duration, language: cc === "DE" && !priv && c !== "C" ? "English / German" : "English",
      tuition, tuitionEU, deadline, deadlineDate, requiredSubjects: s.req, minGpa: Math.round((t.gpa + bump) * 100) / 100,
      sat: satRequired || cc === "US" ? t.sat : (["bocconi", "ie", "esade", "luiss"].includes(id) ? t.sat - 50 : null), ielts: t.ielts,
      otherTests: id === "oxford" || id === "cambridge" ? (c === "L" ? ["LNAT"] : ["Admissions assessment"]) : cc === "GB" && c === "L" && tier <= 2 ? ["LNAT"] : [],
      documents: ["Academic transcript", "Predicted or final grades", "English certificate", cc === "GB" ? "Personal statement" : "Motivation letter", "Recommendation letter", ...(cc === "US" ? ["CV / activities list", "SAT or ACT scores"] : ["CV / Resume"]), "Passport / ID"],
    };
  });
  const main = programs[0]!;
  const living = EXPENSIVE_CITIES[city] ?? r[3];
  const bigCity = setting === "B";
  const tags = [
    ...(tier <= 2 ? ["Prestige/ranking"] : []), ...(intl >= 25 ? ["International environment"] : []), ...(setting !== "B" ? ["Campus life"] : []),
    ...(living <= 12000 ? ["Affordable living costs"] : []), ...((subj.includes("B") || subj.includes("E")) && tier <= 3 ? ["Strong career opportunities"] : []),
    ...(subj.includes("B") ? ["Study abroad opportunities"] : []),
    bigCity ? "Big city" : "Smaller university town", studentsK >= 25 ? "Large university" : "Smaller community",
  ];
  const scholarship = tier <= 3 || priv === 1 || cc === "EE";
  const scholarships: Scholarship[] = scholarship ? [
    { name: `${short} Merit Scholarship`, amount: priv || tuition > 10000 ? "Up to 50% tuition waiver" : "€1,500–€3,000 / year", eligibility: "Strong academic record; awarded at admission", deadline: `With application (${deadline})` },
    ...(tuition > 10000 ? [{ name: `${short} Need-based Award`, amount: "Partial to full tuition", eligibility: "Demonstrated financial need", deadline: "Two weeks after application deadline" }] : []),
  ] : [];
  return {
    id, name, short, domain, logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, country, countryCode: cc, flag: flag(cc), city,
    type: priv ? "Private" : "Public", tier, campus: setting === "C" ? "Campus university" : setting === "T" ? "University town" : "City campus",
    setting: bigCity ? "Big city" : "Smaller university town", size: studentsK >= 25 ? "Large university" : "Smaller community",
    students: `${(studentsK * 1000).toLocaleString("en-US")}`, intl, programs, scholarships, tags, living, accommodation: Math.round(living * 0.55 / 12 / 10) * 10,
    career: tier === 1 ? "Global employer recognition across sectors" : subj.includes("B") ? "Established business and industry network" : "Solid regional employer links",
    dataStatus: "illustrative",
    program: main.name, subject: main.subject, tuition, tuitionEU, language: main.language, minGpa: main.minGpa, sat: main.sat ?? t.sat, ielts: t.ielts,
    math: main.requiredSubjects.includes("Mathematics"), scholarship, competitiveness: t.comp, deadline, deadlineDate, satRequired,
  };
}

export const universities: University[] = ROWS.map(build);
export const countries = [...new Set(universities.map(u => u.country))].sort();
export const subjects = [...new Set(universities.flatMap(u => u.programs.map(p => p.subject)))].sort();
