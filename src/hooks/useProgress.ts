"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProgress,
  markAnswered,
  toggleFlag,
  setNote,
  saveQuizResult,
  resetProgress,
  type ProgressData,
  type QuizResult,
} from "@/lib/progress";

export function useProgress() {
  const [data, setData] = useState<ProgressData>({
    answered: {},
    flagged: [],
    notes: {},
    quizHistory: [],
  });

  useEffect(() => {
    setData(getProgress());
  }, []);

  const refresh = useCallback(() => setData(getProgress()), []);

  const answer = useCallback(
    (questionId: string, letter: string) => {
      markAnswered(questionId, letter);
      refresh();
    },
    [refresh]
  );

  const flag = useCallback(
    (questionId: string) => {
      toggleFlag(questionId);
      refresh();
    },
    [refresh]
  );

  const note = useCallback(
    (questionId: string, text: string) => {
      setNote(questionId, text);
      refresh();
    },
    [refresh]
  );

  const addQuizResult = useCallback(
    (result: QuizResult) => {
      saveQuizResult(result);
      refresh();
    },
    [refresh]
  );

  const reset = useCallback(() => {
    resetProgress();
    refresh();
  }, [refresh]);

  const isFlagged = useCallback(
    (questionId: string) => data.flagged.includes(questionId),
    [data.flagged]
  );

  const getNote = useCallback(
    (questionId: string) => data.notes[questionId] ?? "",
    [data.notes]
  );

  const getAnswer = useCallback(
    (questionId: string) => data.answered[questionId] ?? null,
    [data.answered]
  );

  const answeredCount = Object.keys(data.answered).length;

  return {
    data,
    answer,
    flag,
    note,
    addQuizResult,
    reset,
    isFlagged,
    getNote,
    getAnswer,
    answeredCount,
  };
}
