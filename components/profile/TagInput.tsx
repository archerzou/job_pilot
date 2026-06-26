"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagInput({ tags, onChange, placeholder = "Add..." }: Props) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="leading-none hover:opacity-70 transition-opacity"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 rounded-md border border-border bg-surface text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
