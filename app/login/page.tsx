import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-[var(--shadow-card)]">
          {/* Logo */}
          <div className="flex justify-center mb-7">
            <img src="/logo.png" alt="JobPilot" className="h-9 w-auto" />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-xl font-semibold text-text-primary">
              Sign in to JobPilot
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Find, score, and research jobs with AI
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 rounded-lg bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_24%,transparent)] px-4 py-3">
              <p className="text-sm text-error text-center">
                {error === "oauth_failed" && "OAuth sign-in failed. Please try again."}
                {error === "no_code" && "Invalid callback. Please try again."}
                {error === "exchange_failed" && "Could not complete sign-in. Please try again."}
                {!["oauth_failed", "no_code", "exchange_failed"].includes(error) && "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3">
            <a
              href="/api/auth/oauth/google"
              className="flex items-center justify-center gap-3 h-11 rounded-lg border border-border bg-surface hover:bg-surface-secondary transition-colors text-sm font-medium text-text-primary"
            >
              <GoogleIcon />
              Continue with Google
            </a>

            <a
              href="/api/auth/oauth/github"
              className="flex items-center justify-center gap-3 h-11 rounded-lg border border-[color-mix(in_srgb,var(--color-overlay)_86%,var(--color-accent)_14%)] bg-[color-mix(in_srgb,var(--color-text-darker)_84%,var(--color-overlay-dark)_16%)] hover:bg-[color-mix(in_srgb,var(--color-text-black)_82%,var(--color-accent)_18%)] transition-colors text-sm font-medium text-[var(--color-accent-foreground)]"
            >
              <GitHubIcon />
              Continue with GitHub
            </a>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-text-muted">
            By continuing, you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2 cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}
