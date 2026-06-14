<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the JobPilot Next.js App Router project.

## What was done

- **Client-side initialization** — `instrumentation-client.ts` initialises PostHog via the singleton pattern recommended for Next.js 15.3+, with a reverse proxy (`/ingest/*`) to reduce ad-blocker interference. Exception capture is enabled automatically.
- **Reverse proxy** — `next.config.ts` now rewrites `/ingest/*` to PostHog's US ingestion and assets endpoints, including the required `/ingest/static/*` and `/ingest/array/*` routes.
- **Server-side client** — `lib/posthog-server.ts` provides a lightweight `getPostHogClient()` helper using `posthog-node` with `flushAt: 1` / `flushInterval: 0` so events are sent immediately from API routes and Server Components.
- **Environment variables** — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` written to `.env.local`.
- **User identification** — the OAuth callback identifies the user server-side via `posthog.identify()` using the `sub` claim from the JWT access token. The `PostHogIdentify` client component calls `posthog.identify()` in the browser as soon as the dashboard renders, ensuring anonymous pre-login events are merged with the known user. `posthog.reset()` is called on sign-out.
- **Event capture** — eight events instrumented across client and server code (see table below).

## Events

| Event | Description | File |
|-------|-------------|------|
| `cta_clicked` | User clicks a CTA button on the homepage (Get Started, Find Your First Match, See How It Works) | `components/homepage/Hero.tsx`, `components/homepage/CTASection.tsx` |
| `login_initiated` | User clicks Continue with Google or Continue with GitHub | `components/login/LoginButtons.tsx` |
| `login_error_displayed` | OAuth error banner is shown on the login page | `components/login/LoginButtons.tsx` |
| `login_completed` | User successfully completes OAuth sign-in (server-side) | `app/api/auth/callback/route.ts` |
| `login_failed` | OAuth code exchange fails (server-side) | `app/api/auth/callback/route.ts` |
| `logout_completed` | User successfully signs out (server-side) | `app/api/auth/logout/route.ts` |
| `dashboard_viewed` | Authenticated user views the dashboard (server-side) | `app/dashboard/page.tsx` |

## Next steps

We've built a dashboard and five insights to monitor the most important user-journey metrics:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/469806/dashboard/1710720)
- [Login Conversion Funnel (wizard)](https://us.posthog.com/project/469806/insights/8aCCd3jf)
- [CTA Clicks Over Time (wizard)](https://us.posthog.com/project/469806/insights/RZ81MzFh)
- [Auth Events: Logins vs Logouts (wizard)](https://us.posthog.com/project/469806/insights/PBPuKVWF)
- [Login Failures (wizard)](https://us.posthog.com/project/469806/insights/CutMk5mI)
- [Dashboard Views (wizard)](https://us.posthog.com/project/469806/insights/VNqnHtI6)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
