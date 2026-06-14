import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="JobPilot" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-dark hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            className="text-sm font-medium text-text-dark hover:text-text-primary transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-text-dark hover:text-text-primary transition-colors"
          >
            Profile
          </Link>
        </nav>

        <Link href="/login" className="landing-button-primary">
          Start for free
        </Link>
      </div>
    </header>
  );
}
