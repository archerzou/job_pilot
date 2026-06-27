import { Briefcase } from "lucide-react";
import type { Job } from "@/types";

type Props = { job: Job };

function BulletSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-text-primary mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobDescription({ job }: Props) {
  const hasContent =
    job.about_role ||
    (job.responsibilities?.length ?? 0) > 0 ||
    (job.requirements?.length ?? 0) > 0 ||
    (job.nice_to_have?.length ?? 0) > 0 ||
    (job.benefits?.length ?? 0) > 0;

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-4 w-4 text-text-muted" />
        <h2 className="text-sm font-semibold text-text-primary">Job Description</h2>
      </div>

      {!hasContent ? (
        <p className="text-sm text-text-muted">No description available.</p>
      ) : (
        <>
          {job.about_role && (
            <>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {job.about_role}
              </p>
              {(job.about_role.trimEnd().endsWith("…") ||
                job.about_role.trimEnd().endsWith("...")) &&
                job.external_apply_url && (
                  <div className="mt-3">
                    <a
                      href={job.external_apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
                    >
                      View the full job post
                    </a>
                  </div>
                )}
            </>
          )}
          <BulletSection title="Responsibilities" items={job.responsibilities ?? []} />
          <BulletSection title="Requirements" items={job.requirements ?? []} />
          <BulletSection title="Nice to Have" items={job.nice_to_have ?? []} />
          <BulletSection title="Benefits" items={job.benefits ?? []} />
        </>
      )}
    </div>
  );
}
