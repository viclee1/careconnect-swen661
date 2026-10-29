import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

// High contrast is how the app meets WCAG 1.4.6 Contrast (Enhanced, AAA), so
// with it on every screen is checked against AAA contrast as well as AA — and
// it must never add a failure of its own, such as dark text on a dark button.
const screens = [
  '/app',
  '/app/schedule',
  '/app/appointments',
  '/app/medications',
  '/app/memories',
  '/app/contacts',
  '/app/contacts/c1',
  '/app/settings',
];

test.describe('High contrast', () => {
  test('the header switch turns it on, and it is remembered on the sign-in screens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The header switch is shown from 1024px; phones reach it in the Menu drawer.');
    await signInAsPatient(page, '/app');
    const toggle = page.getByRole('button', { name: 'High contrast' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/high-contrast/);

    // The video call button keeps its white text on its dark fill.
    const call = page.getByRole('link', { name: /Video preview/ });
    await expect(call).toHaveCSS('color', 'rgb(255, 255, 255)');

    await page.evaluate(() => localStorage.removeItem('careconnect_session'));
    await page.goto('/signin');
    await expect(page.locator('html')).toHaveClass(/high-contrast/);
  });

  for (const path of screens) {
    test(`${path} passes AA and AAA contrast with high contrast on`, async ({ page }) => {
      await signInAsPatient(page, path);
      await page.evaluate(() => localStorage.setItem('careconnect_high_contrast', 'true'));
      await page.reload();
      await page.getByRole('heading', { level: 1 }).first().waitFor();
      await expect(page.locator('html')).toHaveClass(/high-contrast/);
      // Let the page fade-in and colour transitions finish: axe measures the
      // colours on screen, and halfway through a fade they are neither theme.
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    });
  }
});
