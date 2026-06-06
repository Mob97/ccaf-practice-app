"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { getAll, getDomainsWithCounts } from "@/lib/questions";
import { ProgressRing } from "@/components/ProgressRing";
import { DOMAINS } from "@/types/question";

const DOMAIN_COLORS: Record<string, string> = {
  "Agentic Architecture & Orchestration": "#8b5cf6",
  "Conversational AI & Context Management": "#3b82f6",
  "Customer Support Orchestration": "#22c55e",
  "Structured Data Extraction": "#f97316",
};

const DOMAIN_SHORT: Record<string, string> = {
  "Agentic Architecture & Orchestration": "Agentic",
  "Conversational AI & Context Management": "Conv. AI",
  "Customer Support Orchestration": "Cust. Support",
  "Structured Data Extraction": "Data Extraction",
};

export default function HomePage() {
  const { data, answeredCount } = useProgress();
  const all = getAll();
  const domainCounts = getDomainsWithCounts();

  function domainAnsweredCount(domain: string) {
    const ids = all.filter((q) => q.domain === domain).map((q) => q.id);
    return ids.filter((id) => data.answered[id]).length;
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CCAF Practice</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Master the Claude Certified AI Fundamentals exam with 60 scenario-based questions across 4 domains.
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Your Progress</h2>
          <span className="text-sm text-muted-foreground">
            {answeredCount} / {all.length} answered
          </span>
        </div>
        <div className="flex justify-around flex-wrap gap-6">
          {DOMAINS.map((domain) => {
            const total = domainCounts.find((d) => d.domain === domain)?.count ?? 0;
            const answered = domainAnsweredCount(domain);
            return (
              <ProgressRing
                key={domain}
                answered={answered}
                total={total}
                label={DOMAIN_SHORT[domain] ?? domain}
                color={DOMAIN_COLORS[domain] ?? "#8b5cf6"}
                size={90}
              />
            );
          })}
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/practice"
          className="group rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-md p-6 transition-all space-y-3"
        >
          <div className="text-3xl">📖</div>
          <div>
            <h3 className="font-semibold text-lg">Practice Mode</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Study at your own pace. See explanations and patterns immediately after each answer.
            </p>
          </div>
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            Start practicing →
          </span>
        </Link>

        <Link
          href="/quiz"
          className="group rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-md p-6 transition-all space-y-3"
        >
          <div className="text-3xl">⏱</div>
          <div>
            <h3 className="font-semibold text-lg">Quiz Mode</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Test yourself with a scored quiz. Optionally timed. Explanations shown after submission.
            </p>
          </div>
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            Take a quiz →
          </span>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-2xl font-bold">{all.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Questions</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-2xl font-bold">{data.flagged.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Flagged</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-2xl font-bold">{data.quizHistory.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Quizzes Taken</p>
        </div>
      </div>
    </div>
  );
}
