/**
 * Design tokens — the code form of docs/design/design-system.md ("Quiet Mind").
 * Never hardcode style values in screens; add tokens here first.
 */

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  accent: string;
  accentSoft: string;
  amber: string;
  danger: string;
  line: string;
}

export const lightPalette: Palette = {
  bg: '#FAF8F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE6',
  ink: '#22262B',
  inkMuted: '#6B7178',
  inkFaint: '#A8ADB3',
  accent: '#3E6B5C',
  accentSoft: '#E3EDE8',
  amber: '#B08A3E',
  danger: '#A94438',
  line: '#E5E0D8',
};

export const darkPalette: Palette = {
  bg: '#14161A',
  surface: '#1D2026',
  surfaceAlt: '#262A31',
  ink: '#ECEAE5',
  inkMuted: '#9BA1A8',
  inkFaint: '#6B7178',
  accent: '#7FAE9E',
  accentSoft: '#22332E',
  amber: '#D4B36A',
  danger: '#C96A5E',
  line: '#31353C',
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
