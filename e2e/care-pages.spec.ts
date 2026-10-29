import { readFile } from 'node:fs/promises';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

/**
 * Appointments, Medicines and Memories: the critical flows, run against the
 * production build in every browser project (desktop at 1440px and mobile
 * Safari at 375px).
 */

test.describe('Medicines', () => {
  test('tick medicines from the keyboard; the count is announced and survives a reload', async ({ page, browserName }) => {
    await signInAsPatient(page, '/app/medicines');
    const status = page.getByRole('status').filter({ hasText: 'taken' });
    await expect(status).toContainText('1 of 4 taken. 3 medicines still to take today.');
    await expect(status).toContainText('3 still to take today');

    const lisinopril = page.getByRole('checkbox', { name: 'Lisinopril taken' });

    // Safari skips checkboxes on Tab unless Full Keyboard Access is on (a
    // macOS setting), so WebKit focuses the box directly; Space is the same.
    // Elsewhere Tab goes from a tick to the next row, then to its tick.
    if (browserName === 'webkit') {
      await lisinopril.focus();
    } else {
      await page.getByRole('checkbox', { name: 'Amlodipine taken' }).focus();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /^Lisinopril/ })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(lisinopril).toBeFocused();
    }
    await page.keyboard.press('Space');
    await expect(lisinopril).toBeChecked();
    await expect(status).toContainText('2 of 4 taken. 2 medicines still to take today.');

    // Choosing a row shows it in the detail panel, whose big button marks it.
    await page.getByRole('button', { name: /^Metformin/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Metformin' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark Metformin as taken' }).click();
    await page.getByRole('checkbox', { name: 'Atorvastatin taken' }).check();
    await expect(status).toContainText('All 4 medicines taken today. Well done!');

    await page.reload();
    await expect(lisinopril).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Metformin taken' })).toBeChecked();
  });
});

test.describe('Appointments', () => {
  test('add a visit to My Day, then export every visit to a calendar file with silent reminders', async ({ page }) => {
    await signInAsPatient(page, '/app/appointments');
    await expect(page.getByRole('heading', { level: 2, name: /Today/ })).toBeVisible();

    await page.getByRole('button', { name: /^Blood test — fasting needed/ }).click();
    const bloodTest = page.getByRole('checkbox', { name: /Blood test — fasting needed/ });
    await expect(bloodTest).not.toBeChecked();
    await bloodTest.check();
    await expect(page.getByRole('checkbox', { name: 'In My Day: Blood test — fasting needed' })).toBeChecked();
    await page.reload();
    await page.getByRole('button', { name: /^Blood test — fasting needed/ }).click();
    await expect(page.getByRole('checkbox', { name: 'In My Day: Blood test — fasting needed' })).toBeChecked();

    await page.getByRole('button', { name: /^Blood pressure check — Dr. Sharma/ }).click();
    const directions = page
      .getByRole('article', { name: 'Blood pressure check — Dr. Sharma' })
      .getByRole('link', { name: /Get directions to Greenfield Surgery/ });
    await expect(directions).toHaveAttribute('target', '_blank');

    const exportButton = page.getByRole('button', { name: 'Export to calendar' });
    const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
    expect(download.suggestedFilename()).toBe('careconnect-appointments.ics');
    const ics = await readFile((await download.path()) as string, 'utf8');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(8);
    expect(ics).toContain('ACTION:DISPLAY');
    expect(ics).not.toContain('ACTION:AUDIO');

    const banner = page.getByRole('status').filter({ hasText: 'appointments saved' });
    await expect(banner).toContainText('8 appointments saved');
    await banner.getByRole('button', { name: 'Dismiss this message' }).click();
    await expect(banner).toBeHidden();
    await expect(exportButton).toBeFocused();
  });
});

