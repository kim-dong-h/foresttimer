import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(output, '.vite/manifest.json'), 'utf8'));
const byFile = new Map(Object.values(manifest).map(entry => [entry.file, entry]));
const pages = ['index.html', 'percent/index.html', 'guides/index.html', 'cooking/index.html'];
const results = [];
for (const page of pages) {
  const html = await readFile(path.join(output, page), 'utf8');
  const js = new Set();
  const css = new Set();
  function visit(key) {
    const entry = manifest[key] || byFile.get(key);
    if (!entry || js.has(entry.file)) return;
    js.add(entry.file);
    entry.css?.forEach(file => css.add(file));
    entry.imports?.forEach(visit);
  }
  function localFile(url) { return path.posix.normalize(path.posix.join(path.posix.dirname(page), url)); }
  for (const [, url] of html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"\s]+)"/g)) visit(localFile(url));
  for (const [, url] of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"\s]+)"/g)) css.add(localFile(url));
  async function sizes(files) {
    let bytes = 0;
    let gzipBytes = 0;
    for (const file of files) {
      const buffer = await readFile(path.join(output, file));
      bytes += buffer.length;
      gzipBytes += gzipSync(buffer).length;
    }
    return { bytes, gzipBytes };
  }
  results.push({ page, js: await sizes(js), css: await sizes(css) });
}
// Local initial imports only; excludes on-demand images/audio and Google scripts.
console.log(JSON.stringify(results, null, 2));
