import { darkPalette, lightPalette } from './tokens';

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
 */
let installed = false;

export function installFocusRing(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const style = document.createElement('style');
  style.setAttribute('data-human-mode', 'focus-ring');
  style.textContent = [
    ':focus-visible:focus-visible {',
    `  outline: 2px solid ${lightPalette.accent};`,
    '  outline-offset: 2px;',
    '  border-radius: 4px;',
    '}',
    '@media (prefers-color-scheme: dark) {',
    '  :focus-visible:focus-visible {',
    `    outline-color: ${darkPalette.accent};`,
    '  }',
    '}',
  ].join('\n');
  document.head.appendChild(style);
}
