/**
 * Screenshots for Upneet's Week 11 write-up (Appointments, Medicines,
 * Memories): each screen at 375 / 768 / 1440px, the feature states, and the
 * keyboard-focus states described in the accessibility section.
 *
 *   npm run dev -- --port 5180                 # terminal 1
 *   node scripts/week11-upneet-evidence.mjs    # terminal 2
 *
 * Writes docs/web/week11/upneet/screenshots/.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../docs/web/week11/upneet/screenshots');
const base = (process.env.WEB_URL ?? 'http://localhost:5180').replace(/\/$/, '');
const user = { id: 'u', name: 'Margaret Whitfield', email: 'margaret@example.com' };

// Screenshots show the demo at 9:45 am today, whatever time they are taken:
// morning greeting, this morning's messages, the 10:30 visit still to come.
const demoTime = new Date();
demoTime.setHours(9, 45, 0, 0);

const widths = [
  ['mobile', 375, 812],
  ['tablet', 768, 1024],
  ['desktop', 1440, 900],
];

const screens = [
  ['01-appointments', '/app/appointments'],
  ['02-medicines', '/app/medications'],
  ['03-memories', '/app/memories'],
];

const browser = await chromium.launch();

async function open(width, height, p) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'reduce',
    acceptDownloads: true,
  });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(demoTime);
  await page.goto(`${base}/`);
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem('careconnect_session', s);
  }, JSON.stringify({ user, role: 'patient' }));
  await page.goto(`${base}${p}`);
  await page.locator('h1').first().waitFor();
  await page.waitForTimeout(300);
  return { ctx, page };
}

async function shot(page, name, opts = {}) {
  await page.waitForTimeout(150); // let the last key press repaint
  await page.screenshot({ path: path.join(out, `${name}.png`), ...opts });
}

/** Scrolls `locator` to the middle of the window and captures the window. */
async function shotAt(page, locator, name) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await shot(page, name);
}

for (const [bp] of widths) await mkdir(path.join(out, bp), { recursive: true });
await mkdir(path.join(out, 'keyboard'), { recursive: true });
await mkdir(path.join(out, 'features'), { recursive: true });

// ── Each screen at each breakpoint ───────────────────────────────────────────
// Tablet and desktop: the full page. Mobile: the top and the bottom of the
// page as a phone shows them, because a full-page capture would paint the
// sticky header and status bar halfway down the image.
for (const [id, p] of screens) {
  for (const [bp, w, h] of widths) {
    const { ctx, page } = await open(w, h, p);
    if (bp === 'mobile') {
      await page.locator('main').evaluate((el) => el.scrollIntoView());
      await shot(page, `${bp}/${id}-top`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await shot(page, `${bp}/${id}-bottom`);
    } else {
      // Fetch every lazily loaded photo before the full-page capture.
      for (const img of await page.locator('main img').all()) await img.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await shot(page, `${bp}/${id}`, { fullPage: true });
    }
    await ctx.close();
  }
  console.log('✔', id);
}

// ── Navigation at each width ─────────────────────────────────────────────────
for (const [bp, w, h] of widths) {
  const { ctx, page } = await open(w, h, '/app/memories');
  if (bp !== 'desktop') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await shot(page, `${bp}/04-navigation`);
  await ctx.close();
}
console.log('✔ navigation');

// ── Feature states (desktop) ─────────────────────────────────────────────────
{
  const { ctx, page } = await open(1440, 900, '/app/appointments');
  await page.getByRole('button', { name: /^Blood test — fasting needed/ }).click();
  await shot(page, 'features/appointments-detail-selected');
  const box = page.getByRole('checkbox', { name: /Blood test — fasting needed/ });
  await box.check();
  await shotAt(page, box, 'features/appointments-my-day-added');
  await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export to calendar' }).click()]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'features/appointments-exported');
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, '/app/medications');
  await page.getByRole('button', { name: /^Metformin/ }).click();
  await shot(page, 'features/medicines-detail-selected');
  await page.getByRole('button', { name: 'Mark Metformin as taken' }).click();
  await shot(page, 'features/medicines-two-of-four');
  await page.getByRole('checkbox', { name: 'Lisinopril taken' }).check();
  await page.getByRole('checkbox', { name: 'Atorvastatin taken' }).check();
  await shot(page, 'features/medicines-all-taken');
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, '/app/memories');
  await page.getByRole('button', { name: 'Add a memory' }).click();
  await shot(page, 'features/memories-add-form');
  await page.getByRole('button', { name: 'Save memory' }).click();
  await shot(page, 'features/memories-validation');
  await page.getByRole('textbox', { name: /Name of the memory/ }).fill('Our wedding day');
  await page.getByRole('textbox', { name: 'When' }).fill('June 1968');
  await page.getByRole('combobox', { name: /Kind of memory/ }).selectOption('event');
  await page.getByRole('textbox', { name: /^The memory/ }).fill(
    'We married at St Mary’s in the rain, and danced in the village hall until midnight.',
  );
  await page.getByRole('checkbox', { name: /Pin to the top/ }).check();
  await page.getByRole('button', { name: 'Save memory' }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'features/memories-saved');
  // Focus + Enter: a scripted click can land under the sticky header.
  await page.getByRole('button', { name: 'Remove: Our wedding day' }).focus();
  await page.keyboard.press('Enter');
  await shot(page, 'features/memories-remove-dialog');
  await page.keyboard.press('Escape');
  await page.getByText('Pets', { exact: true }).click();
  await shot(page, 'features/memories-filter-pets');
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, '/app/memories');
  await page.getByText('Hobbies', { exact: true }).click();
  await page.evaluate(() => {
    localStorage.setItem('careconnect_memories', '[]');
  });
  await page.reload();
  await page.locator('h1').waitFor();
  await shot(page, 'features/memories-empty');
  await ctx.close();
}
console.log('✔ features');

