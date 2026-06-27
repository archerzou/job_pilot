"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchControls } from "./SearchControls";
import { JobFilters, MatchFilter, DateSort } from "./JobFilters";
import { JobsTable } from "./JobsTable";
import { JobsPagination } from "./JobsPagination";
import type { Job } from "@/types";

const PAGE_SIZE = 10;

type Props = {
  initialJobs: Job[];
  initialTotalCount: number;
};

export function FindJobsClient({ initialJobs, initialTotalCount }: Props) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [filterText, setFilterText] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("high");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refetchToken, setRefetchToken] = useState(0);

  const mountedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchJobs = useCallback(
    async (params: {
      search: string;
      matchFilter: MatchFilter;
      dateSort: DateSort;
      page: number;
    }) => {
      setIsLoading(true);
      try {
        const qs = new URLSearchParams({
          search: params.search,
          matchFilter: params.matchFilter,
          dateSort: params.dateSort,
          page: String(params.page),
        });
        const res = await fetch(`/api/jobs?${qs}`);
        const data = await res.json();
        if (res.ok) {
          setJobs(data.jobs);
          setTotalCount(data.totalCount);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs({ search: filterText, matchFilter, dateSort, page });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText, matchFilter, dateSort, page, refetchToken]);

  async function handleSearch(title: string, location: string) {
    setIsSearching(true);
    setSuccessMessage(undefined);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSuccessMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccessMessage(data.message);
      setFilterText("");
      setMatchFilter("high");
      setDateSort("newest");
      setPage(1);
      setRefetchToken((t) => t + 1);
    } catch {
      setSuccessMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleFilterChange(value: string) {
    setFilterText(value);
    setPage(1);
  }

  function handleMatchFilterChange(value: MatchFilter) {
    setMatchFilter(value);
    setPage(1);
  }

  function handleDateSortChange(value: DateSort) {
    setDateSort(value);
    setPage(1);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      <SearchControls
        onSearch={handleSearch}
        successMessage={successMessage}
        isLoading={isSearching}
      />

      <div className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <JobFilters
          filterText={filterText}
          onFilterChange={handleFilterChange}
          matchFilter={matchFilter}
          onMatchFilterChange={handleMatchFilterChange}
          dateSort={dateSort}
          onDateSortChange={handleDateSortChange}
        />

        <JobsTable jobs={jobs} isLoading={isLoading} />

        {(totalCount > 0 || isLoading) && (
          <>
            <JobsPagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
            />
            <p className="text-xs text-text-muted text-right">
              Jobs by{" "}
              <a
                href="https://www.adzuna.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-secondary"
              >
                Adzuna
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
