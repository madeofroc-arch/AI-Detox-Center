/**
 * Palette and type for The Adversary.
 *
 * Separate from `tokens.ts` on purpose, and temporarily. The old screens still
 * build and still have to until the deletion commit, and a game about an
 * opponent cannot share a palette with a calm paper-and-ink wellness app —
 * "Quiet Mind" was the right direction for a product nobody wanted to open.
 * When the old surface goes, this replaces `tokens.ts` rather than sitting
 * beside it.
 *
 * Dark by default, because the moment this competes for is 22:40 on a sofa.
 *
 * Three colours carry meaning and each belongs to one party:
 *   `you`       your band, your claim, your points
 *   `opponent`  the argument, and only the argument
 *   `gold`      what is at stake
 *
 * Nothing here is alarm-red. The opponent is a confident adversary, not a
 * warning, and the player is never the thing being flagged (principle 7). A
 * missed band goes quiet rather than hostile.
 *
 * Every pairing is asserted in `__tests__/contrast.test.ts`.
 */

export interface GamePalette {
  bg: string;
  surface: string;
  /** Raised surface: the opponent's card, the record's cells. */
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  /** The player: their band, their claim, their score. */
  you: string;
  /** Dim fill of the player's band across the axis. */
  youSoft: string;
  /** The opponent, and nothing else. */
  opponent: string;
  opponentSoft: string;
  /** What is at stake — the payout climbing under the thumb. */
  gold: string;
  /** A band that missed. Quiet, never hostile. */
  quiet: string;
  /** Decorative rules. */
  line: string;
  /** A control's visible boundary, and the axis itself. */
  lineStrong: string;
  /** Label on a `you` fill. */
  onYou: string;
}

export const gamePalette: GamePalette = {
  bg: '#0D1015',
  surface: '#171B22',
  surfaceAlt: '#212731',
  ink: '#EDF0F5',
  inkMuted: '#9BA6B4',
  you: '#4FD1B5',
  youSoft: '#1B3A36',
  opponent: '#F2887E',
  opponentSoft: '#3A211F',
  gold: '#EFC15C',
  quiet: '#88919E',
  line: '#2A313C',
  lineStrong: '#77808F',
  onYou: '#0D1015',
};

/**
 * Type scale. Bigger and tighter than the old one: this is read one-handed at
 * arm's length, and the question is the whole screen.
 */
export const gameType = {
  question: { fontSize: 26, lineHeight: 34, fontWeight: '600' },
  /** The payout, the score, the answer. Tabular so it does not jitter while it climbs. */
  figure: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700',
    // Not `as const` on the array: React Native's TextStyle wants a mutable
    // FontVariant[], and a readonly tuple is not assignable to it.
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
  },
  argument: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 1.2 },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '400' },
} as const;

export const gameSpace = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const gameRadius = { sm: 8, md: 14, lg: 22, full: 999 } as const;
