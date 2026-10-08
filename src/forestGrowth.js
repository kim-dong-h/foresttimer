import { createForestLayout, pickGrowingSlot } from './forestLayout.js';

export const PLANT_INTERVAL_MS = 30 * 60 * 1000;
export const PLANT_KINDS = ['grass-tuft', 'woodland-fern', 'round-shrub', 'wildflower-clump', 'young-sapling'];
export const MAX_FOREST_HOURS = 400;
export const MAX_PLANTS = MAX_FOREST_HOURS * 3600000 / PLANT_INTERVAL_MS;

// Slot IDs remain valid for existing saves; visual positions are now generated
// by one unified, deterministic ground-aware layout instead of separate bands.
export const FOREST_SLOTS = createForestLayout(MAX_PLANTS).map((slot, index) => ({ ...slot, index }));
export const PLANT_WIDTH_FACTORS = { 'grass-tuft': 0.72, 'woodland-fern': 0.86, 'round-shrub': 0.9, 'wildflower-clump': 0.48, 'young-sapling': 0.74 };
export const MEADOW_WIDTH_FACTORS = PLANT_WIDTH_FACTORS;

export function earnedPlantCount(totalMilliseconds) {
  return Math.max(0, Math.min(MAX_PLANTS, Math.floor(totalMilliseconds / PLANT_INTERVAL_MS)));
}

export function readForestPlants(value, totalMilliseconds) {
  if (!Array.isArray(value)) return [];
  const used = new Set();
  return value.filter((plant) => {
    if (!plant || !PLANT_KINDS.includes(plant.kind) || !Number.isInteger(plant.slot) || plant.slot < 0 || plant.slot >= MAX_PLANTS || used.has(plant.slot)) return false;
    used.add(plant.slot);
    return true;
  }).slice(0, earnedPlantCount(totalMilliseconds)).map(({ kind, slot }) => ({ kind, slot }));
}

// Existing draws never change. A delayed timer update can earn several plants.
export function growForest(plants, totalMilliseconds, random = Math.random) {
  const target = earnedPlantCount(totalMilliseconds);
  if (plants.length >= target) return plants;
  const next = [...plants];
  const used = new Set(plants.map((plant) => plant.slot));
  const available = FOREST_SLOTS.filter(({ index }) => !used.has(index));
  const plantedSlots = next.map(({ slot }) => FOREST_SLOTS[slot]);
  const pick = (length) => Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
  while (next.length < target) {
    const kind = PLANT_KINDS[pick(PLANT_KINDS.length)];
    const position = pickGrowingSlot(available, plantedSlots, random);
    available.splice(available.indexOf(position), 1);
    plantedSlots.push(position);
    next.push({ kind, slot: position.index });
  }
  return next;
}

