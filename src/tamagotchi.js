import { growForest, readForestPlants } from './forestGrowth.js';

export const TAMAGOTCHI_KEY = 'foresttimer-tamagotchi';
export const SPIRIT_SPECIES = ['sprout-spirit', 'mushroom-sprite', 'moss-stone-spirit'];
export const HOUR_MS = 60 * 60 * 1000;
export const EVOLUTION_HOURS = [10, 30, 60];

export function evolutionStage(totalMilliseconds) {
  return EVOLUTION_HOURS.filter((hours) => totalMilliseconds >= hours * HOUR_MS).length;
}

export function evolutionProgress(totalMilliseconds) {
  const stage = evolutionStage(totalMilliseconds);
  const start = (EVOLUTION_HOURS[stage - 1] ?? 0) * HOUR_MS;
  const target = EVOLUTION_HOURS[stage] * HOUR_MS;
  return { stage, nextHours: EVOLUTION_HOURS[stage] ?? null, fraction: stage === 3 ? 1 : Math.max(0, Math.min(1, (totalMilliseconds - start) / (target - start))) };
}

export function readSpirit(storage) {
  try {
    const data = JSON.parse(storage?.getItem(TAMAGOTCHI_KEY) ?? 'null');
    if (data?.version !== 1 || !SPIRIT_SPECIES.includes(data.species)) return null;
    const nonnegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
    const totalMilliseconds = nonnegativeInteger(data.totalMilliseconds);
    return { version: 1, species: data.species, totalMilliseconds, lastCreditedAt: nonnegativeInteger(data.lastCreditedAt), forestPlants: readForestPlants(data.forestPlants, totalMilliseconds) };
  } catch { return null; }
}

// Credit elapsed running time, capped at the countdown's actual deadline.
// A shared watermark prevents overlapping browser tabs from feeding time twice.
export class SpiritTracker {
  constructor(storage, random = Math.random) {
    this.storage = storage;
    this.random = random;
    this.profile = readSpirit(storage) ?? {
      version: 1,
      species: SPIRIT_SPECIES[Math.min(2, Math.max(0, Math.floor(random() * 3)))],
      totalMilliseconds: 0,
      lastCreditedAt: 0,
      forestPlants: [],
    };
    this.active = null;
    this.growPlants();
    this.save();
  }

  growPlants() {
    const forestPlants = growForest(this.profile.forestPlants, this.profile.totalMilliseconds, this.random);
    if (forestPlants !== this.profile.forestPlants) this.profile = { ...this.profile, forestPlants };
  }

  save() {
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(TAMAGOTCHI_KEY, JSON.stringify(this.profile));
      this.saved = true;
    } catch { this.saved = false; }
  }

  begin(deadline, now = Date.now()) {
    this.stop(now);
    if (deadline > now) this.active = { deadline, accountedAt: now };
  }

  tick(now = Date.now(), force = false) {
    if (!this.active || (!force && now - this.active.accountedAt < 1000)) return this.profile;
    const end = Math.min(now, this.active.deadline);
    const latest = readSpirit(this.storage);
    if (latest) this.merge(latest);
    const elapsed = Math.max(0, end - Math.max(this.active.accountedAt, this.profile.lastCreditedAt));
    this.active.accountedAt = Math.max(this.active.accountedAt, end);
    if (elapsed > 0) {
      this.profile = {
        ...this.profile,
        totalMilliseconds: Math.min(Number.MAX_SAFE_INTEGER, this.profile.totalMilliseconds + elapsed),
        lastCreditedAt: end,
      };
      this.growPlants();
      this.save();
    }
    return this.profile;
  }

  stop(now = Date.now()) {
    this.tick(now, true);
    this.active = null;
    return this.profile;
  }

  refresh() {
    const latest = readSpirit(this.storage);
    if (latest) {
      this.merge(latest);
      this.growPlants();
      this.save();
    }
    return this.profile;
  }

  merge(latest) {
    this.profile = latest.species === this.profile.species ? {
      ...latest,
      totalMilliseconds: Math.max(latest.totalMilliseconds, this.profile.totalMilliseconds),
      lastCreditedAt: Math.max(latest.lastCreditedAt, this.profile.lastCreditedAt),
      forestPlants: latest.forestPlants.length >= this.profile.forestPlants.length ? latest.forestPlants : this.profile.forestPlants,
    } : latest;
  }
}
