const STORAGE_KEY = "ccaf_progress_v1";

export interface QuizResult {
  id: string;
  date: string;
  domains: string[];
  score: number;
  total: number;
  answers: Record<string, string>;
  timed: boolean;
  duration: number | null;
}

export interface ProgressData {
  answered: Record<string, string>;
  flagged: string[];
  notes: Record<string, string>;
  quizHistory: QuizResult[];
}

const DEFAULT: ProgressData = {
  answered: {},
  flagged: [],
  notes: {},
  quizHistory: [],
};

function load(): ProgressData {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

function save(data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function getProgress(): ProgressData {
  return load();
}

export function markAnswered(questionId: string, letter: string): void {
  const data = load();
  data.answered[questionId] = letter;
  save(data);
}

export function toggleFlag(questionId: string): boolean {
  const data = load();
  const idx = data.flagged.indexOf(questionId);
  if (idx === -1) {
    data.flagged.push(questionId);
    save(data);
    return true;
  } else {
    data.flagged.splice(idx, 1);
    save(data);
    return false;
  }
}

export function setNote(questionId: string, note: string): void {
  const data = load();
  if (note.trim() === "") {
    delete data.notes[questionId];
  } else {
    data.notes[questionId] = note;
  }
  save(data);
}

export function saveQuizResult(result: QuizResult): void {
  const data = load();
  data.quizHistory = [result, ...data.quizHistory].slice(0, 50);
  save(data);
}

export function resetProgress(): void {
  save({ ...DEFAULT });
}
