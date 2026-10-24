import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { signInAsPatient } from './helpers';

/** The contact's name heading: the page's h1 on a phone, the pane's h2 on a desktop. */
const contactHeading = (page: Page, name: string) => page.getByRole('heading', { name, exact: true });

/** Desktop runs (1440px) show the list beside the conversation. */
const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

test.describe('Contacts and messaging', () => {
  test('find a contact, open the conversation, send a message that survives a reload', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts');
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Find a contact' }).fill('son');
    await expect(page.getByRole('status').filter({ hasText: 'contact' })).toHaveText(/1 contact matches "son"/);
    await page.getByRole('link', { name: /^James/ }).click();

    await expect(contactHeading(page, 'James')).toBeVisible();
    await expect(page).toHaveTitle('Conversation — CareConnect');

    const field = page.getByRole('textbox', { name: 'Message James' });
    await field.fill('Lunch on Sunday?');
    await page.getByTestId('composer-send').click();
    const sent = page.getByRole('list', { name: 'Messages with James' }).getByText('Lunch on Sunday?');
    await expect(sent).toBeVisible();
    await expect(field).toHaveValue('');

    await page.reload();
    await expect(page.getByRole('list', { name: 'Messages with James' }).getByText('Lunch on Sunday?')).toBeVisible();

    // Desktop keeps the list on screen; a phone goes back to it.
    if (!isWide(page)) await page.getByRole('link', { name: 'Back to contacts' }).click();
    await expect(page.getByTestId('contact-c4')).toContainText('You: Lunch on Sunday?');
  });

  test('a voicemail arrives as a transcript and an empty message is refused with a reason', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts/c2');
    await expect(page.getByText('Transcript · Voicemail · 0:34')).toBeVisible();

    await page.getByTestId('composer-send').click();
    await expect(page.getByRole('alert')).toHaveText('Type a message before sending.');
    await expect(page.getByRole('textbox', { name: 'Message Sharma' })).toBeFocused();
  });

  test('alert someone silently: a worded flash and a written record', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts/c1');
    await page.getByRole('button', { name: /Alert Joyce you want to talk/ }).click();
    await expect(page.getByTestId('visual-flash')).toContainText('Alert sent to Joyce.');
    await expect(
      page.getByRole('list', { name: 'Messages with Joyce' }).getByText(/You alerted Joyce that you want to talk/),
    ).toBeVisible();
    await expect(page.getByText('Alert sent to Joyce', { exact: true })).toBeVisible();
  });

  test('ask for a captioned video call instead of a voice call', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts');
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Video call Joyce with live captions' }).click();
    await expect(contactHeading(page, 'Joyce')).toBeVisible();
    await expect(page.getByText('Captioned video call requested')).toBeVisible();
    await expect(page.getByText(/Nothing will ring/)).toBeVisible();
  });

  test('quick replies are a keyboard menu that fills the message field', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts/c1');
    const menuButton = page.getByRole('button', { name: 'Quick replies' });
    await menuButton.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'Quick replies' });
    await expect(menu.getByRole('menuitem').first()).toBeFocused();

    // Escape closes the menu and stays on the page, focus back on the button.
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(contactHeading(page, 'Joyce')).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    const field = page.getByRole('textbox', { name: 'Message Joyce' });
    await expect(field).toHaveValue('Please send me a message rather than calling.');
    await expect(field).toBeFocused();
  });

  test('a video message shows its captions over the video and in full below it', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts/c3');
    await expect(page.getByTestId('video-caption-m6')).toContainText('[CC] Hi Mum, the garden is finally done.');
    await expect(page.getByText('Captions available · Video message · 1:12')).toBeVisible();
    await page.getByRole('button', { name: 'Play video message from Maria' }).click();
    await expect(page.getByRole('button', { name: 'Pause video message from Maria' })).toBeVisible();
  });

  test('messages written offline are queued and sent when the connection returns', async ({ page, context }) => {
    await signInAsPatient(page, '/app/contacts/c3');
    await context.setOffline(true);
    await expect(page.getByText('You are offline')).toBeVisible();

    await page.getByRole('textbox', { name: 'Message Maria' }).fill('Sent from the garden');
    await page.getByTestId('composer-send').click();
    const list = page.getByRole('list', { name: 'Messages with Maria' });
    await expect(list.getByText('Sending')).toBeVisible();

    await context.setOffline(false);
    await expect(page.getByText('You are offline')).toBeHidden();
    await expect(list.getByText('Sending')).toBeHidden();
  });
});

test.describe('PWA offline', () => {
  test('Contacts and a conversation still open with no connection once the app has been visited', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Service-worker offline emulation is reliable in Chromium only');
    await signInAsPatient(page, '/app/contacts');
    // Wait for the service worker to take control, then visit the lazily
    // loaded conversation chunk once so it is cached.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.getByRole('link', { name: /^Joyce/ }).click();
    await expect(contactHeading(page, 'Joyce')).toBeVisible();

    await context.setOffline(true);
    await page.goto('/app/contacts');
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();
    await page.getByRole('link', { name: /^Joyce/ }).click();
    await expect(
      page.getByRole('list', { name: 'Messages with Joyce' }).getByText('Good morning Margaret! How are you feeling today?'),
    ).toBeVisible();
    await expect(page.getByText('You are offline')).toBeVisible();
  });
});
