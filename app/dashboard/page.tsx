import { requireUser, getServerClient } from "@/lib/auth";
import { getPostHogClient } from "@/lib/posthog-server";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { RecentActivity, type ActivityItem } from "@/components/dashboard/RecentActivity";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsOverTimeChart } from "@/components/dashboard/JobsOverTimeChart";
import { MatchDistributionChart } from "@/components/dashboard/MatchDistributionChart";

function calcTrend(current: number, previous: number): string | null {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

async function fetchDashboardStats(userId: string) {
  const client = await getServerClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [jobsResult, researchedResult] = await Promise.all([
    client.database
      .from("jobs")
      .select("match_score, found_at")
      .eq("user_id", userId),
    client.database
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("company_research", "is", null),
  ]);

  const jobs: Array<{ match_score: number | null; found_at: string }> =
    jobsResult.data ?? [];
  const companiesResearched = researchedResult.count ?? 0;

  const thisWeekJobs = jobs.filter((j) => new Date(j.found_at) >= weekAgo);
  const lastWeekJobs = jobs.filter((j) => {
    const d = new Date(j.found_at);
    return d >= twoWeeksAgo && d < weekAgo;
  });

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const allScores = jobs.map((j) => j.match_score).filter((s): s is number => s !== null);
  const thisWeekScores = thisWeekJobs.map((j) => j.match_score).filter((s): s is number => s !== null);
  const lastWeekScores = lastWeekJobs.map((j) => j.match_score).filter((s): s is number => s !== null);

  const thisWeekAvg = avg(thisWeekScores);
  const lastWeekAvg = avg(lastWeekScores);

  const totalJobsTrend = calcTrend(thisWeekJobs.length, lastWeekJobs.length);
  const avgMatchTrend =
    thisWeekAvg !== null && lastWeekAvg !== null
      ? calcTrend(thisWeekAvg, lastWeekAvg)
      : null;

  return {
    totalJobs: jobs.length,
    avgMatchRate: avg(allScores),
    companiesResearched,
    jobsThisWeek: thisWeekJobs.length,
    totalJobsTrend,
    avgMatchTrend,
  };
}

async function fetchChartData(userId: string) {
  const client = await getServerClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allJobsResult, researchedResult] = await Promise.all([
    client.database
      .from("jobs")
      .select("match_score, found_at")
      .eq("user_id", userId),
    client.database
      .from("jobs")
      .select("found_at")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .gte("found_at", sevenDaysAgo),
  ]);

  const allJobs: Array<{ match_score: number | null; found_at: string }> =
    allJobsResult.data ?? [];
  const researchedJobs: Array<{ found_at: string }> =
    researchedResult.data ?? [];

  // Build rolling 7-day slots, oldest first
  const today = new Date();
  const slots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const dayLabel = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short" });

  const bucketDay = (rows: Array<{ found_at: string }>, d: Date) => {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return rows.filter((r) => {
      const t = new Date(r.found_at);
      return t >= start && t <= end;
    }).length;
  };

  const recentJobs = allJobs.filter(
    (j) => new Date(j.found_at) >= new Date(sevenDaysAgo),
  );

  const researchData = slots.map((d) => ({
    day: dayLabel(d),
    count: bucketDay(researchedJobs, d),
  }));

  const jobsOverTimeData = slots.map((d) => ({
    day: dayLabel(d),
    jobs: bucketDay(recentJobs, d),
  }));

  const scores = allJobs
    .map((j) => j.match_score)
    .filter((s): s is number => s !== null && s !== undefined);

  const matchBuckets = [
    { range: "50-60%", min: 50, max: 60 },
    { range: "60-70%", min: 60, max: 70 },
    { range: "70-80%", min: 70, max: 80 },
    { range: "80-90%", min: 80, max: 90 },
    { range: "90-100%", min: 90, max: 101 },
  ];

  const matchDistributionData = matchBuckets.map((b) => ({
    range: b.range,
    count: scores.filter((s) => s >= b.min && s < b.max).length,
  }));

  return { researchData, jobsOverTimeData, matchDistributionData };
}

async function fetchRecentActivity(userId: string): Promise<ActivityItem[]> {
  const client = await getServerClient();

  const [runsResult, researchedResult] = await Promise.all([
    client.database
      .from("agent_runs")
      .select("job_title_searched, jobs_found, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gt("jobs_found", 0)
      .order("completed_at", { ascending: false })
      .limit(10),
    client.database
      .from("jobs")
      .select("company, found_at")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .order("found_at", { ascending: false })
      .limit(10),
  ]);

  const searchEvents: ActivityItem[] = (runsResult.data ?? [])
    .filter((r) => r.completed_at && r.job_title_searched)
    .map((r) => ({
      type: "job_found" as const,
      text: `Found ${r.jobs_found} job${r.jobs_found !== 1 ? "s" : ""} for ${r.job_title_searched}`,
      timestamp: r.completed_at!,
    }));

  const researchEvents: ActivityItem[] = (researchedResult.data ?? [])
    .filter((j) => j.company)
    .map((j) => ({
      type: "researched" as const,
      text: `Researched ${j.company}`,
      timestamp: j.found_at,
    }));

  return [...searchEvents, ...researchEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [posthog, stats, activities, chartData] = await Promise.all([
    (async () => {
      const ph = getPostHogClient();
      ph.capture({ distinctId: user.id, event: "dashboard_viewed" });
      await ph.shutdown();
      return ph;
    })(),
    fetchDashboardStats(user.id),
    fetchRecentActivity(user.id),
    fetchChartData(user.id),
  ]);
  void posthog;

  return (
    <div className="min-h-screen bg-background">
      <PostHogIdentify userId={user.id} email={user.email} />
      <Navbar isAuthenticated={true} userEmail={user.email} />
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <StatsBar {...stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity activities={activities} />
            <CompanyResearchChart data={chartData.researchData} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JobsOverTimeChart data={chartData.jobsOverTimeData} />
            <MatchDistributionChart data={chartData.matchDistributionData} />
          </div>
        </div>
      </div>
    </div>
  );
}
