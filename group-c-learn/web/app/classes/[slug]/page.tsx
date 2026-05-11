import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";
import { getClassBySlug, MENTORS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  const { slug } = await params;
  const klass = getClassBySlug(slug);
  if (!klass) notFound();

  const mentor = MENTORS[klass.mentorId];

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
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
          {/* Photo */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige-deep">
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                {klass.format}
              </span>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                {klass.durationWeeks} sem.
              </span>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {klass.skills.map((s) => (
                <SkillChip key={s} label={s} validated={s === klass.primarySkill} />
              ))}
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {klass.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{klass.subtitle}</p>

            <div className="my-6 flex items-center gap-6 border-y border-border py-5">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">À partir de</p>
                <p className="font-serif text-3xl font-bold text-primary">{klass.priceEur} €</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  ★ {klass.rating} ({klass.reviews} avis)
                </p>
                <p className="text-xs text-muted-foreground">par cohorte de {klass.cohortSize}</p>
              </div>
            </div>

            <Link href={`/classes/${klass.slug}/apply`}>
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
              {mentor.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{mentor.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{mentor.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                ★ {mentor.rating} ({mentor.reviews} avis) · {mentor.classCount} Mira Classes
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
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-10 md:grid-cols-[200px_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Modules</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {klass.modules.length} modules · {klass.modules.reduce((a, m) => a + parseInt(m.dur), 0)}h au total
            </p>
          </div>
          <div className="relative space-y-6">
            <div className="absolute bottom-2 left-[13px] top-2 w-0.5 bg-border" />
            {klass.modules.map((m) => (
              <div key={m.n} className="relative grid grid-cols-[28px_1fr] gap-5">
                <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-foreground bg-card text-xs font-bold text-foreground">
                  {m.n}
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                    <span className="text-xs text-muted-foreground">{m.dur}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sessions */}
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
              Places limitées (max {klass.cohortSize} par cohorte). {mentor.name.split(" ")[0]} examine chaque candidature.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {klass.sessions.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <span>{s.mode === "physical" ? "📍" : "🌐"}</span>
                  <span>{s.location}</span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {s.dates} · {s.seats - s.enrolled} places dispo sur {s.seats}
                </p>
                <Link href={`/classes/${klass.slug}/apply?session=${s.id}`}>
                  <Button variant="primary" className="w-full">Postuler →</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
