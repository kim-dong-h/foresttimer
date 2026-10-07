export const MAX_TIMER_MINUTES = 360;

export function remainingAt(deadline, now) {
  return Math.max(0, deadline - now);
}

export function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function durationFromInputs(minutes, seconds) {
  const clamp = (value, max) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));
  return Math.min(MAX_TIMER_MINUTES * 60, clamp(minutes, MAX_TIMER_MINUTES) * 60 + clamp(seconds, 59)) * 1000;
}
