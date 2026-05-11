"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";

const ALL_SKILLS = [
  "Pitch investor", "Funding strategy", "UI Design", "Design System",
  "Growth", "B2B", "Go-to-market", "Public speaking", "Figma",
];

const MOCK_ENROLMENTS = [
  { classSlug: "pitcher-pour-lever-500k", title: "Pitcher pour lever 500k €", mentor: "Antoine Martin", when: "il y a 2 j" },
];

export default function MePage() {
  const [targetSkills, setTargetSkills] = useState(["Pitch investor", "Funding strategy"]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [adding, setAdding] = useState(false);

  const remaining = ALL_SKILLS.filter((s) => !targetSkills.includes(s));

  function removeSkill(s: string) {
    setTargetSkills((prev) => prev.filter((x) => x !== s));
  }

  function addSkill(s: string) {
    if (s) setTargetSkills((prev) => [...prev, s]);
    setAdding(false);
  }

  return (
    <div className="flex gap-12">
      {/* Sidebar */}
      <nav className="hidden w-44 flex-shrink-0 md:block">
        <ul className="space-y-1 text-sm">
          {[
            { href: "/me", label: "Mon profil" },
            { href: "/me/path", label: "Mon parcours" },
            { href: "/me/path/generate", label: "✨ Générer" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-2 font-medium text-foreground hover:bg-beige-deep"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-10 min-w-0">
        {/* Header profil */}
        <header className="flex items-center gap-6">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-beige-deep font-bold text-xl text-foreground">
            AL
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold text-foreground">Anna Lopez</h1>
            <p className="mt-1 text-sm text-muted-foreground">Nomad designer en transition vers le SaaS</p>
            <p className="mt-1 text-sm text-muted-foreground">🇵🇹 Lisbonne, PT · nomade depuis 2021</p>
          </div>
          <Button variant="secondary">Modifier le profil</Button>
        </header>

        {/* Skills cibles */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes skills cibles</h2>
          {targetSkills.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-background text-primary">✨</div>
              <p className="flex-1 text-sm text-foreground">Définis tes skills cibles pour qu'on te génère ton parcours d'apprentissage.</p>
              <Link href="/me/path/generate"><Button variant="primary" className="text-sm">Définir mes skills →</Button></Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {targetSkills.map((s) => (
                <SkillChip key={s} label={s} removable onRemove={() => removeSkill(s)} />
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
          )}
        </section>

        {/* Skills validées */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes skills validées</h2>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-background text-success">✓</div>
            <p className="text-sm text-foreground">Passe des QCM pour valider tes skills sur l'app mobile. Ça apparaît ici.</p>
          </div>
        </section>

        {/* Visibilité */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Visibilité</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex gap-4">
              {[
                { id: "public" as const, label: "Public", desc: "Apparais sur la carte de la communauté Mira." },
                { id: "private" as const, label: "Privé", desc: "Ton profil reste invisible aux autres apprenants." },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-1 cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${
                    visibility === opt.id ? "border-foreground bg-background" : "border-border bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === opt.id}
                    onChange={() => setVisibility(opt.id)}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Mon parcours */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mon parcours</h2>
          <div className="rounded-2xl bg-foreground p-8 text-primary-foreground">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-soft">✨ Mira AI</p>
            <h3 className="font-serif text-2xl font-bold">
              Génère ton parcours{" "}
              <span className="italic text-primary">sur mesure.</span>
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-soft">
              On t'aide à passer du point A au point B en 4 étapes max. Démarre quand tu veux, ~15 secondes pour générer.
            </p>
            <Link href="/me/path/generate" className="mt-6 inline-block">
              <Button variant="primary">✨ Générer</Button>
            </Link>
          </div>
        </section>

        {/* Inscriptions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes inscriptions</h2>
          {MOCK_ENROLMENTS.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
              <p className="text-sm text-foreground">Tu n'as pas encore postulé à une Mira Class.</p>
              <Link href="/classes"><Button variant="primary" className="text-sm">Voir le catalogue →</Button></Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {MOCK_ENROLMENTS.map((e, i) => (
                <Link
                  key={i}
                  href={`/classes/${e.classSlug}`}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-beige-deep ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-beige-deep" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">par {e.mentor}</p>
                  </div>
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                    En attente · {e.when}
                  </span>
                  <span className="text-muted-foreground">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
