"use client";

import { useRouter } from "next/navigation";
import { getMatchScoreColor, getMatchScoreTextColor, formatDate } from "@/lib/utils";
import { Building2 } from "lucide-react";
import type { Job } from "@/types";

type Props = {
  jobs: Job[];
  isLoading?: boolean;
};

const thClass =
  "px-4 py-3 text-left text-xs font-semibold text-text-muted tracking-wider uppercase";

export function JobsTable({ jobs, isLoading }: Props) {
  const router = useRouter();
  if (!isLoading && jobs.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-text-muted">
        No jobs found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <table className={`w-full transition-opacity ${isLoading ? "opacity-60" : "opacity-100"}`}>
      <thead>
        <tr className="border-b border-border">
          <th className={thClass}>Company</th>
          <th className={thClass}>Role</th>
          <th className={thClass}>Match Score</th>
          <th className={thClass}>Salary Est.</th>
          <th className={thClass}>Date Found</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => {
          const score = job.match_score ?? 0;
          return (
            <tr
              key={job.id}
              onClick={() => router.push(`/find-jobs/${job.id}`)}
              className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-tertiary border border-border">
                    <Building2 className="h-4 w-4 text-text-muted" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {job.company ?? "Unknown"}
                  </span>
                </div>
              </td>

              <td className="px-4 py-4">
                <span className="text-sm text-text-secondary">{job.title ?? "—"}</span>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-28 rounded-full bg-surface-tertiary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getMatchScoreColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${getMatchScoreTextColor(score)}`}
                  >
                    {score}%
                  </span>
                </div>
              </td>

              <td className="px-4 py-4">
                <span className="text-sm text-text-secondary">{job.salary ?? "—"}</span>
              </td>

              <td className="px-4 py-4">
                <span className="text-sm text-text-muted">{formatDate(job.found_at)}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
