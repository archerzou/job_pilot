"use client";

import { useState, useTransition, forwardRef, useImperativeHandle } from "react";
import { TagInput } from "@/components/profile/TagInput";
import { saveProfile } from "@/actions/profile";
import type { WorkExperience, Education } from "@/types";
import type { ExtractedProfile } from "@/lib/profile-utils";

export type ProfileFormHandle = {
  applyExtracted: (data: ExtractedProfile) => void;
};

export type ProfileFormData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: number;
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: Education;
  jobTitlesSeeking: string[];
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string[];
  coverLetterTone: string;
};

type Props = {
  profile: ProfileFormData;
};

const WORK_AUTH_OPTIONS = ["Citizen", "Permanent Resident", "Work Visa", "Student Visa", "Other"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-Level", "Senior", "Lead/Staff", "Executive"];
const REMOTE_PREFS = ["Any", "Remote Only", "Hybrid", "On-site"];
const DEGREE_OPTIONS = ["High School", "Associate's", "Bachelor's", "Master's", "Doctorate", "Other"];
const COVER_LETTER_TONES = ["Professional", "Conversational", "Formal", "Creative"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

const EMPTY_WORK_EXP: WorkExperience = {
  company: "",
  title: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  current: false,
  responsibilities: "",
};

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent";
const SELECT_CLASS =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent";
const LABEL_CLASS = "block text-xs font-medium text-text-secondary uppercase tracking-wide mb-1";

export const ProfileForm = forwardRef<ProfileFormHandle, Props>(function ProfileForm(
  { profile },
  ref
) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl);
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl);
  const [workAuthorization, setWorkAuthorization] = useState(profile.workAuthorization);
  const [currentTitle, setCurrentTitle] = useState(profile.currentTitle);
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel);
  const [yearsExperience, setYearsExperience] = useState(String(profile.yearsExperience));
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [industries, setIndustries] = useState<string[]>(profile.industries);
  const [workExps, setWorkExps] = useState<WorkExperience[]>(profile.workExperience);
  const [education, setEducation] = useState<Education>(profile.education);
  const [jobTitlesSeeking, setJobTitlesSeeking] = useState<string[]>(profile.jobTitlesSeeking);
  const [remotePreference, setRemotePreference] = useState(profile.remotePreference);
  const [salaryExpectation, setSalaryExpectation] = useState(profile.salaryExpectation);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(profile.preferredLocations);
  const [coverLetterTone, setCoverLetterTone] = useState(profile.coverLetterTone);

  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    applyExtracted(data: ExtractedProfile) {
      if (data.fullName) setFullName(data.fullName);
      if (data.phone) setPhone(data.phone);
      if (data.location) setLocation(data.location);
      if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl);
      if (data.portfolioUrl) setPortfolioUrl(data.portfolioUrl);
      if (data.currentTitle) setCurrentTitle(data.currentTitle);
      if (data.yearsExperience) setYearsExperience(String(data.yearsExperience));
      if (data.skills?.length) setSkills(data.skills);
      if (data.industries?.length) setIndustries(data.industries);
      if (data.jobTitlesSeeking?.length) setJobTitlesSeeking(data.jobTitlesSeeking);
      if (data.workExperience?.length) {
        setWorkExps(
          data.workExperience.map((exp) => ({
            company: exp.company ?? "",
            title: exp.title ?? "",
            startMonth: exp.startMonth ?? "",
            startYear: exp.startYear ?? "",
            endMonth: exp.endMonth ?? "",
            endYear: exp.endYear ?? "",
            current: exp.current ?? false,
            responsibilities: exp.responsibilities ?? "",
          }))
        );
      }
      if (data.education) {
        setEducation({
          degree: data.education.degree ?? "",
          field: data.education.field ?? "",
          institution: data.education.institution ?? "",
          graduationYear: data.education.graduationYear ?? "",
        });
      }
    },
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    startTransition(async () => {
      const result = await saveProfile({
        fullName,
        email: profile.email,
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
        workAuthorization,
        currentTitle,
        experienceLevel,
        yearsExperience: parseInt(yearsExperience) || 0,
        skills,
        industries,
        workExperience: workExps,
        education,
        jobTitlesSeeking,
        remotePreference,
        salaryExpectation,
        preferredLocations,
        coverLetterTone,
      });
      if (result.success) {
        setSaveSuccess(true);
      } else {
        setSaveError(result.error ?? "Something went wrong.");
      }
    });
  }

  function updateWorkExp(index: number, patch: Partial<WorkExperience>) {
    setWorkExps((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, ...patch } : exp))
    );
  }

  function removeWorkExp(index: number) {
    setWorkExps((prev) => prev.filter((_, i) => i !== index));
  }

  function addWorkExp() {
    setWorkExps((prev) => [{ ...EMPTY_WORK_EXP }, ...prev]);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <h2 className="text-base font-semibold text-text-primary">Profile Information</h2>
      <p className="text-sm text-text-secondary mt-1 mb-6">
        Your profile publicly represents you in agent interactions.
      </p>

      {/* ── Personal Info ────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Personal Info</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={LABEL_CLASS}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-secondary cursor-not-allowed"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 555-5555"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>LinkedIn URL</label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="linkedin.com/in/yourname"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Portfolio / GitHub</label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://github.com/yourname"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Work Authorization</label>
            <select
              value={workAuthorization}
              onChange={(e) => setWorkAuthorization(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Select...</option>
              {WORK_AUTH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <hr className="my-6 border-border" />

      {/* ── Professional Info ────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Professional Info</h3>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Current / Last Job Title</label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <label className={LABEL_CLASS}>Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Select...</option>
                {EXPERIENCE_LEVELS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="4"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Skills</label>
            <TagInput tags={skills} onChange={setSkills} placeholder="e.g. React, TypeScript" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Industries Worked In (Optional)</label>
            <TagInput tags={industries} onChange={setIndustries} placeholder="e.g. FinTech, Healthcare" />
          </div>
        </div>
      </section>

      <hr className="my-6 border-border" />

      {/* ── Work Experience ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Work Experience</h3>
          <button
            type="button"
            onClick={addWorkExp}
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--color-accent)" }}
          >
            + Add experience
          </button>
        </div>
        <div className="space-y-4">
          {workExps.map((exp, index) => (
            <div key={index} className="rounded-xl border border-border p-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <label className={LABEL_CLASS}>Company Name</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateWorkExp(index, { company: e.target.value })}
                    placeholder="Acme Corp"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateWorkExp(index, { title: e.target.value })}
                    placeholder="Frontend Engineer"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <label className={LABEL_CLASS}>Start Date</label>
                  <div className="flex gap-2">
                    <select
                      value={exp.startMonth}
                      onChange={(e) => updateWorkExp(index, { startMonth: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-surface px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={exp.startYear}
                      onChange={(e) => updateWorkExp(index, { startYear: e.target.value })}
                      className="w-[80px] rounded-md border border-border bg-surface px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLASS}>End Date</label>
                  {exp.current ? (
                    <div className="py-2 text-sm text-text-muted">Present</div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={exp.endMonth ?? ""}
                        onChange={(e) => updateWorkExp(index, { endMonth: e.target.value })}
                        className="flex-1 rounded-md border border-border bg-surface px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={exp.endYear ?? ""}
                        onChange={(e) => updateWorkExp(index, { endYear: e.target.value })}
                        className="w-[80px] rounded-md border border-border bg-surface px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Year</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateWorkExp(index, { current: e.target.checked })}
                      className="rounded"
                      style={{ accentColor: "var(--color-accent)" }}
                    />
                    <span className="text-xs text-text-secondary">Currently working here</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={LABEL_CLASS} style={{ marginBottom: 0 }}>Key Responsibilities</label>
                  {workExps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkExp(index)}
                      className="text-xs transition-colors"
                      style={{ color: "var(--color-error)" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={exp.responsibilities}
                  onChange={(e) => updateWorkExp(index, { responsibilities: e.target.value })}
                  placeholder="Key achievements and responsibilities..."
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="my-6 border-border" />

      {/* ── Education ────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Education</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <label className={LABEL_CLASS}>Highest Degree</label>
            <select
              value={education.degree}
              onChange={(e) => setEducation({ ...education, degree: e.target.value })}
              className={SELECT_CLASS}
            >
              <option value="">Select...</option>
              {DEGREE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Field of Study</label>
            <input
              type="text"
              value={education.field}
              onChange={(e) => setEducation({ ...education, field: e.target.value })}
              placeholder="e.g. Computer Science"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Institution Name</label>
            <input
              type="text"
              value={education.institution}
              onChange={(e) => setEducation({ ...education, institution: e.target.value })}
              placeholder="e.g. MIT University"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Graduation Year</label>
            <input
              type="text"
              value={education.graduationYear}
              onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
              placeholder="YYYY"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </section>

      <hr className="my-6 border-border" />

      {/* ── Job Preferences ──────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Job Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Job Titles Seeking</label>
            <TagInput
              tags={jobTitlesSeeking}
              onChange={setJobTitlesSeeking}
              placeholder="e.g. Frontend Engineer, React Developer"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <label className={LABEL_CLASS}>Remote Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Select...</option>
                {REMOTE_PREFS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Salary Expectation (Optional)</label>
              <input
                type="text"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="e.g. $80k+"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Preferred Locations (Optional)</label>
            <TagInput
              tags={preferredLocations}
              onChange={setPreferredLocations}
              placeholder="e.g. New York, London"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Cover Letter Tone</label>
            <select
              value={coverLetterTone}
              onChange={(e) => setCoverLetterTone(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Select...</option>
              {COVER_LETTER_TONES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Save ─────────────────────────────────────── */}
      <div className="mt-8 space-y-3">
        {saveError && (
          <p className="text-sm text-center" style={{ color: "var(--color-error)" }}>
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p className="text-sm text-center" style={{ color: "var(--color-success)" }}>
            Profile saved successfully.
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-accent)" }}
        >
          {isPending ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </form>
  );
});

ProfileForm.displayName = "ProfileForm";
