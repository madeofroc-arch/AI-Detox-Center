/**
 * Brand asset generator — "The Open Ring".
 *
 * The mark: a ring (the mind, echoing the app's ScoreDial) left open at the
 * top, with a single dot resting at its centre. The opening says the gate
 * never locks; the dot is the thought that stays yours. Palette comes from
 * docs/design/design-system.md.
 *
 * Rasterized here rather than committed as opaque binaries so the brand is
 * reproducible and reviewable: `npm run icons`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePng, hexToRgb } from './lib/png.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'apps/mobile/assets/images');
const DOCS = join(ROOT, 'docs/assets');

const PAPER = hexToRgb('#FAF8F4'); // bg
const SAGE = hexToRgb('#3E6B5C'); // accent
const WHITE = [255, 255, 255];

const SAMPLES = 4; // supersampling per axis
const GAP_HALF_DEG = 26;

/**
 * Coverage of the mark at a point, 0..1.
 * `scale` shrinks the mark within the canvas (Android safe zone).
 */
function markCoverage(px, py, size, scale) {
  const c = size / 2;
  const s = size * scale;
  const rOuter = 0.34 * s;
  const rInner = rOuter - 0.085 * s;
  const rDot = 0.075 * s;

  const dx = px - c;
  const dy = py - c;
  const dist = Math.hypot(dx, dy);

  if (dist <= rDot) return 1;

  if (dist >= rInner && dist <= rOuter) {
    // Angular gap centred at 12 o'clock keeps the ring open.
    const angle = Math.atan2(dy, dx); // -PI..PI, -PI/2 is up
    let delta = Math.abs(angle - -Math.PI / 2);
    if (delta > Math.PI) delta = 2 * Math.PI - delta;
    if (delta > (GAP_HALF_DEG * Math.PI) / 180) return 1;
  }
  return 0;
}

function render({ size, background, ink, scale = 1 }) {
  const rgba = new Uint8Array(size * size * 4);
  const step = 1 / SAMPLES;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          hits += markCoverage(
            x + (sx + 0.5) * step,
            y + (sy + 0.5) * step,
            size,
            scale,
          );
        }
      }
      const coverage = hits / (SAMPLES * SAMPLES);
      const i = (y * size + x) * 4;
      if (background) {
        // Composite ink over an opaque background.
        for (let ch = 0; ch < 3; ch++) {
          rgba[i + ch] = Math.round(background[ch] * (1 - coverage) + ink[ch] * coverage);
        }
        rgba[i + 3] = 255;
      } else {
        rgba[i] = ink[0];
        rgba[i + 1] = ink[1];
        rgba[i + 2] = ink[2];
        rgba[i + 3] = Math.round(coverage * 255);
      }
    }
  }
  return encodePng(rgba, size, size);
}

function solid({ size, color }) {
  const rgba = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = color[0];
    rgba[i * 4 + 1] = color[1];
    rgba[i * 4 + 2] = color[2];
    rgba[i * 4 + 3] = 255;
  }
  return encodePng(rgba, size, size);
}

const assets = [
  // App icon: mark on paper.
  [join(OUT, 'icon.png'), render({ size: 1024, background: PAPER, ink: SAGE })],
  // Adaptive icon: foreground stays inside the safe zone (~66%).
  [join(OUT, 'android-icon-foreground.png'), render({ size: 1024, ink: SAGE, scale: 0.66 })],
  [join(OUT, 'android-icon-background.png'), solid({ size: 1024, color: PAPER })],
  [join(OUT, 'android-icon-monochrome.png'), render({ size: 1024, ink: WHITE, scale: 0.66 })],
  // Splash + favicon.
  [join(OUT, 'splash-icon.png'), render({ size: 512, ink: SAGE })],
  [join(OUT, 'favicon.png'), render({ size: 64, background: PAPER, ink: SAGE })],
  // Documentation use.
  [join(DOCS, 'logo.png'), render({ size: 256, background: PAPER, ink: SAGE })],
];

for (const [path, buffer] of assets) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
  console.log(`${relative(ROOT, path)}  ${(buffer.length / 1024).toFixed(1)} KB`);
}
