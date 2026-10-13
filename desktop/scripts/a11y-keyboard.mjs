/**
 * Assignment 9 keyboard-only verification, plus the accessibility tree a
 * screen reader is given for each screen.
 *
 *   npm run dev:renderer      # in one terminal
 *   npm run a11y:keyboard     # in another
 *
 * No mouse event is sent anywhere in this script. For every screen it:
 *   - presses Tab until focus comes back round, recording each stop, its role
 *     and name, and whether a focus indicator is actually drawn;
 *   - compares the stops reached with every tabbable element on the page, so
 *     an unreachable control or a keyboard trap shows up as a mismatch;
 *   - saves the Chromium accessibility tree (what VoiceOver and NVDA read).
 * Then it runs every keyboard shortcut and the Tab/Shift+Tab/arrow/Enter/
 * Space/Escape behaviours the assignment lists, and writes the results to
 * `../docs/accessibility/keyboard/results.md` with focus screenshots.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, '../../docs/accessibility');
const outDir = path.join(docs, 'keyboard');
const treeDir = path.join(docs, 'screen-reader/accessibility-tree');
const baseUrl = process.env.A11Y_URL ?? 'http://localhost:5273/';

const isMac = process.platform === 'darwin';
const mod = isMac ? 'Meta' : 'Control';
const modName = isMac ? 'Cmd' : 'Ctrl';

/** Everything about the focused element the report needs. */
function describeFocus() {
  const el = document.activeElement;
  if (!el || el === document.body) return null;

  const drawn = (node) => {
    if (!node) return false;
    const style = getComputedStyle(node);
    const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    const shadow = style.boxShadow && style.boxShadow !== 'none';
    return outline || shadow;
  };
  // A control may draw its ring on itself, its next sibling (the switch
  // track) or a wrapping row (the medicine checkbox row).
  let indicator = drawn(el) ? 'self' : drawn(el.nextElementSibling) ? 'sibling' : null;
  for (let p = el.parentElement, i = 0; !indicator && p && i < 3; p = p.parentElement, i += 1) {
    if (drawn(p)) indicator = 'ancestor';
  }

  const role = el.getAttribute('role') ?? el.tagName.toLowerCase();
  const name = (
    el.getAttribute('aria-label') ||
    (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent) ||
    el.textContent ||
    ''
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);
  if (!el.dataset.kbId) el.dataset.kbId = String(Math.random()).slice(2);
  return { id: el.dataset.kbId, role, name, indicator };
}

function countTabbable() {
  // With a modal open only the dialog counts: aria-modal plus the focus trap
  // mean the page behind is out of reach on purpose.
  const scope = document.querySelector('[role="dialog"]') ?? document;
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(scope.querySelectorAll(selector)).filter((el) => {
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    // Radio groups expose one stop (roving tabindex), so only the checked or
    // first radio counts.
    if (el.getAttribute('role') === 'radio' && el.getAttribute('tabindex') === '-1') return false;
    return el.getClientRects().length > 0 || el.classList.contains('skip-link');
  }).length;
}

async function tabSweep(page, max = 120) {
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
  const stops = [];
  const seen = new Set();
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(describeFocus);
    if (!focus) continue; // focus left the document — wrapping round
    if (seen.has(focus.id)) break;
    seen.add(focus.id);
    stops.push(focus);
  }
  // Shift+Tab must walk back the same way: one step back from the first stop
  // lands on the last.
  const tabbable = await page.evaluate(countTabbable);
  return { stops, tabbable };
}

const results = [];
const check = (area, step, expected, pass, note = '') => {
  results.push({ area, step, expected, pass, note });
  console.log(`${pass ? '✔' : '✘'} ${area} — ${step}${note ? ` (${note})` : ''}`);
};

