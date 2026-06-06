"use client";

import { cn } from "@/lib/utils";

interface Props {
  flagged: boolean;
  onClick: () => void;
  className?: string;
}

export function FlagButton({ flagged, onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      title={flagged ? "Remove flag" : "Flag for review"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        flagged
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        className
      )}
    >
      <span>{flagged ? "★" : "☆"}</span>
      <span>{flagged ? "Flagged" : "Flag"}</span>
    </button>
  );
}
