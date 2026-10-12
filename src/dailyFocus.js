export const DAILY_FOCUS_KEY = 'foresttimer-daily-focus';

export function localDay(now) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function localMidnight(now) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function nextLocalMidnight(now) {
  const date = new Date(localMidnight(now));
  date.setDate(date.getDate() + 1);
  return date.getTime();
}

export function readDailyFocus(storage) {
  try {
    const data = JSON.parse(storage?.getItem(DAILY_FOCUS_KEY) ?? 'null');
    if (data?.version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(data.day)
      || !Number.isSafeInteger(data.totalMilliseconds) || data.totalMilliseconds < 0
      || !Number.isSafeInteger(data.lastCreditedAt) || data.lastCreditedAt < 0) return null;
    return { version: 1, day: data.day, totalMilliseconds: data.totalMilliseconds, lastCreditedAt: data.lastCreditedAt };
  } catch { return null; }
}

// Keep today's record separate from the spirit's lifetime growth and resets.
export class DailyFocusTracker {
  constructor(storage, now = Date.now()) {
    this.storage = storage;
    this.record = readDailyFocus(storage) ?? { version: 1, day: localDay(now), totalMilliseconds: 0, lastCreditedAt: 0 };
    this.active = null;
    this.rollDay(now);
    this.save();
  }

  rollDay(now) {
    if (this.record.day === localDay(now)) return false;
    this.record = { ...this.record, day: localDay(now), totalMilliseconds: 0 };
    return true;
  }

  merge(now) {
    this.rollDay(now);
    const latest = readDailyFocus(this.storage);
    if (!latest) return;
    const totalMilliseconds = latest.day === this.record.day
      ? Math.max(this.record.totalMilliseconds, latest.totalMilliseconds) : this.record.totalMilliseconds;
    const lastCreditedAt = Math.max(this.record.lastCreditedAt, latest.lastCreditedAt);
    if (totalMilliseconds !== this.record.totalMilliseconds || lastCreditedAt !== this.record.lastCreditedAt) {
      this.record = { ...this.record, totalMilliseconds, lastCreditedAt };
    }
  }

  save() {
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(DAILY_FOCUS_KEY, JSON.stringify(this.record));
      this.saved = true;
    } catch { this.saved = false; }
  }

  begin(deadline, now = Date.now()) {
    this.stop(now);
    if (deadline > now) this.active = { deadline, accountedAt: now };
  }

  tick(now = Date.now(), force = false) {
    if (!force && this.active && now - this.active.accountedAt < 1000 && this.record.day === localDay(now)) return this.record;
    const previous = this.record;
    this.merge(now);
    if (this.active) {
      const end = Math.min(now, this.active.deadline);
      const start = Math.max(this.active.accountedAt, this.record.lastCreditedAt);
      // A suspended tab may wake up after midnight. Only credit the part of
      // its running interval that belongs to the current local calendar day.
      const elapsed = Math.max(0, end - Math.max(start, localMidnight(now)));
      this.active.accountedAt = Math.max(this.active.accountedAt, end);
      if (end > start) {
        this.record = {
          ...this.record,
          totalMilliseconds: Math.min(nextLocalMidnight(now) - localMidnight(now), this.record.totalMilliseconds + elapsed),
          lastCreditedAt: end,
        };
      }
    }
    if (this.record !== previous) this.save();
    return this.record;
  }

  stop(now = Date.now()) {
    this.tick(now, true);
    this.active = null;
    return this.record;
  }

  refresh(now = Date.now()) {
    return this.tick(now, true);
  }
}
