/**
 * Assignment 10, Part 2 — automated accessibility audit of the web app.
 *
 * Runs axe-core (the engine inside axe DevTools) over every route and the
 * interactive states that matter (form errors, the confirm dialog, the
 * header search, account menu and shortcuts dialog, the Menu drawer) at the
 * three breakpoints the web design uses:
 *   mobile 375px · tablet 820px · desktop 1280px   (+ 320px reflow check)
 * and checks the keyboard behaviours the documentation promises: skip link,
 * focus trap and focus return in the modals and the drawer, Escape on the
 * account menu, and one main / one banner landmark per page.
 *
 * Every route is then scanned again with the header's high-contrast mode on,
 * with axe's AAA rules added: high contrast is how the app meets WCAG 1.4.6
 * Contrast (Enhanced), and it must never introduce an AA failure of its own.
 *
 * (Assignment 10 also scanned the AI assistant panel; it has not been
 * mounted since the Week 11 Landing page.)
 *
 *   npm run dev -- --port 5180          # terminal 1
 *   npm run a11y:web                    # terminal 2
 *
 * Writes docs/web/accessibility/audit/ (summary.json, report.html,
 * axe-results.png). Exits non-zero on any violation or failed check.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../docs/web/accessibility/audit');
const base = (process.env.WEB_URL ?? 'http://localhost:5180').replace(/\/$/, '');
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const aaaTags = ['wcag2aaa', 'wcag21aaa'];

const breakpoints = [
  { id: 'mobile', width: 375, height: 812 },
  { id: 'tablet', width: 820, height: 1180 },
  { id: 'desktop', width: 1280, height: 900 },
];

const user = { id: 'user_audit', name: 'Margaret Whitfield', email: 'margaret@example.com' };
const session = (role) => JSON.stringify({ user, role });

/** [id, label, path, session role or null for signed out] */
const pages = [
  ['landing', 'Landing', '/', null],
  ['signin', 'Sign in', '/signin', null],
  ['signup', 'Sign up', '/signup', null],
  ['role', 'Role chooser', '/role', 'none'],
  ['today', 'Home (patient)', '/app', 'patient'],
  ['schedule', 'My Day', '/app/my-day', 'patient'],
  ['appointments', 'Appointments', '/app/appointments', 'patient'],
  ['medications', 'Medicines', '/app/medicines', 'patient'],
  ['memories', 'Memories', '/app/memories', 'patient'],
  ['contacts', 'Contacts', '/app/contacts', 'patient'],
  ['conversation', 'Conversation', '/app/contacts/c3', 'patient'],
  ['settings', 'Accessibility Settings', '/app/settings', 'patient'],
  ['dashboard', 'Caregiver dashboard', '/app', 'caregiver'],
  ['manage-meds', 'Manage medicines', '/app/manage-medicines', 'caregiver'],
  ['manage-appts', 'Manage appointments', '/app/manage-appointments', 'caregiver'],
  ['activity', 'Activity log', '/app/activity', 'caregiver'],
  ['notes', 'Caregiver notes', '/app/caregiver', 'caregiver'],
];

const results = [];
const checks = [];
const check = (name, pass, note = '') => {
  checks.push({ name, pass, note });
  console.log(`${pass ? '✔' : '✘'} ${name}${note ? ` — ${note}` : ''}`);
};

async function open(context, pagePath, role, { highContrast = false } = {}) {
  const page = await context.newPage();
  // Seed storage from a static file: Landing clears the session on mount, and
  // could do so after the write below.
  await page.goto(`${base}/icons/icon-192.png`);
  await page.evaluate(
    ([s, hc]) => {
      localStorage.clear();
      if (s) localStorage.setItem('careconnect_session', s);
      if (hc) localStorage.setItem('careconnect_high_contrast', 'true');
    },
    [role === null ? null : session(role === 'none' ? null : role), highContrast],
  );
  await page.goto(`${base}${pagePath}`);
  await page.locator('h1').first().waitFor({ timeout: 8000 });
  await page.waitForTimeout(250);
  return page;
}

