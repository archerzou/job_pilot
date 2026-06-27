import { openai } from "@/lib/openai";
import { getPostHogClient } from "@/lib/posthog-server";
import type { AdzunaJob } from "@/lib/adzuna";
import type { Profile, Job } from "@/types";

export interface ScoreResult {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export async function batchScoreJobs(
  jobs: AdzunaJob[],
  profile: Profile,
): Promise<ScoreResult[]> {
  const jobList = jobs
    .map(
      (j, i) =>
        `Job ${i + 1}: "${j.title}" at ${j.company.display_name}\nDescription: ${j.description}`,
    )
    .join("\n\n");

  const profileSummary = `
Title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? 0} years, level: ${profile.experience_level ?? "not specified"}
Skills: ${(profile.skills ?? []).join(", ") || "None listed"}
Industries: ${(profile.industries ?? []).join(", ") || "None listed"}
Seeking: ${(profile.job_titles_seeking ?? []).join(", ") || "Not specified"}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a job-candidate matching assistant. Given a candidate profile and a list of job postings, score each job on a 0-100 match scale based on how well the candidate's skills, experience, and preferences align with the role.

Return a JSON object with a "scores" array, one entry per job in the same order. Each entry must have:
- "matchScore": integer 0-100
- "matchReason": one sentence explaining the score
- "matchedSkills": array of skills from the candidate's profile that match the job requirements (max 6)
- "missingSkills": array of skills the job likely requires that the candidate has not listed (max 4)

Return only valid JSON.`,
      },
      {
        role: "user",
        content: `CANDIDATE PROFILE:\n${profileSummary}\n\nJOBS TO SCORE:\n${jobList}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content!;
  const parsed = JSON.parse(raw) as { scores: ScoreResult[] };
  return parsed.scores;
}

export async function captureJobSearchEvents(
  userId: string,
  jobTitle: string,
  location: string,
  savedJobs: Job[],
): Promise<void> {
  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "job_search_started",
      properties: { userId, jobTitle, location },
    });
    for (const job of savedJobs) {
      posthog.capture({
        distinctId: userId,
        event: "job_found",
        properties: { userId, source: job.source, matchScore: job.match_score },
      });
    }
    await posthog.shutdown();
  } catch (err) {
    console.error("[agent/find] PostHog capture failed:", err);
  }
}
