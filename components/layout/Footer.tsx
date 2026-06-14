import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface border-x border-b border-border">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="JobPilot" className="h-8 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>
    </footer>
  );
}
