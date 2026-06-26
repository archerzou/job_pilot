@AGENTS.md

## Project Skills

Skills live in `.agents/skills/<name>/SKILL.md`. Load a skill by invoking it as `/skill-name`. Always invoke the matching skill before starting the relevant work — do not skip them.

| When to invoke | Skill | What it does |
|---|---|---|
| Before writing any code for a new feature | `/architect` | Aligns on language, surfaces decisions, produces an implementation plan. Wait for explicit confirmation before coding. |
| After building any UI component | `/imprint` | Extracts visual patterns (colors, spacing, radius, states) and writes them to `ui-registry.md` so future components stay consistent. Run `/imprint audit` first if the project UI was not tracked from the start. |
| When something is broken and fix attempts are not working | `/recover` | Diagnoses whether the failure is a targeted bug, a polluted session, or a wrong foundational assumption — then prescribes the correct response. |
| At the end of every session | `/remember save` | Saves session state to `memory.md` so the next session can pick up exactly where this one left off. |
| At the start of every session | `/remember restore` | Reads `memory.md` and any context files to rebuild full project context before any work begins. |
| After completing a feature | `/review` | Verifies the feature matches the plan, respects architecture and design system, and is production-ready. Does not fix — reports findings for the developer to triage. |
| When writing or reviewing Tailwind classes | `/tailwind-css-patterns` | Full Tailwind utility reference: layout, spacing, responsive, flexbox, grid, typography, colors. |
| When styling components or checking design token usage | `/tailwind-best-practices` | Project-specific Tailwind rules: no arbitrary values, no design system overrides, use existing tokens only. |
| When composing utility classes for a component | `/tailwind-utility-classes` | Utility-first patterns for layout, spacing, typography, colors, and visual effects. |
