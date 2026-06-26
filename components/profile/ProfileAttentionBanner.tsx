import type { MissingField } from "@/lib/profile-utils";

type Props = {
  completionPct: number;
  missingFields: MissingField[];
};

export function ProfileAttentionBanner({ completionPct, missingFields }: Props) {
  if (completionPct === 100) return null;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - completionPct / 100);

  return (
    <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--color-warning)" }}>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-base font-semibold text-text-primary">Profile needs attention</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Complete these fields to improve your chances of getting interviews and generating quality resumes.
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span
                key={field}
                className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
                style={{
                  background: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
                  color: "var(--color-warning)",
                }}
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="9" />
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="absolute text-lg font-semibold text-text-primary">{completionPct}%</span>
        </div>
      </div>
    </div>
  );
}
