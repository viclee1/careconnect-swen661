import { expect, test } from '@playwright/test';

test.describe("Teammates' screens on this branch", () => {
  test('start from Welcome, continue to Contacts, and find who is building the other screens', async ({ page, isMobile }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
    await expect(page.getByText('Owner: Justin Zhang')).toBeVisible();
    await page.getByRole('button', { name: 'Continue to Contacts as Margaret Whitfield' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('link', { name: isMobile ? /^Medic/ : 'Medicines' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Medicines is not on this branch yet' })).toBeVisible();
    await expect(page.getByText('Owner: Upneet Bir')).toBeVisible();

    await page.getByRole('link', { name: 'Go to Contacts' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Contacts' })).toBeVisible();
  });
});
