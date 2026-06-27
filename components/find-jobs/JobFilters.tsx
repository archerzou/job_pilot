"use client";

import { Search, ChevronDown } from "lucide-react";

export type MatchFilter = "high" | "low";
export type DateSort = "newest" | "oldest";

type Props = {
  filterText: string;
  onFilterChange: (value: string) => void;
  matchFilter: MatchFilter;
  onMatchFilterChange: (value: MatchFilter) => void;
  dateSort: DateSort;
  onDateSortChange: (value: DateSort) => void;
};

const selectClass =
  "appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent cursor-pointer";

export function JobFilters({
  filterText,
  onFilterChange,
  matchFilter,
  onMatchFilterChange,
  dateSort,
  onDateSortChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={matchFilter}
            onChange={(e) => onMatchFilterChange(e.target.value as MatchFilter)}
            className={selectClass}
          >
            <option value="high">High Match</option>
            <option value="low">Low Match</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        </div>

        <div className="relative">
          <select
            value={dateSort}
            onChange={(e) => onDateSortChange(e.target.value as DateSort)}
            className={selectClass}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        </div>
      </div>
    </div>
  );
}
