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

## Dependency vulnerabilities

`npm install` reports 22 vulnerabilities. Dependabot reports 3 alerts. Both
numbers are correct and they measure different things: there are **two**
vulnerable packages and **three** advisories against them, and npm counts every
one of the 20 ancestor packages on the path as its own finding. Read the
Security tab, not the install output.

### How these are triaged

Three questions, in order. A "no" at the first two is not a dismissal — it is
the difference between a vulnerability and an exposure, and it decides urgency,
not whether to fix.

1. **Does the vulnerable code reach the shipped app?** The web export is static
   HTML and JavaScript; the bundler, the CLI and the native prebuild tooling
   do not ship. Verify rather than assume — grep `apps/mobile/dist` after
   `npm run build`.
2. **Does it reach an untrusted input?** A parser vulnerability matters when
   something an attacker controls is parsed. In a local-first app with no
   server and no network I/O, most build-time parsers only ever see files that
   are already in the repository.
3. **Is there a patched version, and does upgrading break anything we cannot
   test?** Forcing a resolution to silence an unreachable alert, in a code path
   with no test coverage, trades a theoretical problem for a real one.

### Standing assessment (2026-08-19)

| Advisory | Package | Path | Assessment |
| --- | --- | --- | --- |
| [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) — high, DoS via infinite loop in the ICNS / JXL / HEIF parsers | `image-size@1.2.1` | `expo` → `@expo/metro` → `metro` | **Build-time only, no fix available.** Every published version through 2.0.2 is affected; there is no patched release to move to. Metro calls it to read the dimensions of image assets while bundling, so the only "crafted image" it will ever see is one committed to this repository. Absent from the built bundle (verified by grep). Reachable only by someone who can already land an asset file here — which is a code-review problem, not a dependency problem. |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — medium, missing buffer bounds check | `uuid@7.0.3` | `expo-splash-screen` → `@expo/config-plugins` → `xcode` | **Unreachable, fix deliberately not forced.** The flaw is in `v3()`, `v5()` and `v6()` when the caller supplies an output buffer. `xcode` calls `uuid.v4()` with no buffer, and only during `expo prebuild`, which this project does not run — there is no `ios/` or `android/` directory. An `overrides` entry to `uuid@11` would clear the badge by jumping four majors in a package no test exercises. That is a worse trade than the alert. |

If either assessment stops holding — the app gains a build step that parses
user images, or the project starts running `expo prebuild` — revisit both.
Say so in a PR rather than quietly changing the table.

## Supported versions

Pre-1.0: only the latest release receives fixes.
