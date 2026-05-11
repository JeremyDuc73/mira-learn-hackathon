import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getClassBySlug, MENTORS } from "@/lib/mock-data";
import type { PathStep } from "@/types";

const PATH_STEPS: PathStep[] = [
  {
    idx: 1,
    status: "in_progress",
    skill: "Pitch investor",
    classSlug: "pitcher-pour-lever-500k",
    rationale: "Class flagship d'Antoine pour valider la skill pitch. Tu as déjà postulé (en attente de réponse depuis 2 j).",
    applied: true,
  },
  {
    idx: 2,
    status: "locked",
    skill: "Funding strategy",
    classSlug: "pitcher-pour-lever-500k",
    rationale: "La même class couvre aussi funding strategy. Étape débloquée quand l'étape 1 est validée (QCM mobile + projet final).",
    applied: false,
  },
];

function StepDot({ status }: { status: PathStep["status"] }) {
  if (status === "completed")
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
  return (
    <div className="flex gap-12">
      {/* Sidebar */}
      <nav className="hidden w-44 flex-shrink-0 md:block">
        <ul className="space-y-1 text-sm">
          {[
            { href: "/me", label: "Mon profil" },
            { href: "/me/path", label: "Mon parcours" },
            { href: "/me/path/generate", label: "Générer" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-2 font-medium text-foreground hover:bg-beige-deep"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenu */}
      <div className="flex-1 min-w-0 max-w-2xl pb-24">
        {/* Header */}
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Généré par Mira AI
            </p>
            <h1 className="font-serif text-4xl font-bold text-foreground">Mon parcours.</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Pitch + Funding · estimé 6 mois · ~80 € total
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
            <span><span className="font-semibold text-foreground">0</span> / {PATH_STEPS.length} étapes validées</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full w-[15%] rounded-full bg-gradient-to-r from-primary to-primary/60" />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {PATH_STEPS.map((step, i) => {
            const klass = getClassBySlug(step.classSlug);
            const mentor = klass ? MENTORS[klass.mentorId] : null;
            const isLast = i === PATH_STEPS.length - 1;
            const isLocked = step.status === "locked";

            return (
              <div key={step.idx} className={`relative pl-14 ${isLast ? "" : "pb-12"}`}>
                {/* Ligne verticale */}
                {!isLast && (
                  <div className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-border" />
                )}
                {/* Dot */}
                <div className="absolute left-2 top-1.5">
                  <StepDot status={step.status} />
                </div>

                {/* Labels */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-widest ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                    Étape {step.idx}
                  </span>
                  {step.status === "in_progress" && (
                    <span className="rounded-full bg-sage-soft px-3 py-0.5 text-xs font-medium text-foreground">En cours</span>
                  )}
                  {isLocked && (
                    <span className="rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground">Verrouillée</span>
                  )}
                </div>

                <h3 className={`font-serif text-2xl font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                  Maîtriser : {step.skill}
                </h3>

                <p className="mt-2 mb-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  « {step.rationale} »
                </p>

                {/* Card class */}
                {klass && mentor && (
                  <div className={`flex max-w-xl items-center gap-4 overflow-hidden rounded-xl border border-border p-4 ${isLocked ? "opacity-50" : "bg-card"}`}>
                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-beige-deep">
                      {klass.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={klass.photo} alt={klass.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{klass.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {mentor.name} ·{" "}
                        <span className={isLocked ? "text-muted-foreground" : "font-semibold text-primary"}>
                          {klass.priceEur} €
                        </span>
                        {step.applied && (
                          <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">
                            Candidaté
                          </span>
                        )}
                      </p>
                    </div>
                    {!isLocked && (
                      <Link href={`/classes/${klass.slug}`}>
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
          Cette recommandation est issue de Mira AI · dernière mise à jour il y a 2 j.
          <Link href="/me/path/generate" className="ml-auto text-xs font-semibold text-primary hover:opacity-70">
            Donner du feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
