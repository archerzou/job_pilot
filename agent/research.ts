import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { openai } from "@/lib/openai";
import type { Job, Profile, CompanyResearchDossier } from "@/types";

const HomepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z
    .array(z.string())
    .describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum([
          "about",
          "careers",
          "blog",
          "engineering",
          "product",
          "team",
          "other",
        ]),
      }),
    )
    .describe("Internal links worth visiting"),
});

const SubPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z
    .array(z.string())
    .describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z
    .array(z.string())
    .describe("Stated values, working style, team norms"),
  notable: z
    .array(z.string())
    .describe("Customers, funding, scale, projects, awards"),
});

const PAGE_PRIORITY: Record<string, number> = {
  about: 0,
  engineering: 1,
  blog: 2,
  product: 3,
  team: 4,
  careers: 5,
  other: 6,
};

async function resolveCompanyHomepage(
  applyUrl: string | null,
): Promise<string | null> {
  if (!applyUrl) return null;
  try {
    const res = await fetch(applyUrl, {
      redirect: "follow",
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    const { origin } = new URL(res.url);
    return origin;
  } catch {
    return null;
  }
}

async function synthesiseDossier(
  companyResearch: object,
  job: Job,
  profile: Profile,
): Promise<CompanyResearchDossier> {
  const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

  const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.about_role ?? ""}
Matched skills (already computed): ${(job.matched_skills ?? []).join(", ")}
Missing skills (already computed): ${(job.missing_skills ?? []).join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? 0} years, level ${profile.experience_level ?? "not specified"}
Skills: ${(profile.skills ?? []).join(", ")}
Work history: ${JSON.stringify(profile.work_experience ?? [])}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0].message.content!;
  return JSON.parse(raw) as CompanyResearchDossier;
}

export async function runCompanyResearch(
  job: Job,
  profile: Profile,
): Promise<CompanyResearchDossier> {
  const homepageUrl = await resolveCompanyHomepage(job.external_apply_url);

  const companyResearchData: {
    homepage?: z.infer<typeof HomepageSchema>;
    subPages: z.infer<typeof SubPageSchema>[];
    visitedUrls: string[];
  } = { subPages: [], visitedUrls: [] };

  if (homepageUrl) {
    try {
      const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
      const session = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        timeout: 120,
      });

      const stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY!,
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        browserbaseSessionID: session.id,
        model: {
          modelName: "gpt-4o",
          apiKey: process.env.OPENAI_API_KEY!,
        },
        disablePino: true,
      });

      try {
        await stagehand.init();
        const page = stagehand.context.activePage()!;

        // Step 1 — Homepage
        await page.goto(homepageUrl, { waitUntil: "domcontentloaded" });
        companyResearchData.visitedUrls.push(homepageUrl);

        try {
          const homepageData = await stagehand.extract(
            "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
            HomepageSchema,
          );
          companyResearchData.homepage = homepageData;

          // Step 2 — Sub-pages (max 3, skip careers, prioritise by kind)
          if (homepageData.oneLiner || homepageData.productSummary) {
            const subPageLinks = (homepageData.pageLinks ?? [])
              .filter(
                (l: { url: string; kind: string }) =>
                  l.kind !== "careers" && l.url !== homepageUrl,
              )
              .sort(
                (a: { kind: string }, b: { kind: string }) =>
                  (PAGE_PRIORITY[a.kind] ?? 6) - (PAGE_PRIORITY[b.kind] ?? 6),
              )
              .slice(0, 3);

            for (const link of subPageLinks) {
              try {
                await page.goto((link as { url: string }).url, {
                  waitUntil: "domcontentloaded",
                });
                companyResearchData.visitedUrls.push(
                  (link as { url: string }).url,
                );
                const subData = await stagehand.extract(
                  "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
                  SubPageSchema,
                );
                companyResearchData.subPages.push(subData);
              } catch {
                // skip failed sub-page, continue with others
              }
            }
          }
        } catch {
          // homepage extraction failed — proceed with empty research
        }
      } finally {
        await stagehand.close();
      }
    } catch {
      // Browserbase session or Stagehand init failed — fall through to synthesis-only
    }
  }

  // Step 3 — GPT-4o synthesis
  try {
    return await synthesiseDossier(companyResearchData, job, profile);
  } catch {
    return {
      companyOverview: `Research completed for ${job.company}. Synthesis encountered an error — please try again.`,
      techStack: job.matched_skills ?? [],
      culture: [],
      whyThisRole: job.match_reason ?? "",
      yourEdge: [],
      gapsToAddress: (job.missing_skills ?? []).map(
        (s) => `Address gap in ${s}`,
      ),
      smartQuestions: [],
      interviewPrep: [],
      sources: companyResearchData.visitedUrls,
    };
  }
}