test.describe('Memories', () => {
  test('add a memory: errors explained, saved, focused, pinned, kept after reload, then removed', async ({ page }) => {
    await signInAsPatient(page, '/app/memories');
    const addButton = page.getByRole('button', { name: 'Add a memory' });
    await addButton.click();
    const title = page.getByRole('textbox', { name: /Name of the memory/ });
    await expect(title).toBeFocused();

    // Save with nothing filled in, from the bottom of the form, so focus has
    // to scroll back up to the first field.
    await page.getByRole('button', { name: 'Save memory' }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Save memory' }).click();
    await expect(title).toBeFocused();
    await expect(title).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Choose what kind of memory this is.')).toBeVisible();
    // ...and lands below the sticky header, not under it (WCAG 2.4.11).
    const headerBottom = await page.getByRole('banner').evaluate((h) => h.getBoundingClientRect().bottom);
    expect(await title.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations,
    ).toEqual([]);

    await title.fill('Our wedding day');
    await page.getByRole('combobox', { name: /Kind of memory/ }).selectOption('event');
    await page.getByRole('textbox', { name: /^The memory/ }).fill('We married at St Mary’s in the rain.');
    await page.getByRole('button', { name: 'Save memory' }).click();

    const heading = page.getByRole('heading', { level: 3, name: 'Our wedding day' });
    await expect(heading).toBeFocused();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toHaveText(
      'Saved “Our wedding day” to your memories.',
    );

    // Pinning moves the card into Pinned; focus follows its button.
    await page.getByRole('button', { name: 'Pin to top: Our wedding day' }).click();
    await expect(page.getByRole('button', { name: 'Unpin: Our wedding day' })).toBeFocused();
    await expect(page.getByRole('region', { name: 'Pinned' }).getByRole('heading', { name: 'Our wedding day' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('region', { name: 'Pinned' }).getByRole('heading', { name: 'Our wedding day' })).toBeVisible();

    await page.getByRole('button', { name: 'Remove: Our wedding day' }).click();
    const dialog = page.getByRole('dialog', { name: 'Remove “Our wedding day”?' });
    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Remove: Our wedding day' }).click();
    await page.getByRole('button', { name: 'Remove memory' }).click();
    await expect(heading).toBeHidden();
    await expect(addButton).toBeFocused();
  });

  test('filter memories with the arrow keys, and Escape closes the form without losing the draft', async ({ page, browserName }) => {
    await signInAsPatient(page, '/app/memories');
    const all = page.getByRole('radio', { name: 'All' });
    await expect(all).toBeChecked();
    await all.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Family' })).toBeChecked();
    await expect(page.getByRole('article')).toHaveCount(1);

    // Arrows wrap: back past All lands on the last choice, Pets. WebKit's
    // radio arrow handling needs Full Keyboard Access, so it focuses Pets and
    // presses Space instead — still the keyboard. (Not a click on the label
    // text: on CI, WebKit occasionally hit-tests the release onto the gap
    // between the pills, and the click selects nothing.)
    if (browserName === 'webkit') {
      await page.getByRole('radio', { name: 'Pets' }).focus();
      await page.keyboard.press('Space');
    } else {
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
    }
    await expect(page.getByRole('radio', { name: 'Pets' })).toBeChecked();
    await expect(page.getByRole('heading', { level: 3, name: 'Buddy — Your Cat' })).toBeVisible();

    const addButton = page.getByRole('button', { name: 'Add a memory' });
    await addButton.click();
    await page.getByRole('textbox', { name: /Name of the memory/ }).fill('Half-typed');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('form', { name: 'Add a memory' })).toBeHidden();
    await expect(addButton).toBeFocused();
    await expect(addButton).toHaveAttribute('aria-expanded', 'false');
    await addButton.click();
    await expect(page.getByRole('textbox', { name: /Name of the memory/ })).toHaveValue('Half-typed');
  });

  test('the memory book, photos included, opens with no connection', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Service-worker offline emulation is reliable in Chromium only');
    await signInAsPatient(page, '/app/memories');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    // Scroll through once so every lazily loaded photo is fetched and cached.
    for (const img of await page.getByRole('img').all()) await img.scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);
    await page.goto('/app/memories');
    await expect(page.getByRole('heading', { level: 1, name: 'Memories' })).toBeVisible();
    const photo = page.getByRole('img', { name: 'A smiling family of four at a table set for tea' });
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });
});

test.describe('My screens at every width', () => {
  for (const path of ['/app/appointments', '/app/medicines', '/app/memories']) {
    test(`${path} never scrolls sideways, keeps controls at least 44px and passes axe`, async ({ page }) => {
      await signInAsPatient(page, path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      const small = await page.locator('main').evaluate((main) =>
        [...main.querySelectorAll<HTMLElement>('button, a[href], label:has(input)')]
          .filter((el) => el.offsetParent !== null)
          .map((el) => ({ text: el.textContent?.trim(), ...el.getBoundingClientRect().toJSON() }))
          .filter((box) => box.height < 44)
          .map((box) => `${box.text} (${Math.round(box.height)}px)`),
      );
      expect(small).toEqual([]);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    });
  }
});

test.describe('Screen addresses', () => {
  // The screens moved to match their names on every client; earlier links and
  // bookmarks still arrive.
  for (const [from, to, heading] of [
    ['/app/medications', '/app/medicines', 'Medicines'],
    ['/app/schedule', '/app/my-day', 'My Day'],
    ['/medications', '/app/medicines', 'Medicines'],
  ]) {
    test(`${from} leads to ${to}`, async ({ page }) => {
      await signInAsPatient(page, from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });
  }
});
