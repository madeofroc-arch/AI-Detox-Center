import { defineConfig } from 'vitest/config';

/**
 * UI tests run through **react-native-web under Vitest**, not jest-expo.
 *
 * The choice, since issue #2 asked for the reasoning:
 *
 * - The repo already runs Vitest in `packages/core`, and CI already exports the
 *   web build. One runner for the monorepo means `npm test` at the root covers
 *   both workspaces with no second config language and no second watcher.
 * - Aliasing `react-native` to `react-native-web` means these tests render the
 *   *same* code path the shipped web build renders — the one the screenshots
 *   and the browser verification pass use. A jest-expo mock tree would test a
 *   third thing that ships nowhere.
 * - `accessibilityLabel` becomes `aria-label` and `importantForAccessibility`
 *   becomes `aria-hidden`, so accessibility assertions are checkable against
 *   the real accessibility tree rather than against RN props.
 *
 * The cost, stated plainly: native-only behaviour is NOT covered. `Alert`,
 * `AccessibilityInfo`, iOS/Android differences in how a grouped view is
 * announced, and anything under `Platform.OS !== 'web'` are outside these
 * tests. If a bug is suspected there, it needs a device, not this suite.
 */
export default defineConfig({
  resolve: {
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
    // Same precedence Expo uses for the web bundle.
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.tsx',
      '.ts',
      '.web.jsx',
      '.web.js',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  define: { __DEV__: 'true' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.tsx'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    // Both are published as source or as CJS the browser build needs
    // transformed; externalising them makes the alias above a no-op.
    server: { deps: { inline: [/@ai-detox\/core/, /react-native-web/] } },
  },
});
