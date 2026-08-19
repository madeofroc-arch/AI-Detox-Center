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
| `inkMuted` | `#62686E` | `#9BA1A8` | Secondary text, placeholders, inactive tab |
| `accent` | `#3E6B5C` (deep sage) | `#7FAE9E` | Primary actions, progress |
| `accentSoft` | `#E3EDE8` | `#22332E` | Accent backgrounds |
| `onAccent` | `#FFFFFF` | `#14161A` | Label ON an accent fill |
| `amber` | `#967535` | `#D4B36A` | Contributor bar fill (never alarm) |
| `danger` | `#A94438` | `#C96A5E` | Destructive actions ONLY |
| `onDanger` | `#FFFFFF` | `#14161A` | Label ON a danger fill |
| `line` | `#E5E0D8` | `#31353C` | Decorative hairlines |
| `lineStrong` | `#85827D` | `#75787C` | A control's visible boundary |

Four of these changed when the accessibility checklist was finally run against
the built app (#4), and the reasons are worth keeping:

- **`inkFaint` was deleted.** It sat at 1.9–2.3:1 on our surfaces and was used
  for placeholder text and the inactive tab label. No ink light enough to feel
  "faint" clears 4.5:1 here, so the token was a trap rather than a shade. Quiet
  text is `inkMuted`; quiet non-text is `line`.
- **`onAccent` / `onDanger` exist because white is only correct in light mode.**
  White on the dark-mode accent is 2.49:1 — and that was the label on every
  primary button in the app. Never write `#FFFFFF` in a component.
- **`lineStrong` is the border that has to be seen.** A text field's fill is
  1.17:1 against the card behind it, so the border is what identifies it as a
  field, and a border doing that job needs 3:1. `line` stays quiet because it
  is only decoration.
- **`amber` darkened** from `#B08A3E`, which was 2.44:1 against the bar track it
  fills. A bar is a graphic that means something: 3:1 against its track.

Every pairing the app renders is asserted in
`apps/mobile/__tests__/contrast.test.ts`, including a check that no palette
token escapes the list. Add a colour there in the same commit that adds it
here, or the suite fails — which is the point.

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
  in `line`; center: display number + caption label. No red zones — no band,
  however high, is ever rendered in `danger`. Optional `footnote` under the
  caption carries one additive fact, so a band label never stands alone.
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
