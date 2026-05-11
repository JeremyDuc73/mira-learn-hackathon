import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { ClassCard } from "@/components/ClassCard";

const FEATURED_CLASSES = [
  {
    slug: "pitcher-pour-lever-500k",
    title: "Pitcher pour lever 500k €",
    mentorName: "Antoine Martin",
    format: "live hybride",
    durationWeeks: 6,
    skills: ["Pitch investor", "Funding strategy"],
    priceEur: 80,
    photo: "https://picsum.photos/seed/pitch-investor/800/450",
  },
  {
    slug: "ui-design-saas-b2b",
    title: "UI Design pour SaaS B2B",
    mentorName: "Marie Dupont",
    format: "live virtuel",
    durationWeeks: 4,
    skills: ["UI Design"],
    priceEur: 60,
    photo: "https://picsum.photos/seed/ui-design-saas/800/450",
  },
  {
    slug: "growth-b2b-go-to-market",
    title: "Growth B2B go-to-market",
    mentorName: "David Cohen",
    format: "live virtuel",
    durationWeeks: 8,
    skills: ["Growth", "B2B"],
    priceEur: 49,
    photo: "https://picsum.photos/seed/growth-b2b/800/450",
  },
] as const;

const HOW_IT_WORKS = [
  "Définis ta skill cible",
  "L'IA te crée un parcours sur mesure",
  "Tu suis les classes recommandées",
  "Tu valides la skill, tu rejoins une communauté",
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-serif text-2xl font-bold text-primary">
            Mira Learn
          </span>
          <nav className="hidden items-center gap-6 text-sm text-foreground md:flex">
            <Link href="/classes" className="hover:text-primary">
              Catalogue
            </Link>
            <Link href="/community" className="hover:text-primary">
              Communauté
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/classes">
              <Button variant="primary">Découvrir</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 text-center md:py-20">
        <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
          Apprends en voyageant.
          <br />
          <span className="text-primary">
            Avec des mentors qui ont fait le chemin.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Mira Learn t'aide à acquérir les skills dont tu as besoin auprès de
          mentors validés, en présentiel ou en virtuel.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/classes">
            <Button variant="primary" className="px-6 text-base md:px-8">
              Découvrir les classes
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 text-base md:px-8">
              Devenir mentor
            </Button>
          </Link>
        </div>

        {/* Photo hero */}
        <div className="mt-12 aspect-video w-full overflow-hidden rounded-2xl bg-beige-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/mira-nomad-hero/1200/675"
            alt="Digital nomads learning together"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Classes featured */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 font-serif text-2xl font-bold text-foreground md:text-3xl">
          Classes featured
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {FEATURED_CLASSES.map((c) => (
            <ClassCard key={c.slug} {...c} />
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-foreground py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted-soft">
            Ils ont appris avec Mira
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote: "En 6 semaines avec Antoine j'avais un deck solide. J'ai levé 600k deux mois plus tard.",
                name: "Léa B.",
                detail: "Founder SaaS · Berlin",
                initials: "LB",
              },
              {
                quote: "Le parcours IA m'a vraiment aidé à savoir par où commencer. J'avais du mal à prioriser mes skills.",
                name: "Marco S.",
                detail: "Designer · Sao Paulo",
                initials: "MS",
              },
              {
                quote: "La cohorte physique à Barcelone, c'était incroyable. Tu rencontres des gens qui ont exactement les memes défis.",
                name: "Clara K.",
                detail: "Consultant product · Prague",
                initials: "CK",
              },
            ].map((t) => (
              <div key={t.name} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="flex-1 text-base leading-relaxed text-primary-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">{t.name}</p>
                    <p className="text-xs text-muted-soft">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-10 text-2xl font-bold text-foreground">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span className="font-serif font-bold text-primary">Mira Learn</span>
          <div className="flex gap-6">
            <Link href="/classes" className="hover:text-foreground">
              Catalogue
            </Link>
            <Link href="/community" className="hover:text-foreground">
              Communauté
            </Link>
          </div>
          <span>© 2026 Hello Mira · tous droits réservés</span>
        </div>
      </footer>
    </div>
  );
}
