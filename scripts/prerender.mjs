import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { contentRoutes } from '../src/siteRoutes.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const manifest = JSON.parse(await readFile(path.join(output, '.vite/manifest.json'), 'utf8'));
const pages = [
  ['index.html', 'timer', 'ko'],
  ['kr/index.html', 'timer', 'ko'],
  ['us/index.html', 'timer', 'en'],
  ['percent/index.html', 'calculator', 'ko'],
  ['percent/us/index.html', 'calculator', 'en'],
  ['cooking/index.html', 'cooking', 'ko'],
  ...contentRoutes.map(route => [`${route.path.slice(1)}index.html`, 'content', route.language]),
];

// SSR transforms the same React components without launching a browser or server.
// Client mounting restores each visitor's own storage and notification state.
const server = await createServer({ root, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
try {
  const { renderPage } = await server.ssrLoadModule('/src/prerender.jsx');
  for (const [file, kind, language] of pages) {
    const pathname = `/${file.replace(/index\.html$/, '')}`;
    let content = renderPage(kind, language, pathname);
    content = content.replace(/\b(href|src|srcSet|srcset)="([^"\s]+)"/g, (attribute, name, url) => {
      const asset = manifest[url.replace(/^\//, '')];
      if (!asset) {
        if (url.startsWith('/src/')) throw new Error(`Unbuilt prerender asset: ${url}`);
        return attribute;
      }
      const relative = path.posix.relative(path.posix.dirname(file), asset.file);
      return `${name}="${relative.startsWith('.') ? relative : `./${relative}`}"`;
    });
    const target = path.join(output, file);
    let html = await readFile(target, 'utf8');
    // Information pages use native links/details and need no client React.
    // Keep generated stylesheets and the existing analytics scripts intact.
    if (kind === 'content') {
      html = html.replace(/<script\b[^>]*\btype="module"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/g, '');
    }
    const marker = '<div id="root"></div>';
    if (!html.includes(marker)) throw new Error(`Missing prerender root: ${file}`);
    await writeFile(target, html.replace(marker, `<div id="root">${content}</div>`), 'utf8');
    console.log(`Prerendered ${file} (${language})`);
  }
} finally {
  await server.close();
}
