import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationService } from './notifications.js';

function setup(permission = 'default') {
  const calls = [];
  const notification = {
    permission,
    async requestPermission() {
      calls.push('permission');
      this.permission = 'granted';
      return this.permission;
    },
  };
  const registration = {
    active: { state: 'activated' },
    async showNotification(title, options) { calls.push({ title, options }); },
  };
  const serviceWorker = {
    async register(url) { calls.push(`register:${url}`); return registration; },
  };
  const service = createNotificationService({ notification, serviceWorker, secureContext: true });
  return { service, calls, notification, registration, serviceWorker };
}

test('requests permission from the enable action before registering a worker', async () => {
  const { service, calls } = setup();
  assert.equal(await service.enable(), 'granted');
  assert.deepEqual(calls, ['permission', 'register:./sw.js']);
  await service.enable();
  assert.equal(calls.length, 2);
});

test('does not register or display notifications when permission is dismissed or denied', async () => {
  for (const permission of ['default', 'denied']) {
    const { service, notification, calls } = setup();
    notification.requestPermission = async () => permission;
    assert.equal(await service.enable(), permission);
    assert.equal(await service.show('완료', {}), false);
    assert.deepEqual(calls, []);
  }
});

test('uses the worker to display a notification and respects revoked permission', async () => {
  const { service, notification, calls } = setup('granted');
  const options = { body: '집중 완료', tag: 'tempo-complete' };
  assert.equal(await service.show('tempo', options), true);
  assert.deepEqual(calls, ['register:./sw.js', { title: 'tempo', options }]);
  notification.permission = 'denied';
  assert.equal(await service.show('tempo', options), false);
  assert.equal(calls.length, 2);
});

test('recovers from a worker registration error on the next attempt', async () => {
  const { service, serviceWorker, registration } = setup('granted');
  let attempts = 0;
  serviceWorker.register = async () => {
    if (++attempts === 1) throw new Error('registration failed');
    return registration;
  };
  await assert.rejects(service.enable(), /registration failed/);
  assert.equal(await service.enable(), 'granted');
  assert.equal(attempts, 2);
});

test('waits for worker activation before allowing notifications', async () => {
  const { service, registration } = setup('granted');
  registration.active = null;
  let removed = false;
  registration.installing = {
    state: 'installing',
    addEventListener(event, listener) {
      queueMicrotask(() => { this.state = 'activated'; listener(); });
    },
    removeEventListener() { removed = true; },
  };
  assert.equal(await service.enable(), 'granted');
  assert.equal(removed, true);
});

test('reports insecure and unsupported environments without requesting permission', async () => {
  const { notification, serviceWorker, calls } = setup();
  const insecure = createNotificationService({ notification, serviceWorker, secureContext: false });
  assert.equal(insecure.availability, 'insecure');
  await assert.rejects(insecure.enable());
  const unsupported = createNotificationService({ notification: null, serviceWorker: null, secureContext: true });
  assert.equal(unsupported.availability, 'unsupported');
  assert.equal(await unsupported.show('tempo', {}), false);
  assert.deepEqual(calls, []);
});
