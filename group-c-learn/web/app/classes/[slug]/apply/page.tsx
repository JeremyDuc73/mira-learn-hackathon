"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { getClassBySlug, MENTORS } from "@/lib/mock-data";

const LEVELS = [
  { id: "debutant", label: "Débutant complet" },
  { id: "quelques-bases", label: "Quelques bases" },
  { id: "inter", label: "Intermédiaire" },
  { id: "avance", label: "Avancé" },
  { id: "expert", label: "Expert (je veux peaufiner)" },
] as const;

const AVAILABILITIES = [
  { id: "soir", label: "Soir (18h-21h)" },
  { id: "weekend", label: "Weekend" },
  { id: "semaine", label: "Journée semaine" },
] as const;

export default function ApplyPage() {
  const params = useParams<{ slug: string }>();
  const klass = getClassBySlug(params.slug);
  const mentor = klass ? MENTORS[klass.mentorId] : null;

  const [session, setSession] = useState(klass?.sessions[0]?.id ?? "");
  const [level, setLevel] = useState("quelques-bases");
  const [goal, setGoal] = useState("");
  const [avail, setAvail] = useState({ soir: true, weekend: false, semaine: false });
  const [submitted, setSubmitted] = useState(false);

  if (!klass || !mentor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Class introuvable.</p>
      </div>
    );
  }

  const goalValid = goal.length >= 50 && goal.length <= 500;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-sage-soft">
            <div className="h-6 w-6 rounded-full border-2 border-success bg-success" />
          </div>
          <h2 className="font-serif text-3xl font-bold leading-tight text-foreground">
            Candidature envoyée à{" "}
            <span className="italic text-primary">{mentor.name.split(" ")[0]}.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Tu recevras une réponse par email sous 48 h. En attendant, tu peux explorer le reste du catalogue ou bosser ton parcours.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/me"><Button variant="primary">Voir mon profil</Button></Link>
            <Link href="/classes"><Button variant="ghost">Voir le catalogue</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary">Mira Learn</Link>
          <Link href={`/classes/${klass.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Class : {klass.title}
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12 pb-24">
        <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
          Postuler à cette{" "}
          <span className="italic text-primary">Mira Class.</span>
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-beige-deep text-xs font-bold text-foreground">
            {mentor.name.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{mentor.name.split(" ")[0]}</span>{" "}
            examinera ta candidature et te répondra sous 48 h.
          </p>
        </div>

        <div className="mt-12 space-y-9">
          {/* Session */}
          <div>
            <h2 className="mb-1 text-base font-semibold text-foreground">Session souhaitée</h2>
            <p className="mb-4 text-sm text-muted-foreground">Tu peux candidater à une seule session à la fois.</p>
            <div className="space-y-3">
              {klass.sessions.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition-colors ${
                    session === s.id ? "border-foreground bg-background" : "border-border bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="session"
                    checked={session === s.id}
                    onChange={() => setSession(s.id)}
                    className="hidden"
                  />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${session === s.id ? "border-primary" : "border-border"}`}>
                    {session === s.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {s.location}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.dates} · {s.seats - s.enrolled} places dispo
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Niveau */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-foreground">Ton niveau actuel</h2>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setLevel(o.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    level === o.id
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-beige-deep"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Objectif */}
          <div>
            <h2 className="mb-1 text-base font-semibold text-foreground">Ton objectif concret</h2>
            <p className="mb-3 text-sm text-muted-foreground">200-500 caractères. Sois spécifique : un projet, un timing, un montant.</p>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value.slice(0, 500))}
              placeholder="Ex : lever ma première seed de 500k en automne 2026 pour mon SaaS B2B en finance verte."
              rows={5}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>
                {goalValid ? "Objectif clair" : goal.length < 50 ? `${50 - goal.length} caractères minimum restants` : ""}
              </span>
              <span className={goal.length > 480 ? "text-destructive" : ""}>{goal.length}/500</span>
            </div>
          </div>

          {/* Disponibilité */}
          <div>
            <h2 className="mb-1 text-base font-semibold text-foreground">Disponibilité</h2>
            <p className="mb-4 text-sm text-muted-foreground">Coche tout ce qui marche pour toi.</p>
            <div className="flex flex-wrap gap-3">
              {AVAILABILITIES.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    avail[o.id] ? "border-foreground bg-background" : "border-border bg-card"
                  }`}
                >
                  <div className={`flex h-4.5 w-4.5 items-center justify-center rounded border-2 ${avail[o.id] ? "border-primary bg-primary" : "border-border"}`}>
                    {avail[o.id] && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  {o.label}
                  <input
                    type="checkbox"
                    checked={avail[o.id]}
                    onChange={() => setAvail((prev) => ({ ...prev, [o.id]: !prev[o.id] }))}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8">
          <Link href={`/classes/${klass.slug}`}>
            <Button variant="ghost">Annuler</Button>
          </Link>
          <Button
            variant="primary"
            disabled={!goalValid}
            onClick={() => setSubmitted(true)}
            className="px-8 text-base"
          >
            Soumettre ma candidature →
          </Button>
        </div>
      </div>
    </div>
  );
}
