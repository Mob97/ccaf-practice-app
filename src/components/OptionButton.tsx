"use client";

import { cn } from "@/lib/utils";

interface Props {
  letter: string;
  text: string;
  state: "default" | "selected" | "correct" | "wrong" | "missed";
  onClick?: () => void;
  disabled?: boolean;
}

const STATE_STYLES: Record<Props["state"], string> = {
  default:
    "border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 cursor-pointer",
  selected:
    "border-primary bg-primary/10 text-foreground cursor-pointer",
  correct:
    "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  wrong:
    "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  missed:
    "border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/50 dark:text-green-100 opacity-70",
};

const LETTER_STYLES: Record<Props["state"], string> = {
  default: "bg-muted text-muted-foreground",
  selected: "bg-primary text-primary-foreground",
  correct: "bg-green-500 text-white",
  wrong: "bg-red-500 text-white",
  missed: "bg-green-500/70 text-white",
};

export function OptionButton({ letter, text, state, onClick, disabled }: Props) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled && state === "default"}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
        STATE_STYLES[state],
        disabled && state === "default" && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
          LETTER_STYLES[state]
        )}
      >
        {letter}
      </span>
      <span className="text-sm leading-relaxed pt-0.5">{text}</span>
    </button>
  );
}
