export function createNotificationService({
  notification = globalThis.Notification,
  serviceWorker = globalThis.navigator?.serviceWorker,
  secureContext = globalThis.isSecureContext,
  workerUrl = './sw.js',
  errorMessages = {
    prepare: '알림 준비에 실패했어요. 다시 시도해 주세요.',
    timeout: '알림 준비 시간이 초과됐어요. 다시 시도해 주세요.',
    unavailable: '이 환경에서는 완료 알림을 사용할 수 없어요.',
  },
} = {}) {
  let registrationPromise;

  const availability = !secureContext
    ? 'insecure'
    : !notification || !serviceWorker ? 'unsupported' : 'supported';

  async function getRegistration() {
    if (!registrationPromise) {
      registrationPromise = (async () => {
        const registration = await serviceWorker.register(workerUrl);
        if (!registration.active) {
          await new Promise((resolve, reject) => {
            const worker = registration.installing || registration.waiting;
            if (!worker) {
              reject(new Error(errorMessages.prepare));
              return;
            }
            const timeout = setTimeout(() => finish(new Error(errorMessages.timeout)), 10000);
            function finish(error) {
              clearTimeout(timeout);
              worker.removeEventListener('statechange', onStateChange);
              error ? reject(error) : resolve();
            }
            function onStateChange() {
              if (worker.state === 'activated') finish();
              if (worker.state === 'redundant') finish(new Error(errorMessages.prepare));
            }
            worker.addEventListener('statechange', onStateChange);
            onStateChange();
          });
        }
        return registration;
      })().catch((error) => {
        registrationPromise = undefined;
        throw error;
      });
    }
    return registrationPromise;
  }

  return {
    availability,
    permission: () => notification?.permission ?? 'default',
    async enable() {
      if (availability !== 'supported') throw new Error(errorMessages.unavailable);
      // Request directly from the button gesture, before service worker awaits.
      const permission = notification.permission === 'granted'
        ? 'granted' : await notification.requestPermission();
      if (permission === 'granted') await getRegistration();
      return permission;
    },
    async show(title, options) {
      if (availability !== 'supported' || notification.permission !== 'granted') return false;
      const registration = await getRegistration();
      await registration.showNotification(title, options);
      return true;
    },
  };
}
