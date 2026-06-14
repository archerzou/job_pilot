"use client";

import posthog from "posthog-js";

export function LogoutButton() {
  return (
    <form
      action="/api/auth/logout"
      method="POST"
      onSubmit={() => posthog.reset()}
    >
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
