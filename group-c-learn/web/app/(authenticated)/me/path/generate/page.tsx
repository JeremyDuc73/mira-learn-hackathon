"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";
import { fetchSkills, type ApiSkill } from "@/lib/api";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/v1";
const DEMO_TOKEN = "demo-anna";

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

const CV_EXTRACTED_SKILL_NAMES = ["UI Design", "Public speaking"];

export default function PathGeneratePage() {
  const router = useRouter();
  const [allSkills, setAllSkills] = useState<ApiSkill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [horizon, setHorizon] = useState<"3_months" | "6_months" | "1_year">("6_months");
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvParsing, setCvParsing] = useState(false);
  const [cvExtracted, setCvExtracted] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSkills().then((data) => {
      setAllSkills(data.items);
      const defaults = data.items
        .filter((s) => s.slug === "pitch-investor" || s.slug === "funding-strategy")
        .map((s) => s.id);
      setSelectedSkillIds(defaults);
    }).catch(console.error);
  }, []);

  if (generating) {
    return <GeneratingStateWithCall onDone={() => router.push("/me/path")} selectedSkillIds={selectedSkillIds} horizon={horizon} />;
  }

  const selectedNames = selectedSkillIds
    .map((id) => allSkills.find((s) => s.id === id)?.name ?? id);
  const remainingSkills = allSkills.filter((s) => !selectedSkillIds.includes(s.id));

  function addSkill(id: string) {
    if (id) setSelectedSkillIds((prev) => [...prev, id]);
    setAdding(false);
  }

  function removeSkill(name: string) {
    const skill = allSkills.find((s) => s.name === name);
    if (!skill) return;
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skill.id));
  }

  return (
    <div className="mx-auto max-w-xl py-4 pb-24">
      <Link href="/me" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Retour au profil
      </Link>

      <p className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
        Mira AI
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
            {selectedNames.map((name, i) => (
              <SkillChip
                key={name}
                label={i === 0 ? `${name} (primaire)` : name}
                removable
                onRemove={() => removeSkill(name)}
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
                  {remainingSkills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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

        {/* CV */}
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Ton CV (optionnel)</h2>
          <p className="mb-3 text-sm text-muted-foreground">On identifiera tes skills déjà acquises pour ne pas te les reproposer.</p>

          {cvParsing ? (
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-beige-deep">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{cvName}</p>
                <p className="text-xs text-muted-foreground">Analyse en cours…</p>
              </div>
            </div>
          ) : cvExtracted.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sage-soft text-success text-sm font-bold">ok</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cvName}</p>
                    <p className="text-xs text-muted-foreground">{cvExtracted.length} skills détectées</p>
                  </div>
                </div>
                <button onClick={() => { setCvName(null); setCvExtracted([]); }} className="text-muted-foreground hover:text-primary">×</button>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Déjà acquises (exclues du parcours)</p>
              <div className="flex flex-wrap gap-1.5">
                {cvExtracted.map((s) => (
                  <span key={s} className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-foreground">{s}</span>
                ))}
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-5 rounded-xl border border-dashed border-muted-soft bg-card p-6 hover:border-primary">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const name = e.target.files?.[0]?.name ?? "CV.pdf";
                  setCvName(name);
                  setCvParsing(true);
                  setTimeout(() => {
                    setCvParsing(false);
                    setCvExtracted(CV_EXTRACTED_SKILL_NAMES);
                  }, 2200);
                }}
              />
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-background text-xs font-semibold text-muted-foreground">
                PDF
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
          disabled={selectedSkillIds.length === 0}
          onClick={() => setGenerating(true)}
          className="min-w-[280px] py-4 text-base"
        >
          Générer mon parcours
        </Button>
        <p className="text-xs text-muted-foreground">~15 secondes · gratuit</p>
      </div>
    </div>
  );
}

function GeneratingStateWithCall({
  onDone,
  selectedSkillIds,
  horizon,
}: {
  onDone: () => void;
  selectedSkillIds: string[];
  horizon: string;
}) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhaseIdx(1), 1400);
    const t2 = setTimeout(() => setPhaseIdx(2), 2800);
    const t3 = setTimeout(() => setPhaseIdx(3), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const ts = [
      setTimeout(() => setRevealed(1), 1800),
      setTimeout(() => setRevealed(2), 3800),
      setTimeout(() => setRevealed(3), 5400),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 5000));
    const apiCall = fetch(`${API}/students/me/learning-paths`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEMO_TOKEN}`,
      },
      body: JSON.stringify({
        target_skills: selectedSkillIds,
        target_horizon: horizon,
        name: "",
      }),
    }).catch(() => null);

    Promise.all([minDelay, apiCall]).then(() => onDone());
  }, []);

  const SKELETON_STEPS = [
    { t: "Skill cible : Pitch investor", d: "Class flagship d'Antoine →" },
    { t: "Skill cible : Funding strategy", d: "La même class couvre les 2 →" },
    { t: "Validation : QCM mobile", d: "+ projet final →" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-12 max-w-lg w-full">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>

        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            {LOADING_PHASES[phaseIdx]}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">~15 secondes · ne ferme pas la page</p>
        </div>

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
