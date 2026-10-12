import { useCallback, useEffect, useState } from 'react';
import { SpiritTracker, TAMAGOTCHI_KEY } from './tamagotchi.js';
import { DailyFocusTracker, DAILY_FOCUS_KEY, nextLocalMidnight } from './dailyFocus.js';

export function useTamagotchi() {
  const [tracker] = useState(() => {
    // A build renders a neutral first visit without reading or writing user data.
    if (typeof window === 'undefined') {
      return new SpiritTracker({ getItem: () => null, setItem() {} }, () => 0);
    }
    let storage;
    try { storage = window.localStorage; } catch { /* The pet still grows in memory. */ }
    return new SpiritTracker(storage);
  });
  const [profile, setProfile] = useState(tracker.profile);
  const [daily] = useState(() => new DailyFocusTracker(tracker.storage, typeof window === 'undefined' ? 0 : Date.now()));
  const [saved, setSaved] = useState(tracker.saved && daily.saved);
  const [todayMilliseconds, setTodayMilliseconds] = useState(daily.record.totalMilliseconds);
  const publish = useCallback(() => {
    setProfile(tracker.profile);
    setSaved(tracker.saved && daily.saved);
    setTodayMilliseconds(daily.record.totalMilliseconds);
  }, [tracker, daily]);
  const begin = useCallback((deadline, now = Date.now()) => { tracker.begin(deadline, now); daily.begin(deadline, now); publish(); }, [tracker, daily, publish]);
  const tick = useCallback((now = Date.now(), force = false) => { tracker.tick(now, force); daily.tick(now, force); publish(); }, [tracker, daily, publish]);
  const stop = useCallback((now = Date.now()) => { tracker.stop(now); daily.stop(now); publish(); }, [tracker, daily, publish]);
  const reset = useCallback((now = Date.now()) => { daily.tick(now, true); tracker.reset(now); publish(); }, [tracker, daily, publish]);

  useEffect(() => {
    const flush = () => tick(Date.now(), true);
    const onStorage = (event) => {
      if (event.key !== TAMAGOTCHI_KEY && event.key !== DAILY_FOCUS_KEY) return;
      if (event.key === TAMAGOTCHI_KEY) tracker.refresh();
      daily.refresh();
      publish();
    };
    let midnightTimeout;
    const scheduleMidnight = () => {
      const now = Date.now();
      midnightTimeout = setTimeout(() => {
        flush();
        scheduleMidnight();
      }, nextLocalMidnight(now) - now);
    };
    scheduleMidnight();
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    window.addEventListener('storage', onStorage);
    return () => {
      tracker.stop();
      daily.stop();
      clearTimeout(midnightTimeout);
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('storage', onStorage);
    };
  }, [tracker, daily, tick, publish]);

  return { profile, saved, todayMilliseconds, begin, tick, stop, reset };
}
