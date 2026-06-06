"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAll, filterByDomains, shuffle } from "@/lib/questions";
import { useProgress } from "@/hooks/useProgress";
import { DomainFilter } from "@/components/DomainFilter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";

type Filter = "all" | "unanswered" | "flagged" | "wrong";

const DOMAIN_SHORT: Record<string, string> = {
  "Agentic Architecture & Orchestration": "Agentic",
  "Conversational AI & Context Management": "Conv. AI",
  "Customer Support Orchestration": "Cust. Support",
  "Structured Data Extraction": "Data Extraction",
};

export default function PracticePage() {
  const router = useRouter();
  const { data, isFlagged } = useProgress();
  const [domains, setDomains] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const all = getAll();

  const filtered = useMemo(() => {
    let questions = filterByDomains(domains);
    if (filter === "unanswered") questions = questions.filter((q) => !data.answered[q.id]);
    if (filter === "flagged") questions = questions.filter((q) => isFlagged(q.id));
    if (filter === "wrong") {
      questions = questions.filter((q) => {
        const answered = data.answered[q.id];
        if (!answered) return false;
        const correct = q.options.find((o) => o.correct)?.letter;
        return answered !== correct;
      });
    }
    return questions;
  }, [domains, filter, data, isFlagged]);

  const domainCounts = useMemo(() => {
    const map: Record<string, number> = {};
    all.forEach((q) => {
      map[q.domain] = (map[q.domain] ?? 0) + 1;
    });
    return map;
  }, [all]);

  function goToQuestion(q: Question) {
    router.push(`/practice/${q.id}`);
  }

  function startRandom() {
    if (filtered.length === 0) return;
    const shuffled = shuffle(filtered);
    router.push(`/practice/${shuffled[0].id}`);
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unanswered", label: "Unanswered" },
    { key: "flagged", label: "Flagged" },
    { key: "wrong", label: "Wrong answers" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice Mode</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a question or start randomly. Explanations shown immediately after answering.
        </p>
      </div>

      <DomainFilter
        selected={domains}
        onChange={setDomains}
        counts={domainCounts}
      />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} questions</p>
        <button
          onClick={startRandom}
          disabled={filtered.length === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          🔀 Random Question
        </button>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {filtered.map((q) => {
          const answered = data.answered[q.id];
          const correct = q.options.find((o) => o.correct)?.letter;
          const isCorrect = answered === correct;
          const isWrong = answered && !isCorrect;
          const flagged = isFlagged(q.id);

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(q)}
              className="w-full flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left group"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {q.numericId}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {q.condensedText ?? q.text.slice(0, 120)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{DOMAIN_SHORT[q.domain] ?? q.domain}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {flagged && <span title="Flagged" className="text-amber-500 text-sm">★</span>}
                {isCorrect && <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">✓</Badge>}
                {isWrong && <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">✗</Badge>}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No questions match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
