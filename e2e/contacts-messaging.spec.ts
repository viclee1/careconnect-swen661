import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

test.describe('Contacts and messaging', () => {
  test('find a contact, open the conversation, send a message that survives a reload', async ({ page }) => {
    await signInAsPatient(page, '/app/contacts');
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Find a contact' }).fill('son');
    await expect(page.getByRole('status').filter({ hasText: 'contact' })).toHaveText(/1 contact matches "son"/);
    await page.getByRole('link', { name: /^James/ }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'James' })).toBeVisible();
    await expect(page).toHaveTitle('Conversation — CareConnect');

    const field = page.getByRole('textbox', { name: 'Message James' });
    await field.fill('Lunch on Sunday?');
    await page.getByTestId('composer-send').click();
    const sent = page.getByRole('list', { name: 'Messages with James' }).getByText('Lunch on Sunday?');
    await expect(sent).toBeVisible();
    await expect(field).toHaveValue('');

    await page.reload();
    await expect(page.getByText('Lunch on Sunday?')).toBeVisible();

    await page.getByRole('link', { name: 'Back to contacts' }).click();
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
    await expect(page.getByText(/You alerted Joyce that you want to talk/)).toBeVisible();
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
    await expect(page.getByRole('heading', { level: 1, name: 'Joyce' })).toBeVisible();

    await context.setOffline(true);
    await page.goto('/app/contacts');
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();
    await page.getByRole('link', { name: /^Joyce/ }).click();
    await expect(page.getByText('Good morning Margaret! How are you feeling today?')).toBeVisible();
    await expect(page.getByText('You are offline')).toBeVisible();
  });
});
