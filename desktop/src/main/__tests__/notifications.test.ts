/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Electron's `Notification` is replaced with a recorder, so what the main
 * process would hand the OS — and that it is always silent — can be asserted.
 */
const shown: Array<{ options: Record<string, unknown>; handlers: Record<string, () => void> }> = [];
const isSupported = jest.fn(() => true);

jest.mock(
  'electron',
  () => ({
    Notification: Object.assign(
      jest.fn().mockImplementation((options: Record<string, unknown>) => {
        const record = { options, handlers: {} as Record<string, () => void> };
        return {
          on: (event: string, handler: () => void) => {
            record.handlers[event] = handler;
          },
          show: () => shown.push(record),
        };
      }),
      { isSupported: () => isSupported() },
    ),
  }),
  { virtual: true },
);

const { appUserModelId, showNotification, toNotification } =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../notifications') as typeof import('../notifications');

describe('toNotification', () => {
  it('accepts a title and body, trimmed', () => {
    expect(toNotification({ title: '  Alert sent  ', body: ' No sound. ' })).toEqual({
      title: 'Alert sent',
      body: 'No sound.',
    });
  });

  it.each([
    ['null', null],
    ['a string', 'Alert'],
    ['a missing title', { body: 'x' }],
    ['a blank title', { title: '   ', body: 'x' }],
    ['a non-string body', { title: 'Alert', body: 42 }],
  ])('refuses %s', (_name, payload) => {
    expect(() => toNotification(payload)).toThrow();
  });

  it('cuts over-long text to what a toast can show', () => {
    const { title, body } = toNotification({ title: 'T'.repeat(500), body: 'B'.repeat(500) });
    expect(title).toHaveLength(64);
    expect(body).toHaveLength(256);
  });
});

describe('showNotification', () => {
  beforeEach(() => {
    shown.length = 0;
    isSupported.mockReturnValue(true);
  });

  it('shows a silent notification — nothing is communicated through sound', () => {
    expect(showNotification({ title: 'Alert sent to Joyce', body: 'No sound was played.' })).toBe(
      true,
    );
    expect(shown).toHaveLength(1);
    expect(shown[0].options).toEqual({
      title: 'Alert sent to Joyce',
      body: 'No sound was played.',
      silent: true,
    });
  });

  it('runs the click handler when the toast is clicked', () => {
    const onClick = jest.fn();
    showNotification({ title: 'Alert', body: '' }, onClick);

    shown[0].handlers.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reports false where the OS has no notification service', () => {
    isSupported.mockReturnValue(false);
    expect(showNotification({ title: 'Alert', body: '' })).toBe(false);
    expect(shown).toHaveLength(0);
  });

  it('refuses a malformed payload before reaching the OS', () => {
    expect(() => showNotification({ title: 7 })).toThrow();
    expect(shown).toHaveLength(0);
  });
});

it('uses the electron-builder appId as the Windows Application User Model ID', () => {
  const yml = readFileSync(join(__dirname, '../../../electron-builder.yml'), 'utf8');
  expect(yml).toMatch(new RegExp(`^appId: ${appUserModelId.replace(/\./g, '\\.')}$`, 'm'));
});
