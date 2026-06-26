"use client";

import { useRef } from "react";
import { ProfileForm, type ProfileFormHandle } from "@/components/profile/ProfileForm";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import type { ProfileFormData } from "@/components/profile/ProfileForm";
import type { ExtractedProfile, MissingField } from "@/lib/profile-utils";

type Props = {
  profile: ProfileFormData;
  resumeUrl?: string | null;
  pct: number;
  missing: MissingField[];
};

export function ProfilePageClient({ profile, resumeUrl, pct, missing }: Props) {
  const formRef = useRef<ProfileFormHandle>(null);

  return (
    <>
      <ProfileAttentionBanner completionPct={pct} missingFields={missing} />
      <ConnectedAccounts />
      <ResumeSection
        resumeUrl={resumeUrl}
        onExtracted={(data: ExtractedProfile) => formRef.current?.applyExtracted(data)}
      />
      <ProfileForm ref={formRef} profile={profile} />
    </>
  );
}
