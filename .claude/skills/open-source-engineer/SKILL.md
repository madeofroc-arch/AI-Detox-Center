---
name: open-source-engineer
description: Open-source engineering quality for AI Detox Center. Use when working on repository structure, architecture documentation, ADRs, coding conventions, testing infrastructure, CI workflows, community files (README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, LICENSE), issue and PR templates, releases, or privacy and security reviews of the codebase.
---

# open-source-engineer

Turns Human Mode into **reliable, contributable open-source software**. Owns
engineering quality, community infrastructure, and the privacy architecture.

## Privacy defaults (binding)

- **Privacy-first, local-first, minimal data collection.**
- AI usage events, reflections, challenge history, and scores are stored on
  the local device by default.
- No server upload by default. Any future cloud feature must be explicit
  opt-in, documented, and reviewed by this skill before merge.
- Never collect: AI conversation contents, personal prompts, private
  reflections (beyond local storage), or unnecessary identifiers.
- The README must state: "Your thinking data stays on your device by default."

## Responsibility scope

Owns (single source of truth):

- Root community files: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `LICENSE` (MIT), `CHANGELOG.md`
- `.github/` — issue templates, PR template, `workflows/ci.yml`
- Repository structure, tooling config (tsconfig, eslint, workspaces)
- `docs/architecture/` — `technical-decisions.md`, `privacy.md`, `adr/`
- Test infrastructure and CI policy
- Release and versioning process

Does NOT own: product scope, design, or domain logic - it reviews their
engineering quality but does not redefine their content.

## Inputs

- Current repo state (read before changing structure)
- ADRs and `technical-decisions.md` (extend via new ADRs, never silently
  contradict an accepted ADR)
- Output of the other four skills (to document and gate)

## Outputs

- Community and architecture documents
- CI workflows that run at minimum: lint, typecheck, unit tests, build
- ADRs for significant technical decisions (numbered `docs/architecture/adr/`)
- Privacy/security review verdicts: PASS / FAIL with concrete findings

## Process

1. For structural changes: check existing conventions, propose in an ADR if
   significant, then implement.
2. For every release-worthy change: update `CHANGELOG.md` (Keep a Changelog
   format, SemVer).
3. For privacy review: grep for network calls, identifiers, and data flows;
   verify local-first storage; verify opt-in gates for anything leaving the
   device.
4. For CI: keep pipelines fast and deterministic; a red pipeline blocks merge.
5. Keep `CLAUDE.md` accurate as the repo evolves (commands, architecture,
   skill routing).

## Engineering conventions (binding)

- TypeScript strict mode everywhere; no `any` unless justified inline.
- `packages/core` stays dependency-light, pure, and platform-free.
- Tests accompany logic changes; a TODO is not a completed feature.
- Deterministic domain logic; UI is a thin layer over core.
- Conventional, descriptive commits; docs updated in the same change.

## Prohibitions

- Never add telemetry, analytics, or crash reporting that exfiltrates data by
  default.
- Never weaken the local-first default or the opt-in requirement.
- Never mark partial work as done in changelogs, READMEs, or reports.
- Never merge with red CI; never delete or bypass failing tests to go green.
- Do not invent product features or alter domain semantics.

## Done criteria

- CI green on lint + typecheck + tests + build.
- Community files current; CHANGELOG updated; ADR recorded for significant
  decisions; privacy review passes.

## Collaboration

- Consumes: everything the other skills produce (as review subject).
- Feeds: contribution infrastructure all skills and external contributors
  rely on.
- See `docs/architecture/skill-system.md`.
