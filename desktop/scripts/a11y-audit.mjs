/**
 * Assignment 9 automated accessibility audit.
 *
 * Drives the renderer in Chromium against the Vite dev server and runs
 * axe-core — the engine inside the axe DevTools extension — over every screen,
 * with the WCAG 2.0/2.1 A and AA rule sets plus axe's best practices. Every
 * screen is reached with the keyboard only, so the run doubles as a keyboard
 * smoke test.
 *
 *   npm run dev:renderer      # in one terminal
 *   npm run a11y:audit        # in another
 *
 * Writes `../docs/accessibility/axe/` — one JSON per screen, `summary.json`,
 * an HTML report and a screenshot of the report. Exits non-zero if any screen
 * has a violation.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../docs/accessibility/axe');
const baseUrl = process.env.A11Y_URL ?? 'http://localhost:5273/';
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

/**
 * Settles the contrast checks axe marks "needs review".
 *
 * axe samples the pixels behind text, so text a scroll edge or the status bar
 * overlaps comes back undecided. Here the text colour is measured against the
 * nearest opaque background in its own ancestry — what is behind it once it is
 * scrolled into view — with the WCAG relative-luminance formula. Text inside an
 * aria-hidden decoration, or with no letters, is reported but not scored.
 */
function resolveContrast(selectors) {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  return selectors.map((selector) => {
    const el = document.querySelector(selector);
    if (!el) return { selector, result: 'not found' };
    const style = getComputedStyle(el);
    const fg = parse(style.color);
    let bg = null;
    for (let node = el; node; node = node.parentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a >= 1) {
        bg = c;
        break;
      }
    }
    bg ??= { r: 255, g: 255, b: 255, a: 1 };
    const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(style.fontSize);
    const bold = Number(style.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const decorative = Boolean(el.closest('[aria-hidden="true"]')) || !/[\p{L}\p{N}]/u.test(el.textContent ?? '');
    const needed = decorative ? 3 : large ? 3 : 4.5;
    return {
      selector,
      text: (el.textContent ?? '').trim().slice(0, 40),
      ratio: Math.round(ratio * 100) / 100,
      needed,
      decorative,
      pass: ratio >= needed,
    };
  });
}

/** Tabs until the focused element's accessible text matches, then presses Enter. */
async function tabTo(page, pattern, { max = 60, key = 'Enter' } = {}) {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const el = document.activeElement;
      return `${el?.getAttribute('aria-label') ?? ''} ${el?.textContent ?? ''}`.trim();
    });
    if (pattern.test(label)) {
      if (key) await page.keyboard.press(key);
      return;
    }
  }
  throw new Error(`Never reached ${pattern} by Tab`);
}

