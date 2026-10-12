import test from 'node:test';
import assert from 'node:assert/strict';
import { languageFromPath } from './i18n.js';
import { investmentLabel, percentTimerHref, moneyLabel } from './percentI18n.js';

test('calculator locale routes return to the corresponding timer and retain deployment prefixes', () => {
  assert.equal(languageFromPath('/percent/us/'), 'en');
  assert.equal(languageFromPath('/site/percent/us/index.html'), 'en');
  assert.equal(languageFromPath('/percent/'), 'ko');
  assert.equal(percentTimerHref('/percent/', 'ko'), '/');
  assert.equal(percentTimerHref('/percent/us/', 'en'), '/us/');
  assert.equal(percentTimerHref('/site/percent/us/index.html', 'en'), '/site/us/');
  assert.equal(percentTimerHref('/site/percent/index.html', 'ko'), '/site/');
});

test('English labels use dollars and cents while Korean labels retain whole-won amounts', () => {
  assert.equal(moneyLabel('1234.99', 'en'), '$1,234.99');
  assert.equal(moneyLabel('1234.99', 'ko'), '1,234원');
  assert.equal(investmentLabel(100, 'en'), '$100.00');
  assert.equal(investmentLabel(5500, 'en'), '$5,500.00');
  assert.equal(investmentLabel(55_000_000, 'ko'), '5,500만원');
});
