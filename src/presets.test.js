import test from 'node:test';
import assert from 'node:assert/strict';
import { addPreset, loadPresets, PRESETS_KEY, removePreset } from './presets.js';

test('initial list contains only 30 minutes and survives missing or blocked storage', () => {
  assert.deepEqual(loadPresets({ getItem: () => null }), [1800]);
  assert.deepEqual(loadPresets({ getItem: () => '{invalid' }), [1800]);
  assert.deepEqual(loadPresets({ getItem: () => { throw new Error('Blocked'); } }), [1800]);
});

test('adds second-accurate presets, rejects duplicates, and caps total at four', () => {
  const first = addPreset([1800], '0', '45');
  assert.deepEqual(first, { presets: [1800, 45], seconds: 45 });
  const second = addPreset(first.presets, '1', '30');
  assert.deepEqual(second, { presets: [1800, 45, 90], seconds: 90 });
  const third = addPreset(second.presets, '15', '0');
  assert.deepEqual(third, { presets: [1800, 45, 90, 900], seconds: 900 });
  assert.ok(addPreset(third.presets, '60', '0').error);
  assert.ok(addPreset([1800], '30', '0').error);
  for (const [minutes, seconds] of [['', ''], ['-5', '0'], ['1.5', '0'], ['361', '0'], ['0', '60'], ['abc', '0']]) assert.ok(addPreset([1800], minutes, seconds).error);
  assert.deepEqual(addPreset([1800], '360', '0'), { presets: [1800, 21600], seconds: 21600 });
});

test('keeps the default 30-minute preset and removes only user-added presets', () => {
  assert.ok(removePreset([1800, 45, 90], 1800).error);
  assert.deepEqual(removePreset([1800, 45, 90], 45), { presets: [1800, 90], seconds: 45 });
  assert.ok(removePreset([1800, 45], 90).error);
});

test('migrates legacy minute presets and reads second-accurate saved presets', () => {
  assert.deepEqual(loadPresets({ getItem: (key) => key === PRESETS_KEY ? JSON.stringify([30, 15, 60]) : null }), [1800, 900, 3600]);
  assert.deepEqual(loadPresets({ getItem: () => JSON.stringify([15, 15, 0, '20', 1.5, 361, 60, 90]) }), [1800, 900, 3600, 5400]);
  assert.deepEqual(loadPresets({ getItem: () => JSON.stringify([{ seconds: 1800 }, { seconds: 45 }, { seconds: 90 }]) }), [1800, 45, 90]);
  assert.deepEqual(loadPresets({ getItem: () => JSON.stringify({ minutes: 30 }) }), [1800]);
});
