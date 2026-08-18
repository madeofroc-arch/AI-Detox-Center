# Accessibility

Baseline: WCAG 2.2 AA where applicable to a React Native + web app.

## Requirements

- **Contrast**: text >= 4.5:1 against its background (tokens are chosen to
  pass; verify when adding colors). Large display text >= 3:1.
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
  pair color with labels and values; difficulty uses dots + number.
- **Screen readers**: timer announces at start/pause/end, not every second;
  result screens announce the affirmation text.
- **Language**: plain language, short sentences; avoid idioms in core copy
  (helps future i18n).

## Review checklist (run per screen before "done")

1. All interactive elements labeled and >= 44pt.
2. Contrast spot-check on new color pairs.
3. Keyboard-only pass on web build.
4. Font scale 1.3x pass.
5. Reduce-motion pass (nothing breaks with animations off).
