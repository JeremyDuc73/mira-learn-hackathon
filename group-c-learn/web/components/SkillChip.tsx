import { cn } from "@/lib/utils";

interface SkillChipProps {
  label: string;
  validated?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function SkillChip({ label, validated = false, removable = false, onRemove, className }: SkillChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-foreground",
        validated ? "bg-sage-soft" : "bg-beige-deep",
        className,
      )}
    >
      {validated && <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />}
      {label}
      {removable && (
        <button
          onClick={onRemove}
          aria-label={`Retirer ${label}`}
          className="ml-1 hover:text-primary"
        >
          ×
        </button>
      )}
    </span>
  );
}
