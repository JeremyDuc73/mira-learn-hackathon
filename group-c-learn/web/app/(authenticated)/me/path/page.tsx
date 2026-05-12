"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import {
  fetchMyActivePath,
  fetchSkills,
  fetchClassById,
  type ApiLearningPath,
  type ApiStep,
  type ApiSkill,
  type ApiClassDetail,
} from "@/lib/api";

function StepDot({ status }: { status: ApiStep["status"] }) {
  if (status === "validated")
    return (
      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-success bg-success">
        <div className="h-2 w-2 rounded-full bg-card" />
      </div>
    );
  if (status === "in_progress")
    return (
      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-card shadow-[0_0_0_6px_rgba(230,51,42,0.15)]">
        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
      </div>
    );
  return (
    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-soft bg-card">
      <div className="h-2 w-2 rounded-full bg-muted-soft" />
    </div>
  );
}

export default function PathPage() {
  const [path, setPath] = useState<ApiLearningPath | null>(null);
  const [skillMap, setSkillMap] = useState<Map<string, string>>(new Map());
  const [classCache, setClassCache] = useState<Map<string, ApiClassDetail>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMyActivePath(), fetchSkills()])
      .then(async ([activePath, skillData]) => {
        setSkillMap(new Map(skillData.items.map((s: ApiSkill) => [s.id, s.name])));
        if (!activePath) return;
        setPath(activePath);

        // Fetch class info for each step
        const classIds = (activePath.steps ?? [])
          .flatMap((s) => s.recommended_class_ids)
          .filter(Boolean);
        const unique = [...new Set(classIds)];
        const entries = await Promise.all(
          unique.map((id) => fetchClassById(id).then((c) => [id, c] as const).catch(() => null))
        );
        const cache = new Map<string, ApiClassDetail>();
        entries.forEach((e) => { if (e) cache.set(e[0], e[1]); });
        setClassCache(cache);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const horizonLabel: Record<string, string> = {
    "3_months": "3 mois",
    "6_months": "6 mois",
    "1_year": "1 an",
    "2_years": "2 ans",
  };

  const sidebar = (
    <nav className="hidden w-44 flex-shrink-0 md:block">
      <ul className="space-y-1 text-sm">
        {[
          { href: "/me", label: "Mon profil" },
          { href: "/me/path", label: "Mon parcours" },
          { href: "/me/path/generate", label: "Générer" },
        ].map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block rounded-lg px-3 py-2 font-medium text-foreground hover:bg-beige-deep">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (loading) {
    return (
      <div className="flex gap-12">
        {sidebar}
        <div className="flex-1 py-20 text-center text-muted-foreground text-sm">Chargement…</div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex gap-12">
        {sidebar}
        <div className="flex-1 min-w-0 max-w-2xl pb-24">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Mon parcours.</h1>
          <div className="rounded-2xl bg-foreground p-8 text-primary-foreground">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-soft">Mira AI</p>
            <h3 className="font-serif text-2xl font-bold">
              Pas encore de parcours.{" "}
              <span className="italic text-primary">Lance la génération.</span>
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-soft">
              Définis tes skills cibles et laisse Mira AI te construire un parcours en 3-5 étapes. ~15 secondes.
            </p>
            <Link href="/me/path/generate" className="mt-6 inline-block">
              <Button variant="primary">Générer mon parcours →</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = path.steps ?? [];
  const validated = steps.filter((s) => s.status === "validated").length;

  return (
    <div className="flex gap-12">
      {sidebar}

      <div className="flex-1 min-w-0 max-w-2xl pb-24">
        {/* Header */}
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Généré par Mira AI
            </p>
            <h1 className="font-serif text-4xl font-bold text-foreground">{path.name || "Mon parcours."}</h1>
            <p className="mt-3 text-base text-muted-foreground">
              {path.target_skills.map((id) => skillMap.get(id) ?? id).join(" + ")}
              {" · "}estimé {horizonLabel[path.target_horizon] ?? path.target_horizon}
              {" · "}~{path.estimated_duration_hours}h
            </p>
          </div>
          <Link href="/me/path/generate">
            <Button variant="ghost">↻ Régénérer</Button>
          </Link>
        </header>

        {/* Barre de progression */}
        <div className="mb-12 rounded-xl border border-border bg-card px-6 py-5">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Progression</span>
            <span><span className="font-semibold text-foreground">{validated}</span> / {steps.length} étapes validées</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
              style={{ width: `${steps.length > 0 ? (validated / steps.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, i) => {
            const classId = step.recommended_class_ids[0];
            const klass = classId ? classCache.get(classId) : undefined;
            const isLast = i === steps.length - 1;
            const isLocked = step.status === "skipped" || (step.status === "pending" && i > 0 && steps[i - 1]?.status === "pending");

            return (
              <div key={step.id} className={`relative pl-14 ${isLast ? "" : "pb-12"}`}>
                {!isLast && <div className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-border" />}
                <div className="absolute left-2 top-1.5">
                  <StepDot status={step.status} />
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-widest ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                    Étape {step.position}
                  </span>
                  {step.status === "in_progress" && (
                    <span className="rounded-full bg-sage-soft px-3 py-0.5 text-xs font-medium text-foreground">En cours</span>
                  )}
                  {step.status === "validated" && (
                    <span className="rounded-full bg-success/20 px-3 py-0.5 text-xs font-medium text-success">Validée</span>
                  )}
                  {step.status === "pending" && i > 0 && (
                    <span className="rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground">Verrouillée</span>
                  )}
                </div>

                <h3 className={`font-serif text-2xl font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                  Maîtriser : {skillMap.get(step.skill_id) ?? step.skill_id}
                </h3>

                {step.justification && (
                  <p className="mt-2 mb-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    « {step.justification} »
                  </p>
                )}

                {klass && (
                  <div className={`flex max-w-xl items-center gap-4 overflow-hidden rounded-xl border border-border p-4 ${isLocked ? "opacity-50" : "bg-card"}`}>
                    {klass.mentor.avatar_url ? (
                      <img src={klass.mentor.avatar_url} alt={klass.mentor.display_name} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="h-16 w-24 flex-shrink-0 rounded-lg bg-beige-deep" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{klass.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {klass.mentor.display_name}
                        {klass.recommended_price_per_hour_collective_cents > 0 && (
                          <span className={`ml-2 font-semibold ${isLocked ? "text-muted-foreground" : "text-primary"}`}>
                            {Math.round((klass.recommended_price_per_hour_collective_cents / 100) * klass.total_hours)} €
                          </span>
                        )}
                      </p>
                    </div>
                    {!isLocked && (
                      <Link href={`/classes/${klass.slug ?? classId}`}>
                        <Button variant="secondary" className="text-xs">Voir cette class →</Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer IA */}
        <div className="mt-12 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary inline-block" />
          Cette recommandation est issue de Mira AI.
          <Link href="/me/path/generate" className="ml-auto text-xs font-semibold text-primary hover:opacity-70">
            Régénérer
          </Link>
        </div>
      </div>
    </div>
  );
}
