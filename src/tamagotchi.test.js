import test from 'node:test';
import assert from 'node:assert/strict';
import { EVOLUTION_HOURS, HOUR_MS, TAMAGOTCHI_KEY, SpiritTracker, evolutionProgress, evolutionStage, readSpirit } from './tamagotchi.js';
import { PLANT_INTERVAL_MS, MAX_PLANTS } from './forestGrowth.js';

function storageWith(profile) {
  const values = new Map(profile ? [[TAMAGOTCHI_KEY, JSON.stringify(profile)]] : []);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('assigns one of the three spirits once and restores it without rerolling', () => {
  for (const [random, species] of [[0, 'sprout-spirit'], [0.5, 'mushroom-sprite'], [0.999, 'moss-stone-spirit']]) {
    const storage = storageWith();
    const first = new SpiritTracker(storage, () => random);
    assert.equal(first.profile.species, species);
    assert.equal(first.saved, true);
    const next = new SpiritTracker(storage, () => { throw new Error('Must not reroll'); });
    assert.deepEqual(next.profile, first.profile);
  }
});

test('evolves exactly at 10, 30, and 60 cumulative hours, ending at stage 3', () => {
  assert.equal(evolutionStage(0), 0);
  for (const [index, hours] of EVOLUTION_HOURS.entries()) {
    assert.equal(evolutionStage(hours * HOUR_MS - 1), index);
    assert.equal(evolutionStage(hours * HOUR_MS), index + 1);
  }
  assert.equal(evolutionStage(100 * HOUR_MS), 3);
  assert.deepEqual(evolutionProgress(20 * HOUR_MS), { stage: 1, nextHours: 30, fraction: 0.5 });
  assert.deepEqual(evolutionProgress(80 * HOUR_MS), { stage: 3, nextHours: null, fraction: 1 });
});

test('credits only active time across pauses and repeated sessions', () => {
  const tracker = new SpiritTracker(storageWith(), () => 0);
  tracker.tick(1000);
  assert.equal(tracker.profile.totalMilliseconds, 0);
  tracker.begin(11000, 1000);
  tracker.tick(2500);
  tracker.stop(2750);
  tracker.tick(100000);
  assert.equal(tracker.profile.totalMilliseconds, 1750);
  tracker.begin(107500, 100000);
  tracker.stop(101250);
  assert.equal(tracker.profile.totalMilliseconds, 3000);
});

test('a delayed background tick is capped at completion and never credited twice', () => {
  const tracker = new SpiritTracker(storageWith(), () => 0);
  tracker.begin(60000, 1000);
  tracker.tick(90000);
  tracker.tick(100000);
  tracker.stop(200000);
  assert.equal(tracker.profile.totalMilliseconds, 59000);
});

test('persists sub-second time on reset or pagehide, with no loss or duplicate credit', () => {
  const storage = storageWith();
  const tracker = new SpiritTracker(storage, () => 0);
  tracker.begin(60000, 1000);
  tracker.tick(1400);
  assert.equal(readSpirit(storage).totalMilliseconds, 0);
  tracker.tick(1450, true);
  tracker.tick(1450, true);
  assert.equal(readSpirit(storage).totalMilliseconds, 450);
  tracker.stop(1600);
  assert.equal(readSpirit(storage).totalMilliseconds, 600);
});

test('reload restores cumulative growth but does not feed time while the timer is absent', () => {
  const storage = storageWith();
  const tracker = new SpiritTracker(storage, () => 0);
  tracker.begin(60000, 1000);
  tracker.tick(2000, true);
  const restored = new SpiritTracker(storage, () => 0.9);
  restored.tick(500000);
  assert.equal(restored.profile.totalMilliseconds, 1000);
  assert.equal(restored.profile.species, 'sprout-spirit');
});

test('crosses a threshold during a session and keeps evolution after reset', () => {
  const storage = storageWith({ version: 1, species: 'mushroom-sprite', totalMilliseconds: 10 * HOUR_MS - 500, lastCreditedAt: 0 });
  const tracker = new SpiritTracker(storage);
  tracker.begin(11000, 1000);
  tracker.tick(2000);
  assert.equal(evolutionStage(tracker.profile.totalMilliseconds), 1);
  tracker.stop(2200);
  assert.equal(evolutionStage(new SpiritTracker(storage).profile.totalMilliseconds), 1);
});

test('overlapping tabs share the pet and do not double-feed the same time', () => {
  const storage = storageWith();
  const first = new SpiritTracker(storage, () => 0);
  const second = new SpiritTracker(storage, () => 0.9);
  first.begin(11000, 1000);
  second.begin(12000, 2000);
  first.tick(3000);
  second.tick(3000);
  second.tick(5000);
  first.stop(5000);
  assert.equal(readSpirit(storage).totalMilliseconds, 4000);
  assert.equal(first.profile.species, second.profile.species);
});

test('repairs invalid storage safely and preserves a valid spirit identity', () => {
  const storage = storageWith({ version: 1, species: 'sprout-spirit', totalMilliseconds: -100, lastCreditedAt: 'bad' });
  assert.equal(new SpiritTracker(storage, () => 0.9).profile.species, 'sprout-spirit');
  assert.equal(readSpirit(storage).totalMilliseconds, 0);
  storage.setItem(TAMAGOTCHI_KEY, '{bad json');
  assert.equal(readSpirit(storage), null);
  assert.equal(new SpiritTracker(storage, () => 0.5).profile.species, 'mushroom-sprite');
});

test('continues growing in memory if storage is blocked or becomes read-only', () => {
  const blocked = new SpiritTracker({ getItem() { throw new Error(); }, setItem() { throw new Error(); } }, () => 0);
  blocked.begin(11000, 1000);
  blocked.stop(3000);
  assert.equal(blocked.saved, false);
  assert.equal(blocked.profile.totalMilliseconds, 2000);
  const storage = storageWith();
  const readOnly = new SpiritTracker(storage, () => 0);
  storage.setItem = () => { throw new Error(); };
  readOnly.begin(11000, 1000);
  readOnly.tick(2000);
  readOnly.tick(3000);
  assert.equal(readOnly.profile.totalMilliseconds, 2000);
  assert.equal(readOnly.saved, false);
});

test('split sessions earn a plant at 30 active minutes, preserving plants through reset and reload', () => {
  const storage = storageWith();
  const tracker = new SpiritTracker(storage, () => 0.5);
  tracker.begin(1000 + PLANT_INTERVAL_MS / 2, 1000);
  tracker.stop(1000 + PLANT_INTERVAL_MS / 2);
  assert.equal(tracker.profile.forestPlants.length, 0);
  tracker.tick(10 * HOUR_MS);
  assert.equal(tracker.profile.totalMilliseconds, PLANT_INTERVAL_MS / 2);
  tracker.begin(10 * HOUR_MS + PLANT_INTERVAL_MS / 2, 10 * HOUR_MS);
  tracker.tick(10 * HOUR_MS + PLANT_INTERVAL_MS / 2 - 1, true);
  assert.equal(tracker.profile.forestPlants.length, 0);
  tracker.stop(10 * HOUR_MS + PLANT_INTERVAL_MS / 2);
  assert.equal(tracker.profile.forestPlants.length, 1);
  const restored = new SpiritTracker(storage, () => { throw new Error('Must not reroll saved plants'); });
  assert.deepEqual(restored.profile.forestPlants, tracker.profile.forestPlants);
});

test('backfills existing timer progress once and never adds idle time or completion overshoot', () => {
  const storage = storageWith({ version: 1, species: 'moss-stone-spirit', totalMilliseconds: HOUR_MS, lastCreditedAt: 0 });
  const tracker = new SpiritTracker(storage, () => 0.9);
  assert.equal(tracker.profile.forestPlants.length, 2);
  const before = structuredClone(tracker.profile.forestPlants);
  tracker.begin(1000 + HOUR_MS, 1000);
  tracker.tick(1000 + 10 * HOUR_MS);
  tracker.stop(1000 + 11 * HOUR_MS);
  assert.equal(tracker.profile.totalMilliseconds, 2 * HOUR_MS);
  assert.equal(tracker.profile.forestPlants.length, 4);
  assert.deepEqual(tracker.profile.forestPlants.slice(0, 2), before);
  assert.deepEqual(new SpiritTracker(storage, () => { throw new Error('Saved draws are stable'); }).profile, tracker.profile);
});

test('overlapping tabs retain the first saved random plant and do not earn duplicate plants', () => {
  const storage = storageWith();
  const first = new SpiritTracker(storage, () => 0);
  const second = new SpiritTracker(storage, () => 0.99);
  const end = 1000 + PLANT_INTERVAL_MS;
  first.begin(end, 1000);
  second.begin(end, 1000);
  first.tick(end);
  second.tick(end);
  assert.equal(readSpirit(storage).totalMilliseconds, PLANT_INTERVAL_MS);
  assert.equal(second.profile.forestPlants.length, 1);
  assert.deepEqual(first.profile.forestPlants, second.profile.forestPlants);
});

test('growth continues past 20 hours to 400, preserves existing draws, and evolves the spirit at 60', () => {
  const storedPlants = Array.from({ length: 40 }, (_, slot) => ({ kind: 'grass-tuft', slot }));
  const storage = storageWith({ version: 1, species: 'sprout-spirit', totalMilliseconds: 20 * HOUR_MS, lastCreditedAt: 0, forestPlants: storedPlants });
  const tracker = new SpiritTracker(storage, () => 0.25);
  assert.equal(tracker.profile.forestPlants.length, 40);
  assert.deepEqual(tracker.profile.forestPlants, storedPlants);
  const before = structuredClone(tracker.profile.forestPlants);
  tracker.begin(1000 + 40 * HOUR_MS, 1000);
  tracker.stop(1000 + 40 * HOUR_MS);
  assert.equal(tracker.profile.totalMilliseconds, 60 * HOUR_MS);
  assert.equal(evolutionStage(tracker.profile.totalMilliseconds), 3);
  assert.equal(tracker.profile.forestPlants.length, 120);
  assert.deepEqual(tracker.profile.forestPlants.slice(0, 40), before);
  tracker.begin(1000 + 390 * HOUR_MS, 1000 + 40 * HOUR_MS);
  tracker.stop(1000 + 390 * HOUR_MS);
  assert.equal(tracker.profile.totalMilliseconds, 410 * HOUR_MS);
  assert.equal(tracker.profile.forestPlants.length, MAX_PLANTS);
  assert.deepEqual(tracker.profile.forestPlants.slice(0, 40), before);
  assert.deepEqual(new SpiritTracker(storage, () => { throw new Error('Do not reroll at the cap'); }).profile, tracker.profile);
});

test('a saved 300-hour forest keeps its 600 plant identities and grows into an unused slot', () => {
  const storedPlants = Array.from({ length: 600 }, (_, slot) => ({ kind: 'woodland-fern', slot }));
  const storage = storageWith({ version: 1, species: 'moss-stone-spirit', totalMilliseconds: 300 * HOUR_MS, lastCreditedAt: 0, forestPlants: storedPlants });
  const tracker = new SpiritTracker(storage, () => 0);
  assert.deepEqual(tracker.profile.forestPlants, storedPlants);
  tracker.begin(1000 + PLANT_INTERVAL_MS, 1000);
  tracker.stop(1000 + PLANT_INTERVAL_MS);
  assert.deepEqual(tracker.profile.forestPlants.slice(0, 600), storedPlants);
  assert.deepEqual(tracker.profile.forestPlants[600], { kind: 'grass-tuft', slot: 600 });
});

test('a saved 100-hour forest keeps its 200 plants and earns another plant after half an hour', () => {
  const storedPlants = Array.from({ length: 200 }, (_, slot) => ({ kind: 'round-shrub', slot }));
  const storage = storageWith({ version: 1, species: 'sprout-spirit', totalMilliseconds: 100 * HOUR_MS, lastCreditedAt: 0, forestPlants: storedPlants });
  const tracker = new SpiritTracker(storage, () => 0);
  assert.deepEqual(tracker.profile.forestPlants, storedPlants);
  tracker.begin(1000 + PLANT_INTERVAL_MS, 1000);
  tracker.stop(1000 + PLANT_INTERVAL_MS);
  assert.deepEqual(tracker.profile.forestPlants.slice(0, 200), storedPlants);
  assert.deepEqual(tracker.profile.forestPlants[200], { kind: 'grass-tuft', slot: 200 });
});

test('plants stay stable in memory if saving becomes blocked across the next threshold', () => {
  const storage = storageWith();
  const tracker = new SpiritTracker(storage, () => 0.5);
  tracker.begin(1000 + 2 * PLANT_INTERVAL_MS, 1000);
  storage.setItem = () => { throw new Error('Read-only'); };
  tracker.tick(1000 + PLANT_INTERVAL_MS);
  const first = structuredClone(tracker.profile.forestPlants[0]);
  tracker.stop(1000 + 2 * PLANT_INTERVAL_MS);
  assert.equal(tracker.saved, false);
  assert.equal(tracker.profile.forestPlants.length, 2);
  assert.deepEqual(tracker.profile.forestPlants[0], first);
});
