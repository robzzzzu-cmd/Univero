import type { Doc, Profile, University } from "./univero";

export type GeminiEvaluation = {
  overallVerdict: "Strong Candidate" | "Competitive / Target" | "Reach School" | "High Reach" | "Prerequisites Missing";
  estimatedAcceptanceProbability: number; // e.g. 35 (%)
  summary: string;
  keyStrengths: string[];
  areasOfConcern: string[];
  actionPlan: string[];
  scholarshipOutlook: string;
  recommendedProgramFocus: string;
};

// Returns stored or environment GEMINI_API_KEY
export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const userStored = localStorage.getItem("univero-gemini-key");
    if (userStored && userStored.trim()) return userStored.trim();
    // @ts-expect-error Vite env
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) {
      // @ts-expect-error Vite env
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
  }
  return "";
}

export function saveGeminiApiKey(key: string) {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("univero-gemini-key", key.trim());
    } else {
      localStorage.removeItem("univero-gemini-key");
    }
  }
}

/**
 * Call Gemini with cheap, low-end model options (gemini-1.5-flash-8b / gemini-2.0-flash-lite)
 * Uses conservative parameters: low temperature (0.1) and token limits to keep costs near zero.
 */
async function callGeminiApi(
  prompt: string,
  systemInstruction?: string,
  options?: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add GEMINI_API_KEY or VITE_GEMINI_API_KEY to your Vercel Environment Variables.");
  }

  // Model chain: start with ultra-cheap 1.5-flash-8b, fallback to flash-lite / 1.5-flash
  const requestedModel = options?.model || "gemini-1.5-flash-8b";
  const modelCandidates = [
    requestedModel,
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
  ].filter((v, i, a) => a.indexOf(v) === i); // unique

  const body: {
    contents: Array<{ parts: Array<{ text: string }> }>;
    systemInstruction?: { parts: Array<{ text: string }> };
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
    };
  } = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.1, // Conservative, deterministic
      maxOutputTokens: options?.maxOutputTokens ?? 400, // Capped to stay ultra-cheap
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  let lastError: Error | null = null;

  for (const model of modelCandidates) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        lastError = new Error(`Model ${model} error (${response.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Failed to get response from Gemini API");
}

/**
 * Intelligent Conservative University Admissions Decision Engine
 * Strictly conservative: does not inflate chances, flags all missing prerequisites and rigorous competition.
 */
export async function evaluateWithGemini(
  university: University,
  profile: Profile,
  docs: Doc[],
  specificProgram?: string
): Promise<GeminiEvaluation> {
  const targetProgram = specificProgram
    ? university.programs.find(p => p.name === specificProgram || p.id === specificProgram) || university.programs[0]
    : university.programs[0];

  const studentSummary = {
    name: profile.name || "Student",
    nationality: profile.nationality || "International",
    school: profile.school,
    curriculum: profile.curriculum,
    gpa: profile.gpa,
    gradeScale: profile.gradeScale,
    standardizedTests: [
      profile.sat ? `SAT: ${profile.sat}` : null,
      profile.act ? `ACT: ${profile.act}` : null,
      profile.ielts ? `IELTS: ${profile.ielts}` : null,
      profile.toefl ? `TOEFL: ${profile.toefl}` : null,
      ...profile.tests.map(t => `${t.name}: ${t.score || "Planned"} (${t.status})`),
    ].filter(Boolean),
    schoolYears: profile.years.map(y => ({
      year: y.label,
      type: y.kind,
      subjects: y.subjects.map(s => `${s.name}: ${s.grade}`).join(", "),
    })),
    extracurriculars: profile.activities.map(a => `${a.role} at ${a.org || a.title} (${a.hours} hrs/wk)`),
    workExperience: profile.work.map(w => `${w.role} at ${w.org}`),
    awards: profile.awards.map(aw => `${aw.title} - ${aw.org}`),
    skills: profile.skills,
    languages: profile.languages.map(l => `${l.name} (${l.level})`),
    careerGoal: profile.careerGoal,
    budgetPerYearEur: profile.budget,
    needsScholarship: profile.scholarship,
    uploadedDocuments: docs.map(d => `${d.type}: ${d.fileName} (${d.status})`),
  };

  const uniSummary = {
    university: university.name,
    country: university.country,
    city: university.city,
    type: university.type,
    selectivityTier: university.tier,
    tuitionEur: targetProgram ? targetProgram.tuition : university.tuition,
    tuitionEUEur: targetProgram ? targetProgram.tuitionEU : university.tuitionEU,
    programName: targetProgram ? targetProgram.name : university.program,
    indicativeGpa: targetProgram ? targetProgram.minGpa : university.minGpa,
    satRequired: university.satRequired,
    indicativeSat: targetProgram?.sat || university.sat,
    requiredIelts: targetProgram?.ielts || university.ielts,
    requiredSubjects: targetProgram?.requiredSubjects || [],
    livingCostEur: university.living,
  };

  const systemInstruction = `You are an exceptionally conservative, rigorous, and prudent university admissions evaluator and academic auditor.
CRITICAL INSTRUCTIONS:
1. Be as conservative as possible: DO NOT offer false optimism or inflate admission odds. Top and selective universities reject the vast majority of applicants.
2. If the student lacks any required subject (like Mathematics for Business/CS/Economics) or fails test score minimums, verdict MUST be "Prerequisites Missing" or "High Reach".
3. Estimated acceptance probability must be realistic and sober (never over 85% for any university; for Tier 1 institutions like Oxford/MIT/Harvard, cap strictly under 25%).
4. Flag every concern, missing verification, and competition risk.
5. Return strictly valid JSON conforming to the schema. No markdown formatting, just JSON.`;

  const prompt = `Perform a conservative admissions evaluation for student into ${university.name}:

STUDENT PROFILE:
${JSON.stringify(studentSummary, null, 2)}

UNIVERSITY ADMISSIONS CRITERIA:
${JSON.stringify(uniSummary, null, 2)}

Return ONLY valid JSON matching:
{
  "overallVerdict": "Strong Candidate" | "Competitive / Target" | "Reach School" | "High Reach" | "Prerequisites Missing",
  "estimatedAcceptanceProbability": number,
  "summary": "2-3 sober, realistic sentences outlining actual probability without sugarcoating",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "areasOfConcern": ["Risk or missing requirement 1", "Risk 2"],
  "actionPlan": ["Pragmatic next step 1", "Pragmatic next step 2"],
  "scholarshipOutlook": "Conservative appraisal of financial aid feasibility",
  "recommendedProgramFocus": "Prudent major focus or program specialization"
}`;

  try {
    const rawText = await callGeminiApi(prompt, systemInstruction, {
      model: "gemini-1.5-flash-8b", // Cheap model
      temperature: 0.1, // Conservative
      maxOutputTokens: 600,
    });
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as GeminiEvaluation;
  } catch (err) {
    console.error("Gemini conservative evaluation error:", err);
    throw err;
  }
}

/**
 * Interactive Ultra-Low-Cost Conservative Gemini Counselor Chat
 * Uses gemini-1.5-flash-8b, max 300 tokens, temperature 0.1 to run as cheaply and conservatively as possible.
 */
export async function askGeminiCounselor(
  question: string,
  university?: University | null,
  profile?: Profile | null,
  conversationHistory: Array<{ role: "user" | "model"; text: string }> = []
): Promise<string> {
  const uniContext = university
    ? `Target University: ${university.name} (${university.city}, ${university.country}), Tuition: €${university.tuition}/yr, Min GPA: ${university.minGpa}, IELTS: ${university.ielts}.`
    : `Target: Global University Database & General Higher Education Admissions.`;

  const studentContext = profile
    ? `Student: ${profile.name || "Student"} (GPA: ${profile.gpa || "N/A"}, Curriculum: ${profile.curriculum || "N/A"}, Nationality: ${profile.nationality || "N/A"}, Budget: €${profile.budget || "N/A"}/yr).`
    : `Student: General prospective applicant.`;

  const systemInstruction = `You are Univero's ultra-efficient, conservative AI College Counselor running on Gemini 1.5 Flash-8B.
Rules:
- Be highly conservative, realistic, and prudent: NEVER promise admission or provide ungrounded reassurance. Top and selective universities reject the vast majority of applicants.
- Focus strictly on hard criteria (GPA, required subjects, English test minimums, tuition budget, deadlines).
- Keep answers concise, actionable, and under 130 words to minimize token usage.
- ${studentContext}
- ${uniContext}`;

  // Only take the last 2 conversation turns to save input tokens
  const recentHistory = conversationHistory.slice(-2);
  const historyContext = recentHistory
    .map(h => `${h.role === "user" ? "Student" : "Counselor"}: ${h.text}`)
    .join("\n\n");

  const prompt = `${historyContext ? `Context:\n${historyContext}\n\n` : ""}Question: ${question}`;

  return await callGeminiApi(prompt, systemInstruction, {
    model: "gemini-1.5-flash-8b", // Google's lowest-cost model (~$0.0375 / 1M tokens)
    temperature: 0.1, // Prudent, deterministic
    maxOutputTokens: 300, // Very cheap, fast
  });
}
