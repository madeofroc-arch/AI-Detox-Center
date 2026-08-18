import { describe, expect, it } from 'vitest';
import { DEFAULT_SCORING_CONFIG, sanitizeScoringConfig } from '../src/index';

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
});
