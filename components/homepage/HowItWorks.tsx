import Image from "next/image";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-panel landing-grid overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="bg-surface border-b border-border lg:border-b-0 lg:border-r">
          <div className="px-9 py-9 sm:px-12 sm:py-12 lg:px-14 lg:py-16 border-b border-border">
            <h2 className="text-[clamp(1.875rem,3.2vw,2.625rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text-slate">
              Manage Your Job Search With Ease
            </h2>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14 border-b border-border">
            <div className="border-l-2 border-accent pl-5">
              <h3 className="text-lg font-semibold text-text-primary">
                Find Jobs That Actually Fit
              </h3>
              <p className="mt-2 text-base leading-7 text-text-secondary">
                Adzuna surfaces the relevant roles. GPT-4o scores each one
                0–100 against your real skills — no guessing, no wasted
                applications.
              </p>
            </div>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">
              Know the Company Before You Apply
            </h3>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              One click launches the research agent. It browses the company's
              site, extracts their tech stack and culture, and builds a dossier
              tailored to your background.
            </p>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14">
            <h3 className="text-lg font-semibold text-text-primary">
              Keep Track of Every Application
            </h3>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              Every job you've discovered, scored, and researched — all in one
              dashboard with activity history and match analytics.
            </p>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="bg-surface-tertiary flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="rounded-[24px] overflow-hidden shadow-card border border-border w-full max-w-lg">
            <Image
              src="/images/jobs-lists.png"
              alt="Job listings with AI match scores"
              width={800}
              height={600}
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
