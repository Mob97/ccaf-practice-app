"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getById, getAll } from "@/lib/questions";
import { useProgress } from "@/hooks/useProgress";
import { OptionButton } from "@/components/OptionButton";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { FlagButton } from "@/components/FlagButton";
import { NoteEditor } from "@/components/NoteEditor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PracticeQuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const router = useRouter();
  const { answer, flag, note, isFlagged, getNote, getAnswer, data } = useProgress();

  const question = getById(questionId);
  const all = getAll();
  const currentIndex = all.findIndex((q) => q.id === questionId);

  const [selected, setSelected] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  // Restore prior answer
  useEffect(() => {
    const prior = getAnswer(questionId);
    setSelected(prior);
    setShowFull(false);
  }, [questionId, getAnswer]);

  const handleSelect = useCallback(
    (letter: string) => {
      if (selected) return; // already answered
      setSelected(letter);
      answer(questionId, letter);
    },
    [selected, questionId, answer]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        handleSelect(key);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function goNext() {
    if (currentIndex < all.length - 1) {
      router.push(`/practice/${all[currentIndex + 1].id}`);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      router.push(`/practice/${all[currentIndex - 1].id}`);
    }
  }

  if (!question) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Question not found.
      </div>
    );
  }

  const correctLetter = question.options.find((o) => o.correct)?.letter;

  function getOptionState(letter: string) {
    if (!selected) return "default";
    if (letter === correctLetter && selected) return "correct";
    if (letter === selected && letter !== correctLetter) return "wrong";
    return "default";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/practice")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Practice
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{question.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{question.domain}</Badge>
          <FlagButton flagged={isFlagged(questionId)} onClick={() => flag(questionId)} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{currentIndex + 1} / {all.length}</span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / all.length) * 100}%` }}
          />
        </div>
        <span>{Object.keys(data.answered).length} answered</span>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Scenario
            </p>
            <p className={cn("text-sm leading-relaxed", !showFull && "line-clamp-5 sm:line-clamp-none")}>
              {question.text}
            </p>
            {question.text.length > 300 && (
              <button
                onClick={() => setShowFull((v) => !v)}
                className="text-xs text-primary hover:underline sm:hidden"
              >
                {showFull ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.letter}
            letter={opt.letter}
            text={opt.text}
            state={getOptionState(opt.letter)}
            onClick={() => handleSelect(opt.letter)}
            disabled={!!selected}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      {!selected && (
        <p className="text-xs text-center text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">A</kbd>{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">B</kbd>{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">C</kbd>{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">D</kbd> to select
        </p>
      )}

      {/* Explanation */}
      {selected && (
        <ExplanationPanel
          options={question.options}
          selectedLetter={selected}
          pattern={question.pattern}
        />
      )}

      {/* Note editor */}
      {selected && (
        <NoteEditor
          questionId={questionId}
          initialNote={getNote(questionId)}
          onSave={(text) => note(questionId, text)}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="text-xs text-muted-foreground">← → to navigate</span>
        <button
          onClick={goNext}
          disabled={currentIndex === all.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
