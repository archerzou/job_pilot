# Memory — JobPilot Project

Last updated: 2026-06-20

---

## Current state

- **Feature 06 (Profile Save Logic)**: complete. Server Actions, form wiring, resume upload, DB fetch on page load all working.
- **progress-tracker.md**: updated — Feature 06 marked complete, next is Feature 07.
- **`ui-registry.md`**: NOT yet created. Imprint audit baseline was established (table in Open Questions). Still pending.

---

## Next session starts with

1. **Run `/remember restore`** to reload this context
2. **Start Feature 07: AI Profile Extraction from Resume**
   - Run `/architect feature 07` first — fetch InsForge + OpenAI docs before writing any code
   - Flow: user uploads PDF → extract text → GPT → auto-fill `ProfileForm` fields

---

## What was built (this session — 2026-06-20, Feature 06)

**`lib/profile-utils.ts`** (created)
- `calculateCompletion(profile)` — returns `{ pct, missing }` based on 9 required fields
- `MissingField` union type exported from here

**`actions/profile.ts`** (created)
- `saveProfile(data: ProfileFormData)` — maps camelCase form data → snake_case DB columns, calls `client.database.from("profiles").update({...}).eq("id", user.id)`, fires `profile_completed` PostHog event on first completion, calls `revalidatePath("/profile")`
- `uploadResume(formData: FormData)` — validates PDF ≤ 5MB, removes existing file then uploads to InsForge Storage at `{userId}/resume.pdf`, saves URL to `profiles.resume_pdf_url`
- `requireUser()` called outside try/catch in both actions (NEXT_REDIRECT must not be caught)

**`components/profile/ProfileForm.tsx`** (modified)
- Now accepts `profile: ProfileFormData` prop and initialises all state from it
- Changed `<div>` → `<form onSubmit={handleSubmit}>`
- `useTransition` + `isPending` / `saveError` / `saveSuccess` state
- Save button: `type="submit"`, disabled during pending, shows "Saving…" / error / success

**`components/profile/ResumeSection.tsx`** (modified)
- `handleFile()` creates FormData and calls `uploadResume` via `startTransition`
- Wired to file input `onChange` and drag-and-drop `onDrop`
- Shows upload loading / error / success state

**`components/profile/ProfileAttentionBanner.tsx`** (modified)
- Now uses `MissingField` type from `lib/profile-utils`

**`app/profile/page.tsx`** (modified — twice)
- Fetches real profile from DB: `client.database.from("profiles").select("*").eq("id", user.id).maybeSingle()`
- Maps snake_case DB row → camelCase `ProfileFormData`
- Calls `calculateCompletion(dbProfile)` for real completion %/missing fields

---

## Bugs found and fixed (this session)

