import { enableDesktopNotifications, notificationProblem } from '../notifications';

function install(permission: NotificationPermission, request: () => Promise<NotificationPermission>) {
  const shown: string[] = [];
  const Fake = jest.fn((title: string) => {
    shown.push(title);
  });
  Object.assign(Fake, { permission, requestPermission: jest.fn(request) });
  Object.defineProperty(window, 'Notification', { configurable: true, writable: true, value: Fake });
  return { shown, Fake: Fake as unknown as { requestPermission: jest.Mock } };
}

afterEach(() => {
  delete (window as { Notification?: unknown }).Notification;
});

describe('enableDesktopNotifications', () => {
  it('reports a browser without the Notification API', async () => {
    await expect(enableDesktopNotifications()).resolves.toBe('unsupported');
  });

  it('asks for permission and shows a first notification once granted', async () => {
    const { shown } = install('default', async () => 'granted');
    await expect(enableDesktopNotifications()).resolves.toBe('granted');
    expect(shown).toEqual(['CareConnect notifications are on']);
  });

  it('does not ask again when permission was already given', async () => {
    const { Fake } = install('granted', async () => 'denied');
    await expect(enableDesktopNotifications()).resolves.toBe('granted');
    expect(Fake.requestPermission).not.toHaveBeenCalled();
  });

  it('reports a refusal, or a request that throws, as denied', async () => {
    install('default', async () => 'denied');
    await expect(enableDesktopNotifications()).resolves.toBe('denied');
    install('default', async () => {
      throw new Error('blocked');
    });
    await expect(enableDesktopNotifications()).resolves.toBe('denied');
  });
});

describe('notificationProblem', () => {
  it('explains each failure in words and says nothing on success', () => {
    expect(notificationProblem('unsupported')).toMatch(/cannot show notifications/);
    expect(notificationProblem('denied')).toMatch(/blocked notifications/);
    expect(notificationProblem('granted')).toBeNull();
  });
});
