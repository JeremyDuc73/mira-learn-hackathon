import Link from "next/link";

import { cn } from "@/lib/utils";
import { SkillChip } from "@/components/SkillChip";

interface ClassCardProps {
  slug: string;
  title: string;
  mentorName: string;
  format: string;
  durationWeeks: number;
  skills: readonly string[];
  priceEur: number;
  className?: string;
}

export function ClassCard({
  slug,
  title,
  mentorName,
  format,
  durationWeeks,
  skills,
  priceEur,
  className,
}: ClassCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div className="aspect-video bg-beige-deep" />

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-base font-semibold leading-snug text-foreground">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground">
          {mentorName} · {format} · {durationWeeks} sem.
        </p>

        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <SkillChip key={s} label={s} />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-foreground">{priceEur} €</span>
          <Link
            href={`/classes/${slug}`}
            className="text-sm font-semibold text-primary hover:opacity-70"
          >
            Découvrir →
          </Link>
        </div>
      </div>
    </div>
  );
}
