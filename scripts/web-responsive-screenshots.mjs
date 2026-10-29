/**
 * Screenshots of every main screen at the three web breakpoints, for the
 * Assignment 10 implementation evidence.
 *
 *   npm run dev -- --port 5180              # terminal 1
 *   npm run screenshots:responsive          # terminal 2
 *
 * Writes docs/web/implementation/screenshots/{mobile,tablet,desktop}/<screen>.png
 * (what is on screen at that size, above the fold) and overview/<screen>.png,
 * the three side by side at the same scale.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../docs/web/implementation/screenshots');
const base = (process.env.WEB_URL ?? 'http://localhost:5180').replace(/\/$/, '');
const user = { id: 'u', name: 'Margaret Whitfield', email: 'margaret@example.com' };

// Screenshots show the demo at 9:45 am today, whatever time they are taken:
// morning greeting, this morning's messages, the 10:30 visit still to come.
const demoTime = new Date();
demoTime.setHours(9, 45, 0, 0);

const breakpoints = [
  { id: 'mobile', label: 'Mobile — 375px', width: 375, height: 812 },
  { id: 'tablet', label: 'Tablet — 820px', width: 820, height: 1180 },
  { id: 'desktop', label: 'Desktop — 1280px', width: 1280, height: 800 },
];

/** [id, title, path, role, optional action] */
export const screens = [
  ['01-landing', 'Landing', '/', null],
  ['02-sign-in', 'Sign in', '/signin', null],
  ['03-sign-up', 'Sign up', '/signup', null],
  ['04-role-chooser', 'Role chooser', '/role', 'none'],
  ['05-today', 'Today (care recipient home)', '/app', 'patient'],
  ['06-my-day', 'My Day', '/app/my-day', 'patient'],
  ['07-appointments', 'Appointments', '/app/appointments', 'patient'],
  ['08-medicines', 'Medicines', '/app/medicines', 'patient'],
  ['09-memories', 'Memories', '/app/memories', 'patient'],
  ['10-contacts', 'Contacts', '/app/contacts', 'patient'],
  ['11-dashboard', 'Caregiver dashboard', '/app', 'caregiver'],
  ['12-manage-medications', 'Manage medicines', '/app/manage-medicines', 'caregiver'],
  ['13-manage-appointments', 'Manage appointments', '/app/manage-appointments', 'caregiver'],
  ['14-activity', 'Activity log', '/app/activity', 'caregiver'],
  ['15-notes', 'Caregiver notes', '/app/caregiver', 'caregiver'],
  ['16-navigation-open', 'Navigation opened (phone and tablet Menu drawer; desktop sidebar)', '/app', 'patient', 'open-nav'],
  ['17-search', 'Header search (Ctrl K) with results', '/app', 'patient', 'search'],
];

const browser = await chromium.launch();
for (const bp of breakpoints) await mkdir(path.join(out, bp.id), { recursive: true });
await mkdir(path.join(out, 'overview'), { recursive: true });

for (const [id, title, p, role, action] of screens) {
  for (const bp of breakpoints) {
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(demoTime);
    await page.goto(`${base}/`);
    await page.evaluate((s) => {
      localStorage.clear();
      if (s) localStorage.setItem('careconnect_session', s);
    }, role === null ? null : JSON.stringify({ user, role: role === 'none' ? null : role }));
    await page.goto(`${base}${p}`);
    await page.locator('h1').first().waitFor();
    if (action === 'open-nav' && bp.id !== 'desktop') {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
    }
    if (action === 'search') {
      // Ctrl+K: the header field on desktop, the drawer's field below 1024px.
      await page.keyboard.press('Control+k');
      await page.keyboard.type('metf');
    }
    await page.mouse.move(0, 0);
    await page.waitForTimeout(450); // page-enter animation
    await page.screenshot({ path: path.join(out, bp.id, `${id}.png`) });
    await ctx.close();
  }

  // Overview: the three breakpoints side by side, scaled to one height.
  const imgs = await Promise.all(
    breakpoints.map(async (bp) => `data:image/png;base64,${(await readFile(path.join(out, bp.id, `${id}.png`))).toString('base64')}`),
  );
  const sheet = await browser.newPage({ viewport: { width: 1800, height: 900 } });
  await sheet.setContent(`<!doctype html><html><head><style>
    body{margin:0;padding:24px;font:600 18px system-ui,sans-serif;background:#eef0f4;color:#1e2631}
    h1{font-size:24px;margin:0 0 16px} .row{display:flex;gap:24px;align-items:flex-start}
    figure{margin:0} figcaption{margin-bottom:8px} img{height:720px;border:1px solid #c4cad5;border-radius:6px;background:#fff;display:block}
  </style></head><body><h1>${title}</h1><div class="row">${breakpoints
    .map((bp, i) => `<figure><figcaption>${bp.label}</figcaption><img src="${imgs[i]}"></figure>`)
    .join('')}</div></body></html>`);
  const width = await sheet.evaluate(() => document.querySelector('.row').scrollWidth + 48);
  await sheet.setViewportSize({ width, height: 830 });
  await sheet.screenshot({ path: path.join(out, 'overview', `${id}.png`) });
  await sheet.close();
  console.log('✔', id);
}
await browser.close();
await writeFile(path.join(out, 'README.md'), `# Screenshots\n\nGenerated by \`scripts/web-responsive-screenshots.mjs\` on ${new Date().toISOString().slice(0, 10)}. \`overview/\` shows each screen at all three breakpoints side by side.\n`);
