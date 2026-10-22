import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_EMAIL, SITE_OPERATOR, contentRoutes } from '../src/siteRoutes.js';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
const paths = ['/', '/kr/', '/us/', '/percent/', '/percent/us/', '/cooking/', ...contentRoutes.map(route => route.path)];
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
let linksChecked = 0;
let resourcesChecked = 0;
for (const pathname of paths) {
  const html = await readFile(path.join(output, `${pathname.slice(1)}index.html`), 'utf8');
  assert.match(html, /<h1\b/, `Missing initial heading: ${pathname}`);
  assert.match(html, /aria-label="(?:주 메뉴|Main navigation)"/, `Missing navigation: ${pathname}`);
  assert.match(html, /aria-label="(?:사이트 정보|Site information)"/, `Missing information links: ${pathname}`);
  assert.doesNotMatch(html, /<div id="root"><\/div>/, `Missing static content: ${pathname}`);
  const route = contentRoutes.find(route => route.path === pathname);
  if (route) {
    assert.doesNotMatch(html, /<script\b[^>]*\btype="module"|rel="modulepreload"/, `Unnecessary client JavaScript: ${pathname}`);
    assert.match(html, /rel="stylesheet"/, `Missing styles: ${pathname}`);
    assert.match(html, /googletagmanager\.com/, `Missing existing analytics: ${pathname}`);
    assert.ok(html.includes(SITE_OPERATOR), `Missing operator: ${pathname}`);
    assert.ok(html.includes(`rel="canonical" href="https://forest-timer.com${pathname}"`));
    assert.ok(html.includes(`hreflang="en"`));
    assert.ok(sitemap.includes(`<loc>https://forest-timer.com${pathname}</loc>`));
    if (route.page === 'contact' || route.page === 'privacy') assert.ok(html.includes(SITE_EMAIL));
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const url = new URL(href.replaceAll('&amp;', '&'), `https://forest-timer.com${pathname}`);
    if (url.origin !== 'https://forest-timer.com') continue;
    const target = path.join(output, url.pathname.replace(/^\//, ''), url.pathname.endsWith('/') ? 'index.html' : '');
    await access(target);
    if (url.hash) {
      const targetHtml = await readFile(target, 'utf8');
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${url.href}`);
    }
    linksChecked += 1;
  }
  for (const [, source] of html.matchAll(/\b(?:src|srcSet|srcset)="([^"\s]+)"/g)) {
    const url = new URL(source, `https://forest-timer.com${pathname}`);
    if (url.origin !== 'https://forest-timer.com') continue;
    await access(path.join(output, url.pathname.slice(1)));
    resourcesChecked += 1;
  }
}
console.log(`Verified ${paths.length} prerendered pages, ${linksChecked} internal links, ${resourcesChecked} local resource references, contact details, locale metadata and sitemap.`);
