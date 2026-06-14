import Image from "next/image";

export function SuccessStory() {
  return (
    <section className="landing-panel bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Success Story
        </p>
        <blockquote className="mt-6 text-2xl leading-[1.5] tracking-[-0.01em] font-medium text-text-slate">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open
          my dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Alex Rivera"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover shrink-0"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">
              Alex Rivera
            </p>
            <p className="text-sm text-text-secondary">
              Senior Frontend Engineer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
