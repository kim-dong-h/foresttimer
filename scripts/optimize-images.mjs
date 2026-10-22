import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Optional asset-authoring tool; generated assets are committed and builds do not
// need Sharp. Pass a Sharp package path if it is supplied by an external runtime.
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const assets = path.join(root, 'src/assets');
const output = path.join(assets, 'optimized');
await mkdir(output, { recursive: true });
const report = [];

async function encode(source, name, width) {
  const input = path.join(assets, source);
  const target = path.join(output, name);
  let pipeline = sharp(input);
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  await pipeline.webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(target);
  report.push({ source, file: name, originalBytes: (await stat(input)).size, bytes: (await stat(target)).size });
}

await encode('spirit-forest-background.webp', 'forest-desktop.webp');
await encode('spirit-forest-background.webp', 'forest-mobile.webp', 1024);
const spiritSource = await readFile(path.join(root, 'src/tamagotchiAssets.js'), 'utf8');
// The import names stay identical; only the serving directory changes.
const spiritFiles = [...spiritSource.matchAll(/from '\.\/assets\/(?:optimized\/)?([^']+\.webp)'/g)].map(match => match[1]);
for (const file of spiritFiles) {
  const original = file.startsWith('tamagotchi/') ? file : `tamagotchi/${file.includes('-evolution-') ? 'evolutions' : 'concepts'}/${file}`;
  await encode(original, path.basename(file), 512);
}
// Plant geometry stays valid: retain the original canvas dimensions and alpha.
for (const file of ['soft-pixel-v2/grass', 'soft-pixel-v2/fern', 'soft-pixel-v2/shrub', 'wildflower-clump', 'young-sapling']) {
  await encode(`woodland-plants/${file}.webp`, `${path.basename(file)}.webp`);
}
await writeFile(path.join(output, 'sizes.json'), `${JSON.stringify(report, null, 2)}\n`);
console.table(report);
