"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import { fetchCommunityLearners, type ApiLearner } from "@/lib/api";

export default function CommunityPage() {
  const [members, setMembers] = useState<ApiLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchCommunityLearners()
      .then((data) => setMembers(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(
    () => [...new Set(members.map((m) => m.current_country).filter(Boolean) as string[])],
    [members],
  );

  const filtered = members.filter((m) => {
    if (countryFilter.length && !countryFilter.includes(m.current_country ?? "")) return false;
    return true;
  });

  function toggleCountry(c: string) {
    setCountryFilter((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
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
          Les apprenants qui acceptent d'être visibles partagent leur pays et leurs destinations.{" "}
          {loading ? "..." : filtered.length} nomades affichés.
        </p>
      </section>

      {/* Filtres */}
      {countries.length > 0 && (
        <div className="sticky top-[57px] z-10 border-b border-border bg-background px-6 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    countryFilter.includes(c)
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-beige-deep"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {countryFilter.length > 0 && (
              <button
                onClick={() => setCountryFilter([])}
                className="text-xs font-semibold text-primary hover:opacity-70"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-6 py-10 pb-24">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-sm">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>Pas de nomades visibles avec ces filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => (
              <article
                key={member.profile_id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-beige-deep font-bold text-foreground">
                    {member.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{member.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.current_country ?? "Nomade"}
                    </p>
                  </div>
                </div>

                {member.headline && (
                  <p className="text-xs leading-relaxed text-muted-foreground">{member.headline}</p>
                )}

                {member.preferred_destinations.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Destinations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.preferred_destinations.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-beige-deep px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {d}
                        </span>
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
