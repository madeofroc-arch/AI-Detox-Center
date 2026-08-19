/**
 * Design tokens — the code form of docs/design/design-system.md ("Quiet Mind").
 * Never hardcode style values in screens; add tokens here first.
 */

/**
 * Every pair here is verified against docs/design/accessibility.md, not chosen
 * by eye. The audit (#4) found four real failures, and the token names now
 * carry the constraint so the next contributor does not have to rediscover it:
 *
 * - `inkFaint` is gone. It sat at 1.9-2.3:1 on our surfaces and was used for
 *   placeholder text and the inactive tab label. No ink light enough to feel
 *   "faint" passes 4.5:1 here, so the token was a trap rather than a shade.
 *   Quiet text is `inkMuted`; quiet non-text is `line`.
 * - `onAccent` / `onDanger` exist because white is only correct in light mode.
 *   White on the dark-mode accent is 2.5:1 — every primary button in the app.
 * - `lineStrong` is the border that has to be *seen* (a text field's boundary
 *   is what identifies it as a field). `line` is decorative and may stay quiet.
 * - `amber` is a bar fill, which is a graphic: it needs 3:1 against the track
 *   it sits in, not against nothing.
 */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  /** Quiet text. Passes 4.5:1 on bg, surface AND surfaceAlt. */
  inkMuted: string;
  accent: string;
  accentSoft: string;
  /** Contributor bar fill. Passes 3:1 against `line`, the track it fills. */
  amber: string;
  danger: string;
  /** Decorative separators only. Never the sole boundary of a control. */
  line: string;
  /** A control's visible boundary. Passes 3:1 against every surface. */
  lineStrong: string;
  /** Label color on an accent fill. Never assume white. */
  onAccent: string;
  /** Label color on a danger fill. */
  onDanger: string;
}

export const lightPalette: Palette = {
  bg: '#FAF8F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE6',
  ink: '#22262B',
  inkMuted: '#62686E', // 4.83:1 on surfaceAlt, the tightest pairing we ship
  accent: '#3E6B5C',
  accentSoft: '#E3EDE8',
  amber: '#967535', // 3.27:1 against `line`; the old #B08A3E was 2.44:1
  danger: '#A94438',
  line: '#E5E0D8',
  lineStrong: '#85827D',
  onAccent: '#FFFFFF',
  onDanger: '#FFFFFF',
};

export const darkPalette: Palette = {
  bg: '#14161A',
  surface: '#1D2026',
  surfaceAlt: '#262A31',
  ink: '#ECEAE5',
  inkMuted: '#9BA1A8',
  accent: '#7FAE9E',
  accentSoft: '#22332E',
  amber: '#D4B36A',
  danger: '#C96A5E',
  line: '#31353C',
  lineStrong: '#75787C',
  // Dark ink, not white: white on this accent is 2.49:1, and it was the label
  // on every primary button in the app.
  onAccent: '#14161A',
  onDanger: '#14161A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 0.6 },
} as const;

/** Screen gutter and content width cap (web). */
export const layout = {
  gutter: 20,
  maxWidth: 560,
  touchTarget: 44,
} as const;
