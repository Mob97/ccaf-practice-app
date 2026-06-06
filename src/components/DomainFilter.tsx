"use client";

import { DOMAINS } from "@/types/question";
import { cn } from "@/lib/utils";

const DOMAIN_COLORS: Record<string, string> = {
  "Agentic Architecture & Orchestration":
    "data-[active=true]:bg-purple-100 data-[active=true]:border-purple-400 data-[active=true]:text-purple-800 dark:data-[active=true]:bg-purple-900/40 dark:data-[active=true]:text-purple-300",
  "Conversational AI & Context Management":
    "data-[active=true]:bg-blue-100 data-[active=true]:border-blue-400 data-[active=true]:text-blue-800 dark:data-[active=true]:bg-blue-900/40 dark:data-[active=true]:text-blue-300",
  "Customer Support Orchestration":
    "data-[active=true]:bg-green-100 data-[active=true]:border-green-400 data-[active=true]:text-green-800 dark:data-[active=true]:bg-green-900/40 dark:data-[active=true]:text-green-300",
  "Structured Data Extraction":
    "data-[active=true]:bg-orange-100 data-[active=true]:border-orange-400 data-[active=true]:text-orange-800 dark:data-[active=true]:bg-orange-900/40 dark:data-[active=true]:text-orange-300",
};

const DOMAIN_SHORT: Record<string, string> = {
  "Agentic Architecture & Orchestration": "Agentic",
  "Conversational AI & Context Management": "Conversational AI",
  "Customer Support Orchestration": "Customer Support",
  "Structured Data Extraction": "Data Extraction",
};

interface Props {
  selected: string[];
  onChange: (domains: string[]) => void;
  counts?: Record<string, number>;
}

export function DomainFilter({ selected, onChange, counts }: Props) {
  const toggle = (domain: string) => {
    if (selected.includes(domain)) {
      onChange(selected.filter((d) => d !== domain));
    } else {
      onChange([...selected, domain]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DOMAINS.map((domain) => {
        const active = selected.includes(domain);
        return (
          <button
            key={domain}
            data-active={active}
            onClick={() => toggle(domain)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all",
              "border-border bg-card text-muted-foreground hover:border-primary/50",
              DOMAIN_COLORS[domain] ?? ""
            )}
          >
            <span>{DOMAIN_SHORT[domain] ?? domain}</span>
            {counts && (
              <span className="text-xs opacity-70">({counts[domain] ?? 0})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
