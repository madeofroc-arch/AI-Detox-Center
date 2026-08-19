/**
 * Keyboard focus indicator.
 *
 * Native platforms draw their own focus affordances for external keyboards and
 * switch control, so there is nothing to install here. The web build is a
 * different story — see `focusRing.web.ts`, which is what actually loads when
 * the bundler targets web.
 */
export function installFocusRing(): void {
  // Intentionally empty on native.
}
