import { Leaf, Check, X } from "lucide-react";
import type { Job } from "@/types";

type Props = { job: Job };

export function MatchScore({ job }: Props) {
  const matched = job.matched_skills ?? [];
  const missing = job.missing_skills ?? [];
  const hasSkills = matched.length > 0 || missing.length > 0;

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="h-4 w-4 text-success" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          AI Match Reasoning
        </span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">
        {job.match_reason ?? "No reasoning available."}
      </p>

      {hasSkills && (
        <>
          <div className="my-5 border-t border-border" />
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
            Required Skills vs Your Profile
          </p>

          {matched.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-text-muted mb-2">You have:</p>
              <div className="flex flex-wrap gap-2">
                {matched.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1 text-xs font-medium text-success-foreground"
                  >
                    <Check className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">Gap skills:</p>
              <div className="flex flex-wrap gap-2">
                {missing.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full border border-error bg-surface px-3 py-1 text-xs font-medium text-error"
                  >
                    <X className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
