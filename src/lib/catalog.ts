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

const COUNTRY: Record<string, string> = {
  GB: "United Kingdom", NL: "Netherlands", IT: "Italy", ES: "Spain", DE: "Germany",
  DK: "Denmark", SE: "Sweden", FI: "Finland", FR: "France", US: "United States",
  EE: "Estonia", LV: "Latvia", LT: "Lithuania", CH: "Switzerland", IE: "Ireland",
  BE: "Belgium", AT: "Austria", PT: "Portugal", CA: "Canada", SG: "Singapore",
  HK: "Hong Kong", AU: "Australia", PL: "Poland", CZ: "Czechia",
  NO: "Norway", NZ: "New Zealand", JP: "Japan", KR: "South Korea", HU: "Hungary",
  SI: "Slovenia", HR: "Croatia", CN: "China"
};
export const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
  "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
  "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"
];
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
  SG: [21000, 21000, 21000, 15000, "28 February", "2027-02-28", 4],
  HK: [23000, 23000, 23000, 14000, "20 February", "2027-02-20", 4],
  AU: [34000, 34000, 34000, 18000, "30 November", "2026-11-30", 3],
  PL: [4000, 2000, 6000, 8000, "15 July", "2027-07-15", 3],
  CZ: [5000, 0, 7500, 8500, "28 February", "2027-02-28", 3],
  NO: [15000, 0, 15000, 15500, "15 April", "2027-04-15", 3],
  NZ: [26000, 26000, 26000, 16000, "1 December", "2026-12-01", 3],
  JP: [6000, 6000, 9000, 13000, "15 January", "2027-01-15", 4],
  KR: [5500, 5500, 8500, 11500, "20 January", "2027-01-20", 4],
  HU: [4000, 0, 6000, 7500, "15 February", "2027-02-15", 3],
  SI: [4000, 0, 5000, 8000, "19 April", "2027-04-19", 3],
  HR: [3800, 0, 5000, 7500, "15 May", "2027-05-15", 3],
  CN: [4500, 4500, 6500, 8000, "31 March", "2027-03-31", 4],
};
const EXPENSIVE_CITIES: Record<string, number> = {
  London: 20500, Amsterdam: 17000, Milan: 15000, Munich: 14500, Paris: 16500, Copenhagen: 17000,
  Stockholm: 15000, Zurich: 24000, Boston: 23000, "New York": 25000, Cambridge: 17000, Stanford: 24000,
  Berkeley: 22000, "Los Angeles": 22000, Dublin: 18000, Oxford: 17000, Singapore: 18000, "Hong Kong": 17500,
  Sydney: 19500, Melbourne: 18500, Chicago: 21000, Pasadena: 23000, Baltimore: 19000, Evanston: 20000,
  Pittsburgh: 18000, Atlanta: 18500, Providence: 20500, Hanover: 21000, Nashville: 19500, Houston: 18000,
  Seattle: 21500, Berlin: 13500, Geneva: 23000, "San Diego": 21000, "Washington D.C.": 22000,
  Austin: 17000, Philadelphia: 18000, Oslo: 18000, Tokyo: 16000, Seoul: 14000, Auckland: 16500,
  Beijing: 10000, Montreal: 14500, Vancouver: 18000, Toronto: 18000, Edinburgh: 15500,
  Manchester: 14000, Bristol: 14500, Liverpool: 12000, Lyon: 13000, Rome: 13500, Florence: 13500,
  Barcelona: 13000, Madrid: 13000, Vienna: 13500, Brussels: 13500, Budapest: 8500, Prague: 9500,
  Warsaw: 9000, Krakow: 8500, Tallinn: 8500, Riga: 7500, Vilnius: 7500, Kaunas: 7000,
};

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
  // Verified against the open Hipolabs universities database (universities.hipolabs.com)
  ["yale", "Yale University", "Yale", "New Haven", "US", "yale.edu", 1, 1, 14, 22, "ECLPY", "C"],
  ["princeton", "Princeton University", "Princeton", "Princeton", "US", "princeton.edu", 1, 1, 8, 24, "ECNPY", "C"],
  ["duke", "Duke University", "Duke", "Durham", "US", "duke.edu", 1, 1, 17, 24, "BECNY", "C"],
  ["uchicago", "University of Chicago", "UChicago", "Chicago", "US", "uchicago.edu", 1, 1, 18, 26, "ECLPY", "B"],
  ["utaustin", "University of Texas at Austin", "UT Austin", "Austin", "US", "utexas.edu", 0, 2, 53, 15, "BECNY", "B"],
  ["nottingham", "University of Nottingham", "Nottingham", "Nottingham", "GB", "nottingham.ac.uk", 0, 3, 35, 30, "BECLNY", "C"],
  ["leeds", "University of Leeds", "Leeds", "Leeds", "GB", "leeds.ac.uk", 0, 2, 39, 30, "BECLNY", "B"],
  ["sheffield", "University of Sheffield", "Sheffield", "Sheffield", "GB", "sheffield.ac.uk", 0, 3, 30, 30, "BECLNY", "B"],
  ["southampton", "University of Southampton", "Southampton", "Southampton", "GB", "soton.ac.uk", 0, 3, 23, 25, "BECNY", "C"],
  ["york", "University of York", "York", "York", "GB", "york.ac.uk", 0, 2, 19, 30, "BECLPY", "C"],
  ["heidelberg", "Heidelberg University", "Heidelberg", "Heidelberg", "DE", "uni-heidelberg.de", 0, 2, 29, 20, "ECLPY", "T"],
  ["koeln", "University of Cologne", "Cologne", "Cologne", "DE", "uni-koeln.de", 0, 3, 47, 12, "BELPY", "B"],
  ["kit", "Karlsruhe Institute of Technology", "KIT", "Karlsruhe", "DE", "kit.edu", 0, 2, 23, 20, "CN", "T"],
  ["utrecht", "Utrecht University", "Utrecht", "Utrecht", "NL", "uu.nl", 0, 2, 35, 15, "ECLPY", "T"],
  ["radboud", "Radboud University", "Radboud", "Nijmegen", "NL", "ru.nl", 0, 3, 24, 15, "ELPY", "T"],
  ["turin", "University of Turin", "Turin", "Turin", "IT", "unito.it", 0, 3, 68, 8, "BELPY", "B"],
  ["ucm", "Complutense University of Madrid", "UCM", "Madrid", "ES", "ucm.es", 0, 3, 65, 8, "BELPY", "B"],
  ["uppsala", "Uppsala University", "Uppsala", "Uppsala", "SE", "uu.se", 0, 2, 45, 15, "ECLPY", "T"],
  ["kth", "KTH Royal Institute of Technology", "KTH", "Stockholm", "SE", "kth.se", 0, 2, 14, 30, "CN", "B"],
  ["aarhus", "Aarhus University", "Aarhus", "Aarhus", "DK", "au.dk", 0, 2, 39, 15, "BECPY", "B"],
  ["geneva", "University of Geneva", "Geneva", "Geneva", "CH", "unige.ch", 0, 2, 17, 40, "ELPY", "B"],
  ["uzh", "University of Zurich", "UZH", "Zurich", "CH", "uzh.ch", 0, 1, 27, 25, "ECLPY", "B"],
  ["ucc", "University College Cork", "UCC", "Cork", "IE", "ucc.ie", 0, 3, 24, 15, "BECLNY", "C"],
  ["ghent", "Ghent University", "Ghent", "Ghent", "BE", "ugent.be", 0, 2, 49, 15, "BECLNY", "B"],
  ["univie", "University of Vienna", "Vienna", "Vienna", "AT", "univie.ac.at", 0, 2, 88, 20, "ELPY", "B"],
  ["porto", "University of Porto", "Porto", "Porto", "PT", "up.pt", 0, 3, 32, 10, "BECNY", "B"],
  ["waterloo", "University of Waterloo", "Waterloo", "Waterloo", "CA", "uwaterloo.ca", 0, 2, 42, 25, "BCNY", "C"],
  ["dauphine", "Paris-Dauphine University", "Dauphine", "Paris", "FR", "dauphine.fr", 0, 2, 10, 25, "BE", "B"],
  ["caltech", "California Institute of Technology", "Caltech", "Pasadena", "US", "caltech.edu", 1, 1, 2, 30, "CN", "C"],
  ["jhu", "Johns Hopkins University", "Johns Hopkins", "Baltimore", "US", "jhu.edu", 1, 1, 28, 25, "ECNPY", "B"],
  ["northwestern", "Northwestern University", "Northwestern", "Evanston", "US", "northwestern.edu", 1, 1, 22, 22, "BECNPY", "C"],
  ["cmu", "Carnegie Mellon University", "CMU", "Pittsburgh", "US", "cmu.edu", 1, 1, 15, 35, "BCN", "B"],
  ["gatech", "Georgia Institute of Technology", "Georgia Tech", "Atlanta", "US", "gatech.edu", 0, 1, 45, 25, "BCN", "B"],
  ["brown", "Brown University", "Brown", "Providence", "US", "brown.edu", 1, 1, 10, 20, "ECNPY", "C"],
  ["dartmouth", "Dartmouth College", "Dartmouth", "Hanover", "US", "dartmouth.edu", 1, 1, 6, 16, "BECN", "T"],
  ["vanderbilt", "Vanderbilt University", "Vanderbilt", "Nashville", "US", "vanderbilt.edu", 1, 1, 13, 16, "BECPY", "B"],
  ["rice", "Rice University", "Rice", "Houston", "US", "rice.edu", 1, 1, 8, 25, "BECN", "B"],
  ["uwashington", "University of Washington", "UW", "Seattle", "US", "washington.edu", 0, 2, 49, 18, "BECNY", "B"],
  ["birmingham", "University of Birmingham", "Birmingham", "Birmingham", "GB", "birmingham.ac.uk", 0, 2, 38, 30, "BECLNY", "C"],
  ["qmul", "Queen Mary University of London", "Queen Mary", "London", "GB", "qmul.ac.uk", 0, 3, 33, 45, "BECLNY", "B"],
  ["lancaster", "Lancaster University", "Lancaster", "Lancaster", "GB", "lancaster.ac.uk", 0, 3, 16, 35, "BECLPY", "C"],
  ["newcastle", "Newcastle University", "Newcastle", "Newcastle", "GB", "ncl.ac.uk", 0, 3, 28, 28, "BECLNY", "B"],
  ["cardiff", "Cardiff University", "Cardiff", "Cardiff", "GB", "cardiff.ac.uk", 0, 3, 33, 25, "BECLNY", "B"],
  ["wur", "Wageningen University & Research", "Wageningen", "Wageningen", "NL", "wur.nl", 0, 2, 13, 28, "CN", "T"],
  ["tuberlin", "Technical University of Berlin", "TU Berlin", "Berlin", "DE", "tu.berlin", 0, 2, 35, 27, "BCN", "B"],
  ["goethe", "Goethe University Frankfurt", "Goethe U", "Frankfurt", "DE", "uni-frankfurt.de", 0, 3, 45, 16, "BELPY", "B"],
  ["polytechnique", "École Polytechnique", "l'X", "Paris", "FR", "polytechnique.edu", 0, 1, 4, 40, "CNE", "C"],
  ["sorbonne", "Sorbonne University", "Sorbonne", "Paris", "FR", "sorbonne-universite.fr", 0, 2, 55, 20, "ECNPY", "B"],
  ["unibas", "University of Basel", "Basel", "Basel", "CH", "unibas.ch", 0, 2, 13, 25, "ELPY", "B"],
  ["karolinska", "Karolinska Institute", "Karolinska", "Stockholm", "SE", "ki.se", 0, 1, 6, 25, "Y", "B"],
  ["chalmers", "Chalmers University of Technology", "Chalmers", "Gothenburg", "SE", "chalmers.se", 0, 2, 11, 22, "CN", "B"],
  ["galway", "University of Galway", "Galway", "Galway", "IE", "universityofgalway.ie", 0, 3, 19, 20, "BECLNY", "T"],
  ["tugraz", "Graz University of Technology", "TU Graz", "Graz", "AT", "tugraz.at", 0, 3, 17, 22, "CN", "T"],
  ["uwarsaw", "University of Warsaw", "U of Warsaw", "Warsaw", "PL", "uw.edu.pl", 0, 3, 40, 10, "BELPY", "B"],
  ["cuni", "Charles University", "Charles U", "Prague", "CZ", "cuni.cz", 0, 3, 50, 15, "BELPY", "B"],
  ["nus", "National University of Singapore", "NUS", "Singapore", "SG", "nus.edu.sg", 0, 1, 40, 32, "BECNPY", "C"],
  ["ntu", "Nanyang Technological University", "NTU", "Singapore", "SG", "ntu.edu.sg", 0, 1, 33, 30, "BCN", "C"],
  ["hku", "University of Hong Kong", "HKU", "Hong Kong", "HK", "hku.hk", 0, 1, 31, 43, "BECLPY", "B"],
  ["hkust", "Hong Kong University of Science and Technology", "HKUST", "Hong Kong", "HK", "hkust.edu.hk", 0, 1, 16, 35, "BCNE", "C"],
  ["unimelb", "University of Melbourne", "UniMelb", "Melbourne", "AU", "unimelb.edu.au", 0, 2, 52, 40, "BECNPY", "B"],
  ["usyd", "University of Sydney", "USyd", "Sydney", "AU", "sydney.edu.au", 0, 2, 60, 42, "BECLNY", "B"],
  ["ualberta", "University of Alberta", "UAlberta", "Edmonton", "CA", "ualberta.ca", 0, 3, 40, 22, "BECNPY", "B"],
  ["mcmaster", "McMaster University", "McMaster", "Hamilton", "CA", "mcmaster.ca", 0, 2, 35, 20, "BCNY", "C"],

  // United States Additions
  ["ucsd", "UC San Diego", "UCSD", "San Diego", "US", "ucsd.edu", 0, 1, 42, 20, "BECNPY", "C"],
  ["ucdavis", "UC Davis", "UC Davis", "Davis", "US", "ucdavis.edu", 0, 2, 39, 16, "BECNY", "T"],
  ["ucsb", "UC Santa Barbara", "UCSB", "Santa Barbara", "US", "ucsb.edu", 0, 2, 26, 14, "ECNPY", "C"],
  ["uci", "UC Irvine", "UC Irvine", "Irvine", "US", "uci.edu", 0, 2, 37, 18, "BECNPY", "C"],
  ["emory", "Emory University", "Emory", "Atlanta", "US", "emory.edu", 1, 1, 15, 20, "BECPY", "C"],
  ["georgetown", "Georgetown University", "Georgetown", "Washington D.C.", "US", "georgetown.edu", 1, 1, 20, 22, "BELP", "B"],
  ["uva-us", "University of Virginia", "UVA", "Charlottesville", "US", "virginia.edu", 0, 1, 25, 12, "BECNPY", "T"],
  ["unc", "UNC Chapel Hill", "UNC", "Chapel Hill", "US", "unc.edu", 0, 1, 31, 10, "BECPY", "T"],
  ["tufts", "Tufts University", "Tufts", "Medford", "US", "tufts.edu", 1, 2, 12, 18, "BECNPY", "C"],
  ["bc", "Boston College", "Boston College", "Chestnut Hill", "US", "bc.edu", 1, 2, 15, 12, "BECPY", "C"],
  ["uw-madison", "University of Wisconsin–Madison", "UW–Madison", "Madison", "US", "wisc.edu", 0, 2, 48, 14, "BECNPY", "T"],
  ["uiuc", "University of Illinois Urbana-Champaign", "UIUC", "Urbana", "US", "illinois.edu", 0, 2, 56, 24, "BCNE", "T"],
  ["purdue", "Purdue University", "Purdue", "West Lafayette", "US", "purdue.edu", 0, 2, 50, 20, "BCNE", "C"],
  ["uf", "University of Florida", "UF", "Gainesville", "US", "ufl.edu", 0, 2, 55, 10, "BECNPY", "T"],
  ["umd", "University of Maryland", "UMD", "College Park", "US", "umd.edu", 0, 2, 41, 14, "BECNPY", "C"],
  ["osu", "Ohio State University", "Ohio State", "Columbus", "US", "osu.edu", 0, 2, 61, 12, "BECNPY", "B"],
  ["psu", "Penn State University", "Penn State", "University Park", "US", "psu.edu", 0, 2, 46, 15, "BECNPY", "T"],
  ["indiana", "Indiana University Bloomington", "IU Bloomington", "Bloomington", "US", "indiana.edu", 0, 3, 47, 12, "BEPY", "T"],
  ["utdallas", "UT Dallas", "UT Dallas", "Richardson", "US", "utdallas.edu", 0, 3, 31, 18, "BCNE", "C"],

  // United Kingdom Additions
  ["liverpool", "University of Liverpool", "Liverpool", "Liverpool", "GB", "liverpool.ac.uk", 0, 3, 29, 32, "BECLNY", "B"],
  ["aberdeen", "University of Aberdeen", "Aberdeen", "Aberdeen", "GB", "abdn.ac.uk", 0, 3, 15, 35, "BECLNY", "T"],
  ["qub", "Queen's University Belfast", "Queen's Belfast", "Belfast", "GB", "qub.ac.uk", 0, 3, 25, 28, "BECLNY", "B"],
  ["sussex", "University of Sussex", "Sussex", "Brighton", "GB", "sussex.ac.uk", 0, 3, 18, 38, "BECLPY", "C"],
  ["surrey", "University of Surrey", "Surrey", "Guildford", "GB", "surrey.ac.uk", 0, 3, 16, 35, "BECNY", "C"],
  ["strathclyde", "University of Strathclyde", "Strathclyde", "Glasgow", "GB", "strath.ac.uk", 0, 3, 24, 25, "BECLN", "B"],
  ["loughborough", "Loughborough University", "Loughborough", "Loughborough", "GB", "lboro.ac.uk", 0, 2, 19, 22, "BCNE", "C"],
  ["leicester", "University of Leicester", "Leicester", "Leicester", "GB", "le.ac.uk", 0, 3, 20, 28, "BECLNY", "B"],
  ["uea", "University of East Anglia", "UEA", "Norwich", "GB", "uea.ac.uk", 0, 3, 17, 26, "BECLPY", "C"],
  ["reading", "University of Reading", "Reading", "Reading", "GB", "reading.ac.uk", 0, 3, 20, 32, "BEY", "C"],
  ["essex", "University of Essex", "Essex", "Colchester", "GB", "essex.ac.uk", 0, 3, 17, 40, "BELPY", "C"],
  ["city-london", "City, University of London", "City", "London", "GB", "city.ac.uk", 0, 3, 20, 48, "BEL", "B"],
  ["rhul", "Royal Holloway, University of London", "Royal Holloway", "Egham", "GB", "royalholloway.ac.uk", 0, 3, 12, 33, "BECLPY", "C"],
  ["soas", "SOAS University of London", "SOAS", "London", "GB", "soas.ac.uk", 0, 3, 6, 52, "ELP", "B"],
  ["dundee", "University of Dundee", "Dundee", "Dundee", "GB", "dundee.ac.uk", 0, 3, 16, 25, "BCLNY", "B"],

  // Germany Additions
  ["freiburg", "University of Freiburg", "Freiburg", "Freiburg", "DE", "uni-freiburg.de", 0, 2, 24, 18, "ECLPY", "T"],
  ["tuebingen", "University of Tübingen", "Tübingen", "Tübingen", "DE", "uni-tuebingen.de", 0, 2, 27, 15, "ECLPY", "T"],
  ["bonn", "University of Bonn", "Bonn", "Bonn", "DE", "uni-bonn.de", 0, 2, 38, 14, "ECLPY", "B"],
  ["goettingen", "University of Göttingen", "Göttingen", "Göttingen", "DE", "uni-goettingen.de", 0, 2, 30, 15, "ECLPY", "T"],
  ["hamburg", "University of Hamburg", "Hamburg", "Hamburg", "DE", "uni-hamburg.de", 0, 2, 44, 13, "BECLPY", "B"],
  ["darmstadt", "TU Darmstadt", "TU Darmstadt", "Darmstadt", "DE", "tu-darmstadt.de", 0, 2, 25, 20, "BCN", "T"],
  ["stuttgart", "University of Stuttgart", "Stuttgart", "Stuttgart", "DE", "uni-stuttgart.de", 0, 3, 23, 22, "BCN", "B"],
  ["whu", "WHU – Otto Beisheim School of Management", "WHU", "Vallendar", "DE", "whu.edu", 1, 2, 2, 35, "BE", "T"],
  ["muenster", "University of Münster", "Münster", "Münster", "DE", "uni-muenster.de", 0, 3, 45, 10, "BELPY", "T"],
  ["fau", "FAU Erlangen-Nürnberg", "FAU", "Erlangen", "DE", "fau.de", 0, 3, 39, 14, "BCNE", "T"],

  // Netherlands Additions
  ["hanze", "Hanze University of Applied Sciences", "Hanze", "Groningen", "NL", "hanze.nl", 0, 4, 30, 25, "BCNE", "C"],
  ["fontys", "Fontys University of Applied Sciences", "Fontys", "Eindhoven", "NL", "fontys.edu", 0, 4, 44, 18, "BCNE", "C"],
  ["hva", "Amsterdam University of Applied Sciences", "AUAS", "Amsterdam", "NL", "amsterdamuas.com", 0, 4, 46, 15, "BCE", "B"],
  ["thuas", "The Hague University of Applied Sciences", "THUAS", "The Hague", "NL", "thehagueuniversity.com", 0, 4, 26, 28, "BELP", "B"],
  ["buas", "Breda University of Applied Sciences", "BUas", "Breda", "NL", "buas.nl", 0, 4, 7, 24, "BC", "C"],
  ["nyenrode", "Nyenrode Business University", "Nyenrode", "Breukelen", "NL", "nyenrode.nl", 1, 3, 3, 22, "BE", "C"],

  // France Additions
  ["edhec", "EDHEC Business School", "EDHEC", "Lille", "FR", "edhec.edu", 1, 2, 9, 38, "BE", "B"],
  ["emlyon", "emlyon business school", "emlyon", "Lyon", "FR", "em-lyon.com", 1, 2, 9, 35, "B", "B"],
  ["skema", "SKEMA Business School", "SKEMA", "Paris", "FR", "skema.edu", 1, 3, 10, 45, "BE", "B"],
  ["audencia", "Audencia Business School", "Audencia", "Nantes", "FR", "audencia.com", 1, 3, 6, 32, "B", "B"],
  ["gem-fr", "Grenoble Ecole de Management", "GEM", "Grenoble", "FR", "grenoble-em.com", 1, 3, 7, 30, "B", "B"],
  ["psl", "Paris Sciences et Lettres", "PSL", "Paris", "FR", "psl.eu", 0, 1, 17, 24, "ECNE", "B"],
  ["pariscite", "University of Paris Cité", "Paris Cité", "Paris", "FR", "u-paris.fr", 0, 2, 63, 18, "ECPY", "B"],
  ["enslyon", "ENS de Lyon", "ENS Lyon", "Lyon", "FR", "ens-lyon.fr", 0, 2, 2, 20, "ECN", "B"],
  ["centralesupelec", "CentraleSupélec", "CentraleSupélec", "Paris", "FR", "centralesupelec.fr", 0, 1, 5, 30, "CN", "C"],

  // Italy Additions
  ["polito", "Politecnico di Torino", "PoliTo", "Turin", "IT", "polito.it", 0, 2, 36, 18, "CN", "B"],
  ["unimi", "University of Milan", "La Statale", "Milan", "IT", "unimi.it", 0, 3, 64, 10, "BELPY", "B"],
  ["unifi", "University of Florence", "UniFI", "Florence", "IT", "unifi.it", 0, 3, 50, 8, "BELPY", "B"],
  ["pisa", "University of Pisa", "UniPisa", "Pisa", "IT", "unipi.it", 0, 3, 50, 8, "CNEL", "T"],
  ["cattolica", "Università Cattolica del Sacro Cuore", "Cattolica", "Milan", "IT", "unicatt.it", 1, 3, 41, 12, "BELPY", "B"],
  ["cafoscari", "Ca' Foscari University of Venice", "Ca' Foscari", "Venice", "IT", "unive.it", 0, 3, 23, 14, "BELP", "B"],
  ["unina", "University of Naples Federico II", "Federico II", "Naples", "IT", "unina.it", 0, 3, 75, 5, "BECN", "B"],

  // Spain Additions
  ["unav", "University of Navarra", "Navarra", "Pamplona", "ES", "unav.edu", 1, 2, 13, 30, "BELPY", "C"],
  ["upc", "Universitat Politècnica de Catalunya", "UPC", "Barcelona", "ES", "upc.edu", 0, 2, 30, 16, "CN", "B"],
  ["upm", "Technical University of Madrid", "UPM", "Madrid", "ES", "upm.es", 0, 3, 38, 12, "CN", "B"],
  ["uv", "University of Valencia", "UV", "Valencia", "ES", "uv.es", 0, 3, 50, 10, "BELPY", "B"],
  ["uam", "Autonomous University of Madrid", "UAM", "Madrid", "ES", "uam.es", 0, 2, 31, 14, "BECLP", "C"],

  // Switzerland Additions
  ["unibe", "University of Bern", "UniBern", "Bern", "CH", "unibe.ch", 0, 2, 19, 16, "ECLPY", "B"],
  ["unil", "University of Lausanne", "UNIL", "Lausanne", "CH", "unil.ch", 0, 2, 17, 28, "BELPY", "C"],
  ["usi", "Università della Svizzera italiana", "USI", "Lugano", "CH", "usi.ch", 0, 3, 3, 60, "BC", "T"],

  // Nordics Additions (NO, DK, SE, FI)
  ["uio", "University of Oslo", "UiO", "Oslo", "NO", "uio.no", 0, 2, 27, 15, "ECLPY", "B"],
  ["ntnu", "Norwegian University of Science and Technology", "NTNU", "Trondheim", "NO", "ntnu.edu", 0, 2, 42, 12, "CN", "B"],
  ["bi-no", "BI Norwegian Business School", "BI", "Oslo", "NO", "bi.edu", 1, 3, 20, 22, "BE", "B"],
  ["nhh", "NHH Norwegian School of Economics", "NHH", "Bergen", "NO", "nhh.no", 0, 2, 4, 18, "BE", "C"],
  ["uib", "University of Bergen", "UiB", "Bergen", "NO", "uib.no", 0, 3, 19, 12, "ECLPY", "B"],
  ["dtu", "Technical University of Denmark", "DTU", "Kongens Lyngby", "DK", "dtu.dk", 0, 2, 13, 24, "CN", "C"],
  ["aalborg", "Aalborg University", "AAU", "Aalborg", "DK", "aau.dk", 0, 3, 20, 16, "BCN", "B"],
  ["liu", "Linköping University", "LiU", "Linköping", "SE", "liu.se", 0, 3, 32, 12, "BCNE", "C"],
  ["gu-se", "University of Gothenburg", "Gothenburg", "Gothenburg", "SE", "gu.se", 0, 3, 38, 14, "BECLPY", "B"],
  ["tuni", "Tampere University", "Tampere", "Tampere", "FI", "tuni.fi", 0, 3, 21, 12, "BCNE", "B"],
  ["utu", "University of Turku", "Turku", "Turku", "FI", "utu.fi", 0, 3, 20, 10, "BECLPY", "T"],
  ["lut", "LUT University", "LUT", "Lappeenranta", "FI", "lut.fi", 0, 4, 6, 20, "BCNE", "T"],
  ["hanken", "Hanken School of Economics", "Hanken", "Helsinki", "FI", "hanken.fi", 0, 3, 3, 20, "BE", "B"],

  // Baltics Additions (LV, LT)
  ["sseriga", "Stockholm School of Economics in Riga", "SSE Riga", "Riga", "LV", "sseriga.edu", 1, 3, 1, 40, "BE", "B"],
  ["rsu", "Riga Stradiņš University", "RSU", "Riga", "LV", "rsu.lv", 0, 4, 10, 28, "LPY", "B"],
  ["vgtu", "Vilnius Gediminas Technical University", "VILNIUS TECH", "Vilnius", "LT", "vilniustech.lt", 0, 4, 11, 14, "BCN", "B"],
  ["ktu", "Kaunas University of Technology", "KTU", "Kaunas", "LT", "ktu.edu", 0, 4, 10, 12, "BCNE", "B"],
  ["ism-lt", "ISM University of Management and Economics", "ISM", "Vilnius", "LT", "ism.lt", 1, 4, 2, 30, "BE", "B"],
  ["vdu", "Vytautas Magnus University", "VMU", "Kaunas", "LT", "vdu.lt", 0, 4, 9, 15, "BELPY", "B"],

  // Ireland & Belgium & Austria & Portugal Additions
  ["dcu", "Dublin City University", "DCU", "Dublin", "IE", "dcu.ie", 0, 3, 18, 22, "BECLN", "B"],
  ["ul-ie", "University of Limerick", "UL", "Limerick", "IE", "ul.ie", 0, 3, 17, 18, "BECLNY", "C"],
  ["maynooth", "Maynooth University", "Maynooth", "Maynooth", "IE", "maynoothuniversity.ie", 0, 4, 15, 14, "BELPY", "T"],
  ["uclouvain", "UCLouvain", "UCLouvain", "Louvain-la-Neuve", "BE", "uclouvain.be", 0, 2, 33, 20, "BECLNY", "T"],
  ["ulb", "Université libre de Bruxelles", "ULB", "Brussels", "BE", "ulb.be", 0, 3, 35, 33, "BECLP", "B"],
  ["vub", "Vrije Universiteit Brussel", "VUB", "Brussels", "BE", "vub.be", 0, 3, 19, 24, "BECLNY", "B"],
  ["uantwerp", "University of Antwerp", "UAntwerp", "Antwerp", "BE", "uantwerpen.be", 0, 3, 21, 18, "BECLNY", "B"],
  ["tuwien", "TU Wien", "TU Wien", "Vienna", "AT", "tuwien.at", 0, 2, 28, 30, "CN", "B"],
  ["innsbruck", "University of Innsbruck", "Uni Innsbruck", "Innsbruck", "AT", "uibk.ac.at", 0, 3, 28, 42, "BELPY", "T"],
  ["jku", "Johannes Kepler University Linz", "JKU", "Linz", "AT", "jku.at", 0, 3, 23, 18, "BECLN", "C"],
  ["ulisboa", "University of Lisbon", "ULisboa", "Lisbon", "PT", "ulisboa.pt", 0, 3, 49, 14, "BECLNY", "B"],
  ["catolica-lisbon", "Católica Lisbon SBE", "Católica Lisbon", "Lisbon", "PT", "clsbe.lisboa.ucp.pt", 1, 3, 4, 45, "BE", "B"],
  ["coimbra", "University of Coimbra", "Coimbra", "Coimbra", "PT", "uc.pt", 0, 3, 25, 20, "BELPY", "T"],

  // Central & Eastern Europe Additions (PL, CZ, HU, HR, SI)
  ["uj", "Jagiellonian University", "Jagiellonian", "Kraków", "PL", "uj.edu.pl", 0, 3, 38, 12, "BELPY", "B"],
  ["sgh", "SGH Warsaw School of Economics", "SGH", "Warsaw", "PL", "sgh.waw.pl", 0, 3, 14, 15, "BE", "B"],
  ["agh", "AGH University of Krakow", "AGH", "Kraków", "PL", "agh.edu.pl", 0, 3, 23, 10, "CN", "B"],
  ["pw", "Warsaw University of Technology", "WUT", "Warsaw", "PL", "pw.edu.pl", 0, 3, 31, 12, "CN", "B"],
  ["cvut", "Czech Technical University in Prague", "ČVUT", "Prague", "CZ", "cvut.cz", 0, 3, 18, 20, "CN", "B"],
  ["muni", "Masaryk University", "Muni", "Brno", "CZ", "muni.cz", 0, 3, 35, 22, "BECLPY", "B"],
  ["vse", "Prague University of Economics and Business", "VŠE", "Prague", "CZ", "vse.cz", 0, 3, 14, 25, "BE", "B"],
  ["corvinus", "Corvinus University of Budapest", "Corvinus", "Budapest", "HU", "uni-corvinus.hu", 0, 3, 11, 20, "BEP", "B"],
  ["elte", "Eötvös Loránd University", "ELTE", "Budapest", "HU", "elte.hu", 0, 3, 32, 14, "ECLPY", "B"],
  ["bme", "Budapest University of Technology and Economics", "BME", "Budapest", "HU", "bme.hu", 0, 3, 20, 14, "CN", "B"],
  ["unizg", "University of Zagreb", "UniZg", "Zagreb", "HR", "unizg.hr", 0, 4, 65, 8, "BECLNY", "B"],
  ["unilj", "University of Ljubljana", "UniLj", "Ljubljana", "SI", "uni-lj.si", 0, 4, 38, 10, "BECLNY", "B"],

  // Canada Additions
  ["queens-ca", "Queen's University", "Queen's", "Kingston", "CA", "queensu.ca", 0, 2, 28, 15, "BECNPY", "T"],
  ["western", "Western University", "Western", "London", "CA", "uwo.ca", 0, 2, 38, 16, "BECNPY", "C"],
  ["udem", "Université de Montréal", "UdeM", "Montreal", "CA", "umontreal.ca", 0, 2, 67, 24, "BECLNY", "B"],
  ["sfu", "Simon Fraser University", "SFU", "Burnaby", "CA", "sfu.ca", 0, 3, 30, 24, "BECNPY", "C"],
  ["calgary", "University of Calgary", "UCalgary", "Calgary", "CA", "ucalgary.ca", 0, 3, 34, 18, "BECNPY", "B"],
  ["uottawa", "University of Ottawa", "uOttawa", "Ottawa", "CA", "uottawa.ca", 0, 2, 43, 22, "BECLPY", "B"],

  // Australia & New Zealand Additions
  ["anu", "Australian National University", "ANU", "Canberra", "AU", "anu.edu.au", 0, 1, 23, 44, "BECLPY", "C"],
  ["unsw", "UNSW Sydney", "UNSW", "Sydney", "AU", "unsw.edu.au", 0, 1, 63, 42, "BECNPY", "B"],
  ["uq", "University of Queensland", "UQ", "Brisbane", "AU", "uq.edu.au", 0, 2, 55, 38, "BECLNY", "C"],
  ["monash", "Monash University", "Monash", "Melbourne", "AU", "monash.edu", 0, 2, 78, 42, "BECLNY", "C"],
  ["uwa", "University of Western Australia", "UWA", "Perth", "AU", "uwa.edu.au", 0, 2, 25, 28, "BECNPY", "C"],
  ["adelaide", "University of Adelaide", "Adelaide", "Adelaide", "AU", "adelaide.edu.au", 0, 3, 27, 30, "BECLNY", "B"],
  ["auckland", "University of Auckland", "UoA", "Auckland", "NZ", "auckland.ac.nz", 0, 2, 44, 30, "BECLNY", "B"],
  ["otago", "University of Otago", "Otago", "Dunedin", "NZ", "otago.ac.nz", 0, 3, 21, 15, "ECLPY", "T"],

  // Asia Additions (SG, HK, JP, KR, CN)
  ["smu", "Singapore Management University", "SMU", "Singapore", "SG", "smu.edu.sg", 0, 2, 10, 18, "BELP", "B"],
  ["cuhk", "Chinese University of Hong Kong", "CUHK", "Hong Kong", "HK", "cuhk.edu.hk", 0, 1, 22, 34, "BECLPY", "C"],
  ["cityu-hk", "City University of Hong Kong", "CityU", "Hong Kong", "HK", "cityu.edu.hk", 0, 2, 20, 35, "BECLNY", "B"],
  ["utokyo", "University of Tokyo", "UTokyo", "Tokyo", "JP", "u-tokyo.ac.jp", 0, 1, 28, 14, "ECNPY", "B"],
  ["kyoto", "Kyoto University", "Kyoto U", "Kyoto", "JP", "kyoto-u.ac.jp", 0, 1, 23, 12, "ECNPY", "B"],
  ["waseda", "Waseda University", "Waseda", "Tokyo", "JP", "waseda.jp", 1, 2, 49, 18, "BELPY", "B"],
  ["tokyotech", "Institute of Science Tokyo", "Science Tokyo", "Tokyo", "JP", "isct.ac.jp", 0, 1, 10, 20, "CN", "B"],
  ["snu", "Seoul National University", "SNU", "Seoul", "KR", "snu.ac.kr", 0, 1, 28, 10, "BECNPY", "C"],
  ["kaist", "KAIST", "KAIST", "Daejeon", "KR", "kaist.ac.kr", 0, 1, 11, 12, "CN", "C"],
  ["yonsei", "Yonsei University", "Yonsei", "Seoul", "KR", "yonsei.ac.kr", 1, 2, 38, 16, "BECNPY", "C"],
  ["korea-u", "Korea University", "Korea U", "Seoul", "KR", "korea.ac.kr", 1, 2, 36, 15, "BECLNY", "C"],
  ["tsinghua", "Tsinghua University", "Tsinghua", "Beijing", "CN", "tsinghua.edu.cn", 0, 1, 38, 15, "BCNE", "C"],
  ["peking", "Peking University", "PKU", "Beijing", "CN", "pku.edu.cn", 0, 1, 45, 14, "BECLPY", "C"],
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

