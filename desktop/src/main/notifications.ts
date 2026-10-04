import { Notification } from 'electron';

import type { DesktopNotification } from '../shared/ipc';

/**
 * Native operating-system notifications.
 *
 * On Windows these are Action Center toasts, which stay in the notification
 * history after they fade — a written record of the alert the user can return
 * to, which a hearing-impaired user needs more than a chime. Every toast is
 * `silent`: the governing rule is that nothing is communicated through sound
 * alone, and a notification sound adds nothing for the user this app is for.
 *
 * Windows only shows toasts from an app with an Application User Model ID that
 * matches its Start Menu shortcut. `main.ts` sets it to the `appId` in
 * `electron-builder.yml`, which is also what the NSIS installer stamps on the
 * shortcut it creates.
 */

/** Matches `appId` in `electron-builder.yml`. */
export const appUserModelId = 'com.acuityhealth.careconnect';

const maxTitleLength = 64;
const maxBodyLength = 256;

/**
 * Checks what came over IPC.
 *
 * The payload is untrusted — it crossed the process boundary — so anything
 * that is not two non-empty strings is refused, and over-long text is cut to
 * what a toast can actually show rather than passed on to the OS.
 */
export function toNotification(payload: unknown): DesktopNotification {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Notification must be an object');
  }
  const { title, body } = payload as Record<string, unknown>;
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('Notification title must be a non-empty string');
  }
  if (typeof body !== 'string') {
    throw new Error('Notification body must be a string');
  }
  return {
    title: title.trim().slice(0, maxTitleLength),
    body: body.trim().slice(0, maxBodyLength),
  };
}

/**
 * Shows one notification. Returns `false` where the platform has no
 * notification service (some Linux desktops), so the caller can say so rather
 * than assume it was seen.
 */
export function showNotification(payload: unknown, onClick?: () => void): boolean {
  const { title, body } = toNotification(payload);
  if (!Notification.isSupported()) return false;
  const notification = new Notification({ title, body, silent: true });
  if (onClick) notification.on('click', onClick);
  notification.show();
  return true;
}
