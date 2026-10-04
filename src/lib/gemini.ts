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
  let raw = "";

  // 1. Check local storage override first
  if (typeof window !== "undefined") {
    try {
      const userStored = localStorage.getItem("univero-gemini-key");
      if (userStored && userStored.trim()) raw = userStored.trim();
    } catch {}
  }

  // 2. Check process.env (injected by Vite define at build time)
  if (!raw) {
    try {
      // @ts-expect-error injected by Vite define
      if (typeof process !== "undefined" && process?.env?.GEMINI_API_KEY) {
        // @ts-expect-error injected by Vite define
        raw = process.env.GEMINI_API_KEY;
      }
      // @ts-expect-error injected by Vite define
      if (!raw && typeof process !== "undefined" && process?.env?.VITE_GEMINI_API_KEY) {
        // @ts-expect-error injected by Vite define
        raw = process.env.VITE_GEMINI_API_KEY;
      }
    } catch {}
  }

  // 3. Check import.meta.env
  if (!raw) {
    try {
      // @ts-expect-error Vite env
      if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_GEMINI_API_KEY) {
        // @ts-expect-error Vite env
        raw = import.meta.env.VITE_GEMINI_API_KEY;
      }
      // @ts-expect-error Vite env
      if (!raw && typeof import.meta !== "undefined" && import.meta?.env?.GEMINI_API_KEY) {
        // @ts-expect-error Vite env
        raw = import.meta.env.GEMINI_API_KEY;
      }
    } catch {}
  }

  return raw ? raw.trim().replace(/^["']|["']$/g, "") : "";
}

export function saveGeminiApiKey(key: string) {
  if (typeof window !== "undefined") {
    const cleaned = key.trim().replace(/^["']|["']$/g, "");
    if (cleaned) {
      localStorage.setItem("univero-gemini-key", cleaned);
    } else {
      localStorage.removeItem("univero-gemini-key");
    }
  }
}

let cachedWorkingModel: string | null = null;

/**
 * Dynamically queries Google ModelService.ListModels across v1beta and v1
 * to detect active models that support generateContent on the user's API key,
 * prioritizing the cheapest, high-throughput Flash-Lite / Flash models.
 */
export async function getAvailableModel(apiKey: string): Promise<string> {
  if (cachedWorkingModel) return cachedWorkingModel;

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  if (!cleanKey) return "gemini-3.1-flash-lite";

  // Try v1beta and v1 ListModels endpoints
  for (const version of ["v1beta", "v1"]) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url, {
        headers: {
          "x-goog-api-key": cleanKey,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const modelsList: Array<{ name: string; supportedGenerationMethods?: string[] }> = data.models || [];
        const supported = modelsList
          .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
          .map(m => m.name.replace(/^models\//, ""));

        if (supported.length > 0) {
          // Prioritize cheapest, lowest-cost modern Flash/Lite models
          const preferredCandidates = [
            "gemini-3.1-flash-lite", // Cheapest ultra-low-cost high-throughput model
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.8-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash",
          ];

          for (const cand of preferredCandidates) {
            if (supported.includes(cand)) {
              cachedWorkingModel = cand;
              return cand;
            }
          }

          const fallback =
            supported.find(m => m.includes("flash-lite")) ||
            supported.find(m => m.includes("flash") && !m.includes("image") && !m.includes("tts")) ||
            supported.find(m => m.includes("flash")) ||
            supported[0];

          if (fallback) {
            cachedWorkingModel = fallback;
            return fallback;
          }
        }
      }
    } catch (err) {
      console.warn(`Could not list Gemini models dynamically via ${version}:`, err);
    }
  }

  // Default to Google's cheapest modern Flash-Lite model
  return "gemini-3.1-flash-lite";
}

/**
 * Quick diagnostic ping to verify whether an API key connects and functions.
 */
export async function testGeminiConnection(keyToTest?: string): Promise<{ ok: boolean; model: string; error?: string }> {
  const apiKey = (keyToTest || getGeminiApiKey()).trim().replace(/^["']|["']$/g, "");
  if (!apiKey) return { ok: false, model: "", error: "No API key configured." };

  try {
    const text = await callGeminiApi("Respond with one word: ready", undefined, {
      maxOutputTokens: 10,
      temperature: 0.1,
    });
    return {
      ok: Boolean(text && text.trim()),
      model: cachedWorkingModel || "gemini-3.1-flash-lite",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, model: "", error: msg };
  }
}

/**
 * Call Gemini with ultra-low-cost, conservative settings.
 * Uses dynamic discovery and full fallback chain across v1beta and v1 to prevent 404 errors.
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
    throw new Error("GEMINI_API_KEY is not set. Please enter your key in the counselor box or add GEMINI_API_KEY in Vercel.");
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const discovered = await getAvailableModel(cleanKey);
  const requestedModel = options?.model;

  // Ranked candidate models (cheapest to run first, prioritizing active 2026 models)
  const modelCandidates = [
    cachedWorkingModel,
    requestedModel,
    discovered,
    "gemini-3.1-flash-lite", // Lowest cost tier
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
  ].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i);

  let lastErrorMessage = "";

  for (const model of modelCandidates) {
    for (const version of ["v1beta", "v1"]) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        // Build version-compatible payload
        const body: Record<string, unknown> = {
          contents: [
            {
              parts: [
                {
                  text: version === "v1" && systemInstruction
                    ? `[SYSTEM RULES]:\n${systemInstruction}\n\n[USER PROMPT]:\n${prompt}`
                    : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.1, // Conservative, deterministic
            maxOutputTokens: options?.maxOutputTokens ?? 300, // Capped to stay ultra-cheap
          },
        };

        if (version === "v1beta" && systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            cachedWorkingModel = model; // Cache the successful model for subsequent instant calls
            return text;
          }
        }

        const errText = await response.text();
        let parsedMessage = errText;
        try {
          const parsed = JSON.parse(errText);
          parsedMessage = parsed.error?.message || errText;
        } catch {}

        // If key itself is rejected, fail fast so user knows immediately
        if (response.status === 400 && parsedMessage.toUpperCase().includes("API_KEY_INVALID")) {
          throw new Error("Invalid Gemini API Key. Please verify your key at Google AI Studio (aistudio.google.com).");
        }
        if (response.status === 403) {
          throw new Error(`API Key access denied (${parsedMessage}). Verify project permissions on Google AI Studio.`);
        }
        if (response.status === 429) {
          throw new Error("Gemini quota or rate limit exceeded. Please wait a moment before trying again.");
        }

        lastErrorMessage = `${model} (${version}): ${parsedMessage}`;
      } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("Invalid Gemini API Key") || err.message.includes("access denied") || err.message.includes("quota"))) {
          throw err;
        }
        lastErrorMessage = err instanceof Error ? err.message : String(err);
      }
    }
  }

  cachedWorkingModel = null;
  throw new Error(`Could not connect to Gemini models. ${lastErrorMessage ? `Details: ${lastErrorMessage}` : "Please check your key and model permissions."}`);
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
 * Uses gemini-3.1-flash-lite, max 280 tokens, temperature 0.1 to run as cheaply and conservatively as possible.
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

  const systemInstruction = `You are Univero's ultra-efficient, conservative AI College Counselor running on Google Gemini.
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
    model: "gemini-3.1-flash-lite",
    temperature: 0.1, // Prudent, deterministic
    maxOutputTokens: 280, // Very cheap, fast
  });
}
