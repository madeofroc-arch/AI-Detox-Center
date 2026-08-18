# Privacy Architecture

**Default: everything stays on the device.** There is no server, no account,
no analytics, no telemetry, and no network call in the MVP codebase.

## Data inventory (all local)

| Data | Contains | Sensitivity | Storage |
| --- | --- | --- | --- |
| Usage events | Category, timestamps, attempted-first flag, gate outcome | Medium | Local device storage |
| Gate intentions | Optional one-line free text | High (user's own words) | Local device storage |
| Reflections | Optional free text | High | Local device storage |
| Challenge history | Challenge id, outcome, self-rating | Low | Local device storage |
| Challenge work text | Optional free text (writing challenges) | High | Local device storage |
| Scores/config | Derived numbers, weights | Low | Local device storage |
| Settings | Focus capabilities, onboarding flag | Low | Local device storage |

We never collect (by design, not just by policy): AI conversation contents,
prompts sent to other AI tools, identifiers (no device ID, no user ID beyond
random local UUIDs), location, contacts, or anything not listed above.

## User controls

- **Export**: full data as JSON, user-triggered, via OS share/download.
- **Delete**: full local wipe, double-confirmed. There is no cloud copy to
  chase — deletion is complete by construction.

## Enforcement

- `packages/core` performs no I/O; storage goes through `StoragePort`.
- CI-reviewable invariant: no `fetch(`, `XMLHttpRequest`, `axios`, or socket
  usage in `packages/core` or `apps/mobile` (grep check; see SECURITY.md).
- Any future cloud/sync/AI feature must be: opt-in (off by default),
  documented here first, reviewed under the open-source-engineer skill, and
  must keep every core feature functional when declined.
