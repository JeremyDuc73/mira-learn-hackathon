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
  },
  {
    slug: "ui-design-saas-b2b",
    title: "UI Design pour SaaS B2B",
    mentorName: "Marie Dupont",
    format: "live virtuel",
    durationWeeks: 4,
    skills: ["UI Design"],
    priceEur: 60,
  },
  {
    slug: "growth-b2b-go-to-market",
    title: "Growth B2B go-to-market",
    mentorName: "David Cohen",
    format: "live virtuel",
    durationWeeks: 8,
    skills: ["Growth", "B2B"],
    priceEur: 49,
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
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/classes">
              <Button variant="primary">Découvrir les classes</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl">
          Apprends en voyageant.
          <br />
          <span className="text-primary">
            Avec des mentors qui ont fait le chemin.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Mira Learn t'aide à acquérir les skills dont tu as besoin auprès de
          mentors validés, en présentiel ou en virtuel.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/classes">
            <Button variant="primary" className="px-8 text-base">
              Découvrir les classes
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-8 text-base">
              Devenir mentor
            </Button>
          </Link>
        </div>

        {/* Photo hero placeholder */}
        <div className="mt-12 aspect-video w-full rounded-xl bg-beige-deep" />
      </section>

      {/* Classes featured */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-bold text-foreground">
          Classes featured
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURED_CLASSES.map((c) => (
            <ClassCard key={c.slug} {...c} />
          ))}
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
