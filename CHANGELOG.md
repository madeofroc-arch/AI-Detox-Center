# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Skill-driven development system: five Claude Code skills
  (product-architect, ux-ui-designer, ai-detox-engine,
  human-challenge-engine, open-source-engineer) with an orchestration
  contract in `docs/architecture/skill-system.md`.
- Product documentation: vision, personas, user journeys, MVP scope,
  roadmap, metrics (with anti-metrics).
- Design documentation: "Quiet Mind" design system, user flows, 10 screen
  specs, accessibility requirements.
- Architecture documentation: technical decisions index, privacy
  architecture, ADRs 0001-0004.
- `@ai-detox/core`: deterministic AI Dependency Score with configurable
  weights and per-factor breakdown; AI Gate state machine; detox sessions;
  usage-tracking taxonomy (quantity vs dependency behavior); reflection
  prompts; challenge engine with 27-challenge seed catalog, deterministic
  daily selection, adaptive difficulty, and non-punitive streak/XP;
  local-first storage with versioned schema, migrations, and corrupt-data
  backup. Unit tested throughout.
- `@ai-detox/mobile`: Expo app (Android/iOS/Web) with onboarding, home,
  AI gate, detox, daily challenge, challenge result, reflection, brain
  report, progress, and settings screens; local AsyncStorage persistence;
  JSON export and double-confirmed full deletion.
- Open-source scaffolding: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY,
  MIT LICENSE, issue/PR templates, CI (lint + typecheck + tests + build).
- Progress history: reverse-chronological list merging challenge attempts,
  resolved AI Gate sessions, and ended detox sessions, with a new `ListItem`
  component and neutral row copy.
- Brand assets generated from source (`npm run icons`): the Open Ring mark as
  app icon, adaptive icon, monochrome icon, splash, and favicon — rendered by
  a dependency-free PNG encoder rather than committed as opaque binaries.
- Documentation screenshots generated from demo data (`npm run screenshots`)
  via headless Chrome over the DevTools Protocol, embedded in the README.
- Property-based test coverage for the scoring engine: determinism across JSON
  round-trips and deep clones, range safety, the factor-sum identity, and
  monotonicity, all fuzzed over a fixed-seed corpus so failures reproduce.

### Added

- **Human Mode skill** — an installable skill for Claude Code, Codex, Cursor,
  claude.ai, ChatGPT and Gemini that answers on a hint ladder (orient, nudge,
  hint, approach, full answer) instead of handing over a finished answer by
  default. It never locks: an explicit ask, urgency, pure lookup, mechanical
  work, or reasoning already shown all go straight to the full answer.
  The pedagogy lives in `skill/method/*.yaml` and every platform artifact is
  generated from it, so improving how it teaches is a YAML edit and a PR.
  Distributed as a plugin from this repo acting as its own marketplace;
  `.claude-plugin/` manifests are read by Claude Code, Codex and Cursor alike.

### Changed

- **The dependency score now counts dependent acts per day rather than shares
  of AI use** (config semantics version 3, see
  [ADR-0006](docs/architecture/adr/0006-score-counts-dependent-acts-not-shares.md),
  fixes [#5](https://github.com/madeofroc-arch/AI-Detox-Center/issues/5)).

  Measuring each behavior as a share of AI uses reported *average severity per
  AI use* rather than how much dependency there was. Three consequences, all
  reproduced: nine gate sessions solved alone plus one delegated use scored 77
  "Running on AI" — printed directly above "You handled 90% of these moments
  without AI"; eliminating a whole dependency pattern moved a user 67 to 96 and
  demoted them a band; and worsening a single moment could *lower* the score.

  A count only rises when behavior gets worse, which makes all three
  structurally impossible rather than merely retuned. Two consequences worth
  knowing: the same pattern at half the volume now scores about half (handing
  over seven tasks is half as much outsourced thinking as fourteen), and
  mid-journey scores rise again, so the Home number falls for those users.

  An adversarial review of the first attempt at this fix found that it had
  reintroduced the same class of bug by three other routes — a per-factor clamp,
  a capacity term carried over from the share model, and an observation window
  derived from the events themselves. All three are described in the ADR, and
  a dedicated ~8,800-comparison monotonicity sweep now guards against a fourth.

- **Recalibrated the AI Dependency Score** (config semantics version 2, see
  [ADR-0005](docs/architecture/adr/0005-dependency-score-recalibration.md)).
  Contributor signals now form *reliance*, normalized by the capacity that is
  actually attainable, and reducers *discount* that reliance instead of
  subtracting from it freely. (The discount cap was later lowered to 30% by
  ADR-0006.)

  This is a measurement fix, not a stricter policy. Some signals were
  cancelling each other out: the same `attemptedFirst` bit was scored twice with
  opposite signs, so below roughly 40% delegation the model was effectively
  rewarding people for handing tasks over. Behavior that a reasonable person
  would call moderate reliance was reported as "Independent", three very
  different users all collapsed onto a score of 0, and the top of the scale was
  mathematically unreachable (80 of 100).

  **Your number will read differently after this update even though your
  behavior has not changed.** A mid-journey profile that previously scored 23
  now scores around 52. Heavy but deliberate use — where you think first — still
  scores low, by design and by test.

- Band captions: the lowest band is now **"Mostly your own"** rather than
  "Independent". It describes what you are doing instead of claiming an
  identity, so a sharper score costs a description rather than a compliment.
- Reflection's influence on the score is bounded to a small fraction of a band
  width, so logging activity inside the app cannot meaningfully buy a better
  number (previously it was worth a full band). The stronger phrasing this
  entry originally used — that reflection can never cross a band — was retired
  by ADR-0006 as unachievable.
- The report is unlocked after 10 recorded moments rather than 5; six delegated
  events used to produce a confident verdict that outranked users with ten times
  the evidence.
- Band cut points and the Brain Score composition moved into `ScoringConfig`.
  Values are unchanged; they were previously hardcoded in the algorithm body,
  which ADR-0004 forbids.

### Known issues

- The Brain Report's rounded factor rows do not always sum to the dial
  ([#6](https://github.com/madeofroc-arch/AI-Detox-Center/issues/6)). The copy
  no longer claims they do.

### Fixed

- The Home additive line could render "You handled 0% of these moments without
  AI." under a high band; it now falls back to the encouraging line.
- `migrateAppData` passed non-array collections straight through when the
  stored document already claimed the current schema version, which could
  white-screen every render. All collections are now structurally guarded.
- Stored scoring configs are now actually upgraded. `ScoringConfig.version` was
  read by nothing — migrations keyed only on storage shape — so any
  recalibration would have reached new installs and nobody else.
- `dist` output is now importable from plain Node ESM: relative specifiers get
  explicit `.js` extensions in a post-build step, while source stays
  extensionless for Metro. Previously any non-bundler consumer (a future CLI or
  browser extension) hit `ERR_MODULE_NOT_FOUND`.

### Removed

- Unused Expo template assets (react/expo logos, tab icons, tutorial image).
