export const PRESETS_KEY = 'onlytimer-presets';
export const MAX_PRESETS = 4;
export const DEFAULT_MINUTES = 30;
export const DEFAULT_PRESET_SECONDS = DEFAULT_MINUTES * 60;

const MAX_PRESET_SECONDS = MAX_TIMER_MINUTES * 60;

function savedPresetSeconds(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value * 60 : NaN;
  return value?.seconds;
}

export function loadPresets(storage) {
  try {
    const saved = JSON.parse(storage.getItem(PRESETS_KEY));
    if (!Array.isArray(saved)) return [DEFAULT_PRESET_SECONDS];
    const values = saved.map(savedPresetSeconds).filter((value) => Number.isInteger(value) && value >= 1 && value <= MAX_PRESET_SECONDS);
    return [...new Set([DEFAULT_PRESET_SECONDS, ...values])].slice(0, MAX_PRESETS);
  } catch {
    return [DEFAULT_PRESET_SECONDS];
  }
}

export function addPreset(presets, minutesInput, secondsInput = '0') {
  const minutes = typeof minutesInput === 'string' && minutesInput.trim() === '' ? 0 : Number(minutesInput);
  const seconds = typeof secondsInput === 'string' && secondsInput.trim() === '' ? 0 : Number(secondsInput);
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || minutes > MAX_TIMER_MINUTES || seconds < 0 || seconds > 59) return { error: `0~${MAX_TIMER_MINUTES}분, 0~59초의 정수로 입력해 주세요.` };
  const totalSeconds = minutes * 60 + seconds;
  if (totalSeconds < 1 || totalSeconds > MAX_PRESET_SECONDS) return { error: `1초~${MAX_TIMER_MINUTES}분 사이로 입력해 주세요.` };
  if (presets.includes(totalSeconds)) return { error: '이미 저장된 시간이에요.' };
  if (presets.length >= MAX_PRESETS) return { error: `시간은 최대 ${MAX_PRESETS}개까지 저장할 수 있어요.` };
  return { presets: [...presets, totalSeconds], seconds: totalSeconds };
}

export function removePreset(presets, seconds) {
  if (seconds === DEFAULT_PRESET_SECONDS) return { error: '기본 30분은 삭제할 수 없어요.' };
  const nextPresets = presets.filter((value) => value !== seconds);
  if (nextPresets.length === presets.length) return { error: '저장된 시간을 찾을 수 없어요.' };
  return { presets: nextPresets, seconds };
}
import { MAX_TIMER_MINUTES } from './timer.js';
