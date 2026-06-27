import { TrendingUp } from "lucide-react";

export interface StatsBarProps {
  totalJobs: number;
  avgMatchRate: number | null;
  companiesResearched: number;
  jobsThisWeek: number;
  totalJobsTrend: string | null;
  avgMatchTrend: string | null;
}

export function StatsBar({
  totalJobs,
  avgMatchRate,
  companiesResearched,
  jobsThisWeek,
  totalJobsTrend,
  avgMatchTrend,
}: StatsBarProps) {
  const stats = [
    {
      label: "Total Jobs Found",
      value: String(totalJobs),
      trend: totalJobsTrend,
      trendLabel: totalJobsTrend ? "vs last week" : undefined,
      subLabel: totalJobsTrend ? undefined : "All time",
    },
    {
      label: "Avg. Match Rate",
      value: avgMatchRate !== null ? `${Math.round(avgMatchRate)}%` : "—",
      trend: avgMatchTrend,
      trendLabel: avgMatchTrend ? "vs last week" : undefined,
      subLabel: avgMatchTrend ? undefined : "Across all jobs",
    },
    {
      label: "Companies Researched",
      value: String(companiesResearched),
      subLabel: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: String(jobsThisWeek),
      subLabel: "New this week",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold leading-9 text-text-primary">
            {stat.value}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {stat.trend && (
              <span className="flex items-center gap-1 rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </span>
            )}
            {(stat.trendLabel || stat.subLabel) && (
              <span className="text-xs text-text-muted">
                {stat.trendLabel ?? stat.subLabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
