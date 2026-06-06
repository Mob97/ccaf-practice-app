"use client";

import { useState, useCallback } from "react";
import type { Question } from "@/types/question";
import { shuffle } from "@/lib/questions";

export type QuizStatus = "idle" | "active" | "submitted";

export interface QuizConfig {
  questions: Question[];
  timed: boolean;
  durationMinutes: number;
}

export interface QuizState {
  status: QuizStatus;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  startedAt: number | null;
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>({
    status: "idle",
    questions: [],
    currentIndex: 0,
    answers: {},
    flagged: new Set(),
    startedAt: null,
  });

  const startQuiz = useCallback((config: QuizConfig) => {
    const shuffled = shuffle(config.questions);
    setState({
      status: "active",
      questions: shuffled,
      currentIndex: 0,
      answers: {},
      flagged: new Set(),
      startedAt: Date.now(),
    });
  }, []);

  const selectAnswer = useCallback((questionId: string, letter: string) => {
    setState((prev) => {
      if (prev.status !== "active") return prev;
      // Don't allow re-answer
      if (prev.answers[questionId]) return prev;
      return { ...prev, answers: { ...prev.answers, [questionId]: letter } };
    });
  }, []);

  const goTo = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }));
  }, []);

  const prev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setState((prev) => {
      const flagged = new Set(prev.flagged);
      if (flagged.has(questionId)) flagged.delete(questionId);
      else flagged.add(questionId);
      return { ...prev, flagged };
    });
  }, []);

  const submitQuiz = useCallback(() => {
    setState((prev) => ({ ...prev, status: "submitted" }));
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      status: "idle",
      questions: [],
      currentIndex: 0,
      answers: {},
      flagged: new Set(),
      startedAt: null,
    });
  }, []);

  const currentQuestion = state.questions[state.currentIndex] ?? null;
  const score = state.questions.filter(
    (q) =>
      state.answers[q.id] &&
      q.options.find((o) => o.correct)?.letter === state.answers[q.id]
  ).length;

  const elapsedSeconds = state.startedAt
    ? Math.floor((Date.now() - state.startedAt) / 1000)
    : 0;

  return {
    ...state,
    currentQuestion,
    score,
    elapsedSeconds,
    startQuiz,
    selectAnswer,
    goTo,
    next,
    prev,
    toggleFlag,
    submitQuiz,
    resetQuiz,
  };
}
