import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";
import {
  fetchClassBySlug,
  fetchSkills,
  buildSkillMap,
  resolveSkills,
  formatLabel,
  computePrice,
  formatSessionDate,
} from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  const { slug } = await params;

  const [klass, skillData] = await Promise.all([
    fetchClassBySlug(slug).catch(() => null),
    fetchSkills().catch(() => ({ items: [] })),
  ]);

  if (!klass) notFound();

  const skillMap = buildSkillMap(skillData.items);
  const skills = resolveSkills(klass.skills_taught, skillMap);
  const primarySkill = skills[0] ?? "";
  const format = formatLabel(klass.format_envisaged);
  const priceEur = computePrice(klass.recommended_price_per_hour_collective_cents, klass.total_hours);
  const mentor = klass.mentor;
  const durationWeeks = Math.round(klass.total_hours / 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold text-primary">Mira Learn</Link>
          <Link href="/classes" className="text-sm text-muted-foreground hover:text-foreground">
            ← Catalogue
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-12">
          {/* Photo */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige-deep">
            {mentor.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentor.avatar_url} alt={klass.title} className="h-full w-full object-cover" />
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                {format}
              </span>
              <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                {klass.total_hours}h
              </span>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {skills.map((s) => (
                <SkillChip key={s} label={s} validated={s === primarySkill} />
              ))}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {klass.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {klass.description.split("\n\n")[0]}
            </p>

            <div className="my-6 flex items-center gap-6 border-y border-border py-5">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">À partir de</p>
                <p className="font-serif text-3xl font-bold text-primary">{priceEur} €</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {mentor.aggregate_rating ?? "—"}/5 ({mentor.rating_count} avis)
                </p>
                <p className="text-xs text-muted-foreground">
                  {durationWeeks} sem. · {klass.total_hours}h total
                </p>
              </div>
            </div>

            <Link href={`/classes/${klass.slug ?? klass.id}/apply`}>
              <Button variant="primary" className="w-full text-base">
                Postuler à une session →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mentor */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Le mentor</p>
          <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-beige-deep font-bold text-foreground">
              {mentor.display_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{mentor.display_name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{mentor.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {mentor.aggregate_rating ?? "—"}/5 ({mentor.rating_count} avis) · {mentor.classes_given_count} Mira Classes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-10 md:grid-cols-[200px_1fr]">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">À propos</p>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-foreground">
            {klass.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      {klass.modules.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-10 md:grid-cols-[200px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Modules</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {klass.modules.length} modules · {klass.total_hours}h au total
              </p>
            </div>
            <div className="relative space-y-6">
              <div className="absolute bottom-2 left-[13px] top-2 w-0.5 bg-border" />
              {klass.modules
                .sort((a, b) => a.position - b.position)
                .map((m) => (
                  <div key={m.id} className="relative grid grid-cols-[28px_1fr] gap-5">
                    <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground bg-card text-xs font-bold text-foreground">
                      {m.position}
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{m.summary}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Sessions */}
      {klass.sessions.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-10 pb-24">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sessions disponibles</p>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  Choisis ta <span className="italic text-primary">cohorte.</span>
                </h2>
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Places limitées. {mentor.display_name.split(" ")[0]} examine chaque candidature.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {klass.sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                    <span className="rounded bg-beige-deep px-2 py-0.5 text-xs font-medium text-foreground">
                      {formatLabel(s.format_envisaged)}
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {formatSessionDate(s.starts_at)} · {s.spots_available} places dispo
                  </p>
                  <Link href={`/classes/${klass.slug ?? klass.id}/apply?session=${s.id}`}>
                    <Button variant="primary" className="w-full">Postuler →</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
