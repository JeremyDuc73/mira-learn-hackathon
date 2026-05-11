"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import { ClassCard } from "@/components/ClassCard";
import {
  fetchClasses,
  fetchSkills,
  buildSkillMap,
  resolveSkills,
  formatLabel,
  computePrice,
  type ApiClassItem,
} from "@/lib/api";

const ALL_FORMATS = ["Physique", "Virtuel", "Hybride"] as const;

interface DisplayClass {
  slug: string;
  title: string;
  mentorName: string;
  format: string;
  totalHours: number;
  skills: string[];
  priceEur: number;
  photo?: string;
}

function toDisplay(c: ApiClassItem, skillMap: Map<string, string>): DisplayClass {
  return {
    slug: c.slug ?? c.id,
    title: c.title,
    mentorName: c.mentor_display_name,
    format: formatLabel(c.format_envisaged),
    totalHours: c.total_hours,
    skills: resolveSkills(c.skills_taught, skillMap),
    priceEur: computePrice(c.recommended_price_per_hour_collective_cents, c.total_hours),
    photo: c.mentor_avatar_url ?? undefined,
  };
}

export default function CataloguePage() {
  const [classes, setClasses] = useState<DisplayClass[]>([]);
  const [loading, setLoading] = useState(true);

  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchClasses(), fetchSkills()])
      .then(([classData, skillData]) => {
        const map = buildSkillMap(skillData.items);
        setClasses(classData.items.map((c) => toDisplay(c, map)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return [...set];
  }, [classes]);

  const maxPossiblePrice = useMemo(() => {
    if (classes.length === 0) return 500;
    return Math.max(...classes.map((c) => c.priceEur), 500);
  }, [classes]);

  const filtered = classes.filter((c) => {
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
    setMaxPrice(maxPossiblePrice);
    setFiltersOpen(false);
  }

  const activeFilters = skillFilter.length + formatFilter.length + (maxPrice < maxPossiblePrice ? 1 : 0);

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
          {loading ? "..." : classes.length} Mira Classes,{" "}
          <span className="italic text-primary">animées par des mentors validés.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:mt-4 md:text-base">
          Filtres par skill, format. Chaque class est conçue avec un livrable concret à la sortie.
        </p>
      </section>

      {/* Filtres sticky — desktop */}
      <div className="sticky top-[53px] z-10 border-b border-border bg-background md:top-[57px]">
        {/* Desktop */}
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
          {allSkills.length > 0 && <div className="h-4 w-px bg-border" />}
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
              max={maxPossiblePrice}
              step={10}
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

        {/* Mobile */}
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
            <div className="space-y-4 border-t border-border px-4 py-4">
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
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prix max : <span className="font-bold text-foreground">{maxPrice} €</span>
                </p>
                <input
                  type="range"
                  min={0}
                  max={maxPossiblePrice}
                  step={10}
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
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-sm">Chargement des classes...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                mentorName={c.mentorName}
                format={c.format}
                durationWeeks={Math.round(c.totalHours / 3)}
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
