import { cn } from "@/lib/utils";

interface Props {
  pattern: string | null;
  className?: string;
}

export function PatternBadge({ pattern, className }: Props) {
  if (!pattern) return null;
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-600 p-4",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">
        Pattern to Memorise
      </p>
      <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
        {pattern}
      </p>
    </div>
  );
}
