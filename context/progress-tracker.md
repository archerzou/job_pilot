# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard (COMPLETE)
**Last completed:** 17 Analytics Charts — Real DB Data
**Next:** Project feature-complete. Ready for Vercel deployment.

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — Real DB Data

---

## Decisions Made During Build

- Homepage built as reusable App Router components: `Navbar`, `Hero`, `HowItWorks`, `Features`, `SuccessStory`, `CTASection`, and `Footer`.
- Landing page visuals rely on shared token-driven helpers in `app/globals.css` (`landing-panel`, `landing-grid`, `landing-hero-glow`, `landing-divider`) instead of component-level hardcoded color values.
- Landing CTA styling now uses `text-[var(--color-accent-foreground)]` on dark CTAs to guarantee readable contrast on all link/button states.
- Primary homepage CTAs currently point to `/login` until auth flow is implemented in Feature 02.
- Auth uses InsForge `@insforge/sdk` v1.4.0 with SSR helpers from `@insforge/sdk/ssr` (`createServerClient`, `setAuthCookies`, `clearAuthCookies`, `DEFAULT_ACCESS_TOKEN_COOKIE`).
- OAuth starts through route handlers at `/api/auth/oauth/[provider]` (GET): calls `signInWithOAuth(provider, { redirectTo, skipBrowserRedirect: true })`, stores the PKCE `codeVerifier` in an httpOnly `insforge-pkce-verifier` cookie, then redirects to the provider URL.
- `/api/auth/callback` (GET) completes the OAuth exchange server-side: reads `insforge_code` from URL + `codeVerifier` from cookie → calls `exchangeOAuthCode(code, codeVerifier)` → `setAuthCookies` → redirects to `/dashboard`. Cookie names are `insforge_access_token` / `insforge_refresh_token`.
- `/api/auth/logout` (POST) calls `client.auth.signOut()` then `clearAuthCookies`, redirects to `/`.
- `lib/auth.ts` exports `getServerClient()`, `getUser()`, and `requireUser()` (redirects to `/login` if unauthenticated) using `createServerClient` with Next.js `cookies()` store.
- Next.js 16 route protection uses root `proxy.ts` (exports `proxy` function, not `middleware`) — `middleware.ts` is deprecated in Next.js 16. Checks for `insforge_access_token` cookie; redirects to `/login` if absent.
- Env vars required: `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`.
- PostHog browser initialization now runs from root `instrumentation-client.ts`, backed by `lib/posthog-client.ts`, and accepts either `NEXT_PUBLIC_POSTHOG_KEY` or PostHog's setup-screen `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`. `NEXT_PUBLIC_POSTHOG_HOST` defaults to US Cloud when omitted.
- PostHog server tracking is centralized in `lib/posthog-server.ts` with a typed event contract limited to the seven approved JobPilot event names.
- Authenticated placeholder pages call `posthog.identify()` through `PostHogIdentify`, and current sign-out links call `posthog.reset()` before hitting `/api/auth/logout`.

---

## Notes

