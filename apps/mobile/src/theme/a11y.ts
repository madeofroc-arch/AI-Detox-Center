/**
 * Accessibility primitives shared by the components.
 *
 * These exist because the same three mistakes kept recurring, and the audit
 * (#4) found all three shipped:
 *
 * 1. An `accessibilityLabel` on a plain `View` is ignored — the view has to be
 *    `accessible` for the label to replace its children. Half the labels in the
 *    app were decorative strings nobody would ever hear.
 * 2. Labelling a container without hiding its children announces both, so a
 *    factor row read "Delegation", "14 pts", then "Delegation: 14 points, adds
 *    to the score" — the same fact three times.
 * 3. Glyphs used as icons (● ▲ ■ ◆) are read out. "Black circle, Home" is worse
 *    than "Home".
 */

/**
 * Hide something from assistive technology entirely. For glyphs and for the
 * visual duplicate of text that a wrapper already announces.
 *
 * All three props are set on purpose, and the third is not redundant:
 * `accessibilityElementsHidden` is iOS, `importantForAccessibility` is Android,
 * and react-native-web 0.21 maps NEITHER — it reads `aria-hidden` and nothing
 * else. The first version of this file set only the two React Native props and
 * changed the web accessibility tree not at all, which is the kind of fix that
 * looks done in a diff and does nothing to a user.
 */
export const decorative = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
  'aria-hidden': true,
} as const;

/**
 * Announce a group of views as one thing, with one label. Pair it with
 * `decorative` on whatever inside would otherwise be read separately.
 *
 * The role is `image`, which becomes `role="img"` on the web. A bare
 * `aria-label` on a `div` with no role is ignored by screen readers, so
 * `accessible` alone — which react-native-web does not render at all — leaves
 * the label unreachable. `image` is also the honest role for a bar: it is a
 * graphic that means something, not a control.
 */
export function group(label: string) {
  return { accessible: true, accessibilityRole: 'image', accessibilityLabel: label } as const;
}

/**
 * Selection state for a toggleable control, in both dialects.
 *
 * React Native reads `accessibilityState`; react-native-web 0.21 reads the
 * `aria-*` props and ignores `accessibilityState` entirely. `aria-checked` is
 * only valid on a radio or checkbox, so a plain toggle button gets
 * `aria-pressed` instead — which is the correct ARIA either way.
 */
export function selectionState(selected: boolean, role: 'radio' | 'checkbox' | 'button') {
  return role === 'button'
    ? { accessibilityState: { selected }, 'aria-pressed': selected }
    : { accessibilityState: { checked: selected, selected }, 'aria-checked': selected };
}

/** Minimum touch target, in points. WCAG 2.2 AA asks 24; we hold the 44 of the design system. */
export const MIN_TOUCH_TARGET = 44;
