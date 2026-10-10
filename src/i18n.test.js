import test from 'node:test';
import assert from 'node:assert/strict';
import { formatElapsed, formatPreset, formatSavedPreset, languageFromPath, publicAssetPath } from './i18n.js';

test('selects English only for the /us locale route', () => {
  assert.equal(languageFromPath('/us'), 'en');
  assert.equal(languageFromPath('/us/'), 'en');
  assert.equal(languageFromPath('/foresttimer/us/'), 'en');
  assert.equal(languageFromPath('/kr'), 'ko');
  assert.equal(languageFromPath('/foresttimer/kr/index.html'), 'ko');
  assert.equal(languageFromPath('/'), 'ko');
});

test('uses locale route paths for static public assets', () => {
  assert.equal(publicAssetPath('sw.js', '/'), './sw.js');
  assert.equal(publicAssetPath('sw.js', '/us/'), '../sw.js');
  assert.equal(publicAssetPath('sw.js', '/foresttimer/kr/'), '../sw.js');
});

test('formats units in the active language', () => {
  assert.equal(formatPreset(5405, 'ko'), '1시간 30분 5초');
  assert.equal(formatPreset(5405, 'en'), '1h 30m 5s');
  assert.equal(formatSavedPreset(3600, 'ko'), '60분');
  assert.equal(formatSavedPreset(5400, 'ko'), '90분');
  assert.equal(formatSavedPreset(5405, 'ko'), '90분 5초');
  assert.equal(formatSavedPreset(5405, 'en'), '90m 5s');
  assert.equal(formatSavedPreset(21600, 'ko'), '360분');
  assert.equal(formatSavedPreset(45, 'ko'), '45초');
  assert.equal(formatElapsed(125000, 'ko'), '2분 5초');
  assert.equal(formatElapsed(125000, 'en'), '2m 5s');
});
