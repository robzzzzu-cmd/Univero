import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bookmark, Check, GitCompareArrows, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdmissionPill, Card, Checklist, EligibilityPill, meta, Progress, RequirementList, UniLogo } from "@/components/univero/bits";
import { evaluateWithGemini, askGeminiCounselor, type GeminiEvaluation } from "@/lib/gemini";
import { useUnivero } from "@/lib/use-univero";
import { getMatch, money, readiness, tuitionFor, universities } from "@/lib/univero";

export const Route = createFileRoute("/university/$id")({
  head: ({ params }) => {
    const u = universities.find(x => x.id === params.id);
    return meta(
      `${u?.name || "University"} — Univero`,
      `Programs, admissions, costs, scholarships and AI admissions research for ${u?.name || "this university"}.`
    );
  },
  component: Detail,
});

const tabs = ["Overview", "AI Research", "Programs", "Admissions", "Costs", "Scholarships", "Student Life", "Career", "My Fit"] as const;
const tierLabel = { 1: "Most selective", 2: "Highly selective", 3: "Selective", 4: "Accessible" } as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const u = universities.find(x => x.id === id);
  const { profile, saved, compare, docs, ready, toggleSaved, toggleCompare } = useUnivero();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [programId, setProgramId] = useState<string>();

  // Gemini state
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<GeminiEvaluation | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([]);

  if (!u) {
    return (
      <main className="page-shell min-h-[60vh] py-20">
        <h1 className="font-display text-3xl font-bold">University not found</h1>
        <Button asChild className="mt-5">
          <Link to="/explore">Explore universities</Link>
        </Button>
      </main>
    );
  }

  const m = getMatch(u, profile, programId);
  const r = readiness(u, profile, docs);
  const gaps = m.requirements.filter(x => x.status !== "met");

  const runGeminiEvaluation = async () => {
    setGeminiLoading(true);
    setTab("AI Research");
    try {
      const res = await evaluateWithGemini(u, profile, docs, programId);
      setEvaluation(res);
      toast.success("AI admissions evaluation completed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run AI evaluation";
      toast.error(msg);
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatSending) return;

    const userText = chatInput.trim();
    const newHistory = [...chatMessages, { role: "user" as const, text: userText }];
    setChatMessages(newHistory);
    setChatInput("");
    setChatSending(true);

    try {
      const answer = await askGeminiCounselor(userText, u, profile, chatMessages);
      setChatMessages([...newHistory, { role: "model", text: answer }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Counselor chat failed";
      toast.error(msg);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <main className="page-shell min-h-[70vh] py-10 md:py-14">
      <Link to="/results" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> Back to matches
      </Link>
      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="flex gap-5">
          <UniLogo university={u} size="lg" />
          <div>
            <p className="text-xs font-bold uppercase text-primary">
              <span aria-hidden>{u.flag}</span> {u.city}, {u.country}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-5xl">{u.name}</h1>
            <p className="mt-2 text-muted-foreground">{m.program.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <EligibilityPill value={m.eligibility} />
              <AdmissionPill value={m.admission} />
              <span className="pill bg-muted text-foreground">{u.type}</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-8 py-6 text-center subtle-shadow">
          <strong className="font-display text-5xl text-primary">{ready ? m.score : "—"}%</strong>
          <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">Match score</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => toggleSaved(u.id)}>
          <Bookmark className={saved.includes(u.id) ? "fill-current" : ""} />{" "}
          {saved.includes(u.id) ? "Saved to shortlist" : "Save to shortlist"}
        </Button>
        <Button variant="outline" onClick={() => toggleCompare(u.id)}>
          <GitCompareArrows /> {compare.includes(u.id) ? "Remove from comparison" : "Add to comparison"}
        </Button>
        <Button
          variant="secondary"
          onClick={runGeminiEvaluation}
          disabled={geminiLoading}
          className="gap-2 text-primary font-semibold border border-primary/20"
        >
          {geminiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-primary" />}
          Gemini AI Evaluation
        </Button>
        {compare.length > 1 && (
          <Button variant="ghost" asChild>
            <Link to="/compare">View comparison</Link>
          </Button>
        )}
      </div>

      <div className="mt-10 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {tabs.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "AI Research" ? "✨ AI Research" : t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {tab === "AI Research" && (
            <Card className="border-primary/40 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  <h2 className="font-display text-xl font-bold text-ink">Gemini Admissions Intelligence</h2>
                </div>
                <Button size="sm" onClick={runGeminiEvaluation} disabled={geminiLoading} className="gap-2">
                  {geminiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {evaluation ? "Re-evaluate" : "Run AI Admissions Evaluation"}
                </Button>
              </div>

              {geminiLoading && (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto size-8 animate-spin text-primary" />
                  <p className="mt-3 font-semibold text-ink">Gemini is evaluating your profile against {u.name}…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reading academic subjects, test scores, curriculum standards, and uploaded documents.</p>
                </div>
              )}

              {!geminiLoading && !evaluation && (
                <div className="py-10 text-center">
                  <Sparkles className="mx-auto size-10 text-primary/40" />
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">Get a Real AI Admissions Assessment</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Gemini analyzes your complete student profile, curriculum, GPA, standardized test scores, and uploaded certificates to determine your true admission likelihood and give personalized advice.
                  </p>
                  <Button onClick={runGeminiEvaluation} className="mt-5 gap-2">
                    <Sparkles className="size-4" /> Start Evaluation
                  </Button>
                </div>
              )}

              {!geminiLoading && evaluation && (
                <div className="mt-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-accent/60 p-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground">Gemini Verdict</span>
                      <h3 className="mt-0.5 font-display text-xl font-bold text-primary">{evaluation.overallVerdict}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Estimated Acceptance Odds</span>
                      <p className="mt-0.5 font-display text-2xl font-bold text-ink">{evaluation.estimatedAcceptanceProbability}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Admissions Summary</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">{evaluation.summary}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-success/30 bg-success-soft/20 p-4">
                      <h4 className="text-xs font-bold uppercase text-success">Key Strengths</h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-foreground">
                        {evaluation.keyStrengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="size-3.5 shrink-0 text-success mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-warning/30 bg-warning-soft/20 p-4">
                      <h4 className="text-xs font-bold uppercase text-warning">Areas of Concern</h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-foreground">
                        {evaluation.areasOfConcern.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-warning font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Personalized Action Plan</h4>
                    <ol className="mt-2 list-decimal pl-5 space-y-1.5 text-xs text-foreground">
                      {evaluation.actionPlan.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4 text-xs">
                    <div>
                      <strong className="text-ink">Scholarship Outlook:</strong>
                      <p className="mt-1 text-muted-foreground">{evaluation.scholarshipOutlook}</p>
                    </div>
                    <div>
                      <strong className="text-ink">Recommended Major Focus:</strong>
                      <p className="mt-1 text-muted-foreground">{evaluation.recommendedProgramFocus}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Counselor Chat */}
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-display text-base font-bold text-ink">Ask Gemini Counselor about {u.short}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Ask anything about admissions, motivation letters, scholarships, or career outcomes.</p>

                {chatMessages.length > 0 && (
                  <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "ml-8 bg-primary text-primary-foreground"
                            : "mr-8 bg-card border border-border text-foreground"
                        }`}
                      >
                        <strong className="block mb-1 text-[10px] uppercase opacity-75">
                          {msg.role === "user" ? "You" : "Gemini Counselor"}
                        </strong>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    ))}
                    {chatSending && (
                      <div className="mr-8 rounded-lg bg-card border border-border p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                        Gemini is researching your question…
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={`e.g. How does my GPA compare to admitted students at ${u.short}?`}
                    className="input-field text-xs"
                  />
                  <Button type="submit" size="sm" disabled={chatSending || !chatInput.trim()} className="gap-1.5 shrink-0">
                    <Send className="size-3.5" /> Ask
                  </Button>
                </form>
              </div>
            </Card>
          )}

          {tab === "Overview" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Overview</h2>
              <dl className="mt-3">
                <Row label="Location" value={`${u.city}, ${u.country}`} />
                <Row label="University type" value={u.type} />
                <Row label="Student population" value={u.students} />
                <Row label="International students" value={`~${u.intl}%`} />
                <Row label="Campus type" value={u.campus} />
                <Row label="Selectivity" value={tierLabel[u.tier]} />
                <Row label="Programs on Univero" value={u.programs.length} />
                <Row
                  label="Official website"
                  value={
                    <a href={`https://${u.domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {u.domain}
                    </a>
                  }
                />
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">Admissions data is illustrative and verified against public standards.</p>
            </Card>
          )}

          {tab === "Programs" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Programs</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="pb-3">Program</th>
                      <th>Duration</th>
                      <th>Language</th>
                      <th>Tuition*</th>
                      <th>Deadline*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {u.programs.map(p => (
                      <tr key={p.id} className={`border-t border-border ${p.id === m.program.id ? "bg-accent/40" : ""}`}>
                        <td className="py-3 pr-3">
                          <button
                            className="text-left font-semibold text-ink hover:text-primary"
                            onClick={() => setProgramId(p.id)}
                          >
                            {p.name}
                          </button>
                          <span className="block text-xs text-muted-foreground">{p.degree}</span>
                        </td>
                        <td>{p.duration}</td>
                        <td>{p.language}</td>
                        <td>{money(tuitionFor(p, profile))}</td>
                        <td>{p.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Select a program to see its admissions and fit.</p>
            </Card>
          )}

          {tab === "Admissions" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Admissions · {m.program.name}</h2>
              <dl className="mt-3">
                <Row label="Academic requirement" value={`Indicative GPA ${m.program.minGpa.toFixed(2)}+`} />
                <Row label="Required subjects" value={m.program.requiredSubjects.join(", ") || "None specified"} />
                <Row
                  label="SAT / ACT"
                  value={m.program.sat ? `${u.satRequired ? "Required" : "Recommended"} · ${m.program.sat}+` : "Not required"}
                />
                <Row
                  label="English"
                  value={`IELTS ${m.program.ielts} / TOEFL ${Math.round(m.program.ielts * 13.5)} or equivalent`}
                />
                <Row label="Other tests" value={m.program.otherTests.join(", ") || "None"} />
                <Row label="Application deadline" value={m.program.deadline} />
              </dl>
              <h3 className="mt-6 text-sm font-bold text-ink">Required documents</h3>
              <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                {m.program.documents.map(d => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
            </Card>
          )}

          {tab === "Costs" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Costs</h2>
              <dl className="mt-3">
                <Row label="Tuition / year (your rate)" value={money(m.tuition)} />
                {u.tuitionEU !== u.tuition && (
                  <Row label="EU / non-EU tuition" value={`${money(u.tuitionEU)} / ${money(u.tuition)}`} />
                )}
                <Row label="Est. accommodation / month" value={money(u.accommodation)} />
                <Row label="Est. monthly living cost" value={money(Math.round(u.living / 12 / 10) * 10)} />
                <Row label="Est. total first year" value={money(m.tuition + u.living)} />
                <Row label="Your tuition budget" value={money(profile.budget)} />
              </dl>
              <span
                className={`pill mt-4 ${
                  m.affordability === "Within budget" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
                }`}
              >
                {m.affordability}
              </span>
            </Card>
          )}

          {tab === "Scholarships" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Scholarships</h2>
              {u.scholarships.length ? (
                <div className="mt-4 space-y-3">
                  {u.scholarships.map(s => (
                    <div key={s.name} className="rounded-md border border-border p-4">
                      <strong className="text-ink">{s.name}</strong>
                      <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-xs text-muted-foreground">Amount</dt>
                          <dd>{s.amount}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Eligibility</dt>
                          <dd>{s.eligibility}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Deadline</dt>
                          <dd>{s.deadline}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No scholarships listed for international bachelor’s students yet.</p>
              )}
            </Card>
          )}

          {tab === "Student Life" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Student life</h2>
              <dl className="mt-3">
                <Row label="Setting" value={u.setting} />
                <Row label="Campus" value={u.campus} />
                <Row label="Community size" value={u.size} />
                <Row label="International community" value={`~${u.intl}% international`} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {u.tags.map(t => (
                  <span
                    key={t}
                    className={`pill ${profile.preferences.includes(t) ? "bg-success-soft text-success" : "bg-muted text-foreground"}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {tab === "Career" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">Career</h2>
              <p className="mt-3 text-sm text-foreground">{u.career}.</p>
              <dl className="mt-3">
                <Row label="Career fit for you" value={`${m.fit.career}/10`} />
                <Row label="Your career goal" value={profile.careerGoal || "Not set"} />
              </dl>
              {!profile.careerGoal && (
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/profile">Add a career goal</Link>
                </Button>
              )}
            </Card>
          )}

          {tab === "My Fit" && (
            <Card>
              <h2 className="font-display text-xl font-bold text-ink">My fit</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["Academic fit", m.fit.academic],
                    ["Financial fit", m.fit.financial],
                    ["Location fit", m.fit.location],
                    ["Program fit", m.fit.program],
                    ["Career fit", m.fit.career],
                    ["Personal fit", m.fit.personal],
                  ] as const
                ).map(([l, v]) => (
                  <div key={l}>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{l}</span>
                      <strong className="text-ink">{v}/10</strong>
                    </div>
                    <Progress value={v * 10} className="mt-2" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-md bg-accent/60 px-5 py-4">
                <span className="font-semibold text-ink">Overall</span>
                <strong className="font-display text-2xl text-primary">{m.score}% Match</strong>
              </div>
              <h3 className="mt-6 text-sm font-bold text-ink">Why</h3>
              <ul className="mt-2 space-y-1.5">
                {m.reasons.map(x => (
                  <li key={x} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-success" />
                    {x}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Requirements check</h2>
              <EligibilityPill value={m.eligibility} />
            </div>
            <div className="mt-4">
              <RequirementList items={m.requirements} />
            </div>
            {gaps.length > 0 && (
              <Button asChild size="sm" className="mt-5 w-full">
                <Link to="/profile">Update profile</Link>
              </Button>
            )}
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Application readiness</h2>
              <strong className="text-primary">{r.percent}%</strong>
            </div>
            <Progress value={r.percent} className="my-4" />
            <Checklist items={r.checks} />
          </Card>
          <p className="text-xs leading-5 text-muted-foreground">
            *All figures, requirements and dates are structured admissions guidelines. Use the Gemini AI tab for real personalized research.
          </p>
        </aside>
      </div>
    </main>
  );
}
