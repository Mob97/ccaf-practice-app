"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { filterByDomains, getAll } from "@/lib/questions";
import { DomainFilter } from "@/components/DomainFilter";

const COUNT_OPTIONS = [10, 15, 30, 60] as const;
const DURATION_OPTIONS = [15, 30, 45] as const;

export default function QuizConfigPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<string[]>([]);
  const [count, setCount] = useState<number>(15);
  const [timed, setTimed] = useState(false);
  const [duration, setDuration] = useState(30);

  const all = getAll();
  const available = filterByDomains(domains);
  const actualCount = Math.min(count, available.length);

  function startQuiz() {
    const params = new URLSearchParams({
      domains: domains.join(","),
      count: String(actualCount),
      timed: String(timed),
      duration: String(duration),
    });
    router.push(`/quiz/session?${params.toString()}`);
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Quiz Setup</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your quiz session. No explanations shown until you submit.
        </p>
      </div>

      {/* Domain selection */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Domains (leave empty for all)
        </h2>
        <DomainFilter selected={domains} onChange={setDomains} />
        <p className="text-xs text-muted-foreground">
          {available.length} questions available
        </p>
      </section>

      {/* Count */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Number of questions
        </h2>
        <div className="flex gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                count === n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {n === 60 ? "All" : n}
            </button>
          ))}
        </div>
      </section>

      {/* Timed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Timed quiz
          </h2>
          <button
            onClick={() => setTimed((t) => !t)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              timed ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                timed ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
        {timed && (
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  duration === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Start button */}
      <button
        onClick={startQuiz}
        disabled={actualCount === 0}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Start {actualCount}-Question Quiz{timed ? ` (${duration} min)` : ""}
      </button>
    </div>
  );
}