async function scan(page, id, label, bp, extraTags = []) {
  const axe = await new AxeBuilder({ page })
    .withTags([...tags, ...extraTags])
    .options({ rules: { 'label-content-name-mismatch': { enabled: true } } })
    .analyze();
  const entry = {
    id: `${bp.id}-${id}`,
    page: label,
    breakpoint: `${bp.id} ${bp.width}px`,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 160) })),
    })),
    passes: axe.passes.length,
  };
  results.push(entry);
  const n = entry.violations.reduce((s, v) => s + v.nodes.length, 0);
  console.log(`${n ? '✘' : '✔'} ${bp.id.padEnd(7)} ${label.padEnd(26)} ${entry.violations.length} violations (${n} nodes)`);
  for (const v of entry.violations) {
    console.log(`    ${v.impact} ${v.id}: ${v.help}`);
    for (const node of v.nodes.slice(0, 6)) console.log(`      ${node.target}  ${node.html}`);
  }
  return entry;
}

const landmarks = (page) =>
  page.evaluate(() => {
    const top = (sel) =>
      [...document.querySelectorAll(sel)].filter(
        (el) => !el.closest('main, nav, aside, section, article') || el.matches('main'),
      ).length;
    return {
      main: document.querySelectorAll('main, [role="main"]').length,
      banner: top('header, [role="banner"]'),
      h1: document.querySelectorAll('h1').length,
      title: document.title,
    };
  });

