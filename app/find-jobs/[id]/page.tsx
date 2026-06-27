import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { requireUser, getServerClient } from "@/lib/auth";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import type { Job } from "@/types";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const client = await getServerClient();

  const { data } = await client.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) notFound();
  const job = data as Job;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated userEmail={user.email} />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/find-jobs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <div className="flex flex-col gap-4">
            <JobHeader job={job} />
            <JobInfo job={job} />
            <MatchScore job={job} />
            <JobDescription job={job} />
            <CompanyResearch job={job} />
            <JobActions job={job} />
          </div>
        </div>
      </main>
    </div>
  );
}
