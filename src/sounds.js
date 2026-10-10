import { createRainLoop } from './rainLoop.js';

export const SOUND_PREFERENCE_KEY = 'foresttimer-sound-enabled';

function browserStorage() {
  try { return globalThis.localStorage; } catch { return undefined; }
}

export function readSoundPreference(storage = browserStorage()) {
  try { return storage?.getItem(SOUND_PREFERENCE_KEY) !== 'false'; }
  catch { return true; }
}

// One master gain controls scheduled completion tones as well as future ones.
// The controller stays stable across React renders and timer callbacks.
export class SoundController {
  constructor({ storage = browserStorage(), fetchAudio = url => fetch(url), createContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return AudioContext ? new AudioContext() : null;
  } } = {}) {
    this.storage = storage;
    this.createContext = createContext;
    this.fetchAudio = fetchAudio;
    this.enabled = readSoundPreference(storage);
    this.context = null;
    this.masterGain = null;
    this.rainNode = null;
    this.rainGain = null;
    this.rainBuffer = null;
    this.rainUrl = null;
    this.rainRequested = false;
    this.rainGeneration = 0;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.enabled ? 1 : 0, this.context.currentTime);
    }
    try { this.storage?.setItem(SOUND_PREFERENCE_KEY, String(this.enabled)); }
    catch { /* Keep the current setting when storage is blocked. */ }
  }

  prepare() {
    try {
      if (!this.context) {
        this.context = this.createContext();
        if (!this.context) return Promise.resolve(false);
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.enabled ? 1 : 0;
        this.masterGain.connect(this.context.destination);
      }
      return this.context.resume().then(() => this.context.state === 'running').catch(() => false);
    } catch { return Promise.resolve(false); }
  }

  async startRain(url) {
    if (this.rainRequested) return true;
    this.rainRequested = true;
    const generation = ++this.rainGeneration;
    try {
      // Resume synchronously from the click before waiting for a download.
      const ready = this.prepare();
      if (!this.context) throw new Error('Audio unavailable');
      if (!this.rainBuffer || this.rainUrl !== url) {
        this.rainUrl = url;
        const pending = this.fetchAudio(url).then(async response => {
          if (!response.ok) throw new Error('Rain download failed');
          const recording = await this.context.decodeAudioData(await response.arrayBuffer());
          return createRainLoop(this.context, recording);
        });
        this.rainBuffer = pending;
        pending.catch(() => {
          if (this.rainBuffer === pending) this.rainBuffer = null;
        });
      }
      const [buffer, resumed] = await Promise.all([this.rainBuffer, ready]);
      if (generation !== this.rainGeneration) return false;
      if (!resumed) throw new Error('Audio could not resume');
      const node = this.context.createBufferSource();
      const gain = this.context.createGain();
      node.buffer = buffer;
      node.loop = true;
      node.connect(gain);
      gain.connect(this.masterGain);
      gain.gain.setValueAtTime(0, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(.5, this.context.currentTime + .08);
      this.rainNode = node;
      this.rainGain = gain;
      node.start();
      return true;
    } catch (error) {
      if (generation === this.rainGeneration) this.stopRain();
      throw error;
    }
  }

  stopRain() {
    this.rainRequested = false;
    this.rainGeneration += 1;
    if (this.rainNode) {
      this.rainNode.stop();
      this.rainNode.disconnect();
      this.rainGain.disconnect();
      this.rainNode = null;
      this.rainGain = null;
    }
  }

  playCompletion() {
    const context = this.context;
    if (!this.enabled || !context || !this.masterGain || context.state !== 'running') return;
    try {
      [0, .25, .5].forEach(delay => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        oscillator.frequency.value = 740;
        const start = context.currentTime + delay;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.12, start + .02);
        gain.gain.exponentialRampToValueAtTime(.001, start + .2);
        oscillator.start(start);
        oscillator.stop(start + .22);
      });
    } catch { /* The visual completion remains available. */ }
  }

  dispose() {
    this.stopRain();
    this.rainBuffer = null;
    this.context?.close().catch(() => {});
  }
}
