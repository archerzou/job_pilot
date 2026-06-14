import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginButtons } from "@/components/login/LoginButtons";

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

          <LoginButtons error={error} />

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
