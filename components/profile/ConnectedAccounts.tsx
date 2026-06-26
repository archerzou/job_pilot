export function ConnectedAccounts() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h2 className="text-base font-semibold text-text-primary">Connected Accounts</h2>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Connect your LinkedIn to let the agent handle manual apply with LinkedIn workflows.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--color-linkedin)" }}
          >
            <span className="text-white font-bold text-sm">in</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">LinkedIn</p>
            <p className="text-xs text-text-muted">Not Connected</p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 px-3 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: "var(--color-info-dark)" }}
        >
          Connect LinkedIn
        </button>
      </div>
    </div>
  );
}
