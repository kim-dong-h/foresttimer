import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');

async function clickNotification(windows, url) {
  const handlers = {};
  const opened = [];
  const self = {
    addEventListener(name, handler) { handlers[name] = handler; },
    registration: { scope: 'https://example.com/timer/' },
    clients: {
      async matchAll() { return windows; },
      async openWindow(target) { opened.push(target); },
    },
  };
  vm.runInNewContext(source, { self, URL });
  let pending;
  let closed = false;
  handlers.notificationclick({
    notification: { data: { url }, close() { closed = true; } },
    waitUntil(promise) { pending = promise; },
  });
  await pending;
  return { opened, closed };
}

test('notification click focuses an existing timer, including an explicit index.html deployment', async () => {
  let focused = false;
  const { opened, closed } = await clickNotification([
    { url: 'https://example.com/timer/index.html', async focus() { focused = true; } },
  ], 'https://example.com/timer/index.html');
  assert.equal(focused, true);
  assert.equal(closed, true);
  assert.deepEqual(opened, []);
});

test('notification click opens the static timer if its tab is gone, and never opens an external URL', async () => {
  const result = await clickNotification([], 'https://other.example.com/');
  assert.deepEqual(result.opened, ['https://example.com/timer/']);
});
