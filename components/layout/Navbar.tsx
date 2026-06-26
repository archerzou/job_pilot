"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

type Props = {
  isAuthenticated?: boolean;
};

export function Navbar({ isAuthenticated = false }: Props) {
  const pathname = usePathname();

  function navClass(href: string): string {
    return `text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? "text-accent"
        : "text-text-dark hover:text-text-primary"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center shrink-0"
          onClick={() => posthog.capture("nav_link_clicked", { label: "logo", href: "/" })}
        >
          <img src="/logo.png" alt="JobPilot" className="h-8 w-auto" />
        </Link>

        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={navClass("/dashboard")}
              onClick={() => posthog.capture("nav_link_clicked", { label: "Dashboard", href: "/dashboard" })}
            >
              Dashboard
            </Link>
            <Link
              href="/find-jobs"
              className={navClass("/find-jobs")}
              onClick={() => posthog.capture("nav_link_clicked", { label: "Find Jobs", href: "/find-jobs" })}
            >
              Find Jobs
            </Link>
            <Link
              href="/profile"
              className={navClass("/profile")}
              onClick={() => posthog.capture("nav_link_clicked", { label: "Profile", href: "/profile" })}
            >
              Profile
            </Link>
          </nav>
        ) : (
          <Link
            href="/login"
            className="landing-button-primary"
            onClick={() => posthog.capture("cta_clicked", { label: "Start for free", location: "navbar" })}
          >
            Start for free
          </Link>
        )}
      </div>
    </header>
  );
}
