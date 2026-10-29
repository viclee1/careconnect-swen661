/**
 * Lighthouse accessibility score for every web route, mobile and desktop.
 *
 * Runs Lighthouse's accessibility category against the production build,
 * signed in as the care recipient or the caregiver as each route needs, in
 * Playwright's Chromium. A persistent profile carries the seeded session into
 * the tab Lighthouse opens, and storage reset is off so it stays signed in.
 *
 *   npm run build && npm run preview -- --port 5180   # terminal 1
 *   npm run a11y:lighthouse                            # terminal 2
 *
 * Writes docs/web/accessibility/lighthouse/ (summary.json, summary.md).
 * Exits non-zero if any route scores below 100.
 */
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../docs/web/accessibility/lighthouse');
const base = (process.env.WEB_URL ?? 'http://localhost:5180').replace(/\/$/, '');
const port = 9333;

const user = { id: 'user_audit', name: 'Margaret Whitfield', email: 'margaret@example.com' };

/** [label, path, session role or null for signed out] — as in web-a11y-audit.mjs */
const pages = [
  ['Landing', '/', null],
  ['Sign in', '/signin', null],
  ['Sign up', '/signup', null],
  ['Role chooser', '/role', 'none'],
  ['Home (patient)', '/app', 'patient'],
  ['My Day', '/app/schedule', 'patient'],
  ['Appointments', '/app/appointments', 'patient'],
  ['Medicines', '/app/medications', 'patient'],
  ['Memories', '/app/memories', 'patient'],
  ['Contacts', '/app/contacts', 'patient'],
  ['Conversation', '/app/contacts/c3', 'patient'],
  ['Accessibility Settings', '/app/settings', 'patient'],
  ['Caregiver dashboard', '/app', 'caregiver'],
  ['Manage medications', '/app/manage-medications', 'caregiver'],
  ['Manage appointments', '/app/manage-appointments', 'caregiver'],
  ['Activity log', '/app/activity', 'caregiver'],
  ['Caregiver notes', '/app/caregiver', 'caregiver'],
];

const formFactors = {
  mobile: { extends: 'lighthouse:default', settings: { throttlingMethod: 'provided' } },
  desktop: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttlingMethod: 'provided',
    },
  },
};

async function run() {
  await mkdir(outDir, { recursive: true });
  const profile = await mkdtemp(path.join(os.tmpdir(), 'careconnect-lh-'));
  const context = await chromium.launchPersistentContext(profile, { args: [`--remote-debugging-port=${port}`] });
  const results = [];

  for (const [label, pagePath, role] of pages) {
    // Seed storage from a static file: Landing clears the session on mount.
    const seed = await context.newPage();
    await seed.goto(`${base}/icons/icon-192.png`);
    await seed.evaluate((s) => {
      localStorage.clear();
      if (s) localStorage.setItem('careconnect_session', s);
    }, role === null ? null : JSON.stringify({ user, role: role === 'none' ? null : role }));
    await seed.close();

    for (const [formFactor, config] of Object.entries(formFactors)) {
      const { lhr } = await lighthouse(
        `${base}${pagePath}`,
        { port, onlyCategories: ['accessibility'], disableStorageReset: true, logLevel: 'error' },
        config,
      );
      const category = lhr.categories.accessibility;
      const failed = category.auditRefs
        .filter((ref) => ref.weight > 0 && lhr.audits[ref.id].score !== null && lhr.audits[ref.id].score < 1)
        .map((ref) => ref.id);
      const landed = new URL(lhr.finalDisplayedUrl).pathname;
      const score = Math.round(category.score * 100);
      results.push({ page: label, path: pagePath, formFactor, score, failed, landed });
      console.log(`${score === 100 && landed === pagePath ? '✔' : '✘'} ${String(score).padStart(3)} ${formFactor.padEnd(7)} ${label}${landed === pagePath ? '' : ` (landed on ${landed})`}${failed.length ? ` — ${failed.join(', ')}` : ''}`);
    }
  }

  await context.close();
  await rm(profile, { recursive: true, force: true });

  const below = results.filter((r) => r.score < 100 || r.landed !== r.path);
  const summary = {
    engine: `Lighthouse ${JSON.parse(await readFile(path.resolve(here, '../node_modules/lighthouse/package.json'), 'utf8')).version}`,
    date: new Date().toISOString(),
    runs: results.length,
    perfect: results.length - below.length,
    results,
  };
  await writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  const rows = pages.map(([label, pagePath]) => {
    const score = (ff) => results.find((r) => r.page === label && r.path === pagePath && r.formFactor === ff)?.score;
    return `| ${label} | \`${pagePath}\` | ${score('mobile')} | ${score('desktop')} |`;
  });
  await writeFile(
    path.join(outDir, 'summary.md'),
    `# Lighthouse accessibility scores\n\n${summary.engine} · accessibility category · production build · ${summary.date.slice(0, 10)}\n\n` +
      `**${summary.perfect} of ${summary.runs} runs score 100.** Regenerate with \`npm run a11y:lighthouse\` (see the script header).\n\n` +
      `| Page | Route | Mobile | Desktop |\n|:--|:--|--:|--:|\n${rows.join('\n')}\n`,
  );
  console.log(`\n${summary.perfect}/${summary.runs} runs scored 100.`);
  process.exitCode = below.length === 0 ? 0 : 1;
}

run();
