import test from 'node:test';
import assert from 'node:assert/strict';
import { earnedPlantCount, growForest, readForestPlants, PLANT_INTERVAL_MS, MAX_PLANTS, MAX_FOREST_HOURS, FOREST_SLOTS } from './forestGrowth.js';
import { createForestLayout, isPlantableGround } from './forestLayout.js';

test('earns plants at exact cumulative 30-minute boundaries and caps the forest', () => {
  assert.equal(earnedPlantCount(PLANT_INTERVAL_MS - 1), 0);
  assert.equal(earnedPlantCount(PLANT_INTERVAL_MS), 1);
  assert.equal(earnedPlantCount(PLANT_INTERVAL_MS * 2 - 1), 1);
  assert.equal(earnedPlantCount(PLANT_INTERVAL_MS * 2), 2);
  assert.equal(earnedPlantCount(20 * 3600000), 40);
  assert.equal(earnedPlantCount(100 * 3600000 - 1), 199);
  assert.equal(earnedPlantCount(100 * 3600000), 200);
  assert.equal(earnedPlantCount(200 * 3600000), 400);
  assert.equal(earnedPlantCount(300 * 3600000 - 1), 599);
  assert.equal(earnedPlantCount(300 * 3600000), 600);
  assert.equal(earnedPlantCount(400 * 3600000 - 1), 799);
  assert.equal(earnedPlantCount(400 * 3600000), MAX_PLANTS);
  assert.equal(earnedPlantCount(500 * 3600000), 800);
});

test('multiple new plants use unique free ground positions without changing prior draws', () => {
  const first = growForest([], PLANT_INTERVAL_MS, () => 0.5);
  const full = growForest(first, MAX_FOREST_HOURS * 3600000, () => 0.99);
  assert.equal(first.length, 1);
  assert.deepEqual(full[0], first[0]);
  assert.equal(full.length, MAX_PLANTS);
  assert.equal(new Set(full.map(({ slot }) => slot)).size, MAX_PLANTS);
  assert.equal(growForest(full, 500 * 3600000, () => { throw new Error('Do not draw after the cap'); }), full);
});

test('all 800 roots stay on plantable ground and leave the spirit feet readable', () => {
  assert.equal(FOREST_SLOTS.length, 800);
  assert.ok(FOREST_SLOTS.some(({ x, y }) => x > 350 && x < 650 && y > 520 && y < 750));
  assert.ok(FOREST_SLOTS.filter(({ x, y }) => x > 800 && x < 1000 && y > 550 && y < 900).length > 50);
  for (const { x, y, width } of FOREST_SLOTS) {
    assert.ok(isPlantableGround(x, y, width));
    if (y > 808 && Math.abs(x - 480) < 175) assert.ok(y - width * 1.1 >= 768);
  }
});

test('root separation follows plant size across the foreshortened ground plane', () => {
  for (let index = 0; index < FOREST_SLOTS.length; index += 1) {
    const a = FOREST_SLOTS[index];
    for (const b of FOREST_SLOTS.slice(0, index)) {
      const combined = a.width + b.width;
      assert.ok(Math.hypot((a.x - b.x) / (combined * .18), (a.y - b.y) / (combined * .075)) >= 1);
    }
  }
});

test('clustered layout is deterministic and foreground plants have consistent perspective', () => {
  const repeat = createForestLayout();
  assert.deepEqual(repeat, FOREST_SLOTS.map(({ index, ...slot }) => slot));
  assert.ok(new Set(repeat.map(slot => slot.cluster)).size >= 20);
  const far = repeat.filter(slot => slot.y < 570);
  const near = repeat.filter(slot => slot.y > 920);
  const mean = values => values.reduce((sum, slot) => sum + slot.width, 0) / values.length;
  assert.ok(mean(near) > mean(far) * 2);
  assert.ok(Math.max(...far.map(slot => slot.opacity)) < Math.min(...near.map(slot => slot.opacity)));
});

test('growth inside a saved patch is stable after reload and continues into unused slots', () => {
  const first = growForest([], 100 * 3600000, () => .35);
  const restored = readForestPlants(JSON.parse(JSON.stringify(first)), 100 * 3600000);
  const continued = growForest(restored, 400 * 3600000, () => .6);
  assert.deepEqual(continued.slice(0, first.length), first);
  assert.equal(new Set(continued.map(plant => plant.slot)).size, 800);
  assert.deepEqual(first.map(plant => FOREST_SLOTS[plant.slot]), restored.map(plant => FOREST_SLOTS[plant.slot]));
});

test('invalid and duplicate stored plants cannot occupy a slot or grant unearned plants', () => {
  const stored = [null, { kind: 'unknown', slot: 0 }, { kind: 'grass-tuft', slot: -1 }, { kind: 'grass-tuft', slot: MAX_PLANTS }, { kind: 'young-sapling', slot: 7 }, { kind: 'round-shrub', slot: 7 }, { kind: 'wildflower-clump', slot: 8 }];
  assert.deepEqual(readForestPlants(stored, PLANT_INTERVAL_MS), [{ kind: 'young-sapling', slot: 7 }]);
  assert.deepEqual(readForestPlants(stored, PLANT_INTERVAL_MS * 2), [{ kind: 'young-sapling', slot: 7 }, { kind: 'wildflower-clump', slot: 8 }]);
  assert.deepEqual(readForestPlants(stored, 0), []);
});
