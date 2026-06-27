import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/auth";
import { getPostHogClient } from "@/lib/posthog-server";
import { runCompanyResearch } from "@/agent/research";
import type { Job, Profile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const client = await getServerClient();
    const { data: authData } = await client.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const jobId: string = body.jobId ?? "";
    if (!jobId) {
      return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
    }

    const { data: jobData, error: jobError } = await client.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const { data: profileData, error: profileError } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    try {
      const dossier = await runCompanyResearch(jobData as Job, profileData as Profile);

      const { error: updateError } = await client.database
        .from("jobs")
        .update({ company_research: dossier })
        .eq("id", jobId)
        .eq("user_id", user.id);

      if (updateError) throw new Error(updateError.message);

      revalidatePath(`/find-jobs/${jobId}`);

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "company_researched",
        properties: { userId: user.id, jobId, company: (jobData as Job).company },
      });
      await posthog.shutdown();

      return NextResponse.json({ success: true, dossier });
    } catch (err) {
      console.error("[agent/research]", err);
      return NextResponse.json({ success: false, error: "Research failed. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("[agent/research]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
