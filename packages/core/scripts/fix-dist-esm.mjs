/**
 * Post-build: make `dist` importable by plain Node ESM.
 *
 * Source keeps extensionless relative imports because Metro (the app bundler)
 * cannot map "./time.js" onto time.ts. Node ESM demands the opposite: explicit
 * extensions. So the extension is added to the emitted output, where it is
 * unambiguous — the app consumes src, external consumers consume dist.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SPECIFIER = /((?:from|import)\s*(?:\(\s*)?["'])(\.\.?\/[^"']*)(["'])/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

let patched = 0;
for (const file of walk(DIST)) {
  if (!['.js', '.ts', '.mjs'].includes(extname(file))) continue;
  const source = readFileSync(file, 'utf8');
  const fixed = source.replace(SPECIFIER, (match, open, spec, close) =>
    extname(spec) === '' ? `${open}${spec}.js${close}` : match,
  );
  if (fixed !== source) {
    writeFileSync(file, fixed);
    patched += 1;
  }
}
console.log(`fix-dist-esm: patched ${patched} files`);
