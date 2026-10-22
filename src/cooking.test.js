import test from 'node:test';
import assert from 'node:assert/strict';
import { COOKING_PRESETS, MAX_COOKING_DURATION, cookingDuration, cookingRemaining, cookingReducer,
  createCookingTimer, initialCookingTimers, loadCookingTimers } from './cooking.js';
import { publicAssetPath } from './i18n.js';

const make = (id, seconds) => createCookingTimer(id, id, seconds * 1000);
const act = (timers, type, id, now) => cookingReducer(timers, { type, id, now });
const storageFor = value => ({ getItem: () => JSON.stringify(value) });

test('starts with a four-minute ramen timer and offers usable cooking presets', () => {
  assert.equal(initialCookingTimers()[0].duration, 240000);
  assert.equal(initialCookingTimers()[0].status, 'idle');
  assert.equal(COOKING_PRESETS.length, 6);
  assert.ok(COOKING_PRESETS.every(preset => cookingDuration(preset.minutes, 0) > 0));
});

test('rejects invalid or excessive times instead of silently clamping cooking inputs', () => {
  assert.equal(cookingDuration('', '1'), 1000);
  assert.equal(cookingDuration(360, 0), MAX_COOKING_DURATION);
  for (const [minutes, seconds] of [[0, 0], [-1, 30], [1.5, 0], [360, 1], [0, 60], ['abc', 0], [0, -1], [Infinity, 0]]) {
    assert.equal(cookingDuration(minutes, seconds), 0);
  }
});

test('independent deadlines survive delayed ticks, pause and resume without drift', () => {
  let timers = [make('ramen', 240), make('tea', 180)];
  timers = act(timers, 'toggle', 'ramen', 1000);
  timers = act(timers, 'toggle', 'tea', 61000);
  timers = act(timers, 'toggle', 'ramen', 91000);
  assert.equal(timers[0].remaining, 150000);
  assert.equal(cookingRemaining(timers[1], 91000), 150000);
  timers = act(timers, 'toggle', 'ramen', 191000);
  assert.equal(timers[0].deadline, 341000);
  timers = act(timers, 'tick', undefined, 300000);
  assert.equal(timers[0].status, 'running');
  assert.equal(cookingRemaining(timers[0], 300000), 41000);
  assert.equal(timers[1].status, 'finished');
  assert.equal(timers[1].completions, 1);
  assert.equal(act(timers, 'tick', undefined, 300100), timers);
});

test('completing, acknowledging, restarting and resetting preserve per-cook behavior', () => {
  let timers = act([make('egg', 10)], 'toggle', 'egg', 1000);
  timers = act(timers, 'toggle', 'egg', 11001);
  assert.equal(timers[0].status, 'finished');
  assert.equal(timers[0].acknowledged, false);
  timers = act(timers, 'acknowledge', 'egg');
  assert.equal(timers[0].acknowledged, true);
  timers = act(timers, 'toggle', 'egg', 12000);
  assert.equal(timers[0].deadline, 22000);
  timers = act(timers, 'tick', undefined, 23000);
  assert.equal(timers[0].completions, 2);
  timers = act(timers, 'reset', 'egg');
  assert.equal(timers[0].status, 'idle');
  assert.equal(timers[0].remaining, 10000);
  assert.equal(timers[0].acknowledged, true);
});

test('one-minute extension works while running, paused or finished and respects the limit', () => {
  let timers = act([make('pot', 120)], 'toggle', 'pot', 1000);
  timers = act(timers, 'extend', 'pot', 31000);
  assert.equal(timers[0].deadline, 181000);
  assert.equal(timers[0].duration, 180000);
  timers = act(timers, 'toggle', 'pot', 61000);
  timers = act(timers, 'extend', 'pot', 90000);
  assert.equal(timers[0].status, 'paused');
  assert.equal(timers[0].remaining, 180000);
  assert.equal(timers[0].duration, 240000);
  const finished = { ...make('done', 30), status: 'finished', remaining: 0, completions: 1 };
  const extended = act([finished], 'extend', 'done', 1000)[0];
  assert.equal(extended.status, 'running');
  assert.equal(extended.remaining, 60000);
  assert.equal(extended.deadline, 61000);
  assert.equal(extended.duration, 90000);
  const maxed = make('max', MAX_COOKING_DURATION / 1000);
  assert.deepEqual(act([maxed], 'extend', 'max', 1000), [maxed]);
});

test('caps concurrent timers at six and removes only the selected timer', () => {
  let timers = [];
  for (let index = 0; index < 7; index++) timers = cookingReducer(timers, { type: 'add', timer: make(String(index), 60) });
  assert.equal(timers.length, 6);
  timers = act(timers, 'remove', '2');
  assert.equal(timers.length, 5);
  assert.ok(timers.every(timer => timer.id !== '2'));
});

test('reload restores deadlines and completes overdue timers once on return', () => {
  const started = act([make('saved', 60)], 'toggle', 'saved', 1000);
  let restored = loadCookingTimers(storageFor(started), 31000);
  assert.equal(cookingRemaining(restored[0], 31000), 30000);
  restored = loadCookingTimers(storageFor(started), 120000);
  assert.equal(restored[0].status, 'finished');
  assert.equal(restored[0].completions, 1);
  assert.equal(restored[0].acknowledged, false);
  restored = loadCookingTimers(storageFor(restored), 130000);
  assert.equal(restored[0].completions, 1);
  const paused = act(started, 'toggle', 'saved', 11000);
  assert.equal(loadCookingTimers(storageFor(paused), 130000)[0].remaining, 50000);
});

test('empty saved list stays empty, invalid storage falls back and duplicate IDs are removed', () => {
  assert.deepEqual(loadCookingTimers(storageFor([])), []);
  assert.deepEqual(loadCookingTimers({ getItem: () => '{broken' }), initialCookingTimers());
  assert.deepEqual(loadCookingTimers({ getItem: () => { throw Error('blocked'); } }), initialCookingTimers());
  assert.deepEqual(loadCookingTimers(storageFor([{ status: 'running' }, null])), initialCookingTimers());
  assert.equal(loadCookingTimers(storageFor([make('a', 60), make('a', 90)]))[0].duration, 60000);
  assert.equal(loadCookingTimers(storageFor([make('a', 60), make('a', 90)])).length, 1);
  assert.equal(loadCookingTimers(storageFor([{ ...make('a', 60), icon: 'unexpected' }]))[0].icon, 'pot');
});

test('cooking page resolves the shared service worker and icons from site root, including subfolder deployments', () => {
  assert.equal(publicAssetPath('sw.js', '/cooking/'), '../sw.js');
  assert.equal(publicAssetPath('notification-icon.svg', '/site/cooking/index.html'), '../notification-icon.svg');
});
