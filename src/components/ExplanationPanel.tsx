import type { Option } from "@/types/question";
import { PatternBadge } from "./PatternBadge";
import { cn } from "@/lib/utils";

interface Props {
  options: Option[];
  selectedLetter: string;
  pattern: string | null;
}

export function ExplanationPanel({ options, selectedLetter, pattern }: Props) {
  const correct = options.find((o) => o.correct);
  const isCorrect = selectedLetter === correct?.letter;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl p-4 border-2 font-semibold text-sm flex items-center gap-2",
          isCorrect
            ? "bg-green-50 border-green-500 text-green-800 dark:bg-green-950 dark:text-green-100"
            : "bg-red-50 border-red-500 text-red-800 dark:bg-red-950 dark:text-red-100"
        )}
      >
        <span className="text-lg">{isCorrect ? "✓" : "✗"}</span>
        {isCorrect
          ? `Correct! Option ${selectedLetter} is right.`
          : `Incorrect. You chose ${selectedLetter}; the correct answer is ${correct?.letter}.`}
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = opt.letter === selectedLetter;
          const isCorrectOpt = opt.correct;
          let borderColor = "border-muted";
          if (isCorrectOpt) borderColor = "border-green-400";
          else if (isSelected) borderColor = "border-red-400";

          return (
            <div key={opt.letter} className={cn("rounded-lg border-l-4 pl-4 py-3 bg-card", borderColor)}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                Option {opt.letter}
                {isCorrectOpt && (
                  <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                )}
                {isSelected && !isCorrectOpt && (
                  <span className="ml-2 text-red-600 dark:text-red-400">✗ Your answer</span>
                )}
              </p>
              <p className="text-sm leading-relaxed text-foreground">{opt.explain}</p>
            </div>
          );
        })}
      </div>

      {pattern && <PatternBadge pattern={pattern} />}
    </div>
  );
}
