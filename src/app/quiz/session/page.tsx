"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { filterByDomains, shuffle } from "@/lib/questions";
import { useQuiz } from "@/hooks/useQuiz";
import { useTimer } from "@/hooks/useTimer";
import { OptionButton } from "@/components/OptionButton";
import { FlagButton } from "@/components/FlagButton";
import { Timer } from "@/components/Timer";
import { Progress } from "@/components/ui/progress";

function QuizSession() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const domainsParam = searchParams.get("domains") ?? "";
  const count = parseInt(searchParams.get("count") ?? "15", 10);
  const timed = searchParams.get("timed") === "true";
  const durationMinutes = parseInt(searchParams.get("duration") ?? "30", 10);

  const quiz = useQuiz();

  const handleSubmit = useCallback(() => {
    quiz.submitQuiz();
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/quiz/results?${params.toString()}&answers=${encodeURIComponent(JSON.stringify(quiz.answers))}&questions=${encodeURIComponent(JSON.stringify(quiz.questions.map((q) => q.id)))}`);
  }, [quiz, router, searchParams]);

  const timer = useTimer(durationMinutes * 60, handleSubmit, timed);

  // Initialize quiz on mount
  useEffect(() => {
    if (quiz.status !== "idle") return;
    const domains = domainsParam ? domainsParam.split(",").filter(Boolean) : [];
    const questions = shuffle(filterByDomains(domains)).slice(0, count);
    if (questions.length === 0) {
      router.replace("/quiz");
      return;
    }
    quiz.startQuiz({ questions, timed, durationMinutes });
    if (timed) timer.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (quiz.status === "idle" || !quiz.currentQuestion) {
    return (
      <div className="text-center py-20 text-muted-foreground">Loading quiz…</div>
    );
  }

  const q = quiz.currentQuestion;
  const selectedLetter = quiz.answers[q.id] ?? null;
  const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;
  const isFlagged = quiz.flagged.has(q.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {quiz.currentIndex + 1} / {quiz.questions.length}
          </span>
          <Progress value={progress} className="w-32 h-2" />
        </div>
        <div className="flex items-center gap-2">
          {timed && <Timer display={timer.display} pct={timer.pct} />}
          <FlagButton flagged={isFlagged} onClick={() => quiz.toggleFlag(q.id)} />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Q{quiz.currentIndex + 1} · {q.domain}
        </p>
        <p className="text-sm leading-relaxed">{q.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt) => (
          <OptionButton
            key={opt.letter}
            letter={opt.letter}
            text={opt.text}
            state={
              selectedLetter === opt.letter ? "selected" : "default"
            }
            onClick={() => quiz.selectAnswer(q.id, opt.letter)}
            disabled={!!selectedLetter}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={quiz.prev}
          disabled={quiz.currentIndex === 0}
          className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
        >
          ← Previous
        </button>

        {quiz.currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={quiz.next}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Answered counter */}
      <p className="text-center text-xs text-muted-foreground">
        {Object.keys(quiz.answers).length} / {quiz.questions.length} answered
        {quiz.flagged.size > 0 && ` · ${quiz.flagged.size} flagged`}
      </p>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading…</div>}>
      <QuizSession />
    </Suspense>
  );
}
