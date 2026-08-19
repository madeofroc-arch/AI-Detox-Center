# Accessibility

Baseline: WCAG 2.2 AA where applicable to a React Native + web app.

## Requirements

- **Contrast**: text >= 4.5:1 against its background. Large display text >= 3:1.
  Non-text that carries meaning — a bar fill, a control's boundary — >= 3:1
  against what sits next to it (WCAG 1.4.11).
- **Touch targets**: minimum 44x44pt; list rows >= 56pt.
- **Labels**: every interactive element gets `accessibilityLabel` (RN) /
  `aria-label` (web) when its text is not self-describing; ScoreDial exposes
  the score as text.
- **Focus**: visible focus ring (accent) on web; logical focus order; no
  keyboard traps in modals.
- **Dynamic type**: layouts must tolerate 1.3x font scale without clipping
  (use flexible heights, never fixed-height text containers).
- **Reduced motion**: respect OS reduce-motion; all animations are optional
  polish, never information carriers.
- **Color independence**: never encode meaning in color alone — factor bars
  pair color with labels and values; difficulty uses dots plus a spoken number.
- **Screen readers**: timer announces at start/pause/end, not every second;
  result screens announce the affirmation text.
- **Language**: plain language, short sentences; avoid idioms in core copy.

## What is checked automatically

A checklist a person runs once is worth less than a check that runs on every
commit, so three of the five now have gates:

| Check | Gate |
| --- | --- |
| Contrast | `apps/mobile/__tests__/contrast.test.ts` — every pairing the app renders, in both palettes, plus a test that no palette token escapes the list |
| Touch targets | `apps/mobile/__tests__/components.test.tsx` — Tag, Button, Segmented |
| Labels and roles | same file — one announcement per bar, digits hidden inside the dial, radio vs checkbox vs toggle, headings exposed as headings |

Keyboard focus, font scale and reduce-motion still need a browser. They are
cheap to run: `npm run web --workspace @ai-detox/mobile -- --port 8123`.

## Writing accessible components here

`apps/mobile/src/theme/a11y.ts` holds the three primitives, and the file
documents why each one is not what you would first reach for:

- `decorative` — hide a glyph or a visual duplicate. It sets the two React
  Native props **and** `aria-hidden`, because react-native-web 0.21 reads only
  the third. Setting just the RN props changes the web accessibility tree not
  at all.
- `group(label)` — announce several views as one thing. It sets
  `accessibilityRole="image"`, because a bare `aria-label` on a `div` with no
  role is ignored, and `accessible` alone renders nothing on web.
- `selectionState(selected, role)` — selection state in both dialects. React
  Native reads `accessibilityState`; react-native-web reads `aria-checked` /
  `aria-pressed` and ignores `accessibilityState` entirely.

## The audit (2026-08-19)

The five-point checklist below had never been executed against the built app.
It has now been run against all ten screens, in both palettes, in the web
build. It found **eight defects**, every one of which is fixed and gated:

| # | Defect | Where | Fix |
| --- | --- | --- | --- |
| 1 | White label on the accent fill is **2.49:1** in dark mode | Every primary button and selected tag, all ten screens | `onAccent` / `onDanger` tokens; no `#FFFFFF` in components |
| 2 | No visible keyboard focus anywhere on web — react-native-web sets `outline-style: none` on every Pressable | All screens (18 reachable controls on Settings alone) | `theme/focusRing.web.ts` injects a `:focus-visible` ring |
| 3 | `inkFaint` at 1.94–2.26:1, used for placeholder text and the inactive tab label | Gate, Detox, Challenge, Reflection, tab bar | Token deleted; both usages moved to `inkMuted` |
| 4 | `inkMuted` at 4.23:1 on `surfaceAlt` in light mode | Every alt card and well | Darkened to `#62686E` (4.83:1) |
| 5 | Tappable tags were 36pt, below the 44pt the design system promises | Onboarding, Settings, AI Gate | `minHeight: 44` |
| 6 | Contributor bar fill at 2.44:1 against its own track | Brain Report | `amber` darkened to `#967535` (3.27:1) |
| 7 | Countdown labels changed every second, so a screen reader announced every second | AI Gate, Detox | Minute granularity, plus a polite live region for Running/Paused |
| 8 | Text-field border at 1.31:1 — the fill is 1.17:1 against the card, so the border is the only thing identifying the field | Gate, Detox, Challenge, Reflection | `lineStrong` token (3.28:1) |

Also fixed, found while fixing the above: bar rows announced their label, their
value and a summary as three separate elements; the score dial announced its
digits twice; tab-bar glyphs were read aloud as "black circle, Home"; section
headings were ordinary paragraphs, so a screen reader could not navigate the
Brain Report by heading; difficulty on Home was dots with no spoken number; and
`Button` used a fixed height that clips at 1.3x.

### Per screen

`L` labels and targets · `C` contrast · `K` keyboard · `T` 1.3x type ·
`M` reduce motion. Every cell now passes; the notes say what failed before.

| Screen | L | C | K | T | M | Was failing |
| --- | :-: | :-: | :-: | :-: | :-: | --- |
| Onboarding | ✅ | ✅ | ✅ | ✅ | ✅ | 36pt tags, focus ring, dark primary button |
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | dial announced twice, difficulty dots unspoken, tab glyphs, focus ring |
| AI Gate | ✅ | ✅ | ✅ | ✅ | ✅ | timer announced every second, 36pt tags, field border, placeholder, step questions not headings |
| Detox | ✅ | ✅ | ✅ | ✅ | ✅ | timer announced every second, no state announcement, field border, placeholder |
| Challenge | ✅ | ✅ | ✅ | ✅ | ✅ | field border, placeholder, focus ring |
| Challenge Result | ✅ | ✅ | ✅ | ✅ | ✅ | dark primary button, focus ring |
| Reflection | ✅ | ✅ | ✅ | ✅ | ✅ | field border, placeholder, focus ring |
| Brain Report | ✅ | ✅ | ✅ | ✅ | ✅ | bar rows announced three times each, amber fill contrast, section headings |
| Progress | ✅ | ✅ | ✅ | ✅ | ✅ | bar rows announced three times each, card labels not headings, tab glyphs |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | 36pt tags, danger button in dark mode, section headings, tab glyphs |

### What this audit is not

It was run by a sighted developer with the browser's accessibility tree, a
contrast calculator and a keyboard — **not with a screen reader, and not by
anyone who uses assistive technology daily**. VoiceOver and TalkBack rotor
behaviour, focus order on a real device, and how the grouped bar rows actually
sound are all unverified.

That is the open half of this. A report from someone who uses AT is worth more
than this table, and it is the single most useful contribution the project can
receive on accessibility right now — a comment saying what a screen reader
actually says on any one of these ten screens is enough to act on.

## Review checklist (run per screen before "done")

1. All interactive elements labeled and >= 44pt.
2. Contrast spot-check on new color pairs — and add the pair to
   `contrast.test.ts`, so the next person does not have to remember.
3. Keyboard-only pass on the web build: every control reachable by Tab, and the
   focus ring visible on each.
4. Font scale 1.3x pass: no clipping, no horizontal scroll.
5. Reduce-motion pass (nothing breaks with animations off).
