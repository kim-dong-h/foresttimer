import { useEffect, useRef, useState } from 'react';
import { createNotificationService } from './notifications.js';
import { publicAssetPath, t } from './i18n.js';

const preferenceKey = 'tempo-completion-notifications';

function readPreference() {
  try { return localStorage.getItem(preferenceKey) === 'true'; }
  catch { return false; }
}

function savePreference(enabled) {
  try { localStorage.setItem(preferenceKey, String(enabled)); }
  catch { /* Notifications still work when storage is unavailable. */ }
}

export function useNotifications(language) {
  const [service] = useState(() => createNotificationService({
    workerUrl: new URL(publicAssetPath('sw.js'), document.baseURI).href,
    errorMessages: {
      prepare: t(language, 'notificationPrepareFailure'),
      timeout: t(language, 'notificationPrepareTimeout'),
      unavailable: t(language, 'notificationUnavailable'),
    },
  }));
  const [permission, setPermission] = useState(service.permission);
  const [enabled, setEnabled] = useState(() => service.availability === 'supported' && readPreference() && service.permission() === 'granted');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const enabledRef = useRef(enabled);

  function updateEnabled(next) {
    enabledRef.current = next;
    setEnabled(next);
    savePreference(next);
  }

  useEffect(() => {
    const updatePermission = () => {
      const next = service.permission();
      setPermission(next);
      if (next !== 'granted') {
        enabledRef.current = false;
        setEnabled(false);
        savePreference(false);
      }
    };
    window.addEventListener('focus', updatePermission);
    document.addEventListener('visibilitychange', updatePermission);
    return () => {
      window.removeEventListener('focus', updatePermission);
      document.removeEventListener('visibilitychange', updatePermission);
    };
  }, [service]);

  async function toggle() {
    setMessage('');
    if (enabledRef.current) {
      updateEnabled(false);
      return;
    }
    setBusy(true);
    try {
      const next = await service.enable();
      setPermission(next);
      updateEnabled(next === 'granted');
      if (next === 'default') setMessage(t(language, 'permissionRequired'));
    } catch (error) {
      updateEnabled(false);
      setMessage(error.message || t(language, 'notificationFailure'));
    } finally { setBusy(false); }
  }

  async function notify(title, body, tag) {
    if (!enabledRef.current) return;
    try {
      const shown = await service.show(title, {
        body,
        icon: new URL(publicAssetPath('notification-icon.svg'), document.baseURI).href,
        tag,
        data: { url: window.location.href },
      });
      if (!shown) {
        setPermission(service.permission());
        updateEnabled(false);
      }
      return shown;
    } catch {
      setMessage(t(language, 'notificationSendFailure'));
      return false;
    }
  }

  async function test() {
    setBusy(true);
    setMessage('');
    try {
      const shown = await notify(t(language, 'notificationTestTitle'), t(language, 'notificationTestBody'), 'tempo-test');
      if (shown) setMessage(t(language, 'notificationTestSent'));
    } finally { setBusy(false); }
  }

  const help = service.availability === 'unsupported'
    ? t(language, 'notificationUnsupported')
    : service.availability === 'insecure'
      ? t(language, 'notificationInsecure')
      : permission === 'denied'
        ? t(language, 'notificationDenied')
        : t(language, 'notificationHelp');

  return {
    enabled, busy, help, message, toggle, test,
    available: service.availability === 'supported',
    notifyCompletion: () => notify(t(language, 'completionTitle'), t(language, 'completionBody'), 'tempo-complete'),
  };
}
