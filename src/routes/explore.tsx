import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, Search, Globe, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdmissionPill, Card, EligibilityPill, meta, PageHeader, UniLogo } from "@/components/univero/bits";
import { countries, getMatch, money, subjects, universities, searchGlobalUniversities, type University } from "@/lib/univero";
import { useUnivero } from "@/lib/use-univero";

export const Route = createFileRoute("/explore")({
  head: () =>
    meta(
      "Explore universities — Univero",
      "Search 295+ curated universities plus 9,500+ worldwide institutions across Europe, the UK, North America, Asia and the Baltics by subject, country, cost and fit."
    ),
  component: Explore,
});

const tierLabel = { 1: "Most selective", 2: "Highly selective", 3: "Selective", 4: "Accessible" } as const;

function Explore() {
  const { profile, saved, ready, toggleSaved } = useUnivero();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ country: "", subject: "", tuition: "", language: "", tier: "", size: "", score: "", elig: "" });
  const [globalList, setGlobalList] = useState<University[]>([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const handleGlobalSearch = async () => {
    if (!q.trim() || searchingGlobal) return;
    setSearchingGlobal(true);
    try {
      const found = await searchGlobalUniversities(q);
      setGlobalList(found);
      if (found.length === 0) {
        toast.info(`No global universities found matching "${q}".`);
      } else {
        toast.success(`Loaded ${found.length} universities worldwide!`);
      }
    } catch {
      toast.error("Could not query global universities database.");
    } finally {
      setSearchingGlobal(false);
    }
  };

  const allAvailable = useMemo(() => {
    if (globalList.length > 0) {
      const ids = new Set(universities.map(u => u.id));
      const extras = globalList.filter(g => !ids.has(g.id));
      return [...universities, ...extras];
    }
    return universities;
  }, [globalList]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+|,/).filter(w => w && !["in", "the", "of", "and", "at"].includes(w));
    return allAvailable
      .map(u => ({ u, m: getMatch(u, profile) }))
      .filter(({ u, m }) => {
        const hay = [u.name, u.short, u.city, u.country, ...u.programs.map(p => `${p.name} ${p.subject}`)].join(" ").toLowerCase();
        return (
          words.every(w => hay.includes(w)) &&
          (!f.country || u.country === f.country) &&
          (!f.subject || u.programs.some(p => p.subject === f.subject)) &&
          (!f.tuition || m.tuition <= Number(f.tuition)) &&
          (!f.language || u.programs.some(p => p.language.includes(f.language))) &&
          (!f.tier || String(u.tier) === f.tier) &&
          (!f.size || u.size === f.size) &&
          (!f.score || m.score >= Number(f.score)) &&
          (!f.elig || m.eligibility === f.elig)
        );
      })
      .sort((a, b) => b.m.score - a.m.score);
  }, [allAvailable, q, f, profile]);

  const selects: [keyof typeof f, string, [string, string][]][] = [
    ["country", "All countries", countries.map(c => [c, c])],
    ["subject", "All subjects", subjects.map(s => [s, s])],
    ["tuition", "Any tuition", ["2000", "10000", "20000", "40000"].map(v => [v, `Under ${money(Number(v))}`])],
    ["language", "Any language", [["English", "English"], ["German", "German"]]],
    ["tier", "Any selectivity", ([1, 2, 3, 4] as const).map(t => [String(t), tierLabel[t]])],
    ["size", "Any size", [["Large university", "Large"], ["Smaller community", "Smaller"]]],
    ["score", "Any match", ["60", "70", "80", "90"].map(v => [v, `${v}%+ match`])],
    ["elig", "Any eligibility", ["Eligible", "Potentially eligible", "Missing information", "Not eligible"].map(v => [v, v])],
  ];

  return (
    <main className="page-shell min-h-[70vh] py-12 md:py-16">
      <PageHeader
        eyebrow="Global University Directory"
        title="Explore universities"
        subtitle={`Search ${universities.length} curated universities plus 9,500+ worldwide institutions across 190 countries. Try “Computer Science in Germany”, “Bocconi”, or “Tokyo”.`}
      />

      <div className="relative mt-8">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={e => {
            setQ(e.target.value);
            if (!e.target.value.trim()) setGlobalList([]);
          }}
          placeholder="Search by school, city, or subject (e.g. TalTech, Oxford, Seoul, Business in Netherlands)..."
          className="input-field h-14 pl-12 pr-44 text-base"
          aria-label="Search universities"
        />
        {q.trim().length >= 2 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleGlobalSearch}
            disabled={searchingGlobal}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 gap-1.5 text-xs font-semibold shadow-sm"
          >
            {searchingGlobal ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Searching…
              </>
            ) : (
              <>
                <Globe className="size-3.5 text-primary" /> Search 9,500+ Worldwide
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {selects.map(([k, all, opts]) => (
          <select
            key={k}
            aria-label={all}
            value={f[k]}
            onChange={e => set(k)(e.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-xs font-semibold"
          >
            <option value="">{all}</option>
            {opts.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        ))}
        {(Object.values(f).some(Boolean) || globalList.length > 0) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setF({ country: "", subject: "", tuition: "", language: "", tier: "", size: "", score: "", elig: "" });
              setGlobalList([]);
              setQ("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {results.length} universities available {globalList.length > 0 && <span className="font-semibold text-primary">(including {globalList.length} global records)</span>}
        </p>
      </div>

      {results.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
          <Globe className="mx-auto size-10 text-muted-foreground opacity-60 mb-2" />
          <h3 className="font-display text-base font-bold text-foreground">
            No featured universities match "{q}"
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            Expand search to the global directory of 9,500+ accredited universities and colleges across 190 countries.
          </p>
          <Button
            onClick={handleGlobalSearch}
            disabled={searchingGlobal}
            className="mt-4 gap-2"
            size="sm"
          >
            {searchingGlobal ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Searching global directory…
              </>
            ) : (
              <>
                <Globe className="size-4" /> Search 9,500+ Global Universities
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ready &&
          results.map(({ u, m }) => (
            <Card key={u.id} className="flex flex-col !p-5">
              <div className="flex items-start gap-3">
                <UniLogo university={u} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to="/university/$id" params={{ id: u.id }} className="font-display font-bold leading-snug text-ink hover:text-primary">
                    {u.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span aria-hidden>{u.flag}</span> {u.city} · {tierLabel[u.tier]}
                  </p>
                </div>
                <span className="font-display text-xl font-bold text-primary">{m.score}%</span>
              </div>
              <p className="mt-3 line-clamp-1 text-sm text-foreground">{m.program.name}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <EligibilityPill value={m.eligibility} />
                <AdmissionPill value={m.admission} />
                {u.scholarship && <span className="pill bg-accent text-primary">Scholarships</span>}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-3 mt-4 text-xs">
                <span className="text-muted-foreground">
                  Tuition <strong className="text-ink">{money(m.tuition)}</strong>
                </span>
                <button
                  onClick={() => toggleSaved(u.id)}
                  className="flex items-center gap-1 font-semibold text-primary"
                  aria-label={saved.includes(u.id) ? "Remove from shortlist" : "Save to shortlist"}
                >
                  <Bookmark className={`size-4 ${saved.includes(u.id) ? "fill-current" : ""}`} />
                  {saved.includes(u.id) ? "Saved" : "Save"}
                </button>
              </div>
            </Card>
          ))}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Logos are loaded from each university’s official domain. Curated data includes 295+ global institutions with on-demand access to 9,500+ world universities.
      </p>
    </main>
  );
}