### Bug 1 — profiles table had 0 rows (root cause of "saving doesn't work")
`on_auth_user_created` trigger existed and was correct, but both users registered before the trigger was installed. Backfilled with:
```sql
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT id, email, NOW(), NOW() FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### Bug 2 — `upsert()` not in InsForge SDK
After backfill, changed `update()` to `upsert()` as a safety net — but InsForge SDK docs only expose `insert`, `update`, `delete`, `select`, `rpc`. No `upsert`. The call returned no error but wrote null values for all fields. Reverted to `.update().eq("id", user.id)`. Rows now exist via backfill + trigger, so `update` is correct.

---

## What was built (previous sessions)

**Feature 05 (Profile Page Full UI):** `ProfileAttentionBanner`, `ConnectedAccounts`, `ResumeSection`, `TagInput`, `ProfileForm` all in `components/profile/`. `app/profile/page.tsx` with `requireUser()`.

**Navbar rework:** authenticated = logo + nav links right (Dashboard · Find Jobs · Profile). Unauthenticated = logo + "Start for free" button right. No "Go to Dashboard" CTA button.

**Profile page width:** `max-w-[800px] px-6`.

---

## Decisions made (locked)

- **InsForge DB client**: `client.database.from()` — NOT `client.from()`. The SSR client (`createServerClient`) namespaces it under `.database`.
- **Server Actions**: `requireUser()` must be outside try/catch — `NEXT_REDIRECT` thrown by `redirect()` must not be swallowed.
- **InsForge has no `upsert()`**: Use `update().eq("id", user.id)`. Profile rows are guaranteed to exist via the `on_auth_user_created` trigger.
- **Navbar layout**: authenticated = logo + nav links right (no button). Unauthenticated = logo + "Start for free" right.
- **Profile page max-width**: `max-w-[800px]` — matches design. Do not revert.
- **logout redirect**: 303 not 307 — form POST + 307 causes browser to re-POST to "/" returning 405.
- **Skills**: user-invokable slash commands live in `.claude/skills/`. `.agents/skills/` is Claude-internal only.

---

## Technical gotchas (hard-won — do not repeat)

### InsForge SSR auth requires `isServerMode: true`
Route handlers calling auth methods must use:
```ts
const insforge = createClient({ baseUrl: ..., anonKey: ..., isServerMode: true });
```
Without it, refresh token arrives as Set-Cookie (never reaches browser) → sessions die after ~1h.

Cookie names: `insforge_access_token` / `insforge_refresh_token`.

### Next.js 16 — `proxy.ts` not `middleware.ts`
Route protection in `proxy.ts` at repo root. Export must be named `proxy`, not `middleware`.

### Tailwind v4 — wrap base-element styles in `@layer base`
Unlayered selectors in `globals.css` beat utility classes. Always use `@layer base { a { ... } }`.

### PostHog — initialized via wizard, do not re-init
Singleton in `instrumentation-client.ts`. Server: `getPostHogClient()` from `lib/posthog-server.ts` + `await posthog.shutdown()`.

### No `gh` CLI and no git remote
`gh` not on PATH. `git remote -v` is empty. Use local diff for reviews.

---

## Feedback rules (apply every session)

### Always screenshot + compare before reporting UI done
1. Run playwright screenshot at 1440px
2. Read screenshot and design PNG side-by-side
3. Only report done when proportions, font weight, spacing match

### Verify `progress-tracker.md` against actual code before trusting it
Has been aspirational before. Grep for libraries, glob for directories before starting a feature.

---

## Imprint audit baseline (pending — write to `ui-registry.md`)

2 minor conflicts across 14 components. No raw hex values anywhere.

Conflicts:
1. **Shadow** — 4 profile cards use `style={{ boxShadow: "var(--shadow-card)" }}`; HowItWorks uses `shadow-card` class → standardise on `shadow-card`
2. **GitHub button** — `color-mix()` arbitrary values → deferred

| Property | Correct pattern |
|---|---|
| Card container | `bg-surface rounded-2xl border border-border p-6 shadow-card` |
| Row item within card | `rounded-xl border border-border px-4 py-3` |
| Button — primary (accent) | `px-4 py-2 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity` + `style={{ background: "var(--color-accent)" }}` |
| Button — secondary | `px-4 py-2 rounded-md border border-border bg-surface text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors` |
| Button — auth CTA | `h-11 rounded-lg border border-border bg-surface text-sm font-medium hover:bg-surface-secondary transition-colors` |
| Input / Select | `rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent` |
| Label | `text-xs font-medium text-text-secondary uppercase tracking-wide` |
| Tag / chip | `rounded-full px-3 py-1 text-sm font-medium` + `style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}` |
| Text — primary | `text-text-primary` |
| Text — secondary | `text-text-secondary` |
| Text — muted | `text-text-muted` |
| Card section heading | `text-base font-semibold text-text-primary` |
| Form subsection heading | `text-sm font-semibold text-text-primary` |

---

## Open questions

- Write `ui-registry.md` from imprint baseline above (confirm shadow conflict fix first)
- Should profile card inline shadows be converted to `shadow-card` class? (minor, do during next profile touch)
