import { Navbar } from "@/components/layout/Navbar";
import { FindJobsClient } from "@/components/find-jobs/FindJobsClient";
import { requireUser, getServerClient } from "@/lib/auth";
import { MATCH_THRESHOLD } from "@/lib/utils";

export default async function FindJobsPage() {
  const user = await requireUser();
  const client = await getServerClient();

  // Initial load matches client defaults: High Match (≥threshold), match DESC, newest DESC
  const { data: jobs, count } = await client
    .database.from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .gte("match_score", MATCH_THRESHOLD)
    .order("match_score", { ascending: false })
    .order("found_at", { ascending: false })
    .range(0, 9);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated userEmail={user.email} />
      <FindJobsClient initialJobs={jobs ?? []} initialTotalCount={count ?? 0} />
    </div>
  );
}
