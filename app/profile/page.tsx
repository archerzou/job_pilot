import { requireUser, getServerClient } from "@/lib/auth";
import { calculateCompletion } from "@/lib/profile-utils";
import { Navbar } from "@/components/layout/Navbar";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import type { ProfileFormData } from "@/components/profile/ProfileForm";
import type { Education, WorkExperience } from "@/types";

const EMPTY_EDUCATION: Education = {
  degree: "",
  field: "",
  institution: "",
  graduationYear: "",
};

const EMPTY_WORK_EXP: WorkExperience[] = [];

export default async function ProfilePage() {
  const user = await requireUser();
  const client = await getServerClient();

  const { data: dbProfile } = await client
    .database.from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile: ProfileFormData = {
    fullName: dbProfile?.full_name ?? "",
    email: user.email ?? "",
    phone: dbProfile?.phone ?? "",
    location: dbProfile?.location ?? "",
    linkedinUrl: dbProfile?.linkedin_url ?? "",
    portfolioUrl: dbProfile?.portfolio_url ?? "",
    workAuthorization: dbProfile?.work_authorization ?? "",
    currentTitle: dbProfile?.current_title ?? "",
    experienceLevel: dbProfile?.experience_level ?? "",
    yearsExperience: dbProfile?.years_experience ?? 0,
    skills: dbProfile?.skills ?? [],
    industries: dbProfile?.industries ?? [],
    workExperience: (dbProfile?.work_experience as WorkExperience[]) ?? EMPTY_WORK_EXP,
    education: (dbProfile?.education as Education) ?? EMPTY_EDUCATION,
    jobTitlesSeeking: dbProfile?.job_titles_seeking ?? [],
    remotePreference: dbProfile?.remote_preference ?? "",
    salaryExpectation: dbProfile?.salary_expectation ?? "",
    preferredLocations: dbProfile?.preferred_locations ?? [],
    coverLetterTone: dbProfile?.cover_letter_tone ?? "",
  };

  const { pct, missing } = calculateCompletion(dbProfile ?? {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      <main className="mx-auto max-w-[800px] px-6 py-8 space-y-5">
        <ProfilePageClient
          profile={profile}
          resumeUrl={dbProfile?.resume_pdf_url}
          pct={pct}
          missing={missing}
        />
      </main>
    </div>
  );
}
