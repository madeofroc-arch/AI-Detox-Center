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
  backup. 73 unit tests.
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

### Fixed

- `dist` output is now importable from plain Node ESM: relative specifiers get
  explicit `.js` extensions in a post-build step, while source stays
  extensionless for Metro. Previously any non-bundler consumer (a future CLI or
  browser extension) hit `ERR_MODULE_NOT_FOUND`.

### Removed

- Unused Expo template assets (react/expo logos, tab icons, tutorial image).
