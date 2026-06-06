"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  questionId: string;
  initialNote: string;
  onSave: (note: string) => void;
}

export function NoteEditor({ questionId, initialNote, onSave }: Props) {
  const [value, setValue] = useState(initialNote);

  useEffect(() => {
    setValue(initialNote);
  }, [questionId, initialNote]);

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        My Notes
      </p>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder="Add a personal note about this question..."
        className="min-h-[80px] text-sm resize-none"
      />
    </div>
  );
}
