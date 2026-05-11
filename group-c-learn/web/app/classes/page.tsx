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
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    setFiltersOpen(false);
  }

  const activeFilters = skillFilter.length + formatFilter.length + (maxPrice < 200 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3 md:px-6 md:py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-lg font-bold text-primary md:text-xl">
            Mira Learn
          </Link>
          <div className="flex items-center gap-3 text-sm md:gap-6">
            <Link href="/community" className="hidden text-foreground hover:text-primary md:block">
              Communauté
            </Link>
            <Link href="/login" className="text-foreground hover:text-primary">
              Se connecter
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:mb-3">
          Catalogue
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-5xl">
          {CLASSES.length} Mira Classes,{" "}
          <span className="italic text-primary">animées par des mentors validés.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:mt-4 md:text-base">
          Filtres par skill, catégorie, format. Chaque class est conçue avec un livrable concret à la sortie.
        </p>
      </section>

      {/* Barre de filtres sticky — desktop */}
      <div className="sticky top-[53px] z-10 border-b border-border bg-background md:top-[57px]">
        {/* Desktop : une ligne compacte */}
        <div className="mx-auto hidden max-w-6xl flex-wrap items-center gap-3 px-6 py-3 md:flex">
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  skillFilter.includes(s)
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-2">
            {ALL_FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFormat(f)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  formatFilter.includes(f)
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-beige-deep"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1">
            <span className="whitespace-nowrap text-xs font-medium text-foreground">Prix max</span>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-20 accent-primary"
            />
            <span className="min-w-[40px] text-right text-xs font-semibold text-foreground">{maxPrice} €</span>
          </div>
          {activeFilters > 0 && (
            <button onClick={reset} className="text-xs font-semibold text-primary hover:opacity-70">
              Réinitialiser ({activeFilters})
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Mobile : barre condensée + panel dépliable */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                activeFilters > 0
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              Filtres
              {activeFilters > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </span>
          </div>

          {filtersOpen && (
            <div className="border-t border-border px-4 py-4 space-y-4">
              {/* Skills */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        skillFilter.includes(s)
                          ? "border-foreground bg-foreground text-primary-foreground"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format</p>
                <div className="flex gap-2">
                  {ALL_FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFormat(f)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        formatFilter.includes(f)
                          ? "border-foreground bg-foreground text-primary-foreground"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prix max : <span className="font-bold text-foreground">{maxPrice} €</span>
                </p>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button onClick={reset} className="text-xs font-semibold text-primary">
                  Réinitialiser
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Voir les résultats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-4 py-6 pb-20 md:px-6 md:py-10 md:pb-24">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground md:py-20">
            <p className="text-base">Pas de class qui matche. Élargis tes filtres.</p>
            <button onClick={reset} className="mt-4 text-sm font-semibold text-primary hover:opacity-70">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
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
