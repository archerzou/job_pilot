import Image from "next/image";

export function Features() {
  return (
    <section className="landing-panel landing-grid overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Visual (shown below copy on mobile) */}
        <div className="bg-surface-tertiary flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 order-2 lg:order-1 border-t border-border lg:border-t-0 lg:border-r">
          <div className="rounded-[24px] overflow-hidden w-full max-w-lg">
            <Image
              src="/images/agnet-log.png"
              alt="AI agent research log in action"
              width={800}
              height={600}
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* Right: Copy */}
        <div className="bg-surface order-1 lg:order-2">
          <div className="px-9 py-9 sm:px-12 sm:py-12 lg:px-14 lg:py-16 border-b border-border">
            <h2 className="text-[clamp(1.875rem,3.2vw,2.625rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text-slate">
              Apply With More Confidence, Every Time
            </h2>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">
              Understand the Company, Deeply
            </h3>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              Browserbase visits the company's actual website. Stagehand
              extracts what matters. GPT-4o turns raw signals into a briefing
              tailored to your specific background.
            </p>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14 border-b border-border">
            <div className="border-l-2 border-success pl-5">
              <h3 className="text-lg font-semibold text-text-primary">
                An Advantage Over Every Applicant
              </h3>
              <p className="mt-2 text-base leading-7 text-text-secondary">
                Your edge, identified. Your gaps, reframed as strategy.
                Interview questions that prove you did your homework — generated
                specifically for you and this role.
              </p>
            </div>
          </div>

          <div className="px-9 py-7 sm:px-12 lg:px-14">
            <h3 className="text-lg font-semibold text-text-primary">
              Focus on the Right Applications
            </h3>
            <p className="mt-2 text-base leading-7 text-text-secondary">
              Match scores tell you where your time is best spent.
              High-confidence roles rise to the top so you apply with purpose,
              not guesswork.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
