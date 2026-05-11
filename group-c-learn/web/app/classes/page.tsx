"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { ClassCard } from "@/components/ClassCard";
import { CLASSES, MENTORS } from "@/lib/mock-data";

const ALL_FORMATS = ["Physique", "Virtuel", "Hybride"] as const;

export default function CataloguePage() {
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(200);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    CLASSES.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return [...set];
  }, []);

  const filtered = CLASSES.filter((c) => {
    if (skillFilter.length && !skillFilter.some((s) => c.skills.includes(s))) return false;
    if (formatFilter.length && !formatFilter.includes(c.format)) return false;
    if (c.priceEur > maxPrice) return false;
    return true;
  });

  function toggleSkill(s: string) {
    setSkillFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function toggleFormat(f: string) {
    setFormatFilter((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }
  function reset() {
    setSkillFilter([]);
    setFormatFilter([]);
    setMaxPrice(200);
  }

  const activeFilters = skillFilter.length + formatFilter.length + (maxPrice < 200 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary">Mira Learn</Link>
          <div className="flex gap-6 text-sm">
            <Link href="/community" className="text-foreground hover:text-primary">Communauté</Link>
            <Link href="/login" className="text-foreground hover:text-primary">Se connecter</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Catalogue</p>
        <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
          {CLASSES.length} Mira Classes,<br />
          <span className="text-primary italic">animées par des mentors validés.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Filtres par skill, catégorie, format. Chaque class est conçue avec un livrable concret à la sortie.
        </p>
      </section>

      {/* Barre de filtres sticky */}
      <div className="sticky top-[57px] z-10 border-b border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto pb-1 md:flex-wrap md:pb-0">
          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  skillFilter.includes(s)
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Formats */}
          <div className="flex gap-2">
            {ALL_FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFormat(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  formatFilter.includes(f)
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Prix */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1">
            <span className="text-xs font-medium text-foreground">Prix max</span>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-primary"
            />
            <span className="min-w-[46px] text-right text-xs font-semibold text-foreground">{maxPrice} €</span>
          </div>

          {activeFilters > 0 && (
            <button onClick={reset} className="text-xs font-semibold text-primary hover:opacity-70">
              Reset ({activeFilters})
            </button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-6 py-10 pb-24">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-base">Pas de class qui matche. Élargis tes filtres.</p>
            <button onClick={reset} className="mt-4 text-sm font-semibold text-primary hover:opacity-70">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filtered.map((c) => (
              <ClassCard
                key={c.slug}
                slug={c.slug}
                title={c.title}
                mentorName={MENTORS[c.mentorId]?.name ?? c.mentorId}
                format={c.format}
                durationWeeks={c.durationWeeks}
                skills={c.skills}
                priceEur={c.priceEur}
                photo={c.photo}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