// ── Keyboard focus states (desktop, real key presses) ────────────────────────
{
  const { ctx, page } = await open(1440, 900, '/app/medications');
  await page.getByRole('checkbox', { name: 'Amlodipine taken' }).focus();
  await page.keyboard.press('Tab'); // the next row (shows it in detail with Enter)
  await page.keyboard.press('Tab'); // that row's tick
  await shot(page, 'keyboard/01-medicine-tab-focus');
  await page.keyboard.press('Space');
  await shot(page, 'keyboard/02-medicine-space-ticks');
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, '/app/appointments');
  await page.getByRole('button', { name: /^Blood test — fasting needed/ }).focus();
  await page.keyboard.press('Enter');
  const box = page.getByRole('checkbox', { name: /Blood test — fasting needed/ });
  await box.focus();
  await page.keyboard.press('Space');
  await shotAt(page, box, 'keyboard/03-my-day-space');
  await page.getByRole('button', { name: 'Export to calendar' }).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, 'keyboard/04-export-focus');
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 900, '/app/memories');
  await page.getByRole('radio', { name: 'All' }).focus();
  await page.keyboard.press('ArrowRight');
  await shot(page, 'keyboard/05-filter-arrow-keys');
  await page.keyboard.press('ArrowLeft');
  await page.getByRole('button', { name: 'Add a memory' }).focus();
  await page.keyboard.press('Enter');
  await shot(page, 'keyboard/06-form-opens-focus-first-field');
  await page.keyboard.type('Picnic by the river');
  await page.keyboard.press('Escape');
  await shot(page, 'keyboard/07-escape-returns-focus');
  await page.keyboard.press('Enter');
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Tab');
  await page.keyboard.type('A short story about the picnic.');
  await page.getByRole('button', { name: 'Save memory' }).focus();
  await page.keyboard.press('Enter');
  await shot(page, 'keyboard/08-save-error-focuses-field');
  await page.getByRole('combobox', { name: /Kind of memory/ }).selectOption('place');
  await page.getByRole('button', { name: 'Save memory' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await shot(page, 'keyboard/09-saved-heading-focused');
  await page.getByRole('button', { name: 'Pin to top: Your Garden' }).focus();
  await page.keyboard.press('Enter');
  await shotAt(page, page.getByRole('button', { name: 'Unpin: Your Garden' }), 'keyboard/10-pin-focus-follows');
  await ctx.close();
}
console.log('✔ keyboard');

await browser.close();
