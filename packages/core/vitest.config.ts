import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    /**
     * The default is 5 seconds, and the scoring sweeps run for four and a half
     * on a quiet machine. That is close enough that a busy one fails the suite
     * for no reason — which it did, once, under the extra parallel load of the
     * quiz tests. A property test that walks tens of thousands of profiles is
     * doing real work and should be allowed to finish; a test that hangs is a
     * different problem and thirty seconds still catches it.
     */
    testTimeout: 30_000,
  },
});
