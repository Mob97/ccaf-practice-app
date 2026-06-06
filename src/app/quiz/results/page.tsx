"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { getById, getAll } from "@/lib/questions";
import { useProgress } from "@/hooks/useProgress";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { NoteEditor } from "@/components/NoteEditor";
import { FlagButton } from "@/components/FlagButton";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/types/question";

function QuizResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addQuizResult, flag, note, isFlagged, getNote } = useProgress();

  const answersParam = searchParams.get("answers") ?? "{}";
  const questionsParam = searchParams.get("questions") ?? "[]";
  const timed = searchParams.get("timed") === "true";
  const durationMinutes = parseInt(searchParams.get("duration") ?? "30", 10);

  const answers: Record<string, string> = useMemo(() => {
    try { return JSON.parse(decodeURIComponent(answersParam)); } catch { return {}; }
  }, [answersParam]);

  const questionIds: string[] = useMemo(() => {
    try { return JSON.parse(decodeURIComponent(questionsParam)); } catch { return []; }
  }, [questionsParam]);

  const questions = useMemo(() =>
    questionIds.map((id) => getById(id)).filter(Boolean) as ReturnType<typeof getById>[],
  [questionIds]);

  const score = useMemo(() =>
    (questions ?? []).filter((q) => {
      if (!q) return false;
      const correct = q.options.find((o) => o.correct)?.letter;
      return answers[q.id] === correct;
    }).length,
  [questions, answers]);

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Domain breakdown
  const domainStats = useMemo(() => {
    return DOMAINS.map((domain) => {
      const dqs = (questions ?? []).filter((q) => q?.domain === domain);
      if (dqs.length === 0) return null;
      const correct = dqs.filter((q) => {
        if (!q) return false;
        return answers[q.id] === q.options.find((o) => o.correct)?.letter;
      }).length;
      return { domain, correct, total: dqs.length };
    }).filter(Boolean) as { domain: string; correct: number; total: number }[];
  }, [questions, answers]);

  const wrongQuestions = useMemo(() =>
    (questions ?? []).filter((q) => {
      if (!q) return false;
      const correct = q.options.find((o) => o.correct)?.letter;
      return answers[q.id] !== correct;
    }),
  [questions, answers]);

  // Save quiz result once on mount
  useEffect(() => {
    if (questionIds.length === 0) return;
    const domains = Array.from(new Set((questions ?? []).map((q) => q?.domain).filter(Boolean)));
    addQuizResult({
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
      domains: domains as string[],
      score,
      total: questions.length,
      answers,
      timed,
      duration: timed ? durationMinutes * 60 : null,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (questionIds.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">No quiz results found.</p>
        <button onClick={() => router.push("/quiz")} className="text-primary hover:underline">
          Start a quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Score hero */}
      <div className="rounded-2xl border-2 border-border bg-card p-8 text-center space-y-2">
        <p className="text-5xl font-bold">{pct}%</p>
        <p className="text-xl font-semibold">{score} / {questions.length} correct</p>
        <p className={`text-sm font-medium ${pct >= 72 ? "text-green-600" : "text-red-500"}`}>
          {pct >= 72 ? "🎉 Passing score!" : "📚 Keep studying — target is 72%"}
        </p>
      </div>

      {/* Domain breakdown */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold">By Domain</h2>
        {domainStats.map(({ domain, correct, total }) => (
          <div key={domain} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{domain.split(" ")[0]}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${correct / total >= 0.72 ? "bg-green-500" : "bg-red-400"}`}
                style={{ width: `${(correct / total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium w-12 text-right">{correct}/{total}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/quiz")}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          New Quiz
        </button>
        <button
          onClick={() => router.push("/practice")}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Practice Wrong Answers
        </button>
      </div>

      {/* Wrong answers review */}
      {wrongQuestions.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">
            Review Wrong Answers ({wrongQuestions.length})
          </h2>
          {wrongQuestions.map((q) => {
            if (!q) return null;
            const selectedLetter = answers[q.id] ?? "";
            return (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{q.id}</Badge>
                      <span className="text-xs text-muted-foreground">{q.domain}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{q.text}</p>
                  </div>
                  <FlagButton flagged={isFlagged(q.id)} onClick={() => flag(q.id)} />
                </div>
                <ExplanationPanel
                  options={q.options}
                  selectedLetter={selectedLetter}
                  pattern={q.pattern}
                />
                <NoteEditor
                  questionId={q.id}
                  initialNote={getNote(q.id)}
                  onSave={(text) => note(q.id, text)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading results…</div>}>
      <QuizResults />
    </Suspense>
  );
}
