import { Building2, ExternalLink } from "lucide-react";
import { getMatchScoreTextColor } from "@/lib/utils";
import type { Job } from "@/types";

type Props = { job: Job };

function matchScoreBg(score: number): string {
  if (score >= 90) return "bg-success-lightest";
  if (score >= 80) return "bg-info-lightest";
  return "bg-surface-secondary";
}

export function JobHeader({ job }: Props) {
  const score = job.match_score ?? 0;

  return (
    <div className="bg-surface rounded-lg shadow-card p-6 flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary border border-border">
        <Building2 className="h-7 w-7 text-text-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-text-primary">{job.title ?? "Untitled"}</h1>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-secondary">{job.company ?? "Unknown Company"}</span>
          {score > 0 && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${matchScoreBg(score)} ${getMatchScoreTextColor(score)}`}
            >
              {score}% Match Score
            </span>
          )}
        </div>
      </div>

      {job.external_apply_url && (
        <a
          href={job.external_apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Job Post
        </a>
      )}
    </div>
  );
}