const screens = [
  { id: 'splash', name: 'Splash', go: async () => {} },
  {
    id: 'sign-in-errors',
    name: 'Sign In — validation errors shown',
    go: async (page) => {
      await tabTo(page, /^Sign in$/);
      await tabTo(page, /^Sign in$/); // submit the empty form
    },
  },
  {
    id: 'sign-up',
    name: 'Sign Up',
    go: async (page) => {
      await tabTo(page, /^Sign up$/);
    },
  },
  {
    id: 'home',
    name: 'Home',
    go: async (page) => {
      await tabTo(page, /^Sign in$/);
      await tabTo(page, /Go to CareConnect homepage/, { key: null });
      await page.keyboard.press('Tab');
      await page.keyboard.type('jordan@example.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('password123');
      await page.keyboard.press('Enter');
      await page.getByRole('heading', { level: 1 }).first().waitFor();
    },
  },
  { id: 'my-day', name: 'My Day', go: (page) => page.keyboard.press(`${mod}+2`) },
  { id: 'appointments', name: 'Appointments', go: (page) => page.keyboard.press(`${mod}+3`) },
  {
    id: 'appointments-exported',
    name: 'Appointments — export banner',
    go: async (page) => {
      await page.getByRole('button', { name: /Export to calendar/ }).focus();
      await page.keyboard.press('Enter');
    },
  },
  { id: 'medicines', name: 'Medicines', go: (page) => page.keyboard.press(`${mod}+4`) },
  { id: 'memories', name: 'Memories', go: (page) => page.keyboard.press(`${mod}+5`) },
  { id: 'contacts', name: 'Contacts', go: (page) => page.keyboard.press(`${mod}+6`) },
  {
    id: 'message-thread',
    name: 'Message thread',
    go: async (page) => {
      await page.locator('.contact-row').first().focus();
      await page.keyboard.press('Enter');
      await page.locator('textarea').first().waitFor();
    },
  },
  {
    id: 'message-notify',
    name: 'Message thread — Notify sent',
    go: async (page) => {
      await page.keyboard.press(`${mod}+Shift+N`);
      await page.waitForTimeout(400);
    },
  },
  { id: 'settings', name: 'Accessibility Settings', go: (page) => page.keyboard.press(`${mod}+Comma`) },
  {
    id: 'shortcuts-dialog',
    name: 'Keyboard shortcuts dialog',
    go: (page) => page.keyboard.press(`${mod}+Slash`),
  },
];

async function run() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch(process.env.A11Y_CHANNEL ? { channel: process.env.A11Y_CHANNEL } : {});
  const results = [];

  for (const [label, viewport] of [
    ['wide', { width: 1280, height: 860 }],
    ['narrow', { width: 900, height: 700 }],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(baseUrl);
    await page.getByRole('heading', { level: 1 }).first().waitFor();

    for (const screen of screens) {
      // Each step starts from wherever the last one left off, as a user would.
      if (screen.id === 'sign-in-errors' || screen.id === 'sign-up' || screen.id === 'home') {
        await page.goto(baseUrl);
        await page.getByRole('heading', { level: 1 }).first().waitFor();
      }
      await screen.go(page);
      await page.waitForTimeout(250);

      // label-content-name-mismatch (WCAG 2.5.3) is experimental in axe, so it is
      // switched on explicitly rather than left out of the scan.
      const axe = await new AxeBuilder({ page })
        .withTags(tags)
        .options({ rules: { 'label-content-name-mismatch': { enabled: true } } })
        .analyze();
      const entry = {
        id: `${label}-${screen.id}`,
        screen: screen.name,
        viewport: `${viewport.width}×${viewport.height}`,
        url: page.url(),
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          tags: v.tags.filter((t) => t.startsWith('wcag')),
          nodes: v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.failureSummary })),
        })),
        passes: axe.passes.length,
        incomplete: axe.incomplete.map((v) => ({
          id: v.id,
          help: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target.join(' '),
            reason: n.any.concat(n.all, n.none).map((c) => c.message).join('; '),
          })),
        })),
      };
      const undecided = axe.incomplete
        .filter((v) => v.id === 'color-contrast')
        .flatMap((v) => v.nodes.map((n) => n.target.join(' ')));
      entry.contrastReview = undecided.length
        ? await page.evaluate(resolveContrast, undecided)
        : [];
      for (const r of entry.contrastReview.filter((c) => c.pass === false)) {
        console.log(`    needs-review contrast FAILS ${r.ratio}:1 (needs ${r.needed}) ${r.selector}`);
      }
      results.push(entry);
      await writeFile(path.join(outDir, `${entry.id}.json`), JSON.stringify(entry, null, 2));
      if (label === 'wide') {
        await page.screenshot({ path: path.join(outDir, `screen-${screen.id}.png`) });
      }

      const count = entry.violations.reduce((sum, v) => sum + v.nodes.length, 0);
      console.log(
        `${count === 0 ? '✔' : '✘'} ${label.padEnd(6)} ${screen.name.padEnd(36)} ` +
          `${entry.violations.length} violations (${count} nodes), ${entry.passes} passing rules`,
      );
      for (const v of entry.violations) {
        console.log(`    ${v.impact} ${v.id}: ${v.help}`);
        for (const n of v.nodes) console.log(`      ${n.target}`);
      }

      if (screen.id === 'shortcuts-dialog') await page.keyboard.press('Escape');
    }
    await context.close();
  }

  const total = results.reduce((sum, r) => sum + r.violations.length, 0);
  const reviewed = results.flatMap((r) => r.contrastReview.map((c) => ({ screen: `${r.screen} (${r.viewport})`, ...c })));
  const reviewFailures = reviewed.filter((c) => c.pass === false).length;
  const summary = {
    engine: `axe-core ${(await import('axe-core')).default.version}`,
    ruleTags: tags,
    date: new Date().toISOString(),
    screensScanned: results.length,
    totalViolations: total,
    contrastNeedsReview: { checked: reviewed.length, failing: reviewFailures },
    results: results.map((r) => ({
      id: r.id,
      screen: r.screen,
      viewport: r.viewport,
      violations: r.violations.length,
      passes: r.passes,
      incomplete: r.incomplete.length,
    })),
  };
  await writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

  const reportPath = path.join(outDir, 'report.html');
  await writeFile(reportPath, renderReport(summary, results, reviewed));
  const reportPage = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await reportPage.goto(`file://${reportPath}`);
  await reportPage.screenshot({ path: path.join(outDir, 'axe-zero-violations.png'), fullPage: true });
  await browser.close();

  console.log(`\n${results.length} screens, ${total} violations. Report: ${reportPath}`);
  console.log(`Needs-review contrast: ${reviewed.length} measured, ${reviewFailures} below threshold.`);
  process.exitCode = total === 0 && reviewFailures === 0 ? 0 : 1;
}