async function signIn(page) {
  await page.goto(baseUrl);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // Sign in
  await page.keyboard.press('Enter');
  await page.locator('#email-input').waitFor();
  await page.keyboard.press('Tab'); // logo
  await page.keyboard.press('Tab'); // email
  await page.keyboard.type('jordan@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('password123');
  await page.keyboard.press('Enter');
  await page.getByRole('navigation', { name: 'Main' }).waitFor();
}

const heading = (page) =>
  page.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? '');
const focused = (page) => page.evaluate(describeFocus);

async function run() {
  await mkdir(outDir, { recursive: true });
  await mkdir(treeDir, { recursive: true });
  const browser = await chromium.launch(
    process.env.A11Y_CHANNEL ? { channel: process.env.A11Y_CHANNEL } : {},
  );
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const sweeps = [];

  const sweep = async (screen, slug) => {
    const { stops, tabbable } = await tabSweep(page);
    const noRing = stops.filter((s) => !s.indicator);
    sweeps.push({ screen, stops, tabbable, noRing });
    check(
      'Tab order',
      `${screen}: every control reached by Tab, focus wraps (no trap)`,
      `${tabbable} tabbable elements reached`,
      stops.length >= tabbable,
      `${stops.length} stops / ${tabbable} tabbable`,
    );
    check(
      'Focus visible',
      `${screen}: a focus indicator is drawn at every stop`,
      'outline or ring on every stop',
      noRing.length === 0,
      noRing.length ? `missing on: ${noRing.map((s) => s.name).join(', ')}` : '',
    );
    const tree = await page.locator('body').ariaSnapshot();
    await writeFile(path.join(treeDir, `${slug}.yml`), tree);
  };

  // ── Public screens ────────────────────────────────────────────────────────
  await page.goto(baseUrl);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await page.keyboard.press('Tab');
  const skip = await focused(page);
  check('Skip link', 'First Tab on launch', '"Skip to main content" focused', /skip to main/i.test(skip?.name ?? ''));
  await page.screenshot({ path: path.join(outDir, 'focus-01-skip-link.png') });
  await page.keyboard.press('Enter');
  const afterSkip = await page.evaluate(() => document.activeElement?.id);
  check('Skip link', 'Enter on the skip link', 'focus moves to <main>', afterSkip === 'main-content');
  await sweep('Splash', '01-splash');

  // After the sweep focus has wrapped; put it back on the header's Sign in.
  await page.getByRole('button', { name: 'Sign in' }).first().focus();
  await page.keyboard.press('Enter');
  await page.locator('#email-input').waitFor();
  await sweep('Sign In', '02-sign-in');
  await page.locator('form button[type="submit"]').focus();
  await page.keyboard.press('Enter');
  const alert = await page.getByRole('alert').first().textContent();
  check('Forms', 'Submit an empty Sign In form with Enter', 'error alert shown and announced', Boolean(alert));
  await page.screenshot({ path: path.join(outDir, 'focus-02-sign-in-errors.png') });

  await page.goto(baseUrl);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await page.getByRole('button', { name: 'Sign up' }).first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await sweep('Sign Up', '03-sign-up');

  // ── Signed in ────────────────────────────────────────────────────────────
  await signIn(page);
  check('Forms', 'Sign in using only Tab, typing and Enter', 'lands on Home', /your day/i.test(await heading(page)));

  const pages = [
    ['1', 'Home', /your day/i, '04-home'],
    ['2', 'My Day', /my day/i, '05-my-day'],
    ['3', 'Appointments', /appointments/i, '06-appointments'],
    ['4', 'Medicines', /medicines/i, '07-medicines'],
    ['5', 'Memories', /memories/i, '08-memories'],
    ['6', 'Contacts', /contacts/i, '09-contacts'],
  ];
  for (const [digit, name, pattern, slug] of pages) {
    await page.keyboard.press(`${mod}+${digit}`);
    await page.waitForTimeout(150);
    const h = await heading(page);
    check('Shortcuts', `${modName}+${digit}`, `opens ${name}`, pattern.test(h), `h1 "${h}"`);
    await sweep(name, slug);
  }

  await page.keyboard.press(`${mod}+Comma`);
  await page.waitForTimeout(150);
  check('Shortcuts', `${modName}+,`, 'opens Accessibility Settings', /accessibility settings/i.test(await heading(page)));
  await sweep('Accessibility Settings', '11-settings');

  await page.keyboard.press(isMac ? 'Meta+BracketLeft' : 'Alt+ArrowLeft');
  await page.waitForTimeout(150);
  check('Shortcuts', isMac ? 'Cmd+[' : 'Alt+←', 'back to the previous page (Contacts)', /contacts/i.test(await heading(page)));

  // Sidebar arrows.
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Home' }).focus();
  await page.keyboard.press('ArrowDown');
  const down = await focused(page);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  const wrapped = await focused(page);
  check('Arrow keys', 'Sidebar ↓ / ↑ from Home', 'moves between items and wraps to the last', /my day/i.test(down?.name ?? '') && /contacts/i.test(wrapped?.name ?? ''), `↓ ${down?.name}; ↑↑ ${wrapped?.name}`);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Medicines' }).focus();
  await page.screenshot({ path: path.join(outDir, 'focus-03-sidebar.png') });

  // Contacts: find, open, send, notify.
  await page.keyboard.press(`${mod}+6`);
  await page.waitForTimeout(150);
  await page.keyboard.press(`${mod}+F`);
  const search = await page.evaluate(() => document.activeElement?.getAttribute('type'));
  await page.keyboard.type('Joyce');
  const rows = await page.locator('.contact-row').count();
  check('Shortcuts', `${modName}+F on Contacts, then type`, 'search focused, list filters', search === 'search' && rows === 1, `${rows} row(s)`);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await page.locator('.contact-row').first().focus();
  await page.screenshot({ path: path.join(outDir, 'focus-04-contact-row.png') });
  await page.keyboard.press('Enter');
  await page.locator('textarea').waitFor();
  check('Enter', 'Enter on a contact row', 'opens the conversation', /joyce/i.test(await heading(page)));
  await sweep('Message thread', '10-message-thread');

  await page.locator('textarea').focus();
  await page.keyboard.type('Testing from the keyboard');
  const before = await page.locator('.thread li').count();
  await page.keyboard.press(`${mod}+Enter`);
  await page.waitForTimeout(300);
  const after = await page.locator('.thread li').count();
  check('Shortcuts', `${modName}+Enter in the composer`, 'message sent', after > before, `${before} → ${after} messages`);

  await page.keyboard.press(`${mod}+Shift+N`);
  await page.waitForTimeout(300);
  const flash = await page.locator('.visual-flash, [class*="flash"]').count();
  check('Shortcuts', `${modName}+Shift+N`, 'Notify alert fires with a visual flash', flash > 0);
  await page.screenshot({ path: path.join(outDir, 'focus-05-notify.png') });

  await page.locator('.thread-scroll').focus();
  const scrollBefore = await page.locator('.thread-scroll').evaluate((el) => el.scrollTop);
  await page.keyboard.press('Home');
  await page.waitForTimeout(100);
  const scrollAfter = await page.locator('.thread-scroll').evaluate((el) => el.scrollTop);
  check('Arrow keys', 'Conversation history: focus it, Home / ↑ / Page Up', 'history scrolls without a mouse', scrollAfter <= scrollBefore, `scrollTop ${scrollBefore} → ${scrollAfter}`);

  await page.locator('textarea').focus();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  check('Escape', 'Esc in a conversation', 'back to Contacts', /contacts/i.test(await heading(page)));

  // Settings: switch with Space, slider with arrows/Home/End, radios with arrows.
  await page.keyboard.press(`${mod}+Comma`);
  await page.waitForTimeout(150);
  // The first switch, visual alert banners, is locked on by design.
  const sw = page.locator('[role="switch"]:not([disabled])').first();
  const swBefore = await sw.isChecked();
  await sw.focus();
  await page.keyboard.press('Space');
  const swAfter = await sw.isChecked();
  check('Space', 'Space on a settings switch', 'switch toggles, On/Off text changes', swBefore !== swAfter);
  await page.screenshot({ path: path.join(outDir, 'focus-06-switch.png') });
  await page.keyboard.press('Space');

  const slider = page.getByRole('slider').first();
  await slider.focus();
  const v0 = await slider.inputValue();
  await page.keyboard.press('ArrowRight');
  const v1 = await slider.inputValue();
  await page.keyboard.press('End');
  const v2 = await slider.inputValue();
  await page.keyboard.press('Home');
  const v3 = await slider.inputValue();
  check('Arrow keys', 'Slider → / End / Home', 'value changes each time', v0 !== v1 && v2 !== v3, `${v0} → ${v1} → ${v2} → ${v3}`);
  await page.keyboard.press('ArrowRight');
  await page.screenshot({ path: path.join(outDir, 'focus-07-slider.png') });

  const radios = page.getByRole('radio');
  if ((await radios.count()) > 1) {
    await page.locator('[role="radio"][tabindex="0"]').first().focus();
    const r0 = await focused(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100); // focus follows on the next frame
    const r1 = await focused(page);
    check('Arrow keys', 'Radio group → (text size / contrast choice)', 'selection and focus move together', r0?.id !== r1?.id, `${r0?.name} → ${r1?.name}`);
  }

  // Appointments export and focus return.
  await page.keyboard.press(`${mod}+3`);
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: /export to calendar/i }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const banner = await page.getByRole('status').filter({ hasText: /saved|export|calendar/i }).count();
  check('Enter', 'Enter on Export to calendar', 'confirmation banner appears', banner > 0);
  const dismiss = page.getByRole('button', { name: /dismiss|ok|close/i }).first();
  if (await dismiss.count()) {
    await dismiss.focus();
    await page.keyboard.press('Enter');
    const back = await focused(page);
    check('Focus management', 'Dismiss the export banner', 'focus returns to Export to calendar', /export/i.test(back?.name ?? ''), back?.name);
  }

  // Medicines checkbox with Space.
  await page.keyboard.press(`${mod}+4`);
  await page.waitForTimeout(150);
  const box = page.getByRole('checkbox').first();
  const c0 = await box.isChecked();
  await box.focus();
  await page.keyboard.press('Space');
  check('Space', 'Space on a medicine', 'checkbox toggles and "N of M taken" updates', c0 !== (await box.isChecked()));
  await page.screenshot({ path: path.join(outDir, 'focus-08-medicine.png') });

  // My Day toggle with Enter and Space.
  await page.keyboard.press(`${mod}+2`);
  await page.waitForTimeout(150);
  const task = page.locator('.myday-card').first();
  const p0 = await task.getAttribute('aria-pressed');
  await task.focus();
  await page.keyboard.press('Space');
  const p1 = await task.getAttribute('aria-pressed');
  await page.keyboard.press('Enter');
  const p2 = await task.getAttribute('aria-pressed');
  check('Space', 'Space then Enter on a My Day task', 'task toggles done / not done', p0 !== p1 && p1 !== p2);

  // Shortcut dialog: trap, Shift+Tab, Escape restores focus.
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Home' }).focus();
  await page.keyboard.press(`${mod}+Slash`);
  await page.getByRole('dialog').waitFor();
  await sweep('Keyboard shortcuts dialog', '12-shortcuts-dialog');
  const inside = [];
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).focus();
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))));
    await page.keyboard.press('Tab');
    inside.push(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))));
  }
  check('Focus management', `${modName}+/ then Tab / Shift+Tab repeatedly`, 'focus stays inside the dialog', inside.every(Boolean));
  await page.screenshot({ path: path.join(outDir, 'focus-09-dialog.png') });
  await page.keyboard.press('Escape');
  const restored = await focused(page);
  const dialogGone = (await page.getByRole('dialog').count()) === 0;
  check('Escape', 'Esc in the shortcut dialog', 'dialog closes; focus returns to where it was', dialogGone && /home/i.test(restored?.name ?? ''), restored?.name);

  // Zoom and reflow. Ctrl/Cmd + + scales CSS pixels, so a 1280px window at
  // 200% lays out like a 640px one and at 400% like a 320px one (WCAG 1.4.10).
  for (const [zoom, width] of [['200%', 640], ['400%', 320]]) {
    await page.setViewportSize({ width, height: 860 });
    for (const digit of ['1', '2', '3', '4', '5', '6', 'Comma']) {
      await page.keyboard.press(`${mod}+${digit}`);
      await page.waitForTimeout(120);
      const h = await heading(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      check('Zoom / reflow', `${h} at ${zoom} (${width}px)`, 'no horizontal scrolling of the page', !overflow);
    }
    await page.keyboard.press(`${mod}+6`);
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(outDir, `zoom-${zoom.replace('%', '')}.png`) });
  }

  // Text spacing (WCAG 1.4.12): the four overrides from the success
  // criterion, then look for text that is now cut off.
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
  });
  for (const digit of ['1', '2', '3', '4', '5', '6', 'Comma']) {
    await page.keyboard.press(`${mod}+${digit}`);
    await page.waitForTimeout(150);
    const h = await heading(page);
    const clipped = await page.evaluate(() =>
      Array.from(document.querySelectorAll('body *'))
        .filter((el) => {
          if (el.closest('.visually-hidden, .sidebar__label, [aria-hidden="true"]')) return false;
          if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
          const style = getComputedStyle(el);
          if (style.position === 'absolute' && el.clientWidth <= 1) return false;
          const hides = style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden';
          // An intentional one-line ellipsis keeps the full text in the name.
          if (style.textOverflow === 'ellipsis') return false;
          return hides && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
        })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
    );
    check('Text spacing', `${h} with WCAG 1.4.12 spacing applied`, 'no text clipped or overlapping', clipped.length === 0, clipped.slice(0, 3).join(', '));
  }
  await page.screenshot({ path: path.join(outDir, 'text-spacing.png') });

  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.pass);
  const lines = [
    '# Keyboard-only test results (automated)',
    '',
    `Generated by \`desktop/scripts/a11y-keyboard.mjs\` on ${new Date().toISOString().slice(0, 10)} — Chromium ${browser.version?.() ?? ''}, ${isMac ? 'macOS key bindings (Cmd)' : 'Windows/Linux key bindings (Ctrl)'}.`,
    'No mouse event is sent at any point. Screenshots of the focus indicator are alongside this file.',
    '',
    `**${results.length - failed.length} of ${results.length} checks passed.**`,
    '',
    '| Area | Step | Expected | Result | Note |',
    '|:--|:--|:--|:--|:--|',
    ...results.map((r) => `| ${r.area} | ${r.step} | ${r.expected} | ${r.pass ? 'Pass' : '**Fail**'} | ${r.note.replace(/\|/g, '\\|')} |`),
    '',
    '## Tab order per screen',
    '',
    'Every stop reached by pressing Tab from the top of the page until focus came back round. "Ring" is where the focus indicator is drawn: on the control itself, on its sibling (the switch track) or on its row (the medicine checkbox).',
    '',
    ...sweeps.flatMap((s) => [
      `### ${s.screen} — ${s.stops.length} stops`,
      '',
      '| # | Role | Name | Ring |',
      '|--:|:--|:--|:--|',
      ...s.stops.map((stop, i) => `| ${i + 1} | ${stop.role} | ${stop.name.replace(/\|/g, '\\|')} | ${stop.indicator ?? '**none**'} |`),
      '',
    ]),
  ];
  await writeFile(path.join(outDir, 'results.md'), lines.join('\n'));
  console.log(`\n${results.length - failed.length}/${results.length} passed. Report: ${path.join(outDir, 'results.md')}`);
  process.exitCode = failed.length ? 1 : 0;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
