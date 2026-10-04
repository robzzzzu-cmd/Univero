import { useState } from "react";
import { Cloud, CloudCheck, Key, LogIn, LogOut, Shield, User, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getGeminiApiKey, saveGeminiApiKey } from "@/lib/gemini";
import { useUnivero } from "@/lib/use-univero";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, syncState, loginUser, registerUser, logoutUser } = useUnivero();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password, name);
        toast.success("Account created! Progress is now synced across your devices.");
      } else {
        await loginUser(email, password);
        toast.success("Welcome back! Your cloud data has been loaded.");
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(apiKey);
    toast.success("Gemini API Key updated successfully!");
    setShowKeySettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {user ? (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{user.name}</h3>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Cloud className="size-4 text-primary" />
                <span>Cloud Synchronization</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                  Active
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your profile, university shortlist, and application tracking statuses are continuously saved in the database. Log in from any phone or computer to continue where you left off.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowKeySettings(!showKeySettings)}
              >
                <Key className="size-4 text-primary" />
                {showKeySettings ? "Hide Gemini API Key Settings" : "Configure Gemini API Key"}
              </Button>

              {showKeySettings && (
                <form onSubmit={handleSaveApiKey} className="mt-2 space-y-3 rounded-lg border border-border p-3">
                  <label className="block text-xs font-bold text-ink">
                    Gemini API Key (Optional Override)
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="input-field mt-1 text-xs"
                    />
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    If GEMINI_API_KEY is configured in your Vercel project environment variables, it is used automatically. You can also specify an override here.
                  </p>
                  <Button type="submit" size="sm" className="w-full">
                    Save Key
                  </Button>
                </form>
              )}

              <Button
                variant="destructive"
                className="mt-4 w-full justify-center gap-2"
                onClick={() => {
                  logoutUser();
                  toast.info("Logged out from this device");
                  onClose();
                }}
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {isRegister ? <UserPlus className="size-6" /> : <LogIn className="size-6" />}
              </div>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">
                {isRegister ? "Create your student account" : "Sign in to Univero"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Save your progress, shortlist, and applications to the database across all your devices.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
              {isRegister && (
                <label className="block">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Your Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Angelina Tamm"
                    className="input-field mt-1"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="input-field mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field mt-1"
                />
              </label>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? "Please wait…" : isRegister ? "Create Account & Sync" : "Sign In & Load Cloud Data"}
              </Button>
            </form>

            <div className="mt-5 border-t border-border pt-4 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isRegister
                  ? "Already have an account? Sign in instead"
                  : "Don't have an account? Create one to save across devices"}
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowKeySettings(!showKeySettings)}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                ⚙️ {showKeySettings ? "Hide API settings" : "Configure Gemini API key"}
              </button>
              {showKeySettings && (
                <form onSubmit={handleSaveApiKey} className="mt-2 space-y-2 rounded-lg border border-border p-3 text-left">
                  <label className="block text-xs font-bold text-ink">
                    Gemini API Key
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="input-field mt-1 text-xs"
                    />
                  </label>
                  <Button type="submit" size="sm" className="w-full">
                    Save Key
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