function escape(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function renderReport(summary, results, reviewed) {
  const unique = new Map();
  for (const c of reviewed) unique.set(`${c.selector}|${c.ratio}`, c);
  const reviewRows = [...unique.values()]
    .sort((a, b) => a.ratio - b.ratio)
    .map(
      (c) => `<tr class="${c.pass ? 'pass' : 'fail'}"><td><code>${escape(c.selector)}</code></td><td>${escape(c.text ?? '')}</td>
        <td class="num">${c.ratio ?? '—'}:1</td><td class="num">${c.needed ?? '—'}:1${c.decorative ? ' (non-text)' : ''}</td><td>${c.pass ? 'Pass' : 'Fail'}</td></tr>`,
    )
    .join('');
  const rows = results
    .map(
      (r) => `<tr class="${r.violations.length ? 'fail' : 'pass'}">
        <td>${escape(r.screen)}</td><td>${escape(r.viewport)}</td>
        <td class="num">${r.violations.length}</td><td class="num">${r.passes}</td>
        <td class="num">${r.incomplete.length}</td></tr>`,
    )
    .join('');
  const details = results
    .filter((r) => r.violations.length)
    .map(
      (r) => `<h3>${escape(r.screen)} (${escape(r.viewport)})</h3><ul>${r.violations
        .map((v) => `<li><b>${escape(v.id)}</b> (${escape(v.impact)}): ${escape(v.help)}<br><code>${v.nodes.map((n) => escape(n.target)).join('<br>')}</code></li>`)
        .join('')}</ul>`,
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CareConnect axe report</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;margin:32px;color:#1a1a1a}
h1{margin:0 0 4px}.meta{color:#444;margin-bottom:20px}
.big{font-size:28px;font-weight:700;padding:14px 18px;border-radius:8px;display:inline-block;margin-bottom:20px}
.ok{background:#e6f4ea;color:#0b5d1e;border:2px solid #0b5d1e}.bad{background:#fde8e8;color:#8a1111;border:2px solid #8a1111}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}
th{background:#f2f2f2}.num{text-align:right}.fail td{background:#fde8e8}
</style></head><body>
<h1>CareConnect desktop — axe accessibility scan</h1>
<div class="meta">${escape(summary.engine)} · rules: ${summary.ruleTags.join(', ')} · ${escape(summary.date)}</div>
<div class="big ${summary.totalViolations ? 'bad' : 'ok'}">${summary.totalViolations} violations across ${summary.screensScanned} screen scans</div>
<table><thead><tr><th>Screen</th><th>Viewport</th><th>Violations</th><th>Passing rules</th><th>Needs review</th></tr></thead>
<tbody>${rows}</tbody></table>${details}
<h2>"Needs review" contrast, resolved</h2>
<p class="meta">axe could not sample the background behind these (text under the status bar or a scroll edge, or a symbol with no letters), so each was measured against the nearest opaque background in its own ancestry. ${summary.contrastNeedsReview.checked} measurements, ${summary.contrastNeedsReview.failing} below threshold; unique elements below, lowest ratio first.</p>
<table><thead><tr><th>Element</th><th>Text</th><th>Ratio</th><th>Required</th><th>Result</th></tr></thead><tbody>${reviewRows}</tbody></table>
</body></html>`;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
