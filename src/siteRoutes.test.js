import test from 'node:test';
import assert from 'node:assert/strict';
import { contentRouteAt, contentRoutes, siteHref, sitePath } from './siteRoutes.js';

const resolve = (page, language, pathname) => new URL(siteHref(page, language, pathname), `https://example.com${pathname}`).pathname;

test('content routes identify the complete locale path, including nested guide and index URLs', () => {
  for (const route of contentRoutes) {
    assert.equal(contentRouteAt(route.path).page, route.page);
    assert.equal(contentRouteAt(route.path).language, route.language);
    assert.equal(contentRouteAt(`${route.path}index.html`).language, route.language);
    assert.equal(contentRouteAt(`/project${route.path}`).page, route.page);
  }
  assert.equal(contentRouteAt('/unknown/'), undefined);
});

test('shared navigation resolves at each tool and content route, including subdirectory deployment', () => {
  const currentPaths = ['/', '/kr/', '/us/', '/percent/', '/percent/us/', '/cooking/', ...contentRoutes.map(route => route.path)];
  const pages = ['timer', 'calculator', 'cooking', 'about', 'contact', 'privacy', 'guides', 'focusGuide', 'percentGuide', 'cookingGuide'];
  for (const prefix of ['', '/project']) {
    for (const current of currentPaths) {
      for (const language of ['ko', 'en']) {
        for (const page of pages) assert.equal(resolve(page, language, `${prefix}${current}`), `${prefix}${sitePath(page, language)}`);
      }
    }
  }
});

test('static HTML guide links preserve the corresponding timer language', () => {
  assert.equal(resolve('timer', 'en', '/guides/focus-timer/us/index.html'), '/us/');
  assert.equal(resolve('calculator', 'en', '/guides/percent-calculator/us/'), '/percent/us/');
  assert.equal(resolve('privacy', 'en', '/percent/us/'), '/privacy/us/');
  assert.equal(resolve('contact', 'ko', '/about/'), '/contact/');
});
