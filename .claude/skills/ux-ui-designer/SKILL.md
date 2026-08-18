---
name: ux-ui-designer
description: UX/UI design for AI Detox Center (Human Mode). Use when creating or revising the design system (typography, spacing, color, components), user flows, screen specifications, accessibility guidance, or when implementing or reviewing UI code in apps/mobile (theme, components, screens). Also use to review any UI change for tone - calm, minimal, premium, human-centered, never shame-based.
---

# ux-ui-designer

Defines **how a human experiences Human Mode**. Design direction: Minimal,
Premium, Calm, Intelligent, Human-centered. The feeling to create:
**"I am taking back my own thinking."** — never "I did something wrong."

## Responsibility scope

Owns (single source of truth):

- `docs/design/design-system.md` — tokens: typography, spacing, grid, colors,
  radius, shadows; components: buttons, cards, progress, charts, empty states,
  error states
- `docs/design/user-flows.md` — flow diagrams for all MVP flows
- `docs/design/screens.md` — per-screen specification (all 10 MVP screens)
- `docs/design/accessibility.md` — accessibility requirements
- `apps/mobile/src/theme/` — design tokens in code
- `apps/mobile/src/components/` — shared UI components
- Visual/interaction layer of `apps/mobile/app/` screens

Does NOT own: what features exist (product-architect), domain logic
(engine skills), business state shape (engine skills).

## Inputs

- `docs/product/*` — especially mvp.md and user-journeys.md (design follows spec)
- Existing `docs/design/*` and `apps/mobile/src/theme/` (extend, do not fork)
- Core domain API from `packages/core` (design must present real data,
  e.g. score breakdowns, not invented numbers)

## Outputs

- Design documents under `docs/design/`
- Theme tokens and components in `apps/mobile/src/`
- Screen implementations wired to core domain state
- Design review verdicts on UI changes (tone + system compliance)

## Process

1. Read the product spec for the feature; identify the emotional goal of the
   screen (what should the user feel?).
2. Check tone rules (below). Draft flow in `user-flows.md`, then screen spec
   in `screens.md`, then implement with existing tokens and components.
3. Never introduce a new color/size/radius inline — add it to the design
   system first, with rationale.
4. Every screen must define: empty state, error state, loading state, and
   accessibility notes (labels, contrast, touch targets at least 44pt).
5. Verify against `docs/design/accessibility.md` before declaring done.

## Tone rules (binding)

- Not a medical app; not a scary digital-abstinence app.
- No walls of red warnings. Red is reserved for destructive actions only
  (e.g. delete my data), never for user behavior feedback.
- Never tell the user they failed. Reframe: an abandoned detox session is
  "session ended early — that is data, not defeat."
- Progress language is additive ("you thought first 4 times this week"),
  never subtractive ("you gave in 6 times").
- Copy is short, warm, direct. No jargon, no guilt, no urgency.
- Celebration is quiet (subtle affirmation), not slot-machine confetti loops.

## Prohibitions

- No dark patterns: no fake urgency, no streak-loss threats, no notification
  spam design, no infinite feeds.
- No shame, fear, or anxiety-driven visuals or copy.
- Do not change domain logic to fit a design; request a spec change instead.
- Do not add screens or features outside `docs/product/mvp.md` scope.
- Do not skip empty/error/loading states or accessibility notes.

## Done criteria

- Screen or flow documented in `docs/design/` AND (if implementation was
  requested) implemented using only design-system tokens and components.
- All states covered; accessibility notes present; tone rules pass.
- No hardcoded style values outside the theme.

## Collaboration

- Consumes: product specs (product-architect), domain APIs (engine skills).
- Feeds: the UI surface both engines are experienced through;
  open-source-engineer (screenshots and descriptions for README).
- See `docs/architecture/skill-system.md`.
