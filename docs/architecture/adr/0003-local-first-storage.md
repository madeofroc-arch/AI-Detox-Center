# ADR-0003: Local-first storage behind a StoragePort

Status: Accepted · Date: 2026-08-18

## Context

The app stores sensitive personal data (reflections, intentions, behavior
records). Philosophy principles 5-6: privacy before personalization,
local-first by default.

## Decision

- All data persists on-device only. MVP has no backend, no account, no
  network calls.
- `packages/core` defines `StoragePort` (async get/set/remove) plus a
  versioned `AppData` schema with a migration hook; core never touches
  platform storage APIs directly.
- `apps/mobile` implements the port with AsyncStorage (localStorage on web).
- Users get full JSON export and full deletion in Settings.
- Any future sync/cloud is explicit opt-in, additive, and must leave the
  local-only mode fully functional (see docs/architecture/privacy.md).

## Consequences

- Privacy claims are structural, not promises: there is no code path that
  sends data out.
- Multi-device sync is deliberately deferred; when it comes, it must be
  E2E-encrypted and self-hostable (roadmap Phase 4).
- Schema versioning from day one makes future migrations routine.