// In-memory dynamic university cache (supports looking up any university worldwide on demand)
export const dynamicUniversityCache = new Map<string, University>();

// Hydrate from localStorage on browser load
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("univero-dynamic-unis");
    if (raw) {
      const parsed: University[] = JSON.parse(raw);
      for (const u of parsed) {
        dynamicUniversityCache.set(u.id, u);
      }
    }
  } catch {}
}

export function saveDynamicUniversity(uni: University) {
  dynamicUniversityCache.set(uni.id, uni);
  if (typeof window !== "undefined") {
    try {
      const list = Array.from(dynamicUniversityCache.values()).slice(-100);
      localStorage.setItem("univero-dynamic-unis", JSON.stringify(list));
    } catch {}
  }
}

export function getUniversityById(id: string): University | undefined {
  return universities.find(u => u.id === id) || dynamicUniversityCache.get(id);
}

// In-memory cache of global HipoLabs dataset (9,500+ world universities)
let globalDatasetCache: Array<{
  name: string;
  country: string;
  alpha_two_code: string;
  domains?: string[];
  web_pages?: string[];
  "state-province"?: string | null;
}> | null = null;

let isFetchingDataset = false;

export async function loadGlobalUniversitiesDataset(): Promise<typeof globalDatasetCache> {
  if (globalDatasetCache) return globalDatasetCache;
  if (isFetchingDataset) {
    await new Promise(r => setTimeout(r, 300));
    if (globalDatasetCache) return globalDatasetCache;
  }
  isFetchingDataset = true;
  try {
    const res = await fetch("https://cdn.jsdelivr.net/gh/Hipo/university-domains-list@master/world_universities_and_domains.json");
    if (res.ok) {
      globalDatasetCache = await res.json();
      return globalDatasetCache;
    }
  } catch (err) {
    console.warn("Failed to load global universities dataset:", err);
  } finally {
    isFetchingDataset = false;
  }
  return null;
}

