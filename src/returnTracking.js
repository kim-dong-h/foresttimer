export const RETURN_HISTORY_KEY = 'onlytimer-return-history';

export class ReturnTracker {
  start({ startedAt, deadline }) {
    this.startedAt = startedAt;
    this.deadline = deadline;
    this.active = true;
    this.away = false;
  }

  stop() {
    this.active = false;
    this.away = false;
  }

  observe(present, now) {
    if (!this.active) return null;
    if (!present) {
      this.away = true;
      return null;
    }
    if (!this.away) return null;
    this.away = false;
    // Background timer ticks may be delayed, so check the actual deadline.
    if (now >= this.deadline) return null;
    return { returnedAt: now, elapsedMs: Math.max(0, now - this.startedAt) };
  }
}

export function subscribeToReturns({ documentTarget, windowTarget, tracker, onReturn, now = Date.now }) {
  const observe = (present) => {
    const entry = tracker.observe(present, now());
    if (entry) onReturn(entry);
  };
  const onVisibility = () => observe(!documentTarget.hidden);
  const onFocus = () => { if (!documentTarget.hidden) observe(true); };
  const onAway = () => observe(false);
  const onPageShow = () => { if (!documentTarget.hidden) observe(true); };
  documentTarget.addEventListener('visibilitychange', onVisibility);
  windowTarget.addEventListener('focus', onFocus);
  windowTarget.addEventListener('blur', onAway);
  windowTarget.addEventListener('pageshow', onPageShow);
  windowTarget.addEventListener('pagehide', onAway);
  return () => {
    documentTarget.removeEventListener('visibilitychange', onVisibility);
    windowTarget.removeEventListener('focus', onFocus);
    windowTarget.removeEventListener('blur', onAway);
    windowTarget.removeEventListener('pageshow', onPageShow);
    windowTarget.removeEventListener('pagehide', onAway);
  };
}

export function longestFocusInterval(history, endedAt) {
  if (!history || !Number.isFinite(endedAt) || endedAt <= history.startedAt) return null;
  const points = [history.startedAt];
  const returns = history.returns
    .map((entry) => entry.returnedAt)
    .filter((returnedAt) => Number.isFinite(returnedAt) && returnedAt > history.startedAt && returnedAt < endedAt)
    .sort((a, b) => a - b);
  for (const returnedAt of returns) {
    if (returnedAt > points[points.length - 1]) points.push(returnedAt);
  }
  points.push(endedAt);
  let longest = { startedAt: points[0], endedAt: points[1], durationMs: points[1] - points[0] };
  for (let index = 1; index < points.length - 1; index += 1) {
    const interval = { startedAt: points[index], endedAt: points[index + 1], durationMs: points[index + 1] - points[index] };
    if (interval.durationMs > longest.durationMs) longest = interval;
  }
  return longest;
}

export function readReturnHistory(storage) {
  try {
    const value = JSON.parse(storage.getItem(RETURN_HISTORY_KEY));
    const validDate = (timestamp) => Number.isFinite(timestamp) && timestamp > 0 && timestamp <= 8640000000000000;
    if (!value || !validDate(value.startedAt) || !Array.isArray(value.returns)) return null;
    if (!value.returns.every((entry) => entry && validDate(entry.returnedAt) && entry.returnedAt >= value.startedAt && Number.isFinite(entry.elapsedMs) && entry.elapsedMs >= 0)) return null;
    return { startedAt: value.startedAt, returns: value.returns };
  } catch {
    return null;
  }
}
