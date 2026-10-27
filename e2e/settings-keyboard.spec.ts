import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

test.describe('Accessibility settings', () => {
  test('operated with the keyboard alone, and remembered after a reload', async ({ page, browserName }) => {
    await signInAsPatient(page, '/app/settings');
    await expect(page.getByRole('heading', { level: 1, name: 'Accessibility Settings' })).toBeVisible();

    // Space toggles a switch.
    const captions = page.getByRole('switch', { name: 'Show captions' });
    await captions.focus();
    await page.keyboard.press('Space');
    await expect(captions).not.toBeChecked();
    await expect(page.getByText('Check your captions')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(captions).toBeChecked();

    // Tab from the switch reaches the caption-size group; arrows move inside it.
    // WebKit on macOS skips form controls on Tab unless the user has turned on
    // "Full Keyboard Access", so there the group is focused directly.
    if (browserName === 'webkit') await page.getByRole('radio', { name: 'Medium' }).focus();
    else await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Large' })).toBeChecked();

    // Arrow keys move a slider; the value is printed in words.
    const volume = page.getByRole('slider', { name: 'Alert volume' });
    await volume.focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(volume).toHaveAttribute('aria-valuetext', 'Alert volume 50 per cent');

    // :focus-visible after a programmatic focus differs in WebKit, so the
    // visible ring is checked in the other engines.
    if (browserName !== 'webkit') {
      const outline = await captions.evaluate((el) => {
        (el as HTMLElement).focus();
        return getComputedStyle(el.nextElementSibling as Element).outlineStyle;
      });
      expect(outline).not.toBe('none');
    }

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Large' })).toBeChecked();
    await expect(page.getByRole('slider', { name: 'Alert volume' })).toHaveAttribute('aria-valuetext', 'Alert volume 50 per cent');
  });

  test('sign out asks for confirmation in a dialog that Escape closes and returns focus', async ({ page }) => {
    await signInAsPatient(page, '/app/settings');
    const signOut = page.getByRole('main').getByRole('button', { name: 'Sign out', exact: true });
    await signOut.click();
    const dialog = page.getByRole('dialog', { name: 'Sign out of CareConnect?' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(signOut).toBeFocused();

    await signOut.click();
    await dialog.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('captions switched off warn inside a conversation with a video message', async ({ page }) => {
    await signInAsPatient(page, '/app/settings');
    await page.getByRole('switch', { name: 'Show captions' }).click();
    await page.goto('/app/contacts/c3');
    await expect(page.getByText('Captions are turned off')).toBeVisible();
    await page.getByRole('link', { name: 'Open settings' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Accessibility Settings' })).toBeVisible();
  });
});

test.describe('Screen flash cues', () => {
  test('each alert type previews its own flash, named in words', async ({ page }) => {
    await signInAsPatient(page, '/app/settings');
    await page.getByRole('button', { name: /Appointment Teal flash/ }).click();
    const flash = page.getByTestId('visual-flash');
    await expect(flash).toContainText('Appointment alert');
    await expect(flash).toHaveAttribute('data-tone', 'calm');
    await expect(flash).toBeHidden({ timeout: 4000 });

    await page.getByRole('switch', { name: 'Screen flash alerts' }).click();
    await expect(page.getByRole('button', { name: /Appointment Teal flash/ })).toBeDisabled();
  });
});

test.describe('Responsive navigation', () => {
  test('Settings is reachable at every width', async ({ page, isMobile }) => {
    await signInAsPatient(page, '/app');
    if (isMobile) {
      // Phones: the Menu button opens the navigation drawer, Settings at its foot.
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Settings' }).click();
    } else {
      await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Settings' }).click();
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Accessibility Settings' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
