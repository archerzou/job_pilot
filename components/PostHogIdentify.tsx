"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface Props {
  userId: string;
  email?: string;
}

export function PostHogIdentify({ userId, email }: Props) {
  useEffect(() => {
    posthog.identify(userId, { email });
  }, [userId, email]);

  return null;
}
