// Regenerates src/shared/data/marker-assets.ts from the files in public/markers.
// Arma marker class names are case-insensitive, file names are not.
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(join(root, 'public/markers'))
  .filter((name) => /\.(png|svg)$/i.test(name))
  .sort();

const manifest = {};
for (const file of files) {
  const stem = file.replace(/\.[^.]+$/, '').toLowerCase();
  // Prefer PNG when both PNG and SVG exist.
  if (manifest[stem]?.toLowerCase().endsWith('.png')) continue;
  manifest[stem] = file;
}

const body = Object.keys(manifest)
  .sort()
  .map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(manifest[key])}`)
  .join(',\n');

writeFileSync(
  join(root, 'src/shared/data/marker-assets.ts'),
  `/**
 * Marker image manifest (generated from /public/markers, OCAP2/web assets).
 *
 * Arma marker class names are case-insensitive (OCAP lower-cases them when it
 * scans its assets folder), while file names on disk are not. This maps the
 * lower-case class name to the real file name in /public/markers.
 *
 * Regenerate with \`pnpm generate:markers\` after adding marker images.
 */
const markerAssets: Record<string, string> = {
${body},
};

export { markerAssets };
`
);

console.log(`marker-assets.ts: ${Object.keys(manifest).length} markers`);
