/**
 * The deterministic hash everything seeded in this package runs on.
 *
 * FNV-1a, 32-bit. Small, stable, and — the property that matters here —
 * identical on every engine: `Math.imul` is exact 32-bit integer
 * multiplication, so a seed produces the same board on a phone, in a browser
 * and in CI. `Math.random()` is banned in core (ADR-0004) and this is what
 * replaces it: randomness enters as a string the caller chose.
 *
 * It lived in `challenges/selection.ts` until the challenge engine was
 * removed. Nothing about it was ever about challenges.
 */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