export function createDynamicUniversity(item: {
  name: string;
  country: string;
  alpha_two_code: string;
  domains?: string[];
  web_pages?: string[];
  "state-province"?: string | null;
}): University {
  const cc = item.alpha_two_code?.toUpperCase() || "US";
  const domain = item.domains?.[0] || item.web_pages?.[0]?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "") || "edu";
  const rawId = `ext-${cc.toLowerCase()}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30)}`;
  const id = rawId.length > 4 ? rawId : `ext-${domain.replace(/[^a-z0-9]+/g, "-")}`;

  const cached = getUniversityById(id);
  if (cached) return cached;

  const countryName = COUNTRY[cc] || item.country || "International";
  const isPriv = Boolean(
    item.name.toLowerCase().includes("college") ||
    item.name.toLowerCase().includes("business") ||
    item.name.toLowerCase().includes("private")
  );

  const row: Row = [
    id,
    item.name,
    item.name.length > 25 ? item.name.split(" ").slice(0, 3).join(" ") : item.name,
    item["state-province"] || countryName,
    cc in RULES ? cc : "US",
    domain,
    isPriv ? 1 : 0,
    3, // Selective tier
    18, // 18k students
    15, // 15% intl
    "BECN",
    "C"
  ];

  const built = build(row);
  saveDynamicUniversity(built);
  return built;
}

export async function searchGlobalUniversities(query: string): Promise<University[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // 1. Search local curated universities first
  const local = universities.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.short.toLowerCase().includes(q) ||
    u.city.toLowerCase().includes(q) ||
    u.country.toLowerCase().includes(q) ||
    u.domain.toLowerCase().includes(q)
  );

  if (local.length >= 8) {
    return local;
  }

  // 2. Query global index on demand
  const globalData = await loadGlobalUniversitiesDataset();
  if (!globalData) return local;

  const matches = globalData.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.country.toLowerCase().includes(q) ||
    item.domains?.some(d => d.toLowerCase().includes(q))
  );

  const dynamicResults = matches.slice(0, 25).map(createDynamicUniversity);

  const seenNames = new Set(local.map(u => u.name.toLowerCase()));
  const combined = [...local];
  for (const item of dynamicResults) {
    if (!seenNames.has(item.name.toLowerCase())) {
      seenNames.add(item.name.toLowerCase());
      combined.push(item);
    }
  }

  return combined;
}
