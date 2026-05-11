"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";

const ALL_SKILLS = [
  "Pitch investor", "Funding strategy", "UI Design", "Design System",
  "Growth", "B2B", "Go-to-market", "Public speaking",
];

const HORIZONS = [
  { id: "3_months", label: "3 mois", desc: "Sprint focus" },
  { id: "6_months", label: "6 mois", desc: "Rythme soutenable" },
  { id: "1_year", label: "1 an", desc: "Approfondi" },
] as const;

const LOADING_PHASES = [
  "Mira analyse tes objectifs…",
  "On croise avec le catalogue…",
  "On classe les mentors par fit…",
  "Construction du parcours…",
] as const;

function GeneratingState() {
  const router = useRouter();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhaseIdx(1), 1400);
    const t2 = setTimeout(() => setPhaseIdx(2), 2800);
    const t3 = setTimeout(() => setPhaseIdx(3), 4200);
    const t4 = setTimeout(() => router.push("/me/path"), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router]);

  useEffect(() => {
    const ts = [
      setTimeout(() => setRevealed(1), 1800),
      setTimeout(() => setRevealed(2), 3800),
      setTimeout(() => setRevealed(3), 5400),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const SKELETON_STEPS = [
    { t: "Skill cible : Pitch investor", d: "Class flagship d'Antoine →" },
    { t: "Skill cible : Funding strategy", d: "La même class couvre les 2 →" },
    { t: "Validation : QCM mobile", d: "+ projet final →" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-12 max-w-lg w-full">
        {/* Icône animée */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-12 w-12 animate-spin items-center justify-center rounded-full bg-primary text-primary-foreground">
            ✨
          </div>
        </div>

        {/* Texte rotatif */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            {LOADING_PHASES[phaseIdx]}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">~15 secondes · ne ferme pas la page</p>
        </div>

        {/* Skeleton timeline */}
        <div className="relative w-full max-w-sm pl-6">
          <div className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-border" />
          {SKELETON_STEPS.map((node, i) => (
            <div
              key={i}
              className={`relative mb-5 grid grid-cols-[12px_1fr] gap-5 transition-opacity duration-500 ${
                revealed > i ? "opacity-100" : "opacity-25"
              }`}
            >
              <div
                className={`mt-1.5 h-3 w-3 rounded-full transition-all duration-500 ${
                  revealed > i ? "bg-primary shadow-[0_0_0_5px_rgba(230,51,42,0.15)]" : "bg-muted-soft"
                }`}
              />
              <div
                className={`rounded-xl border border-border bg-card p-3 transition-all duration-500 ${
                  revealed > i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-50"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{node.t}</p>
                <p className="text-xs text-muted-foreground">{node.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PathGeneratePage() {
  const [skills, setSkills] = useState(["Pitch investor", "Funding strategy"]);
  const [horizon, setHorizon] = useState<"3_months" | "6_months" | "1_year">("6_months");
  const [budget, setBudget] = useState(80);
  const [cvName, setCvName] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);

  if (generating) return <GeneratingState />;

  const remaining = ALL_SKILLS.filter((s) => !skills.includes(s));

  function addSkill(s: string) {
    if (s) setSkills((prev) => [...prev, s]);
    setAdding(false);
  }

  return (
    <div className="mx-auto max-w-xl py-4 pb-24">
      <Link href="/me" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Retour au profil
      </Link>

      <p className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
        ✨ Mira AI
      </p>
      <h1 className="font-serif text-4xl font-bold leading-tight text-foreground">
        Génère ton parcours{" "}
        <span className="italic text-primary">sur mesure.</span>
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        On va te proposer un parcours d'apprentissage à partir de tes objectifs. Tu pourras toujours le modifier ou en générer un nouveau.
      </p>

      <div className="mt-12 space-y-8">
        {/* Skills */}
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Tes skills cibles</h2>
          <p className="mb-3 text-sm text-muted-foreground">Min. 1 skill. Mira AI les croise avec le catalogue.</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <SkillChip
                key={s}
                label={i === 0 ? `${s} (primaire)` : s}
                removable
                onRemove={() => setSkills((prev) => prev.filter((x) => x !== s))}
              />
            ))}
            {adding ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-muted-soft px-3 py-1">
                <select
                  onChange={(e) => addSkill(e.target.value)}
                  defaultValue=""
                  className="border-0 bg-transparent text-xs text-foreground outline-none"
                >
                  <option value="" disabled>Choisir…</option>
                  {remaining.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-primary">×</button>
              </span>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="rounded-full border border-dashed border-muted-soft px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                + Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Horizon */}
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Ton horizon</h2>
          <p className="mb-3 text-sm text-muted-foreground">Le rythme auquel tu veux progresser.</p>
          <div className="grid grid-cols-3 gap-3">
            {HORIZONS.map((o) => (
              <label
                key={o.id}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                  horizon === o.id ? "border-foreground bg-background" : "border-border bg-card"
                }`}
              >
                <input type="radio" name="horizon" checked={horizon === o.id} onChange={() => setHorizon(o.id)} className="hidden" />
                <p className="text-base font-semibold text-foreground">{o.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Ton budget total</h2>
          <p className="mb-3 text-sm text-muted-foreground">Tu peux toujours t'inscrire à plus de classes ensuite.</p>
          <div className="flex items-center gap-5 rounded-xl border border-border bg-card px-6 py-5">
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="text-right">
              <p className="font-serif text-3xl font-bold text-primary">{budget} €</p>
              <p className="text-xs text-muted-foreground">max</p>
            </div>
          </div>
        </div>

        {/* CV */}
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Ton CV (optionnel)</h2>
          <p className="mb-3 text-sm text-muted-foreground">On identifiera tes skills déjà acquises pour ne pas te les reproposer.</p>
          {cvName ? (
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sage-soft text-success">✓</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{cvName}</p>
              </div>
              <button onClick={() => setCvName(null)} className="text-muted-foreground hover:text-primary">×</button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-5 rounded-xl border border-dashed border-muted-soft bg-card p-6 hover:border-primary">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={() => setCvName("CV.pdf")}
              />
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
                ↑
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Glisse ton CV ici ou clique pour parcourir</p>
                <p className="mt-1 text-xs text-muted-foreground">PDF · max 5 MB</p>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Button
          variant="primary"
          disabled={skills.length === 0}
          onClick={() => setGenerating(true)}
          className="min-w-[280px] py-4 text-base"
        >
          ✨ Générer mon parcours
        </Button>
        <p className="text-xs text-muted-foreground">~15 secondes · gratuit</p>
      </div>
    </div>
  );
}
