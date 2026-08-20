// @ai-detox/core — pure TypeScript domain layer for Human Mode.
// No React, no platform APIs, no I/O (storage via injected port), no network.

export * from './time';
export * from './hash';

// the adversary (docs/product/adversary.md)
export * from './adversary/types';
export * from './adversary/catalog';
export * from './adversary/quiz-types';
export * from './adversary/quiz-config';
export * from './adversary/quiz-board';
export * from './adversary/quiz-selection';
export * from './adversary/quiz-run';
export * from './adversary/quiz-diagnosis';

// i18n (domain strings only; screen copy lives in the app layer)
export * from './i18n/types';
export * from './i18n/i18n';

// storage
export * from './storage/port';
export * from './storage/schema';
export * from './storage/migrations';
export * from './storage/repository';
