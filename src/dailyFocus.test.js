import test from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_FOCUS_KEY, DailyFocusTracker, localDay, localMidnight, nextLocalMidnight, readDailyFocus } from './dailyFocus.js';
import { SpiritTracker } from './tamagotchi.js';

function storageWith(record) {
  const data = new Map(record ? [[DAILY_FOCUS_KEY, JSON.stringify(record)]] : []);
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const hour = 3600000;
const noon = new Date(2026, 9, 12, 12).getTime();

test('uses local calendar days and sums running intervals, excluding pauses and countdown reset', () => {
  assert.equal(localDay(noon), '2026-10-12');
  assert.equal(new Date(localMidnight(noon)).getHours(), 0);
  const tracker = new DailyFocusTracker(storageWith(), noon);
  tracker.begin(noon + hour, noon);
  tracker.stop(noon + hour / 2);
  tracker.tick(noon + 2 * hour);
  tracker.begin(noon + 3 * hour, noon + 2 * hour);
  tracker.stop(noon + 3 * hour);
  assert.equal(tracker.record.totalMilliseconds, 1.5 * hour);
});

test('splits a timer crossing midnight and credits only the new day after a delayed tick', () => {
  const midnight = nextLocalMidnight(noon);
  const tracker = new DailyFocusTracker(storageWith(), noon);
  tracker.begin(midnight + 20 * 60000, midnight - 10 * 60000);
  tracker.tick(midnight - 5 * 60000);
  assert.equal(tracker.record.totalMilliseconds, 5 * 60000);
  tracker.tick(midnight + 15 * 60000);
  assert.equal(tracker.record.day, localDay(midnight));
  assert.equal(tracker.record.totalMilliseconds, 15 * 60000);
  tracker.stop(midnight + hour);
  assert.equal(tracker.record.totalMilliseconds, 20 * 60000);
});

test('clears today at midnight even when paused, and does not count idle time', () => {
  const midnight = nextLocalMidnight(noon);
  const storage = storageWith();
  const tracker = new DailyFocusTracker(storage, noon);
  tracker.begin(noon + hour, noon);
  tracker.stop(noon + hour);
  tracker.tick(midnight, true);
  assert.equal(tracker.record.totalMilliseconds, 0);
  assert.equal(readDailyFocus(storage).day, localDay(midnight));
  tracker.tick(midnight + hour);
  assert.equal(tracker.record.totalMilliseconds, 0);
});

test('a timer that finished yesterday contributes nothing today even after a long background delay', () => {
  const midnight = nextLocalMidnight(noon);
  const tracker = new DailyFocusTracker(storageWith(), noon);
  tracker.begin(midnight - 1000, midnight - 60000);
  tracker.tick(midnight + 3 * hour);
  assert.equal(tracker.record.totalMilliseconds, 0);
  tracker.begin(midnight + 4 * hour, midnight + 3 * hour);
  tracker.stop(midnight + 4 * hour);
  assert.equal(tracker.record.totalMilliseconds, hour);
});

test('preserves partial seconds, caps completion overshoot and restores the same day after reload', () => {
  const storage = storageWith();
  const tracker = new DailyFocusTracker(storage, noon);
  tracker.begin(noon + 2500, noon);
  tracker.tick(noon + 450);
  assert.equal(tracker.record.totalMilliseconds, 0);
  tracker.tick(noon + 450, true);
  tracker.tick(noon + 450, true);
  assert.equal(tracker.record.totalMilliseconds, 450);
  tracker.stop(noon + 10000);
  const restored = new DailyFocusTracker(storage, noon + 20000);
  restored.tick(noon + hour);
  assert.equal(restored.record.totalMilliseconds, 2500);
  assert.equal(new DailyFocusTracker(storage, nextLocalMidnight(noon)).record.totalMilliseconds, 0);
});

test('overlapping tabs do not count the same time twice, including across midnight', () => {
  const midnight = nextLocalMidnight(noon);
  const storage = storageWith();
  const first = new DailyFocusTracker(storage, noon);
  const second = new DailyFocusTracker(storage, noon);
  first.begin(midnight + 10000, midnight - 2000);
  second.begin(midnight + 10000, midnight - 1000);
  first.tick(midnight + 2000);
  second.tick(midnight + 2000);
  second.tick(midnight + 5000);
  first.stop(midnight + 5000);
  assert.equal(readDailyFocus(storage).totalMilliseconds, 5000);
});

test('resetting a spirit does not clear today or interrupt its independent running record', () => {
  const storage = storageWith();
  const daily = new DailyFocusTracker(storage, noon);
  const spirit = new SpiritTracker(storage, () => 0);
  daily.begin(noon + hour, noon);
  spirit.begin(noon + hour, noon);
  daily.tick(noon + 1000, true);
  spirit.reset(noon + 1000);
  daily.stop(noon + 2000);
  assert.equal(daily.record.totalMilliseconds, 2000);
  assert.equal(new DailyFocusTracker(storage, noon + 3000).record.totalMilliseconds, 2000);
});

test('invalid or unavailable storage is safe and a read-only browser still accumulates in memory', () => {
  const storage = storageWith({ version: 1, day: '2026-10-12', totalMilliseconds: -1, lastCreditedAt: 0 });
  assert.equal(readDailyFocus(storage), null);
  storage.setItem(DAILY_FOCUS_KEY, '{bad json');
  assert.equal(readDailyFocus(storage), null);
  const tracker = new DailyFocusTracker({ getItem() { throw new Error(); }, setItem() { throw new Error(); } }, noon);
  tracker.begin(noon + hour, noon);
  tracker.stop(noon + 1000);
  assert.equal(tracker.record.totalMilliseconds, 1000);
  assert.equal(tracker.saved, false);
  const readOnly = new DailyFocusTracker(storageWith(), noon);
  readOnly.storage.setItem = () => { throw new Error(); };
  readOnly.begin(noon + hour, noon);
  readOnly.tick(noon + 1000);
  readOnly.stop(noon + 2000);
  assert.equal(readOnly.record.totalMilliseconds, 2000);
  assert.equal(readOnly.saved, false);
});
