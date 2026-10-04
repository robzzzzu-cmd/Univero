import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, meta, PageHeader } from "@/components/univero/bits";
import { universities } from "@/lib/catalog";
import { askGeminiCounselor } from "@/lib/gemini";
import { useUnivero } from "@/lib/use-univero";
import type { University } from "@/lib/univero";

export const Route = createFileRoute("/counselor")({
  head: () =>
    meta(
      "AI College Counselor — Univero",
      "Interactive college counselor powered by Gemini 1.5 Flash-8B for conservative admissions guidance, GPA prerequisites, and tuition analysis."
    ),
  component: CounselorPage,
});

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
};

function CounselorPage() {
  const { profile, user } = useUnivero();
  const [selectedUniId, setSelectedUniId] = useState<string>("general");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your AI College Counselor powered by Google Gemini (Gemini 1.5 Flash-8B). My guidance is strictly conservative and realistic: I do not inflate admission odds. I evaluate hard minimums, subject prerequisites, tuition costs, and competitive benchmarks. What would you like to explore today?",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedUni: University | null =
    selectedUniId === "general"
      ? null
      : universities.find(u => u.id === selectedUniId) || null;

  const quickPrompts = [
    "What are realistic target universities based on my GPA?",
    "Which European universities offer programs under €5,000/yr?",
    "Do I meet prerequisites for Bachelor programs without SAT?",
    selectedUni ? `Can you evaluate my chances conservatively for ${selectedUni.name}?` : "What documents should I prepare first for European universities?",
    "How competitive are business programs in the Netherlands and Baltics?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, text: m.text }));

      const botReply = await askGeminiCounselor(text, selectedUni, profile, history);

      setMessages(prev => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          role: "model",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to AI Counselor.";
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "model",
          text: `⚠️ Counselor unavailable: ${errorMsg}. Please ensure GEMINI_API_KEY is configured in your project settings.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell min-h-[80vh] py-10 md:py-14">
      <PageHeader
        eyebrow="Gemini AI Research"
        title="Interactive College Counselor"
        subtitle="Ultra-low-cost, conservative guidance powered by Gemini 1.5 Flash-8B. Real requirement checks, honest admission probability, and cost breakdowns."
      >
        <Button asChild variant="outline">
          <Link to="/results">Explore all universities</Link>
        </Button>
      </PageHeader>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Chat Box */}
        <div className="flex flex-col h-[650px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Counselor top bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-ink">Admissions Counseling Session</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    gemini-1.5-flash-8b
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" /> Conservative, prudent & token-optimized
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([messages[0]!])}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw className="size-3.5 mr-1" /> Reset
            </Button>
          </div>

          {/* Target Focus Selector */}
          <div className="flex items-center gap-3 border-b border-border/70 bg-muted/15 px-5 py-2.5">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Focus Target:</span>
            <select
              value={selectedUniId}
              onChange={e => setSelectedUniId(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="general">🌍 General University Counseling (All Countries)</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>
                  🏛️ {u.name} ({u.city}, {u.country}) · Tuition: €{u.tuition.toLocaleString()}/yr
                </option>
              ))}
            </select>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed text-sm shadow-xs ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-muted/40 border border-border/80 text-foreground rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1.5 block text-[10px] text-right ${
                      m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary animate-spin">
                  <RefreshCw className="size-4" />
                </div>
                <div className="rounded-2xl bg-muted/40 border border-border/80 px-4 py-2.5 text-xs text-muted-foreground italic">
                  Counselor is analyzing admission criteria and formulating conservative advice…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-border/70 bg-muted/10 px-5 py-2.5">
            <span className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5 block">Suggested questions</span>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border-t border-border p-4 bg-card"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={selectedUni ? `Ask about requirements or fit for ${selectedUni.name}…` : "Ask any college admissions question…"}
              className="flex-1 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="rounded-xl px-4"
            >
              <Send className="size-4 mr-1.5" /> Send
            </Button>
          </form>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <Card>
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" /> Student Context
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The AI counselor uses your current student profile parameters to tailor conservative guidance:
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Student Name</span>
                <span className="font-semibold">{profile.name || "Guest Student"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Academic GPA</span>
                <span className="font-semibold">{profile.gpa ? `${profile.gpa} / 4.0` : "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Curriculum</span>
                <span className="font-semibold">{profile.curriculum || "General"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Tuition Budget</span>
                <span className="font-semibold">€{profile.budget.toLocaleString()} / year</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Preferred Field</span>
                <span className="font-semibold">{profile.subject || "Any"}</span>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/profile">
                Edit Profile <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </Card>

          <Card>
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" /> Conservative AI Policy
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>No False Reassurance:</strong> Honors stringent admission rates without inflated chances.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Strict Cost-Efficiency:</strong> Runs on Gemini 1.5 Flash-8B at ~$0.0375 / 1M tokens to remain ultra-affordable.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Hard Criteria Focused:</strong> Evaluates subject requirements, minimum GPA, and language proofs.</span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
