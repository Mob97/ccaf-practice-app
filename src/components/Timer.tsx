"use client";

import { cn } from "@/lib/utils";

interface Props {
  display: string;
  pct: number;
  className?: string;
}

export function Timer({ display, pct, className }: Props) {
  const urgent = pct < 25;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-colors",
        urgent
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          : "bg-muted text-foreground",
        className
      )}
    >
      <span>{urgent ? "⏱" : "🕐"}</span>
      <span>{display}</span>
    </div>
  );
}
