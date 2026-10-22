import { MAX_TIMER_MINUTES, remainingAt } from './timer.js';

export const COOKING_STORAGE_KEY = 'foresttimer-cooking-v1';
export const MAX_COOKING_TIMERS = 6;
export const MAX_COOKING_DURATION = MAX_TIMER_MINUTES * 60000;
export const COOKING_PRESETS = [
  { id: 'ramen', name: '라면', minutes: 4, icon: 'noodles', note: '면을 넣고 시작' },
  { id: 'pasta', name: '파스타', minutes: 10, icon: 'pasta', note: '포장지의 시간을 확인' },
  { id: 'egg', name: '달걀 삶기', minutes: 10, icon: 'egg', note: '물이 끓으면 시작' },
  { id: 'tea', name: '차 우리기', minutes: 3, icon: 'tea', note: '찻잎에 물을 부은 뒤' },
  { id: 'steam', name: '찜 요리', minutes: 15, icon: 'pot', note: '김이 오르면 시작' },
  { id: 'simmer', name: '조림', minutes: 30, icon: 'pot', note: '약불로 줄인 뒤' },
];

export function cookingDuration(minutesInput, secondsInput) {
  const minutes = Number(minutesInput);
  const seconds = Number(secondsInput);
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0 || seconds > 59) return 0;
  const duration = minutes * 60000 + seconds * 1000;
  return duration >= 1000 && duration <= MAX_COOKING_DURATION ? duration : 0;
}

export function createCookingTimer(id, name, duration, icon = 'pot') {
  return { id, name: name.trim().slice(0, 32) || '나의 요리', duration, remaining: duration, icon,
    status: 'idle', deadline: 0, completions: 0, acknowledged: false };
}

export function initialCookingTimers() {
  return [createCookingTimer('cooking-default', '라면', 4 * 60000, 'noodles')];
}

export function cookingRemaining(timer, now) {
  return timer.status === 'running' ? remainingAt(timer.deadline, now) : timer.remaining;
}

function finish(timer) {
  return { ...timer, status: 'finished', remaining: 0, deadline: 0,
    completions: timer.completions + 1, acknowledged: false };
}

export function cookingReducer(timers, action) {
  if (action.type === 'restore') return action.timers;
  if (action.type === 'add') return timers.length < MAX_COOKING_TIMERS ? [...timers, action.timer] : timers;
  if (action.type === 'remove') return timers.filter(timer => timer.id !== action.id);
  if (action.type === 'tick') {
    let changed = false;
    const next = timers.map(timer => {
      if (timer.status !== 'running' || timer.deadline > action.now) return timer;
      changed = true;
      return finish(timer);
    });
    return changed ? next : timers;
  }
  return timers.map(timer => {
    if (timer.id !== action.id) return timer;
    switch (action.type) {
      case 'toggle': {
        if (timer.status === 'running') {
          const remaining = cookingRemaining(timer, action.now);
          return remaining ? { ...timer, remaining, deadline: 0, status: 'paused' } : finish(timer);
        }
        const remaining = timer.status === 'finished' ? timer.duration : timer.remaining;
        return { ...timer, status: 'running', remaining, deadline: action.now + remaining, acknowledged: false };
      }
      case 'reset': return { ...timer, status: 'idle', remaining: timer.duration, deadline: 0, acknowledged: true };
      case 'acknowledge': return { ...timer, acknowledged: true };
      case 'extend': {
        const remaining = cookingRemaining(timer, action.now);
        const extra = Math.min(60000, MAX_COOKING_DURATION - Math.max(timer.duration, remaining));
        if (extra <= 0) return timer;
        // A completed timer resumes for the extra minute; paused timers stay paused.
        return { ...timer, duration: timer.duration + extra, remaining: remaining + extra,
          deadline: timer.status === 'running' ? action.now + remaining + extra : timer.status === 'finished' ? action.now + extra : 0,
          status: timer.status === 'finished' ? 'running' : timer.status, acknowledged: false };
      }
      default: return timer;
    }
  });
}

export function loadCookingTimers(storage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage.getItem(COOKING_STORAGE_KEY));
    if (!Array.isArray(saved)) return initialCookingTimers();
    const ids = new Set();
    const timers = saved.filter(timer => {
      if (!timer || typeof timer.id !== 'string' || !timer.id || ids.has(timer.id) ||
        typeof timer.name !== 'string' || !timer.name.trim() ||
        !Number.isInteger(timer.duration) || timer.duration < 1000 || timer.duration > MAX_COOKING_DURATION ||
        !Number.isFinite(timer.remaining) || timer.remaining < 0 || timer.remaining > timer.duration ||
        !['idle', 'running', 'paused', 'finished'].includes(timer.status) ||
        (timer.status === 'running' && (!Number.isSafeInteger(timer.deadline) || timer.deadline <= 0 || timer.deadline > now + MAX_COOKING_DURATION)) ||
        (timer.status === 'paused' && timer.remaining <= 0)) return false;
      ids.add(timer.id);
      return true;
    }).slice(0, MAX_COOKING_TIMERS).map(timer => ({
      ...createCookingTimer(timer.id, timer.name, timer.duration, ['noodles', 'pasta', 'egg', 'tea', 'pot'].includes(timer.icon) ? timer.icon : 'pot'),
      status: timer.status, remaining: timer.status === 'idle' ? timer.duration : timer.status === 'finished' ? 0 : timer.remaining,
      deadline: timer.status === 'running' ? timer.deadline : 0,
      completions: Number.isSafeInteger(timer.completions) && timer.completions >= 0 ? timer.completions : 0,
      acknowledged: Boolean(timer.acknowledged),
    }));
    if (saved.length && !timers.length) return initialCookingTimers();
    return cookingReducer(timers, { type: 'tick', now });
  } catch { return initialCookingTimers(); }
}
