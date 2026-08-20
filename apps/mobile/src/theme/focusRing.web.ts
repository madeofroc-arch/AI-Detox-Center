import { gamePalette } from './game';

/**
 * Keyboard focus indicator for the web build.
 *
 * `docs/design/accessibility.md` has required "visible focus ring (accent) on
 * web" since the design system was written. It was not there: react-native-web
 * ships `.r-outlineStyle-1ny4l3l { outline-style: none }` and puts it on every
 * Pressable, so tabbing through the app moved focus invisibly — 18 reachable
 * controls on the Settings screen alone, none of which showed where you were
 * (#4).
 *
 * A stylesheet rather than per-component state, because focus is a property of
 * the page, not of nine separate components — and because `Pressable`'s style
 * callback in React Native core exposes only `pressed`, so the per-component
 * version would have to fork on platform anyway.
 *
 * The doubled `:focus-visible` is a specificity trick, not a typo. The
 * react-native-web reset is a single class (0,1,0); one pseudo-class would tie
 * with it and then depend on stylesheet order, which is decided by whichever
 * of us injects last. Repeating it scores (0,2,0) and wins outright, without
 * `!important` and without touching anything that is not focused.
 *
 * `:focus-visible` and not `:focus`: a mouse click should not leave a ring
 * behind, and the browser already knows the difference.
 *
 * There used to be a `prefers-color-scheme` block here, because the tracker
 * had a light palette and a dark one. The game has one surface, so the ring
 * has one colour: the player's own — `you`, asserted at 3:1 against the
 * background in `contrast.test.ts`.
 */
let installed = false;

export function installFocusRing(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const style = document.createElement('style');
  style.setAttribute('data-human-mode', 'focus-ring');
  style.textContent = [
    ':focus-visible:focus-visible {',
    `  outline: 2px solid ${gamePalette.you};`,
    '  outline-offset: 2px;',
    '  border-radius: 4px;',
    '}',
  ].join('\n');
  document.head.appendChild(style);
}
