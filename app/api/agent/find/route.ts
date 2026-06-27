import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/auth";
import { searchJobs } from "@/lib/adzuna";
import { batchScoreJobs, captureJobSearchEvents } from "@/agent/find";
import type { Profile, Job } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const client = await getServerClient();
    const { data: authData } = await client.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title: string = body.title ?? "";
    const location: string = body.location ?? "";

    if (!title.trim()) {
      return NextResponse.json({ success: false, error: "Job title is required" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const { data: runData, error: runError } = await client.database
      .from("agent_runs")
      .insert([{ user_id: user.id, status: "running", job_title_searched: title, location_searched: location || null }])
      .select()
      .single();

    if (runError || !runData) {
      return NextResponse.json({ success: false, error: "Failed to start agent run" }, { status: 500 });
    }

    const run = runData;

    try {
      const adzunaJobs = await searchJobs(title, location);

      if (adzunaJobs.length === 0) {
        await client.database
          .from("agent_runs")
          .update({ status: "completed", jobs_found: 0 })
          .eq("id", run.id);

        return NextResponse.json({
          success: true,
          jobs: [],
          totalFound: 0,
          message: "No jobs found for this search. Try a different title or location.",
        });
      }

      const scores = await batchScoreJobs(adzunaJobs, profile as Profile);

      const jobRecords = adzunaJobs.map((job, i) => {
        const score = scores[i] ?? { matchScore: 0, matchReason: "", matchedSkills: [], missingSkills: [] };
        return {
          user_id: user.id,
          run_id: run.id,
          source: "search" as const,
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          salary: job.salary_min
            ? `$${Math.round(job.salary_min / 1000)}k–$${Math.round((job.salary_max ?? job.salary_min) / 1000)}k`
            : null,
          job_type: job.contract_type ?? "fulltime",
          about_role: job.description,
          match_score: score.matchScore,
          match_reason: score.matchReason,
          matched_skills: score.matchedSkills,
          missing_skills: score.missingSkills,
          found_at: new Date().toISOString(),
        };
      });

      const { data: insertedJobs, error: insertError } = await client.database
        .from("jobs")
        .insert(jobRecords)
        .select();

      if (insertError) throw new Error(insertError.message);

      await client.database
        .from("agent_runs")
        .update({ status: "completed", jobs_found: insertedJobs?.length ?? 0, completed_at: new Date().toISOString() })
        .eq("id", run.id);

      const { data: rankedJobs } = await client.database
        .from("jobs")
        .select("*")
        .eq("run_id", run.id)
        .order("match_score", { ascending: false });

      const jobs = (rankedJobs ?? []) as Job[];
      const savedCount = jobs.filter((j) => (j.match_score ?? 0) >= 70).length;

      // Fire job_search_started + job_found events (non-blocking)
      void captureJobSearchEvents(user.id, title, location, jobs);

      return NextResponse.json({
        success: true,
        jobs,
        totalFound: jobs.length,
        message: `Found ${jobs.length} job${jobs.length !== 1 ? "s" : ""}${savedCount > 0 ? `, ${savedCount} strong match${savedCount !== 1 ? "es" : ""}` : ""}.`,
      });
    } catch (err) {
      await client.database.from("agent_runs").update({ status: "failed" }).eq("id", run.id);
      console.error("[agent/find]", err);
      return NextResponse.json({ success: false, error: "Agent run failed" }, { status: 500 });
    }
  } catch (err) {
    console.error("[agent/find]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
