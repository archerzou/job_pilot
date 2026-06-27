export const MATCH_THRESHOLD = 70;

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  if (score >= 70) return "bg-warning";
  return "bg-error";
}

export function getMatchScoreTextColor(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 80) return "text-info";
  if (score >= 70) return "text-warning";
  return "text-error";
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}
