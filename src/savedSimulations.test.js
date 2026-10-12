import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSavedSimulations, saveSimulation, SAVED_SIMULATIONS_KEY } from './savedSimulations.js';

function memoryStorage() {
  const items = new Map();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
}

const values = { basePrice: '1234.56', dropPercent: '-7.5', profitPercent: '10' };

test('named simulations persist all input values and append without overwriting existing records', () => {
  const storage = memoryStorage();
  const first = saveSimulation(storage, '  첫 계획  ', values);
  assert.equal(first.record.title, '첫 계획');
  assert.deepEqual(loadSavedSimulations(storage), first.records);
  const second = saveSimulation(storage, '다른 계획', { ...values, profitPercent: '20' });
  assert.equal(second.records.length, 2);
  assert.notEqual(second.record.id, first.record.id);
  assert.deepEqual(loadSavedSimulations(storage)[1], first.record);
  assert.equal(loadSavedSimulations(storage)[0].profitPercent, '20');
});

test('invalid titles or inputs cannot write saved simulations', () => {
  const storage = memoryStorage();
  for (const title of ['', '   ', 'a'.repeat(61)]) assert.ok(saveSimulation(storage, title, values).error);
  assert.ok(saveSimulation(storage, '계획', { ...values, dropPercent: '100' }).error);
  assert.equal(storage.getItem(SAVED_SIMULATIONS_KEY), null);
});

test('dollar and won saves stay separate and legacy untagged records remain Korean won', () => {
  const storage = memoryStorage();
  const won = saveSimulation(storage, '원화 계획', values).record;
  const { currency, ...legacy } = won;
  storage.setItem(SAVED_SIMULATIONS_KEY, JSON.stringify([legacy]));
  const dollar = saveSimulation(storage, 'Dollar plan', { ...values, basePrice: '100' }, 'en');
  assert.equal(dollar.record.currency, 'USD');
  assert.equal(dollar.records.length, 1);
  assert.deepEqual(loadSavedSimulations(storage, 'KRW'), [legacy]);
  assert.deepEqual(loadSavedSimulations(storage, 'USD'), [dollar.record]);
  assert.equal(loadSavedSimulations(storage).length, 2);
  saveSimulation(storage, '새 원화 계획', values);
  assert.equal(loadSavedSimulations(storage, 'USD').length, 1);
  assert.equal(loadSavedSimulations(storage, 'KRW').length, 2);
});

test('malformed saved data and unavailable storage do not crash or claim a successful save', () => {
  const storage = memoryStorage();
  storage.setItem(SAVED_SIMULATIONS_KEY, '{broken');
  assert.deepEqual(loadSavedSimulations(storage), []);
  const valid = saveSimulation(storage, '정상', values).record;
  storage.setItem(SAVED_SIMULATIONS_KEY, JSON.stringify([valid, null, { ...valid, title: '' }, { ...valid, basePrice: '0' }]));
  assert.deepEqual(loadSavedSimulations(storage), [valid]);
  const unavailable = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(loadSavedSimulations(unavailable), []);
  assert.ok(saveSimulation(unavailable, '계획', values).error);
});
