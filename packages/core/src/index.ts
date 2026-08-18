// @ai-detox/core — pure TypeScript domain layer for AI Detox Center.
// No React, no platform APIs, no I/O (storage via injected port), no network.

export * from './time';

// tracking
export * from './ai-detox/tracking/types';
export * from './ai-detox/tracking/tracking';

// scoring
export * from './ai-detox/scoring/config';
export * from './ai-detox/scoring/scoring';

// AI gate
export * from './ai-detox/ai-gate/gate';

// detox
export * from './ai-detox/detox/detox';

// reflection
export * from './ai-detox/reflection/reflection';

// challenges
export * from './challenges/types';
export * from './challenges/catalog';
export * from './challenges/selection';
export * from './challenges/difficulty';
export * from './challenges/progression';

// storage
export * from './storage/port';
export * from './storage/schema';
export * from './storage/migrations';
export * from './storage/repository';
