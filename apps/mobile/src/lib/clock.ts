import type { DateKey } from '@ai-detox/core';

/** The app layer is the only place that reads the clock. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Local calendar day key (user's timezone), e.g. "2026-08-18". */
export function todayKey(): DateKey {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
