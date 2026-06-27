"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import posthog from "posthog-js";

type Props = {
  isAuthenticated?: boolean;
  userEmail?: string;
};

export function Navbar({ isAuthenticated = false, userEmail }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  async function handleSignOut() {
    try { posthog.reset(); } catch {}
    setPanelOpen(false);
    setMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    // Hard navigation so the login page is fetched fresh without cached auth state
    window.location.href = "/login";
  }

  function navClass(href: string): string {
    return `text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? "text-accent"
        : "text-text-dark hover:text-text-primary"
    }`;
  }

  function mobileNavClass(href: string): string {
    return `block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      pathname.startsWith(href)
        ? "text-accent bg-surface-secondary"
        : "text-text-dark hover:text-text-primary hover:bg-surface-secondary"
    }`;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/find-jobs", label: "Find Jobs" },
    { href: "/profile", label: "Profile" },
  ];

  const signOutButton = (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-text-dark hover:text-text-primary hover:bg-surface-secondary transition-colors"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0"
          onClick={() => posthog.capture("nav_link_clicked", { label: "logo", href: "/" })}
        >
          <img src="/logo.png" alt="JobPilot" className="h-8 w-auto" />
        </Link>

        {isAuthenticated ? (
          <>
            {/* Desktop center nav */}
            <nav className="flex-1 hidden md:flex justify-center items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={navClass(href)}
                  onClick={() => posthog.capture("nav_link_clicked", { label, href })}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop right: avatar button + panel */}
            <div className="hidden md:flex shrink-0 relative" ref={panelRef}>
              <button
                type="button"
                aria-label="Account menu"
                onClick={() => setPanelOpen((o) => !o)}
                className="p-1 rounded-full text-text-secondary hover:text-text-primary transition-colors"
              >
                <UserCircle size={28} />
              </button>

              {panelOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-surface shadow-card z-50 overflow-hidden">
                  <div className="flex flex-col items-center gap-3 px-6 py-6 border-b border-border">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-secondary text-text-secondary">
                      <UserCircle size={48} />
                    </div>
                    <p className="text-sm font-medium text-text-primary text-center break-all">
                      {userEmail ?? "Account"}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    {signOutButton}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden ml-auto p-2 rounded-lg text-text-dark hover:text-text-primary hover:bg-surface-secondary transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        ) : (
          <div className="ml-auto">
            <Link
              href="/login"
              className="landing-button-primary"
              onClick={() => posthog.capture("cta_clicked", { label: "Start for free", location: "navbar" })}
            >
              Start for free
            </Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isAuthenticated && menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pb-3 pt-2">
          {userEmail && (
            <div className="flex items-center gap-3 px-4 py-3 mb-1">
              <UserCircle size={20} className="text-text-secondary shrink-0" />
              <span className="text-sm text-text-secondary truncate">{userEmail}</span>
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={mobileNavClass(href)}
                onClick={() => {
                  posthog.capture("nav_link_clicked", { label, href });
                  setMenuOpen(false);
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 pt-2 border-t border-border">
            {signOutButton}
          </div>
        </div>
      )}
    </header>
  );
}
