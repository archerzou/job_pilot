"use client";

import Link from "next/link";
import posthog from "posthog-js";

type Props = {
  ctaHref: string;
};

export function CTASection({ ctaHref }: Props) {
  return (
    <section className="landing-panel landing-hero-glow">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 text-center">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-text-slate">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mt-6 text-base leading-7 text-text-secondary sm:text-lg max-w-xl mx-auto">
          Set up your profile, upload your resume, and let JobPilot find and
          research the jobs that actually fit.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ctaHref}
            className="landing-button-primary"
            onClick={() => posthog.capture("cta_clicked", { label: "Get Started", location: "cta_section" })}
          >
            Get Started
          </Link>
          <Link
            href="#how-it-works"
            className="landing-button-secondary"
            onClick={() => posthog.capture("cta_clicked", { label: "See How It Works", location: "cta_section" })}
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
