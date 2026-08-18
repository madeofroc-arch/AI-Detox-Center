# ADR-0002: npm workspaces monorepo with a pure domain package

Status: Accepted · Date: 2026-08-18

## Context

Domain logic (scoring, gate, challenges) must be testable without booting a
mobile app, reusable by future surfaces (browser extension, CLI), and
protected from UI concerns leaking in.

## Decision

npm workspaces monorepo:

- `packages/core` — `@ai-detox/core`: pure TypeScript, zero React/Expo/
  platform dependencies, no I/O (storage via injected `StoragePort`).
- `apps/mobile` — Expo app consuming `@ai-detox/core`.

Plain npm (no turbo/nx/pnpm): two workspaces do not justify extra tooling;
`npm run <script> --workspaces --if-present` is enough. Vitest tests the core
package; the app is gated by typecheck + export build (component tests are a
Phase 2 item).

## Consequences

- Core logic gets fast, deterministic unit tests in CI.
- Dependency direction is enforceable by review (app -> core only).
- If the repo grows many packages, revisit task-runner tooling in a new ADR.