- The homepage uses the provided assets from `public/logo.png` and `public/images/` to match the approved design.
- Production build verification passed after allowing `next/font` to fetch the required Inter font outside the sandbox.
- Feature 02 lint and production build verification passed. Build still requires network access for `next/font` to fetch Inter.
- Feature 03 lint and production build verification passed. The first build attempt still failed on the known sandboxed `next/font` Inter fetch; rerunning with network access passed. PostHog will stay inactive until `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is present in `.env.local`.
- Feature 03 finalized via the PostHog Wizard: singleton init in `instrumentation-client.ts`, `/ingest/*` reverse proxy in `next.config.ts`, server client in `lib/posthog-server.ts`, server-side `identify` + `login_completed`/`login_failed` in `app/api/auth/callback/route.ts`, `logout_completed` in `app/api/auth/logout/route.ts`, `dashboard_viewed` + `PostHogIdentify` on `app/dashboard/page.tsx`, `cta_clicked` on Hero/CTASection, `login_initiated`/`login_error_displayed` in `LoginButtons`. Navbar tracking added on top: `cta_clicked` for "Start for free" and `nav_link_clicked` for logo/Dashboard/Find Jobs/Profile. Env vars: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`. See `posthog-setup-report.md`.
- Feature 04: four tables (`profiles`, `agent_runs`, `jobs`, `agent_logs`) created via InsForge CLI migrations with full RLS (16 policies). Two Postgres triggers on `profiles`: `on_profile_updated` auto-sets `updated_at`; `on_auth_user_created` on `auth.users` auto-inserts a minimal profile row on signup. `resumes` private storage bucket created with path-scoped RLS on `storage.objects`. `types/index.ts` created with `Profile`, `WorkExperience`, `Education`, `AgentRun`, `Job`, `AgentLog` interfaces.
- Feature 06: `actions/profile.ts` created with `saveProfile` (text fields → `profiles` table, `is_complete` calculated via `calculateCompletion`, `profile_completed` PostHog event on first completion) and `uploadResume` (PDF → InsForge Storage at `{userId}/resume.pdf`, URL saved to `profiles.resume_pdf_url`). `lib/profile-utils.ts` created with shared `calculateCompletion` (9 required fields). `MissingField` union type moved to `types/index.ts`. `ProfileForm` now accepts `profile` prop, initialises all state from DB, has `<form onSubmit>` with `useTransition`, loading/error/success feedback, and `coverLetterTone` field added to Job Preferences. `ResumeSection` uploads on file selection via `uploadResume`. `ProfilePage` fetches full profile from DB and passes real data to all components. Three bugs fixed post-build: (1) `requireUser()` moved outside `try/catch` in both actions so `NEXT_REDIRECT` is never swallowed; (2) `parseInt` NaN guard added for years of experience; (3) `.select("id").maybeSingle()` added after `.update()` so zero-rows-updated is caught as an error instead of silent success. Profile row backfilled for existing user via `INSERT … ON CONFLICT DO NOTHING`. `ProfileAttentionBanner` now returns `null` at 100% completion.
- Feature 08: `@react-pdf/renderer` installed. `app/api/resume/generate/route.tsx` (POST handler: auth → profile fetch → GPT-4o content + skill categorization → `renderToBuffer` via `renderResumePDF` helper → storage remove+upload → DB update → `revalidatePath`) and `app/api/resume/generate/ResumePDF.tsx` (server-only PDF component: name/contact header, Summary, Technical Skills categorized rows, Work Experience with title+company inline + date right-aligned, Education) created. `app/api/resume/download/route.ts` (GET, `Content-Disposition: attachment`) created. `ResumeSection.tsx`: "View Resume" button removed; `handleGenerate` wired to Generate button; success message with download link appears below the Generate button row. Route file is `.tsx` (JSX required for `renderToBuffer`). JSX extracted to `renderResumePDF()` helper to satisfy `react-hooks/error-boundaries` lint rule. Buffer cast to `ArrayBuffer` via `.buffer.slice()` before `new Blob()`. `GeneratedContent` type updated to include `categorizedSkills: Array<{category, items}>`.
- Feature 07: `extractProfile` Server Action added to `actions/profile.ts`. Installs `pdf-parse@1.1.1` (v1) and `openai`. Flow: download resume from InsForge Storage → `pdf-parse` extracts text → GPT-4o with `response_format: json_object`, `temperature: 0.3`, `max_tokens: 800` → `ExtractedProfile` typed return. Empty-text guard returns user-friendly error. `ProfileForm` gains `ProfileFormHandle` ref type with `applyExtracted()` method via `useImperativeHandle`. `ResumeSection` gains `onExtracted` callback prop and an `Extract Profile` button (only visible when a resume exists). Thin `ProfilePageClient` client wrapper holds the `useRef<ProfileFormHandle>` and wires `ResumeSection.onExtracted → ProfileForm.applyExtracted`. `app/profile/page.tsx` now renders `ProfilePageClient` instead of the two components separately. Critical notes: (1) Must use `pdf-parse@1.1.1` (v1), NOT v2 — v2 uses pdfjs-dist v5 with ESM-only web workers that webpack cannot bundle in Server Actions. (2) Must import from `pdf-parse/lib/pdf-parse.js`, NOT the package index — the index.js has a debug block that reads a test PDF file on every `require()` call when `module.parent` is null (always true under Next.js/Turbopack), causing an ENOENT crash on page load.
- Feature 11: `GET /api/jobs` route created — accepts `search`, `matchFilter`, `sortOption`, `page` query params; runs server-side InsForge DB query with `.ilike` text search, `.gte`/`.lt` match score filters, `.order` sort, and `.range` pagination (20 per page); returns `{ jobs, totalCount, page, pageSize }`. `FindJobsClient` refactored: removed `useMemo`, added `fetchJobs` callback (called via `useEffect` on filter/sort/page changes and after a successful search); `initialTotalCount` prop added. `JobsTable` gains optional `isLoading` prop — dims table to `opacity-60` during fetch and skips empty-state when loading. `app/find-jobs/page.tsx` updated to fetch first page with `match_score` sort and pass `count` as `initialTotalCount`.
- Feature 10: `lib/adzuna.ts` — `searchJobs` HTTP helper. `app/api/agent/find/route.ts` — POST handler: auth → profile fetch → agent_run insert → Adzuna search → single GPT-4o batch scoring call → DB insert → agent_run update. `FindJobsClient` wired to `/api/agent/find`; after search, re-fetches from DB via `fetchJobs`. `jobs.source` corrected from `"linkedin"|"url"` to `"search"|"url"`.
- Feature 09: Find Jobs page built with mock data matching the design. `lib/utils.ts` created with `MATCH_THRESHOLD = 70`, `getMatchScoreColor`, `getMatchScoreTextColor`, `formatDate`, `formatSalary`. Components: `SearchControls` (job title + location inputs, Find Jobs button, success banner), `JobFilters` (text search + All Matches/High Match/Low Match dropdown + Match Score/Newest/Oldest sort), `JobsTable` (company icon, role, match score progress bar with score-range colors, salary, source badge, date), `JobsPagination` (showing X to Y of Z, Previous/page numbers/Next). `FindJobsClient` client wrapper owns all filter/sort/pagination state with `useMemo` for derived list. Filter and sort reset page to 1 on change. `Jobs by Adzuna` credit shown when jobs exist. Mock data uses 6 jobs matching the design exactly.
- Feature 05: full profile page UI built with mock data. Components: `ProfileAttentionBanner` (SVG completion ring, missing field warning badges), `ConnectedAccounts` (LinkedIn row with Connect button), `ResumeSection` (drag-and-drop PDF upload area, Generate Resume from Profile button), `ProfileForm` (Personal Info, Professional Info with tag inputs for skills/industries, Work Experience with add/remove roles + month/year selects, Education, Job Preferences). Navbar updated to `"use client"` with `usePathname`-driven active link highlighting.
- Feature 12: `app/find-jobs/[id]/page.tsx` created as a dynamic, server-rendered job details route. It authenticates with `requireUser()`, fetches one `jobs` row scoped by both `id` and `user_id`, and renders `notFound()` when unavailable. Components added under `components/job-details/`: `JobActions`, `JobInfo`, `MatchScore`, `JobDescription`, and `CompanyResearch`. The page matches `context/designs/job-details.png`: centered detail column, Back to Jobs link, job header with placeholder company icon, match score badge, View Job Post link, four info cards, AI match reasoning card, matched/gap skill badges, description card, company research empty state, and bottom Apply Now CTA. `Navbar` now accepts `isAuthenticated` to show the signed-in app actions shown in the design; authenticated app pages opt into that state. `types/index.ts` now includes `CompanyResearchDossier` and `Job.company_research`. Verification: `npm run lint` passes with four pre-existing warnings; `npm run build` passes and includes `/find-jobs/[id]`.
- Feature 12 review follow-up: `JobDescription` now renders the full stored description with `whitespace-pre-line`, includes populated structured sections (`responsibilities`, `requirements`, `nice_to_have`, `benefits`), and detects Adzuna previews ending in `…` or `...` to show a `View Full Job Post` notice. Important caveat: Adzuna `description` is often a source-side preview, so the app cannot display text that was never returned/saved; users get a direct full-post fallback in those cases. Verification: `npm run lint && npm run build` passes with the same four pre-existing warnings.
- Feature 17: Analytics Charts wired to real DB data. `AnalyticsCharts.tsx` deleted and split into three single-component files: `CompanyResearchChart.tsx` (BarChart, `data: {day, count}[]`), `JobsOverTimeChart.tsx` (AreaChart, `data: {day, jobs}[]`), `MatchDistributionChart.tsx` (BarChart, `data: {range, count}[]`). `fetchChartData(userId)` added to `app/dashboard/page.tsx`: two parallel DB queries bucket jobs into rolling 7-day day slots and match-score ranges (50-60 / 60-70 / 70-80 / 80-90 / 90-100). Charts use design-token CSS variables for colors. Additional changes this session: mobile hamburger nav added to Navbar (Menu/X icons, dropdown with nav links); desktop user avatar panel (UserCircle → floating panel with email + sign out); sign out fixed to `fetch('/api/auth/logout', { method: 'POST' }) + window.location.href = '/login'`; `/api/auth/logout` returns 200 (no redirect), deletes both cookies explicitly; `agent/find.ts` extracted from route with `batchScoreJobs` + `captureJobSearchEvents` firing `job_search_started`/`job_found`; full project code-standards audit resolved all Critical/Important issues; `npm run build` clean with 0 ESLint errors.
- Feature 13: Company Research Agent complete. `agent/research.ts` resolves the Adzuna redirect URL to the company homepage domain, runs a Browserbase + Stagehand v3 session (homepage extraction → up to 3 sub-page extractions with Zod schemas), then synthesises a 9-field `CompanyResearchDossier` with GPT-4o (temperature 0.4). Falls back to a minimal dossier if browser research or synthesis fails. `app/api/agent/research/route.ts` authenticates, validates `jobId`, fetches job + profile from DB, calls `runCompanyResearch`, saves result to `jobs.company_research`, calls `revalidatePath`, and tracks `company_researched` via PostHog. `components/job-details/CompanyResearch.tsx` wires the "Research Company" button to the API (loading spinner, error display, `router.refresh()` on success) and renders the full dossier when present: overview paragraph, tech chip badges, culture/yourEdge/gaps/interviewPrep bullet lists, smart questions numbered list, sources links. Stagehand v3 API note: `extract()` takes `(instruction, schema, options?)` as separate args; model config goes in `model: { modelName, apiKey }`. New deps: `@browserbasehq/sdk`, `@browserbasehq/stagehand`, `zod`. Verification: `npx tsc --noEmit` passes; `npm run build` passes and includes `/api/agent/research`.
