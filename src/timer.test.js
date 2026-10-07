import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingAt, formatTime, durationFromInputs } from './timer.js';

test('calculates elapsed time correctly after a delayed browser tick', () => {
  assert.equal(remainingAt(60000, 45250), 14750);
  assert.equal(remainingAt(60000, 90000), 0);
});

test('rounds display up without showing negative time', () => {
  assert.equal(formatTime(1500000), '25:00');
  assert.equal(formatTime(3600000), '01:00:00');
  assert.equal(formatTime(5432000), '01:30:32');
  assert.equal(formatTime(59001), '01:00');
  assert.equal(formatTime(1), '00:01');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-100), '00:00');
});

test('constrains custom time to supported minute and second ranges', () => {
  assert.equal(durationFromInputs('1', '30'), 90000);
  assert.equal(durationFromInputs('', ''), 0);
  assert.equal(durationFromInputs('-5', '100'), 59000);
  assert.equal(durationFromInputs('200', '0'), 12000000);
  assert.equal(durationFromInputs('360', '0'), 21600000);
  assert.equal(durationFromInputs('361', '59'), 21600000);
  assert.equal(formatTime(durationFromInputs('360', '0')), '06:00:00');
});
