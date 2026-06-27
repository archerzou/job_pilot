import { DollarSign, MapPin, Briefcase, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/types";

type Props = { job: Job };

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-lg shadow-card p-4 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

export function JobInfo({ job }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <InfoCard
        icon={<DollarSign className="h-5 w-5 text-success" />}
        label="Salary Est."
        value={job.salary ?? "—"}
      />
      <InfoCard
        icon={<MapPin className="h-5 w-5 text-info-medium" />}
        label="Location"
        value={job.location ?? "—"}
      />
      <InfoCard
        icon={<Briefcase className="h-5 w-5 text-info-medium" />}
        label="Job Type"
        value={job.job_type ?? "—"}
      />
      <InfoCard
        icon={<Clock className="h-5 w-5 text-text-muted" />}
        label="Date Found"
        value={formatDate(job.found_at)}
      />
    </div>
  );
}
