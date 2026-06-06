"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";
import { getAll, filterByDomains } from "@/lib/questions";
import { ProgressRing } from "@/components/ProgressRing";
import { DOMAINS } from "@/types/question";

const DOMAIN_COLORS: Record<string, string> = {
  "Agentic Architecture & Orchestration": "#8b5cf6",
  "Conversational AI & Context Management": "#3b82f6",
  "Customer Support Orchestration": "#22c55e",
  "Structured Data Extraction": "#f97316",
};

export default function ProgressPage() {
  const { data, reset } = useProgress();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  const all = getAll();

  function domainStats(domain: string) {
    const questions = filterByDomains([domain]);
    const answered = questions.filter((q) => data.answered[q.id]).length;
    const correct = questions.filter((q) => {
      const a = data.answered[q.id];
      if (!a) return false;
      return a === q.options.find((o) => o.correct)?.letter;
    }).length;
    return { total: questions.length, answered, correct };
  }

  function handleReset() {
    if (confirmReset) {
      reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  }

  const totalAnswered = Object.keys(data.answered).length;
  const totalCorrect = all.filter((q) => {
    const a = data.answered[q.id];
    return a && a === q.options.find((o) => o.correct)?.letter;
  }).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalAnswered} / {all.length} questions answered ·{" "}
            {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}% correct
          </p>
        </div>
        <button
          onClick={handleReset}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            confirmReset
              ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {confirmReset ? "Confirm Reset" : "Reset Progress"}
        </button>
      </div>

      {/* Domain rings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-6">By Domain</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {DOMAINS.map((domain) => {
            const { total, answered, correct } = domainStats(domain);
            return (
              <div key={domain} className="space-y-3">
                <ProgressRing
                  answered={answered}
                  total={total}
                  label={domain.split(" ")[0]}
                  color={DOMAIN_COLORS[domain] ?? "#8b5cf6"}
                  size={90}
                />
                <div className="text-center text-xs text-muted-foreground">
                  <p>{correct} correct</p>
                  <button
                    onClick={() => router.push(`/practice?domain=${encodeURIComponent(domain)}`)}
                    className="text-primary hover:underline mt-1"
                  >
                    Practice →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged questions */}
      {data.flagged.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Flagged Questions ({data.flagged.length})</h2>
            <button
              onClick={() => router.push("/practice?filter=flagged")}
              className="text-xs text-primary hover:underline"
            >
              Practice flagged →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.flagged.map((id) => (
              <button
                key={id}
                onClick={() => router.push(`/practice/${id}`)}
                className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors"
              >
                ★ {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz history */}
      {data.quizHistory.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Quiz History</h2>
          <div className="space-y-2">
            {data.quizHistory.slice(0, 10).map((quiz) => {
              const pct = Math.round((quiz.score / quiz.total) * 100);
              return (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{quiz.score}/{quiz.total} correct</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quiz.date).toLocaleDateString()} ·{" "}
                      {quiz.timed ? `${Math.round((quiz.duration ?? 0) / 60)}min timed` : "untimed"}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${pct >= 72 ? "text-green-600" : "text-red-500"}`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalAnswered === 0 && data.quizHistory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground space-y-3">
          <p>No activity yet.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/practice")}
              className="text-primary hover:underline text-sm"
            >
              Start practicing →
            </button>
            <button
              onClick={() => router.push("/quiz")}
              className="text-primary hover:underline text-sm"
            >
              Take a quiz →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
