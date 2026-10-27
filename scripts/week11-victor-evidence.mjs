/**
 * Screenshots for Victor's Week 11 write-up (Contacts, Messaging,
 * Accessibility Settings, and the app shell aligned to the Figma design):
 * each screen at 375 / 768 / 1440px, the shell's controls, and the
 * keyboard-focus states described in the accessibility section.
 *
 *   npm run dev -- --port 5180                 # terminal 1
 *   node scripts/week11-victor-evidence.mjs    # terminal 2
 *
 * Writes docs/web/week11/victor/screenshots/.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../docs/web/week11/victor/screenshots');
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
  ['01-contacts', '/app/contacts'],
  ['02-conversation', '/app/contacts/c3'],
  ['03-settings', '/app/settings'],
];

const browser = await chromium.launch();

async function open(width, height, p) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
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

for (const [bp, w, h] of widths) await mkdir(path.join(out, bp), { recursive: true });
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
      await shot(page, `${bp}/${id}-top`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await shot(page, `${bp}/${id}-bottom`);
    } else {
      await shot(page, `${bp}/${id}`, { fullPage: true });
    }
    await ctx.close();
  }
  console.log('✔', id);
}

// ── Navigation: the sidebar on desktop, the Menu drawer below 1024px ─────────
for (const [bp, w, h] of widths) {
  const { ctx, page } = await open(w, h, '/app/contacts');
  if (bp !== 'desktop') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await shot(page, `${bp}/04-navigation`);
  await ctx.close();
}

// ── App shell controls (desktop unless noted) ────────────────────────────────
{
  const { ctx, page } = await open(1440, 900, '/app');
  await page.keyboard.press('Control+k');
  await page.keyboard.type('jo');
  await shot(page, 'features/shell-search');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /account menu/ }).click();
  await shot(page, 'features/shell-account-menu');
  await page.keyboard.press('Escape');

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: /alerts?$/ }).click();
  await shot(page, 'features/shell-alerts-list');

  await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
  await shot(page, 'features/shell-shortcuts-dialog');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'High contrast' }).click();
  await shot(page, 'features/shell-high-contrast');
  await page.getByRole('button', { name: 'High contrast' }).click();

  await page.getByRole('button', { name: 'CC captions' }).click();
  await shot(page, 'features/shell-captions-off-home');
  await ctx.close();
}
{
  const { ctx, page } = await open(375, 812, '/app');
  await page.keyboard.press('Control+k');
  await shot(page, 'features/shell-drawer-search-mobile');
  await ctx.close();
}

// ── Feature states (desktop) ─────────────────────────────────────────────────
{
  const { ctx, page } = await open(1440, 900, '/app/contacts');
  await page.getByRole('searchbox', { name: 'Find a contact' }).fill('daughter');
  await shot(page, 'features/contacts-search');
  await page.getByRole('searchbox', { name: 'Find a contact' }).fill('zzz');
  await shot(page, 'features/contacts-no-match');

  await page.goto(`${base}/app/contacts/c2`);
  await page.locator('h1').first().waitFor();
  await shot(page, 'features/voicemail-transcript');

  await page.goto(`${base}/app/contacts/c1`);
  await page.locator('h1').first().waitFor();
  await page.getByTestId('composer-send').click();
  await shot(page, 'features/composer-validation');

  await page.getByRole('textbox', { name: 'Message Joyce' }).fill('See you at ten');
  await page.getByTestId('composer-send').click();
  await page.getByRole('button', { name: /Alert Joyce you want to talk/ }).click();
  await page.getByTestId('visual-flash').waitFor();
  await shot(page, 'features/alert-flash');
  await page.getByTestId('visual-flash').waitFor({ state: 'detached' });
  await shot(page, 'features/alert-sent-banner');

  await page.getByRole('button', { name: 'Video call Joyce with live captions' }).click();
  await shot(page, 'features/video-call-requested');

  await page.goto(`${base}/app/contacts/c3`);
  await page.locator('h1').first().waitFor();
  await page.getByRole('button', { name: 'Play video message from Maria' }).click();
  await page.getByTestId('video-caption-m6').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2700);
  await shot(page, 'features/captioned-video-playing');

  await page.goto(`${base}/app/contacts/c1`);
  await page.locator('h1').first().waitFor();
  await ctx.setOffline(true);
  await page.getByRole('textbox', { name: 'Message Joyce' }).fill('Written with no connection');
  await page.getByTestId('composer-send').click();
  await shot(page, 'features/offline-queued');
  await ctx.setOffline(false);
  await page.getByText('You are offline').waitFor({ state: 'detached' });
  await shot(page, 'features/offline-sent');

  await page.goto(`${base}/app/settings`);
  await page.locator('h1').first().waitFor();
  await page.getByRole('button', { name: /Missed \/ Escalated Rapid red double-flash/ }).click();
  await page.getByTestId('visual-flash').waitFor();
  await shot(page, 'features/settings-flash-preview');
  await page.getByTestId('visual-flash').waitFor({ state: 'detached' });
  await page.getByRole('switch', { name: 'Show captions' }).click();
  await shot(page, 'features/settings-captions-off');
  await page.goto(`${base}/app/contacts/c3`);
  await page.locator('h1').first().waitFor();
  await shot(page, 'features/conversation-captions-warning');
  await ctx.close();
}

// ── Keyboard focus states (desktop, real key presses) ────────────────────────
{
  const { ctx, page } = await open(1440, 900, '/app/contacts');
  await page.keyboard.press('/');
  await page.keyboard.type('jo');
  await shot(page, 'keyboard/01-slash-focuses-search');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab'); // from the search box to the first contact
  await shot(page, 'keyboard/02-contact-row-focus');
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Joyce', exact: true }).waitFor();
  // Let the shell finish moving focus to <main> after the navigation.
  await page.waitForTimeout(600);

  await page.getByRole('region', { name: 'Conversation with Joyce' }).focus();
  await page.keyboard.press('Shift+Tab');
  await shot(page, 'keyboard/03-alert-button-focus');
  await page.keyboard.press('Tab'); // the history
  await page.keyboard.press('Tab'); // quick replies
  await page.keyboard.press('ArrowDown');
  await shot(page, 'keyboard/03b-quick-replies-menu');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab'); // the message field
  await page.keyboard.type('Typed with the keyboard');
  await shot(page, 'keyboard/04-composer-focus');
  await page.keyboard.press('Control+Enter');
  await shot(page, 'keyboard/05-ctrl-enter-sent');

  await page.goto(`${base}/app/settings`);
  await page.locator('h1').first().waitFor();
  await page.getByRole('switch', { name: 'Smart alert escalation' }).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await shot(page, 'keyboard/06-switch-focus');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowRight');
  await shot(page, 'keyboard/07-radio-arrow-keys');
  await page.getByRole('main').getByRole('button', { name: 'Sign out', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await shot(page, 'keyboard/08-sign-out-dialog');
  await page.keyboard.press('Escape');
  await shot(page, 'keyboard/09-dialog-escape-returns-focus');
  await ctx.close();
}

// ── Keyboard: the app shell, sign-in form (real key presses) ─────────────────
{
  // Skip link: the first Tab on any page.
  const { ctx, page } = await open(1440, 900, '/app');
  await page.keyboard.press('Tab');
  await shot(page, 'keyboard/10-skip-link-first-tab');
  // Tab through the header: Search (after the logo).
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await shot(page, 'keyboard/11-header-search-focus');
  await page.keyboard.type('metf');
  await page.keyboard.press('ArrowDown');
  await shot(page, 'keyboard/12-search-arrow-keys');
  await page.keyboard.press('Escape');
  // On to the avatar: CC → high contrast → shortcuts → avatar.
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await shot(page, 'keyboard/13-account-menu-tab');
  await page.keyboard.press('Escape');
  await shot(page, 'keyboard/14-account-menu-escape-returns-focus');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await page.getByRole('dialog', { name: 'Keyboard shortcuts' }).waitFor();
  await shot(page, 'keyboard/15-shortcuts-dialog-focus');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await shot(page, 'keyboard/16-high-contrast-focus-ring');
  await ctx.close();
}
{
  // Phone width: the Menu drawer.
  const { ctx, page } = await open(375, 812, '/app');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // Menu
  await page.keyboard.press('Enter');
  await page.locator('#nav-drawer').waitFor();
  await shot(page, 'keyboard/17-menu-drawer-opens-focus-inside');
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('Tab');
  await shot(page, 'keyboard/18-menu-drawer-tab-to-a-page');
  await page.keyboard.press('Escape');
  await shot(page, 'keyboard/19-menu-drawer-escape-returns-focus');
  await ctx.close();
}
{
  // Sign in: a refused submit focuses the first field to fix. (Phone-ish
  // width, so the form fills the image.)
  const ctx = await browser.newContext({ viewport: { width: 600, height: 760 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(demoTime);
  await page.goto(`${base}/signin`);
  await page.locator('h1').first().waitFor();
  await page.getByRole('button', { name: /sign in/i }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await shot(page, 'keyboard/20-sign-in-error-focuses-field');
  await ctx.close();
}

await browser.close();
console.log('done');
