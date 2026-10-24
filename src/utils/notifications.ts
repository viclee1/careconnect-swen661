/** What happened when the user asked for desktop notifications. */
export type NotificationOutcome = 'granted' | 'denied' | 'unsupported';

/**
 * Asks the browser for permission to show notifications, and shows one at
 * once when it is granted so the user sees what they have switched on.
 *
 * Never throws: an old browser without the Notification API, or one that
 * rejects the request, is reported as an outcome the Settings page can
 * explain in words.
 */
export async function enableDesktopNotifications(): Promise<NotificationOutcome> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';
    new Notification('CareConnect notifications are on', {
      body: 'Alerts will appear here even when CareConnect is in the background.',
    });
    return 'granted';
  } catch {
    return 'denied';
  }
}

/** The sentence shown under the switch when notifications could not be turned on. */
export function notificationProblem(outcome: NotificationOutcome): string | null {
  switch (outcome) {
    case 'unsupported':
      return 'This browser cannot show notifications. Screen flashes and vibration still work.';
    case 'denied':
      return 'Your browser blocked notifications. Allow them for this site in the browser’s settings, then turn this on again.';
    default:
      return null;
  }
}
