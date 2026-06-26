import type { Profile, WorkExperience, Education } from "@/types";

export type ExtractedProfile = {
  fullName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  yearsExperience?: number;
  skills?: string[];
  industries?: string[];
  jobTitlesSeeking?: string[];
  workExperience?: WorkExperience[];
  education?: Education;
};

export type MissingField =
  | "FULL NAME"
  | "PHONE"
  | "LOCATION"
  | "JOB TITLE"
  | "EXPERIENCE LEVEL"
  | "SKILLS"
  | "WORK EXPERIENCE"
  | "EDUCATION"
  | "JOB TITLES SEEKING";

const REQUIRED: Array<{ label: MissingField; check: (p: Partial<Profile>) => boolean }> = [
  { label: "FULL NAME",          check: (p) => !!p.full_name },
  { label: "PHONE",              check: (p) => !!p.phone },
  { label: "LOCATION",           check: (p) => !!p.location },
  { label: "JOB TITLE",          check: (p) => !!p.current_title },
  { label: "EXPERIENCE LEVEL",   check: (p) => !!p.experience_level },
  { label: "SKILLS",             check: (p) => (p.skills?.length ?? 0) > 0 },
  { label: "WORK EXPERIENCE",    check: (p) => (p.work_experience?.length ?? 0) > 0 },
  { label: "EDUCATION",          check: (p) => !!p.education?.degree },
  { label: "JOB TITLES SEEKING", check: (p) => (p.job_titles_seeking?.length ?? 0) > 0 },
];

export function calculateCompletion(profile: Partial<Profile>): {
  pct: number;
  missing: MissingField[];
} {
  const missing = REQUIRED.filter((r) => !r.check(profile)).map((r) => r.label);
  const pct = Math.round(((REQUIRED.length - missing.length) / REQUIRED.length) * 100);
  return { pct, missing };
}