async function run() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch(process.env.A11Y_CHANNEL ? { channel: process.env.A11Y_CHANNEL } : {});

  for (const bp of breakpoints) {
    const context = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    const titles = new Map();
    for (const [id, label, pagePath, role] of pages) {
      const page = await open(context, pagePath, role);
      await scan(page, id, label, bp);
      const lm = await landmarks(page);
      titles.set(id, lm.title);
      if (bp.id === 'desktop') {
        check(`${label}: one <main>, one top-level banner, one <h1>`, lm.main === 1 && lm.banner === 1 && lm.h1 === 1, `main=${lm.main} banner=${lm.banner} h1=${lm.h1}`);
        await page.screenshot({ path: path.join(outDir, `${id}.png`) });
      }
      await page.close();
    }
    if (bp.id === 'desktop') {
      const unique = new Set(titles.values()).size;
      check('Each page has its own document title', unique === titles.size, `${unique} distinct titles for ${titles.size} pages`);
    }

    // ── States ─────────────────────────────────────────────────────────────
    // Sign-in errors.
    let page = await open(context, '/signin', null);
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(200);
    await scan(page, 'signin-errors', 'Sign in — errors showing', bp);
    if (bp.id === 'desktop') {
      const invalid = await page.locator('[aria-invalid="true"]').count();
      const described = await page.evaluate(() =>
        [...document.querySelectorAll('[aria-invalid="true"]')].every((el) => {
          const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
          return ids.some((i) => document.getElementById(i)?.textContent?.trim());
        }),
      );
      check('Sign in: invalid fields are marked and described by their error', invalid > 0 && described, `${invalid} invalid field(s)`);
    }
    await page.close();

    // App shell: the header's search, account menu and shortcuts dialog.
    if (bp.id === 'desktop') {
      page = await open(context, '/app', 'patient');
      await page.keyboard.press('Control+k');
      const search = page.getByRole('combobox', { name: /search medicines/i });
      check('Search: Ctrl+K focuses the header search', await search.evaluate((el) => el === document.activeElement));
      await page.keyboard.type('metf');
      await scan(page, 'search', 'Header search — results open', bp);
      check('Search: the results are a listbox and the first option is active', (await search.getAttribute('aria-expanded')) === 'true' && (await page.getByRole('option', { selected: true }).count()) === 1);
      await page.keyboard.press('Escape');

      const account = page.getByRole('button', { name: /account menu/ });
      await account.focus();
      await page.keyboard.press('Enter');
      await scan(page, 'account-menu', 'Account menu open', bp);
      await page.keyboard.press('Escape');
      check('Account menu: Escape closes it and focus returns to the avatar', (await account.getAttribute('aria-expanded')) === 'false' && (await account.evaluate((el) => el === document.activeElement)));

      await page.getByRole('button', { name: 'Keyboard shortcuts' }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('dialog', { name: 'Keyboard shortcuts' }).waitFor();
      await scan(page, 'shortcuts', 'Keyboard shortcuts dialog', bp);
      await page.keyboard.press('Escape');
      check(
        'Shortcuts: the keyboard button opens the dialog; Escape closes it and focus returns to the button',
        (await page.getByRole('dialog').count()) === 0 &&
          (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Keyboard shortcuts',
      );
      await page.close();
    }

    // Confirm dialog (Manage medications → Delete).
    page = await open(context, '/app/manage-medicines', 'caregiver');
    const del = page.getByRole('button', { name: /^Delete /i }).first();
    await del.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor();
    await scan(page, 'dialog', 'Manage medications — confirm dialog', bp);
    if (bp.id === 'desktop') {
      const inside = [];
      for (let i = 0; i < 6; i += 1) {
        await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
        inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))));
        await page.keyboard.press('Tab');
        inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))));
      }
      check('Dialog: Tab and Shift+Tab stay inside', inside.every(Boolean));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      const label = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
      check('Dialog: Escape closes it and focus returns to the Delete button', (await page.getByRole('dialog').count()) === 0 && /^Delete /.test(label), label);
    }
    await page.close();

    // Responsive navigation: below 1024px the Menu drawer, for both roles.
    if (bp.id !== 'desktop') {
      for (const role of ['patient', 'caregiver']) {
        page = await open(context, '/app', role);
        const menu = page.getByRole('button', { name: 'Menu', exact: true });
        await menu.focus();
        await page.keyboard.press('Enter');
        await page.locator('#nav-drawer').waitFor();
        await scan(page, `drawer-${role}`, `${role === 'patient' ? 'Care recipient' : 'Caregiver'} — Menu drawer open`, bp);
        const inside = [];
        for (let i = 0; i < 25; i += 1) {
          await page.keyboard.press('Tab');
          inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('#nav-drawer'))));
        }
        await page.keyboard.press('Escape');
        const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        const closed = (await page.locator('#nav-drawer').count()) === 0;
        check(
          `Menu drawer (${bp.id}, ${role}): Tab stays inside, Escape closes it and focus returns to Menu`,
          inside.every(Boolean) && closed && back === 'Menu',
          `back on "${back}"`,
        );
        await page.close();
      }
    }

    if (bp.id === 'desktop') {
      // Focus on load: nothing should be focused before the user acts.
      for (const [p, role] of [['/app/manage-medicines', 'caregiver'], ['/app/manage-appointments', 'caregiver']]) {
        const pg = await open(context, p, role);
        const active = await pg.evaluate(() => {
          const el = document.activeElement;
          return el && el !== document.body ? `${el.tagName.toLowerCase()} "${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}"` : 'body';
        });
        check(`${p}: focus is not moved on page load`, active === 'body', `focused: ${active}`);
        await pg.close();
      }

      // In-app navigation moves focus to <main>.
      {
        const pg = await open(context, '/app', 'patient');
        await pg.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Medicines' }).focus();
        await pg.keyboard.press('Enter');
        await pg.getByRole('heading', { level: 1, name: /medicines/i }).waitFor();
        await pg.waitForTimeout(150);
        const id = await pg.evaluate(() => document.activeElement?.id);
        const title = await pg.title();
        check('Navigating with the keyboard moves focus to <main> and updates the title', id === 'main-content' && /^Medicines/.test(title), `focus #${id}, title "${title}"`);
        await pg.close();
      }

      // Skip link on every shell.
      for (const [p, role, name] of [['/', null, 'Landing'], ['/signin', null, 'Sign in'], ['/app', 'patient', 'Patient app'], ['/app', 'caregiver', 'Caregiver app']]) {
        const pg = await open(context, p, role);
        await pg.evaluate(() => document.activeElement?.blur?.());
        await pg.keyboard.press('Tab');
        const first = await pg.evaluate(() => document.activeElement?.textContent?.trim());
        await pg.keyboard.press('Enter');
        const target = await pg.evaluate(() => document.activeElement?.id);
        check(`${name}: first Tab is "Skip to main content", Enter moves focus to <main>`, /skip to main content/i.test(first ?? '') && target === 'main-content', `first="${first}" → #${target}`);
        await pg.close();
      }
    }
    await context.close();
  }

  // Reflow at 320px.
  const narrow = await browser.newContext({ viewport: { width: 320, height: 800 } });
  for (const [id, label, pagePath, role] of pages) {
    const page = await open(narrow, pagePath, role);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${label}: no horizontal scroll at 320px`, overflow <= 1, overflow > 1 ? `${overflow}px too wide` : '');
    await page.close();
  }
  await narrow.close();

  // High contrast on: no AA failures of its own, and AAA contrast throughout.
  for (const bp of breakpoints) {
    const context = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    for (const [id, label, pagePath, role] of pages) {
      const page = await open(context, pagePath, role, { highContrast: true });
      const on = await page.evaluate(() => document.documentElement.classList.contains('high-contrast'));
      check(`${label} (${bp.id}): high contrast applied`, on);
      await scan(page, `hc-${id}`, `${label} — high contrast`, bp, aaaTags);
      await page.close();
    }
    await context.close();
  }

  // ── Report ───────────────────────────────────────────────────────────────
  const total = results.reduce((s, r) => s + r.violations.length, 0);
  const failed = checks.filter((c) => !c.pass).length;
  const summary = {
    engine: `axe-core ${(await import('axe-core')).default.version}`,
    tags,
    highContrastTags: [...tags, ...aaaTags],
    date: new Date().toISOString(),
    scans: results.length,
    violations: total,
    checks: { total: checks.length, failed },
    results: results.map((r) => ({ id: r.id, page: r.page, breakpoint: r.breakpoint, violations: r.violations.length, passes: r.passes })),
    checkResults: checks,
  };
  await writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(outDir, 'details.json'), JSON.stringify(results, null, 2));
  const reportPath = path.join(outDir, 'report.html');
  await writeFile(reportPath, report(summary, results));
  const rp = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await rp.goto(`file://${reportPath}`);
  await rp.screenshot({ path: path.join(outDir, 'axe-results.png'), fullPage: true });
  await browser.close();
  console.log(`\n${results.length} scans, ${total} violations; ${checks.length - failed}/${checks.length} checks passed.`);
  process.exitCode = total === 0 && failed === 0 ? 0 : 1;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function report(summary, results) {
  const byPage = new Map();
  for (const r of results) {
    if (!byPage.has(r.page)) byPage.set(r.page, {});
    byPage.get(r.page)[r.breakpoint.split(' ')[0]] = r.violations.length;
  }
  const cell = (n) => (n === undefined ? '<td>—</td>' : `<td class="num ${n ? 'bad' : 'ok'}">${n}</td>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CareConnect web — accessibility audit</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:32px;color:#1a1a1a}h1{margin:0 0 4px}.meta{color:#444;margin:0 0 16px}
.big{display:inline-block;font-size:24px;font-weight:700;padding:12px 16px;border-radius:8px;margin:0 12px 16px 0}
.okb{background:#e6f4ea;color:#0b5d1e;border:2px solid #0b5d1e}.badb{background:#fde8e8;color:#8a1111;border:2px solid #8a1111}
table{border-collapse:collapse;width:100%;margin-bottom:20px}th,td{border:1px solid #ccc;padding:5px 9px;text-align:left}th{background:#f2f2f2}
.num{text-align:right}.bad{background:#fde8e8;color:#8a1111;font-weight:700}.ok{color:#0b5d1e}</style></head><body>
<h1>CareConnect web app — accessibility audit</h1>
<p class="meta">${esc(summary.engine)} · ${summary.tags.join(', ')} + label-in-name · ${esc(summary.date)}</p>
<div class="big ${summary.violations ? 'badb' : 'okb'}">${summary.violations} axe violations · ${summary.scans} scans</div>
<div class="big ${summary.checks.failed ? 'badb' : 'okb'}">${summary.checks.total - summary.checks.failed} / ${summary.checks.total} keyboard &amp; structure checks</div>
<h2>axe violations by page and breakpoint</h2>
<table><thead><tr><th>Page / state</th><th>Mobile 375px</th><th>Tablet 820px</th><th>Desktop 1280px</th></tr></thead><tbody>
${[...byPage].map(([p, v]) => `<tr><td>${esc(p)}</td>${cell(v.mobile)}${cell(v.tablet)}${cell(v.desktop)}</tr>`).join('')}</tbody></table>
<h2>Keyboard and structure checks</h2>
<table><thead><tr><th>Check</th><th>Result</th><th>Note</th></tr></thead><tbody>
${summary.checkResults.map((c) => `<tr><td>${esc(c.name)}</td><td class="${c.pass ? 'ok' : 'bad'}">${c.pass ? 'Pass' : 'Fail'}</td><td>${esc(c.note)}</td></tr>`).join('')}</tbody></table>
</body></html>`;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
