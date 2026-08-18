/**
 * Random ids live in the app layer — core stays deterministic and takes ids
 * as parameters (ADR-0004).
 */
export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}
