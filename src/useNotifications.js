import { useEffect, useRef, useState } from 'react';
import { createNotificationService } from './notifications.js';

const preferenceKey = 'tempo-completion-notifications';

function readPreference() {
  try { return localStorage.getItem(preferenceKey) === 'true'; }
  catch { return false; }
}

function savePreference(enabled) {
  try { localStorage.setItem(preferenceKey, String(enabled)); }
  catch { /* Notifications still work when storage is unavailable. */ }
}

export function useNotifications() {
  const [service] = useState(() => createNotificationService({ workerUrl: new URL('sw.js', document.baseURI).href }));
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
      if (next === 'default') setMessage('알림 권한을 허용하면 완료 알림을 받을 수 있어요.');
    } catch (error) {
      updateEnabled(false);
      setMessage(error.message || '알림을 켜지 못했어요. 다시 시도해 주세요.');
    } finally { setBusy(false); }
  }

  async function notify(title, body, tag) {
    if (!enabledRef.current) return;
    try {
      const shown = await service.show(title, {
        body,
        icon: new URL('notification-icon.svg', document.baseURI).href,
        tag,
        data: { url: window.location.href },
      });
      if (!shown) {
        setPermission(service.permission());
        updateEnabled(false);
      }
      return shown;
    } catch {
      setMessage('알림을 보내지 못했어요. 브라우저와 기기의 알림 설정을 확인해 주세요.');
      return false;
    }
  }

  async function test() {
    setBusy(true);
    setMessage('');
    try {
      const shown = await notify('forestTimer · 알림이 준비됐어요', '타이머가 끝나면 이렇게 알려드릴게요.', 'tempo-test');
      if (shown) setMessage('테스트 알림을 보냈어요. 기기 알림을 확인해 주세요.');
    } finally { setBusy(false); }
  }

  const help = service.availability === 'unsupported'
    ? '이 브라우저는 완료 알림을 지원하지 않아요. Chrome 또는 Edge에서 열어 주세요.'
    : service.availability === 'insecure'
      ? '완료 알림은 HTTPS 주소 또는 localhost에서 사용할 수 있어요.'
      : permission === 'denied'
        ? '알림이 차단되어 있어요. 브라우저 사이트 설정에서 알림을 허용해 주세요.'
        : '다른 탭에 있어도 알려드려요. 타이머 탭은 열어 두세요.';

  return {
    enabled, busy, help, message, toggle, test,
    available: service.availability === 'supported',
    notifyCompletion: () => notify('forestTimer · 집중 완료!', '잘했어요! 설정한 시간이 끝났어요. 잠시 쉬어가세요.', 'tempo-complete'),
  };
}
