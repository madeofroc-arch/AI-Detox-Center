import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCORING_CONFIG,
  SCORING_CONFIG_VERSION,
  defaultScoringConfig,
  sanitizeScoringConfig,
} from '../src/index';

describe('sanitizeScoringConfig', () => {
  it('accepts a valid persisted config (JSON round-trip)', () => {
    expect(sanitizeScoringConfig(JSON.parse(JSON.stringify(DEFAULT_SCORING_CONFIG)))).toEqual(
      DEFAULT_SCORING_CONFIG,
    );
  });

  it('rejects malformed configs', () => {
    expect(sanitizeScoringConfig(null)).toBeNull();
    expect(sanitizeScoringConfig('nope')).toBeNull();
    expect(sanitizeScoringConfig({ version: 1 })).toBeNull();
    expect(
      sanitizeScoringConfig({ ...DEFAULT_SCORING_CONFIG, weights: { frequency: -5 } }),
    ).toBeNull();
    expect(sanitizeScoringConfig({ ...DEFAULT_SCORING_CONFIG, windowDays: 0 })).toBeNull();
  });

  it('rejects a config from an older semantics version', () => {
    // This rejection is the delivery mechanism for a recalibration: it makes
    // migrateAppData fall back to the current defaults (ADR-0005). Weakening
    // it to default-fill missing fields would leave existing users on stale
    // semantics forever.
    const stale = { ...defaultScoringConfig(), version: SCORING_CONFIG_VERSION - 1 };
    expect(sanitizeScoringConfig(stale)).toBeNull();
  });

  it('rejects out-of-range values for every new knob', () => {
    const bad: Array<Partial<Record<string, unknown>>> = [
      { reducerMaxDiscount: 1 }, // at 1 reducers could cancel reliance entirely
      { reducerMaxDiscount: -0.1 },
      { minEventsForScore: 0 },
      { brainPracticeWindowDays: 0 },
      { brainIndependenceWeight: 0.8, brainConsistencyWeight: 0.4 }, // sums above 1
      { brainIndependenceWeight: -0.1 },
      { bandIndependentMax: 60 }, // must stay below bandBalancedMax
      { bandLeaningMax: 100 }, // must stay below the top of the scale
    ];
    for (const override of bad) {
      expect(sanitizeScoringConfig({ ...defaultScoringConfig(), ...override })).toBeNull();
    }
  });

  it('rejects weights that would make the top of the scale unreachable', () => {
    // delegation and emotionalDependency are mutually exclusive shares of one
    // usage-kind partition, so scoring normalizes by the larger of the two.
    const inverted = defaultScoringConfig();
    inverted.weights.emotionalDependency = inverted.weights.delegation + 1;
    expect(sanitizeScoringConfig(inverted)).toBeNull();
  });

  it('keeps every field through a JSON round-trip (nothing silently dropped)', () => {
    const parsed = sanitizeScoringConfig(JSON.parse(JSON.stringify(defaultScoringConfig())));
    expect(parsed).not.toBeNull();
    expect(Object.keys(parsed!).sort()).toEqual(Object.keys(DEFAULT_SCORING_CONFIG).sort());
  });
});

describe('defaultScoringConfig', () => {
  it('returns an independent copy so persisted data cannot alias the defaults', () => {
    const a = defaultScoringConfig();
    a.weights.delegation = 999;
    expect(defaultScoringConfig().weights.delegation).toBe(
      DEFAULT_SCORING_CONFIG.weights.delegation,
    );
    expect(DEFAULT_SCORING_CONFIG.weights.delegation).not.toBe(999);
  });
});
