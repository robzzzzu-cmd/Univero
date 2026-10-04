import { useState, useRef, useEffect } from "react";
import { Bot, ChevronDown, Sparkles, Send, X, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { universities } from "@/lib/catalog";
import { askGeminiCounselor } from "@/lib/gemini";
import { useUnivero } from "@/lib/use-univero";
import type { University } from "@/lib/univero";

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
};

export function AiCounselorWidget() {
  const { profile, user } = useUnivero();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUniId, setSelectedUniId] = useState<string>("general");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I'm your conservative AI College Counselor running on Gemini 1.5 Flash-8B. I provide realistic, prudent admissions evaluations without inflated odds. Ask about GPA requirements, curriculum eligibility, budget fits, or specific universities.",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const selectedUni: University | null =
    selectedUniId === "general"
      ? null
      : universities.find(u => u.id === selectedUniId) || null;

  const quickPrompts = [
    "What are conservative target schools for my GPA?",
    "Which European universities fit a €5,000/yr budget?",
    "Do I need SAT/ACT for European English-taught programs?",
    selectedUni ? `What are the minimum requirements for ${selectedUni.name}?` : "What documents should I prepare first?",
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
          text: `⚠️ Counselor unavailable: ${errorMsg}. If GEMINI_API_KEY is not configured yet, you can add it in the user settings menu (top right).`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/30 transition-all duration-200 hover:scale-105 hover:bg-primary/95 focus:outline-none focus:ring-4 focus:ring-primary/30"
            aria-label="Open AI College Counselor"
          >
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-emerald-400"></span>
            </span>
            <Sparkles className="size-4 animate-pulse text-amber-200" />
            <span>AI Counselor</span>
            <span className="hidden rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide sm:inline-block">
              Gemini
            </span>
          </button>
        </div>
      )}

      {/* Expanded Interactive Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 z-50 flex w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[82vh] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-card to-card px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-bold text-ink">AI College Counselor</h3>
                  <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    1.5 Flash-8B
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" /> Conservative & Cost-Optimized
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]!])}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Reset conversation"
              >
                <RefreshCw className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Minimize counselor"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          {/* University context selector */}
          <div className="border-b border-border/60 bg-muted/20 px-3 py-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 font-medium">Focus:</span>
            <select
              value={selectedUniId}
              onChange={e => setSelectedUniId(e.target.value)}
              className="w-full truncate rounded border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="general">🌍 General College Counseling & Requirements</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>
                  🏛️ {u.name} ({u.country})
                </option>
              ))}
            </select>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-[13px] shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-muted/50 border border-border/70 text-card-foreground rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`mt-1 block text-[10px] text-right ${
                      m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary animate-spin">
                  <RefreshCw className="size-3.5" />
                </div>
                <div className="rounded-2xl bg-muted/40 border border-border/70 px-3.5 py-2 text-xs text-muted-foreground italic">
                  Counselor is analyzing requirements conservatively…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt chips */}
          <div className="border-t border-border/60 bg-muted/10 px-3 py-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Quick prompts</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-card"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={selectedUni ? `Ask about ${selectedUni.name}…` : "Ask about GPA, admission odds, tuition…"}
              className="flex-1 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card"
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !inputText.trim()}
              className="rounded-xl px-3"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
