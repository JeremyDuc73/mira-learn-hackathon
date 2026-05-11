"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { SkillChip } from "@/components/SkillChip";
import { COMMUNITY_MEMBERS } from "@/lib/mock-data";

export default function CommunityPage() {
  const [cityFilter, setCityFilter] = useState<string[]>([]);
  const [targetFilter, setTargetFilter] = useState<string[]>([]);

  const cities = useMemo(
    () => [...new Set(COMMUNITY_MEMBERS.map((m) => m.city.split(",")[0].trim()))],
    [],
  );
  const allTargets = useMemo(
    () => [...new Set(COMMUNITY_MEMBERS.flatMap((m) => m.target))],
    [],
  );

  const filtered = COMMUNITY_MEMBERS.filter((m) => {
    if (cityFilter.length && !cityFilter.includes(m.city.split(",")[0].trim())) return false;
    if (targetFilter.length && !targetFilter.some((t) => m.target.includes(t))) return false;
    return true;
  });

  function toggleCity(c: string) {
    setCityFilter((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  function toggleTarget(t: string) {
    setTargetFilter((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary">Mira Learn</Link>
          <div className="flex gap-6 text-sm">
            <Link href="/classes" className="text-foreground hover:text-primary">Catalogue</Link>
            <Link href="/login" className="text-foreground hover:text-primary">Se connecter</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Communauté</p>
        <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
          La communauté{" "}
          <span className="italic text-primary">Mira.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Les apprenants qui acceptent d'être visibles partagent leur ville et leurs skills cibles.{" "}
          {filtered.length} nomades affichés.
        </p>
      </section>

      {/* Filtres */}
      <div className="sticky top-[57px] z-10 border-b border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => toggleCity(c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  cityFilter.includes(c)
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTargets.map((t) => (
              <button
                key={t}
                onClick={() => toggleTarget(t)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  targetFilter.includes(t)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {(cityFilter.length > 0 || targetFilter.length > 0) && (
            <button
              onClick={() => { setCityFilter([]); setTargetFilter([]); }}
              className="text-xs font-semibold text-primary hover:opacity-70"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-6 py-10 pb-24">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>Pas de nomades visibles avec ces filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => (
              <article
                key={member.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
              >
                {/* Identité */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-beige-deep font-bold text-foreground">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      {member.completed && (
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">
                          Mira graduate
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.city} · {member.since}
                    </p>
                  </div>
                </div>

                {/* Skills cibles */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cible</p>
                  {member.target.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">Pas encore de skill déclarée</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {member.target.map((t) => (
                        <SkillChip key={t} label={t} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills validées */}
                {member.validated.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Validée</p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.validated.map((t) => (
                        <SkillChip key={t} label={t} validated />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
