# Design System — "Quiet Mind"

Direction: Minimal, Premium, Calm, Intelligent, Human-centered.
The user should feel: *"I am taking back my own thinking."*

## Color

Calm, paper-and-ink palette with one confident accent. No alarm reds for
behavior; red exists only for destructive actions.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | `#FAF8F4` (warm paper) | `#14161A` | App background |
| `surface` | `#FFFFFF` | `#1D2026` | Cards |
| `surfaceAlt` | `#F1EDE6` | `#262A31` | Secondary surfaces, wells |
| `ink` | `#22262B` | `#ECEAE5` | Primary text |
| `inkMuted` | `#6B7178` | `#9BA1A8` | Secondary text |
| `inkFaint` | `#A8ADB3` | `#6B7178` | Tertiary text, placeholders |
| `accent` | `#3E6B5C` (deep sage) | `#7FAE9E` | Primary actions, progress |
| `accentSoft` | `#E3EDE8` | `#22332E` | Accent backgrounds |
| `amber` | `#B08A3E` | `#D4B36A` | Gentle attention (never alarm) |
| `danger` | `#A94438` | `#C96A5E` | Destructive actions ONLY |
| `line` | `#E5E0D8` | `#31353C` | Hairline borders |

## Typography

System font stack (SF Pro / Roboto via RN defaults) — premium comes from
hierarchy and spacing, not custom fonts (keeps bundle light).

| Token | Size/Line | Weight | Use |
| --- | --- | --- | --- |
| `display` | 34/40 | 700 | Score number, big moments |
| `title` | 24/30 | 700 | Screen titles |
| `heading` | 18/24 | 600 | Card titles |
| `body` | 16/24 | 400 | Default text |
| `bodyStrong` | 16/24 | 600 | Emphasis |
| `caption` | 13/18 | 400 | Meta, labels |
| `micro` | 11/14 | 500 | Uppercase tags, factor labels |

## Spacing & grid

4pt base grid. Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
Screen gutter: 20. Card padding: 16-20. Section gap: 24-32.
Single-column layout throughout MVP (content max-width 560 on web).

## Radius

`sm: 8` (inputs, tags) · `md: 14` (buttons, list items) · `lg: 20` (cards)
· `full: 999` (pills, progress dots).

## Shadows / elevation

Barely-there. `card: 0 1px 3px rgba(20,22,26,0.06)` light mode; dark mode
uses surface contrast instead of shadows. Never heavy drop shadows.

## Components

- **Button** — variants: `primary` (accent bg, white text), `secondary`
  (surfaceAlt bg, ink text), `ghost` (text only, accent), `danger`
  (only in Settings destructive zone). Height 52, radius `md`, full-width by
  default. Loading state = subtle opacity + spinner. Disabled = 40% opacity.
- **Card** — surface bg, radius `lg`, padding 16-20, optional hairline border.
- **ScoreDial** — circular progress ring for Brain Score; ring in accent, track
  in `line`; center: display number + caption label. No red zones.
- **FactorBar** — horizontal bar per scoring factor: label (micro), value bar
  (accent for reducers, amber for contributors), plain-language note.
- **ProgressRing / ProgressBar** — accent on `line` track.
- **Tag** — pill, `accentSoft` bg, micro type; used for categories/difficulty.
- **TimerDisplay** — display type, monospaced digits, generous whitespace.
- **ListItem** — 56pt min height, radius `md`, surfaceAlt background; leading
  accent glyph paired with a written kind label (meaning never rests on the
  glyph alone), title + muted meta line. Used by Progress history.
- **EmptyState** — icon-free: short heading + one supportive sentence +
  optional single action. Never "No data :(" — always an invitation.
- **ErrorState** — plain explanation + retry; no alarm styling.
- **Input / TextArea** — surfaceAlt bg, radius `sm`, 16pt text, clear focus
  ring in accent; never red validation before submit attempt.

## Motion

Calm and brief: 150-250ms ease-out for transitions; no bouncing, no confetti
storms. A completed challenge gets one soft scale+fade affirmation.

## Voice & tone

- Short, warm, direct. Second person.
- Additive framing only ("4 independent attempts this week").
- Never: "you failed", "you gave in", "warning", "streak lost".
- Quiet celebration: "Good thinking." beats "AMAZING!!! 🎉🎉".
