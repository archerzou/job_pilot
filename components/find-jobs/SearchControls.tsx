"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

type Props = {
  onSearch: (title: string, location: string) => void;
  successMessage?: string;
  isLoading?: boolean;
};

export function SearchControls({ onSearch, successMessage, isLoading }: Props) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(title, location);
  }

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-text-muted tracking-wider uppercase mb-2">
              Job Title
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Frontend Engineer"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-text-muted tracking-wider uppercase mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote, New York..."
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              {isLoading ? "Finding..." : "Find Jobs"}
            </button>
          </div>
        </div>
      </form>

      {successMessage && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-success-lightest border border-success/20 rounded-md">
          <Sparkles className="h-4 w-4 text-success shrink-0" />
          <span className="text-sm font-medium text-success-foreground">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
