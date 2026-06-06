export interface Option {
  letter: string;
  text: string;
  correct: boolean;
  explain: string;
  condensedText: string | null;
}

export interface Question {
  id: string;
  numericId: number;
  group: string;
  domain: string;
  text: string;
  condensedText: string | null;
  options: Option[];
  pattern: string | null;
  sources: string[];
}

export interface QuestionBankMeta {
  version: string;
  generated: string;
  total: number;
  sources: string[];
}

export interface QuestionBank {
  meta: QuestionBankMeta;
  questions: Question[];
}

export const DOMAINS = [
  "Agentic Architecture & Orchestration",
  "Conversational AI & Context Management",
  "Customer Support Orchestration",
  "Structured Data Extraction",
] as const;

export type Domain = (typeof DOMAINS)[number];
