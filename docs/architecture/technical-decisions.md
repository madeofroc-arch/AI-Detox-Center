# Technical Decisions

Significant decisions are recorded as ADRs in `docs/architecture/adr/`.
This file is the index and the current-state summary.

## Current stack

| Concern | Decision | ADR |
| --- | --- | --- |
| Language | TypeScript (strict) everywhere | [ADR-0001](adr/0001-typescript-expo-stack.md) |
| App framework | Expo (React Native + react-native-web), expo-router | [ADR-0001](adr/0001-typescript-expo-stack.md) |
| Repo layout | npm workspaces monorepo: `packages/core` + `apps/mobile` | [ADR-0002](adr/0002-monorepo-npm-workspaces.md) |
| Domain layer | `@ai-detox/core`: pure TS, zero platform deps | [ADR-0002](adr/0002-monorepo-npm-workspaces.md) |
| Storage | Local-first via `StoragePort`; AsyncStorage adapter in app | [ADR-0003](adr/0003-local-first-storage.md) |
| Scoring | Deterministic, config-driven; no LLM in core paths | [ADR-0004](adr/0004-deterministic-scoring-no-llm-core.md) |
| Score calibration | Capacity-normalized reliance; reducers as a bounded discount | [ADR-0005](adr/0005-dependency-score-recalibration.md) |
| Score semantics | Contributors count dependent acts per day, not shares of AI use | [ADR-0006](adr/0006-score-counts-dependent-acts-not-shares.md) |
| Testing | Vitest for core; typecheck + build gate for app | [ADR-0002](adr/0002-monorepo-npm-workspaces.md) |
| CI | GitHub Actions: lint, typecheck, test, build | — |
| License | MIT | — |

## Architecture at a glance

```
apps/mobile (Expo, expo-router)
  app/            screens (thin: read store, call core, render)
  src/theme       design tokens (from docs/design/design-system.md)
  src/components  shared UI
  src/state       zustand store; hydrates from storage, persists on change
  src/storage     AsyncStorage adapter implementing core StoragePort
        |
        v  (only dependency direction: app -> core)
packages/core (@ai-detox/core, pure TypeScript)
  ai-detox/  scoring | ai-gate | detox | tracking | reflection
  challenges/  catalog | selection | difficulty | progression
  storage/     StoragePort + AppData schema + migrations
```

Rules:

1. `packages/core` never imports React/Expo/platform modules and never
   performs I/O directly (storage goes through the injected port).
2. All time enters core as a parameter (`nowIso` / `dateKey`); no
   `Date.now()` inside domain logic. Determinism is testable.
3. The app layer holds no business rules — if a rule appears in a component,
   it must move to core.
4. No network calls anywhere in the MVP codebase.

## Amending decisions

New significant decision -> new ADR (next number) -> update this index.
Never silently contradict an accepted ADR.
