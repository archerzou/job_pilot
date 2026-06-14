import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="landing-panel landing-hero-glow">
      {/* Copy */}
      <div className="flex flex-col items-center text-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 border-b border-border">
        <h1 className="text-[clamp(2.75rem,7vw,4.625rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-text-slate max-w-3xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mt-6 text-base leading-7 text-text-secondary sm:text-lg max-w-xl">
          Stop spending evenings copy-pasting resumes. JobPilot finds jobs that
          fit your skills, scores them against your profile, and researches every
          company — so you show up ready to impress.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="landing-button-primary">
            Get Started
          </Link>
          <Link href="/login" className="landing-button-secondary">
            Find Your First Match
          </Link>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="px-4 pt-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          {/* Browser chrome frame */}
          <div className="landing-browser-shadow overflow-hidden rounded-t-[20px] border border-border border-b-0">
            {/* Address bar row */}
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-error opacity-70" />
                <span className="h-3 w-3 rounded-full bg-warning opacity-70" />
                <span className="h-3 w-3 rounded-full bg-success opacity-70" />
              </div>
              <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-surface-secondary px-3">
                <span className="text-[11px] text-text-muted">
                  jobpilot.ai/dashboard
                </span>
              </div>
            </div>
            {/* Screenshot */}
            <Image
              src="/images/dashboard-demo.png"
              alt="JobPilot dashboard showing job matches and analytics"
              width={1200}
              height={750}
              className="w-full h-auto block"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
