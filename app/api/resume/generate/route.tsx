import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser, getServerClient } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { ResumePDF } from "./ResumePDF";
import type { Profile, GeneratedContent, WorkExperience } from "@/types";

function renderResumePDF(profile: Profile, generated: GeneratedContent): Promise<Buffer> {
  return renderToBuffer(<ResumePDF profile={profile} generated={generated} />);
}

async function generateResumeContent(profile: Profile): Promise<GeneratedContent> {
  const workSummary = (profile.work_experience ?? [])
    .map((w: WorkExperience) => {
      const end = w.current ? "Present" : [w.endMonth, w.endYear].filter(Boolean).join(" ");
      const start = [w.startMonth, w.startYear].filter(Boolean).join(" ");
      return `${w.title} at ${w.company} (${start}–${end}): ${w.responsibilities}`;
    })
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a professional resume writer. Given a candidate's profile data, return a JSON object with exactly these keys:
- "summary": a 2-3 sentence professional summary, written without "I", highlighting their title, years of experience, and top strengths.
- "categorizedSkills": array of objects grouping the candidate's skills into professional categories (e.g. Languages, Frameworks, Cloud & DevOps, Architecture, Database, Testing, Tools). Each object: { "category": string, "items": string[] }. Only include categories that have at least one item. 5-8 categories max. Derive categories from the skills list provided; do not invent skills.
- "enhancedExperiences": an array of objects, one per work experience entry in the same order as given, each with:
  - "company": string (copy exactly from input)
  - "title": string (copy exactly from input)
  - "bullets": array of 3-5 concise achievement-oriented bullet points starting with action verbs, quantifying where possible, derived from the responsibilities text.
Return only the JSON object, no markdown.`,
      },
      {
        role: "user",
        content: `Name: ${profile.full_name ?? ""}
Title: ${profile.current_title ?? ""}
Experience Level: ${profile.experience_level ?? ""}
Years of Experience: ${profile.years_experience ?? ""}
Skills: ${(profile.skills ?? []).join(", ")}

Work Experience:
${workSummary || "None provided."}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as GeneratedContent;
}

export async function POST() {
  const user = await requireUser();

  try {
    const client = await getServerClient();

    const { data: profile, error: profileError } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const generated = await generateResumeContent(profile as Profile);

    const pdfBuffer = await renderResumePDF(profile as Profile, generated);

    const ab = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([ab], { type: "application/pdf" });

    const storagePath = `${user.id}/resume.pdf`;
    await client.storage.from("resumes").remove(storagePath);

    const { data: uploadData, error: uploadError } = await client.storage
      .from("resumes")
      .upload(storagePath, blob);

    if (uploadError || !uploadData) {
      throw uploadError ?? new Error("Storage upload returned no data");
    }

    const { error: dbError } = await client.database
      .from("profiles")
      .update({ resume_pdf_url: uploadData.url })
      .eq("id", user.id);

    if (dbError) throw dbError;

    revalidatePath("/profile");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resume/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate resume. Please try again." },
      { status: 500 }
    );
  }
}
