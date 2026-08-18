# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Instead, use
GitHub's private vulnerability reporting ("Report a vulnerability" under the
Security tab) once the repository is published, or contact the maintainers
directly. You will get an acknowledgment within 7 days.

## Scope & threat model

Human Mode is a local-first app: there is no server, no account system, and
no network I/O in the MVP codebase. The data that matters most is the
user's own behavioral record and private reflections stored on-device.

Especially valuable reports:

- Any code path that causes user data to leave the device
- Data loss or corruption in storage/migrations
- Dependency vulnerabilities that affect the built app
- Ways the exported JSON could leak more than the user sees

## Privacy invariants (enforced by architecture, verifiable by grep)

1. No `fetch` / `XMLHttpRequest` / sockets in `packages/core` (lint-enforced)
   or in `apps/mobile` source.
2. All persistence goes through the `StoragePort` in `packages/core`.
3. Corrupt data is backed up locally, never silently discarded.
4. Deleting data removes both the store and any backup keys.

A PR that breaks an invariant fails privacy review regardless of intent.

## Supported versions

Pre-1.0: only the latest release receives fixes.
