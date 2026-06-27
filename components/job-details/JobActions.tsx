import type { Job } from "@/types";

type Props = { job: Job };

export function JobActions({ job }: Props) {
  return (
    <a
      href={job.external_apply_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-lg bg-accent py-4 text-center text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark"
    >
      Apply Now at {job.company ?? "Company"}
    </a>
  );
}
