import questionBankRaw from "@/data/question_bank.json";
import type { Question, QuestionBank } from "@/types/question";

const bank = questionBankRaw as QuestionBank;

export function getAll(): Question[] {
  return bank.questions;
}

export function getById(id: string): Question | undefined {
  return bank.questions.find((q) => q.id === id);
}

export function getByNumericId(n: number): Question | undefined {
  return bank.questions.find((q) => q.numericId === n);
}

export function filterByDomains(domains: string[]): Question[] {
  if (domains.length === 0) return bank.questions;
  return bank.questions.filter((q) => domains.includes(q.domain));
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDomainsWithCounts(): { domain: string; count: number }[] {
  const map = new Map<string, number>();
  for (const q of bank.questions) {
    map.set(q.domain, (map.get(q.domain) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([domain, count]) => ({ domain, count }));
}

export function getMeta() {
  return bank.meta;
}
