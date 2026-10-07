import { useEffect, useRef, useState } from 'react';
import { readReturnHistory, RETURN_HISTORY_KEY, ReturnTracker, subscribeToReturns } from './returnTracking.js';

export function useReturnHistory() {
  const [history, setHistory] = useState(() => {
    try { return readReturnHistory(window.localStorage); } catch { return null; }
  });
  const tracker = useRef(new ReturnTracker());
  const startedAt = useRef(history?.startedAt);

  useEffect(() => subscribeToReturns({
    documentTarget: document,
    windowTarget: window,
    tracker: tracker.current,
    onReturn: (entry) => setHistory((previous) => previous ? { ...previous, returns: [...previous.returns, entry] } : previous),
  }), []);

  useEffect(() => {
    if (!history) return;
    try { window.localStorage.setItem(RETURN_HISTORY_KEY, JSON.stringify(history)); } catch { /* Recording in memory still works when storage is unavailable. */ }
  }, [history]);

  function begin(deadline, newSession) {
    if (newSession) {
      startedAt.current = Date.now();
      setHistory({ startedAt: startedAt.current, returns: [] });
    }
    tracker.current.start({ startedAt: startedAt.current, deadline });
  }

  return { history, begin, stop: () => tracker.current.stop() };
}
