import test from 'node:test';
import assert from 'node:assert/strict';
import { createRainLoop } from './rainLoop.js';

function buffer(channels, length, sampleRate = 1000) {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return { numberOfChannels: channels, length, sampleRate, getChannelData: channel => data[channel] };
}
const context = { createBuffer: buffer };

test('crossfade has continuous joins, preserves stereo, and leaves the recording unchanged', () => {
  const recording = buffer(2, 10000);
  for (let i = 0; i < recording.length; i += 1) {
    recording.getChannelData(0)[i] = .4 + i / 100000;
    recording.getChannelData(1)[i] = -.4 - i / 100000;
  }
  const original = recording.getChannelData(0).slice();
  const loop = createRainLoop(context, recording, 1);
  assert.equal(loop.numberOfChannels, 2);
  assert.equal(loop.sampleRate, 1000);
  assert.equal(loop.length, 9000);
  const samples = loop.getChannelData(0);
  // At the repeat boundary we continue with adjacent samples from the head.
  assert.ok(Math.abs(samples[0] - samples.at(-1)) < .00002);
  // At the beginning of the blend we continue with adjacent tail samples.
  assert.ok(Math.abs(samples[8000] - samples[7999]) < .00002);
  assert.deepEqual(recording.getChannelData(0), original);
  for (let i = 0; i < loop.length; i += 1) assert.equal(loop.getChannelData(1)[i], -samples[i]);
});

test('quiet leading and trailing padding is removed instead of repeated', () => {
  const recording = buffer(1, 10000);
  recording.getChannelData(0).fill(.25, 1000, 9000);
  const loop = createRainLoop(context, recording, 1);
  assert.equal(loop.length, 7000);
  assert.ok(loop.getChannelData(0).every(value => value >= .249 && Number.isFinite(value)));
});

test('short and silent recordings remain valid without NaN samples', () => {
  const silent = buffer(1, 100);
  assert.equal(createRainLoop(context, silent), silent);
  const short = buffer(1, 4);
  short.getChannelData(0).fill(.1);
  assert.equal(createRainLoop(context, short), short);
});
