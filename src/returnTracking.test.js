import test from 'node:test';
import assert from 'node:assert/strict';
import { longestFocusInterval, readReturnHistory, RETURN_HISTORY_KEY, ReturnTracker, subscribeToReturns } from './returnTracking.js';

test('records each return once when visibility and focus events overlap', () => {
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  assert.equal(tracker.observe(true, 1001), null);
  tracker.observe(false, 2000);
  tracker.observe(false, 2001);
  assert.deepEqual(tracker.observe(true, 9000), { returnedAt: 9000, elapsedMs: 8000 });
  assert.equal(tracker.observe(true, 9001), null);
  tracker.observe(false, 12000);
  assert.deepEqual(tracker.observe(true, 25000), { returnedAt: 25000, elapsedMs: 24000 });
});

test('visible but unfocused tab is not counted until both conditions are met', () => {
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  tracker.observe(false, 2000);
  assert.equal(tracker.observe(false, 4000), null);
  assert.deepEqual(tracker.observe(true, 5000), { returnedAt: 5000, elapsedMs: 4000 });
});

test('paused and stopped timers do not record returns or carry departures into resuming', () => {
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  tracker.observe(false, 2000);
  tracker.stop();
  assert.equal(tracker.observe(true, 4000), null);
  tracker.observe(false, 5000);
  tracker.start({ startedAt: 1000, deadline: 71000 });
  assert.equal(tracker.observe(true, 6000), null);
  tracker.observe(false, 7000);
  assert.deepEqual(tracker.observe(true, 8000), { returnedAt: 8000, elapsedMs: 7000 });
});

test('return after the deadline is excluded even if background completion was delayed', () => {
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 4000 });
  tracker.observe(false, 2000);
  assert.equal(tracker.observe(true, 4000), null);
  tracker.observe(false, 5000);
  assert.equal(tracker.observe(true, 8000), null);
});

test('new timer uses a fresh starting point', () => {
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  tracker.observe(false, 2000);
  tracker.start({ startedAt: 10000, deadline: 70000 });
  assert.equal(tracker.observe(true, 10001), null);
  tracker.observe(false, 12000);
  assert.deepEqual(tracker.observe(true, 14000), { returnedAt: 14000, elapsedMs: 4000 });
});

test('loads saved records and tolerates unavailable or corrupted browser storage', () => {
  const history = { startedAt: 1000, returns: [{ returnedAt: 5000, elapsedMs: 4000 }] };
  assert.deepEqual(readReturnHistory({ getItem: (key) => key === RETURN_HISTORY_KEY ? JSON.stringify(history) : null }), history);
  for (const value of [null, '{broken', '{}', '{"startedAt":1000,"returns":[null]}', '{"startedAt":1e100,"returns":[]}', '{"startedAt":1000,"returns":[{}]}', '{"startedAt":1000,"returns":[{"returnedAt":500,"elapsedMs":-500}]}']) {
    assert.equal(readReturnHistory({ getItem: () => value }), null);
  }
  assert.equal(readReturnHistory({ getItem: () => { throw new Error('Storage blocked'); } }), null);
});

test('browser event subscription records visible returns without relying on desktop focus', () => {
  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget();
  let now = 1000;
  documentTarget.hidden = false;
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  const entries = [];
  const cleanup = subscribeToReturns({ documentTarget, windowTarget, tracker, now: () => now, onReturn: (entry) => entries.push(entry) });
  now = 2000;
  windowTarget.dispatchEvent(new Event('blur'));
  documentTarget.hidden = true;
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  now = 9000;
  documentTarget.hidden = false;
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(entries, [{ returnedAt: 9000, elapsedMs: 8000 }]);
  windowTarget.dispatchEvent(new Event('focus'));
  documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(entries, [{ returnedAt: 9000, elapsedMs: 8000 }]);
  cleanup();
  windowTarget.dispatchEvent(new Event('blur'));
  windowTarget.dispatchEvent(new Event('focus'));
  assert.equal(entries.length, 1);
});

test('mobile pagehide and pageshow transitions record a return', () => {
  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget();
  let now = 1000;
  documentTarget.hidden = false;
  const tracker = new ReturnTracker();
  tracker.start({ startedAt: 1000, deadline: 61000 });
  const entries = [];
  subscribeToReturns({ documentTarget, windowTarget, tracker, now: () => now, onReturn: (entry) => entries.push(entry) });
  now = 2000;
  windowTarget.dispatchEvent(new Event('pagehide'));
  now = 11000;
  windowTarget.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(entries, [{ returnedAt: 11000, elapsedMs: 10000 }]);
});

test('calculates the longest interval between starting, returning, and timer completion', () => {
  const history = {
    startedAt: 1000,
    returns: [
      { returnedAt: 10000, elapsedMs: 9000 },
      { returnedAt: 17000, elapsedMs: 16000 },
      { returnedAt: 35000, elapsedMs: 34000 },
    ],
  };
  assert.deepEqual(longestFocusInterval(history, 50000), { startedAt: 17000, endedAt: 35000, durationMs: 18000 });
  assert.deepEqual(longestFocusInterval({ startedAt: 1000, returns: [] }, 61000), { startedAt: 1000, endedAt: 61000, durationMs: 60000 });
  assert.equal(longestFocusInterval(history, 1000), null);
});
