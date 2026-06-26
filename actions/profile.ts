"use server";

import { revalidatePath } from "next/cache";
import { requireUser, getServerClient } from "@/lib/auth";
import { calculateCompletion } from "@/lib/profile-utils";
import { getPostHogClient } from "@/lib/posthog-server";
import { openai } from "@/lib/openai";
import type { ProfileFormData } from "@/components/profile/ProfileForm";
import type { ExtractedProfile } from "@/lib/profile-utils";

export async function saveProfile(data: ProfileFormData) {
  const user = await requireUser();

  try {
    const client = await getServerClient();

    // Check current is_complete for first-completion detection
    const { data: existing } = await client
      .database.from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .maybeSingle();

    const { missing } = calculateCompletion({
      full_name: data.fullName,
      phone: data.phone,
      location: data.location,
      current_title: data.currentTitle,
      experience_level: data.experienceLevel,
      skills: data.skills,
      work_experience: data.workExperience,
      education: data.education,
      job_titles_seeking: data.jobTitlesSeeking,
    });

    const is_complete = missing.length === 0;

    const { error } = await client
      .database.from("profiles")
      .update({
        full_name: data.fullName || null,
        phone: data.phone || null,
        location: data.location || null,
        linkedin_url: data.linkedinUrl || null,
        portfolio_url: data.portfolioUrl || null,
        work_authorization: data.workAuthorization || null,
        current_title: data.currentTitle || null,
        experience_level: data.experienceLevel || null,
        years_experience: data.yearsExperience || null,
        skills: data.skills,
        industries: data.industries,
        work_experience: data.workExperience,
        education: data.education,
        job_titles_seeking: data.jobTitlesSeeking,
        remote_preference: data.remotePreference || null,
        salary_expectation: data.salaryExpectation || null,
        preferred_locations: data.preferredLocations,
        cover_letter_tone: data.coverLetterTone || null,
        is_complete,
      })
      .eq("id", user.id);

    if (error) throw error;

    if (is_complete && existing && !existing.is_complete) {
      const posthog = getPostHogClient();
      posthog.capture({ distinctId: user.id, event: "profile_completed" });
      await posthog.shutdown();
    }

    revalidatePath("/profile");
    return { success: true } as const;
  } catch (err) {
    console.error("[saveProfile]", err);
    return { success: false, error: "Failed to save profile. Please try again." } as const;
  }
}

export async function uploadResume(formData: FormData) {
  const user = await requireUser();

  try {
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." } as const;
    if (file.type !== "application/pdf")
      return { success: false, error: "Only PDF files are accepted." } as const;
    if (file.size > 5 * 1024 * 1024)
      return { success: false, error: "File must be under 5MB." } as const;

    const client = await getServerClient();
    const path = `${user.id}/resume.pdf`;

    // Remove existing file first — ignore error if it doesn't exist yet
    await client.storage.from("resumes").remove(path);

    const { data: uploadData, error: uploadError } = await client.storage
      .from("resumes")
      .upload(path, file);

    if (uploadError || !uploadData) throw uploadError ?? new Error("Upload returned no data");

    const { error: dbError } = await client
      .database.from("profiles")
      .update({ resume_pdf_url: uploadData.url })
      .eq("id", user.id);

    if (dbError) throw dbError;

    revalidatePath("/profile");
    return { success: true, url: uploadData.url } as const;
  } catch (err) {
    console.error("[uploadResume]", err);
    return { success: false, error: "Failed to upload resume. Please try again." } as const;
  }
}

export async function extractProfile(): Promise<
  { success: true; data: ExtractedProfile } | { success: false; error: string }
> {
  const user = await requireUser();

  try {
    const client = await getServerClient();
    const path = `${user.id}/resume.pdf`;

    const { data: blob, error } = await client.storage.from("resumes").download(path);
    if (error || !blob) return { success: false, error: "No resume found. Upload one first." };

    const buffer = Buffer.from(await blob.arrayBuffer());
    // Dynamic import avoids the top-level require() crash under Next.js/Turbopack
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const { text } = await pdfParse(buffer);

    if (!text?.trim()) return { success: false, error: "Could not extract text from this PDF." };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract structured profile data from a resume. Return only a JSON object with these keys (omit any key you cannot find): fullName, phone, location, linkedinUrl, portfolioUrl, currentTitle, yearsExperience (number), skills (string[]), industries (string[]), jobTitlesSeeking (string[]), workExperience (array of {company, title, startMonth, startYear, endMonth, endYear, current (boolean), responsibilities}), education ({degree, field, institution, graduationYear}).",
        },
        { role: "user", content: text.slice(0, 12000) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let data: ExtractedProfile = {};
    try {
      data = JSON.parse(raw);
    } catch {
      return { success: false, error: "AI returned malformed data. Please try again." };
    }
    return { success: true, data };
  } catch (err) {
    console.error("[extractProfile]", err);
    return { success: false, error: "Extraction failed. Please try again." };
  }
}
