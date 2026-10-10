import test from 'node:test';
import assert from 'node:assert/strict';
import { SoundController, SOUND_PREFERENCE_KEY, readSoundPreference } from './sounds.js';

function memoryStorage(value) {
  const values = new Map(value === undefined ? [] : [[SOUND_PREFERENCE_KEY, value]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, next) => values.set(key, next) };
}

function fakeContext() {
  const context = { state: 'running', currentTime: 10, destination: {}, gains: [], oscillators: [], sources: [], resume: () => Promise.resolve(), close: () => Promise.resolve() };
  context.createGain = () => {
    const gain = { value: 1, cancelScheduledValues() {}, setValueAtTime(value) { this.value = value; }, linearRampToValueAtTime(value) { this.rampTarget = value; }, exponentialRampToValueAtTime() {} };
    const node = { gain, connect(target) { this.output = target; }, disconnect() { this.output = null; } };
    context.gains.push(node);
    return node;
  };
  context.createOscillator = () => {
    const node = { frequency: {}, connect(target) { this.output = target; }, start(time) { this.startedAt = time; }, stop(time) { this.stoppedAt = time; } };
    context.oscillators.push(node);
    return node;
  };
  context.createBuffer = (numberOfChannels, length, sampleRate) => {
    const channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
    return { numberOfChannels, length, sampleRate, getChannelData: channel => channels[channel] };
  };
  context.decodeAudioData = async () => {
    const recording = context.createBuffer(2, 10000, 1000);
    recording.getChannelData(0).fill(.1);
    recording.getChannelData(1).fill(.1);
    return recording;
  };
  context.createBufferSource = () => {
    const node = { connect(target) { this.output = target; }, start() { this.started = true; }, stop() { this.stopped = true; }, disconnect() { this.output = null; } };
    context.sources.push(node);
    return node;
  };
  return context;
}
const audioResponse = () => Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });

test('sound defaults on and restores an explicit off preference across page loads', () => {
  const storage = memoryStorage();
  assert.equal(readSoundPreference(storage), true);
  const sound = new SoundController({ storage });
  sound.setEnabled(false);
  assert.equal(storage.getItem(SOUND_PREFERENCE_KEY), 'false');
  assert.equal(new SoundController({ storage }).enabled, false);
  sound.setEnabled(true);
  assert.equal(new SoundController({ storage }).enabled, true);
});

test('muting and unmuting continuous rain keeps the same running source', async () => {
  const context = fakeContext();
  const sound = new SoundController({ storage: memoryStorage(), createContext: () => context, fetchAudio: audioResponse });
  await sound.startRain('rain.mp3');
  const rain = context.sources[0];
  assert.equal(rain.loop, true);
  assert.equal(rain.output.gain.rampTarget, .5);
  assert.equal(rain.output.output, sound.masterGain);
  sound.setEnabled(false);
  assert.equal(sound.masterGain.gain.value, 0);
  assert.equal(rain.stopped, undefined);
  sound.setEnabled(true);
  assert.equal(sound.masterGain.gain.value, 1);
  assert.equal(context.sources.length, 1);
  assert.equal(sound.rainRequested, true);
});

test('rain started while sound is off is already muted', async () => {
  const context = fakeContext();
  const sound = new SoundController({ storage: memoryStorage('false'), createContext: () => context, fetchAudio: audioResponse });
  await sound.startRain('rain.mp3');
  assert.equal(sound.masterGain.gain.value, 0);
  assert.equal(context.sources[0].started, true);
});

test('stopping during a download prevents late playback, and restart reuses the download', async () => {
  const context = fakeContext();
  let resolveDownload;
  let downloads = 0;
  const sound = new SoundController({ storage: memoryStorage(), createContext: () => context, fetchAudio: () => {
    downloads += 1;
    return new Promise(resolve => { resolveDownload = resolve; });
  } });
  const first = sound.startRain('rain.mp3');
  sound.stopRain();
  const second = sound.startRain('rain.mp3');
  resolveDownload(await audioResponse());
  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.equal(downloads, 1);
  assert.equal(context.sources.length, 1);
  sound.stopRain();
  assert.equal(context.sources[0].stopped, true);
  assert.equal(context.sources[0].output, null);
  await sound.startRain('rain.mp3');
  assert.equal(downloads, 1);
  assert.equal(context.sources.length, 2);
  sound.dispose();
  assert.equal(context.sources[1].stopped, true);
});

test('a failed rain download clears playback state and allows retry', async () => {
  const context = fakeContext();
  let attempts = 0;
  const sound = new SoundController({ storage: memoryStorage(), createContext: () => context, fetchAudio: () => {
    attempts += 1;
    return attempts === 1 ? Promise.reject(new Error('offline')) : audioResponse();
  } });
  await assert.rejects(sound.startRain('rain.mp3'), /offline/);
  assert.equal(sound.rainRequested, false);
  await sound.startRain('rain.mp3');
  assert.equal(context.sources.length, 1);
});

test('completion callbacks use the current preference and all scheduled tones pass through the master mute', () => {
  const context = fakeContext();
  const sound = new SoundController({ storage: memoryStorage(), createContext: () => context });
  const finish = () => sound.playCompletion();
  sound.prepare();
  sound.setEnabled(false);
  finish();
  assert.equal(context.oscillators.length, 0);
  assert.equal(context.gains[0].gain.value, 0);
  sound.setEnabled(true);
  finish();
  assert.equal(context.oscillators.length, 3);
  assert.equal(context.gains[0].output, context.destination);
  for (const tone of context.oscillators) {
    assert.equal(tone.output.output, context.gains[0]);
    assert.ok(tone.stoppedAt > tone.startedAt);
  }
  sound.setEnabled(false);
  assert.equal(context.gains[0].gain.value, 0);
  finish();
  assert.equal(context.oscillators.length, 3);
});

test('starting a timer with saved sound off initializes its audio output silently', () => {
  const context = fakeContext();
  const sound = new SoundController({ storage: memoryStorage('false'), createContext: () => context });
  sound.prepare();
  assert.equal(context.gains[0].gain.value, 0);
  sound.playCompletion();
  assert.equal(context.oscillators.length, 0);
});

test('blocked storage and missing audio support still allow the sound switch to work', () => {
  const sound = new SoundController({ storage: { getItem() { throw new Error(); }, setItem() { throw new Error(); } }, createContext: () => null });
  sound.setEnabled(false);
  assert.equal(sound.enabled, false);
  assert.doesNotThrow(() => { sound.prepare(); sound.playCompletion(); sound.dispose(); });
});
