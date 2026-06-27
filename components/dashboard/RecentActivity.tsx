import { formatDate } from "@/lib/utils";

export interface ActivityItem {
  type: "job_found" | "researched";
  text: string;
  timestamp: string;
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Recent Activity
      </h2>
      {activities.length === 0 ? (
        <p className="mt-5 text-sm text-text-muted">
          No activity yet. Run a job search to get started.
        </p>
      ) : (
        <ul className="mt-5 space-y-5">
          {activities.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    item.type === "job_found"
                      ? "var(--color-success-light)"
                      : "var(--color-info-light)",
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      item.type === "job_found"
                        ? "var(--color-success-alt)"
                        : "var(--color-info)",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium leading-5 text-text-primary">
                  {item.text}
                </p>
                <p className="text-xs text-text-muted">
                  {formatDate(item.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
