import { useCallback, useEffect, useState } from 'react';
import { SpiritTracker, TAMAGOTCHI_KEY } from './tamagotchi.js';

export function useTamagotchi() {
  const [tracker] = useState(() => {
    let storage;
    try { storage = window.localStorage; } catch { /* The pet still grows in memory. */ }
    return new SpiritTracker(storage);
  });
  const [profile, setProfile] = useState(tracker.profile);
  const [saved, setSaved] = useState(tracker.saved);
  const publish = useCallback(() => {
    setProfile(tracker.profile);
    setSaved(tracker.saved);
  }, [tracker]);
  const begin = useCallback((deadline, now) => { tracker.begin(deadline, now); publish(); }, [tracker, publish]);
  const tick = useCallback((now, force = false) => { tracker.tick(now, force); publish(); }, [tracker, publish]);
  const stop = useCallback((now) => { tracker.stop(now); publish(); }, [tracker, publish]);

  useEffect(() => {
    const flush = () => tick(Date.now(), true);
    const onStorage = (event) => {
      if (event.key !== TAMAGOTCHI_KEY) return;
      tracker.refresh();
      publish();
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    window.addEventListener('storage', onStorage);
    return () => {
      tracker.stop();
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('storage', onStorage);
    };
  }, [tracker, tick, publish]);

  return { profile, saved, begin, tick, stop };
}
