/**
 * The "testing" screenshots for the Week 11 write-ups, made from real runs:
 * each owner's Jest suites, the whole app with coverage, the Playwright run,
 * the HTML coverage report and the Playwright HTML report.
 *
 *   node scripts/week11-testing-evidence.mjs
 *
 * Runs the commands itself (Playwright builds and serves the production
 * build), so it takes a few minutes. Firefox is left out of the Playwright
 * run: it cannot launch on macOS 27 and runs in CI instead.
 *
 * Writes docs/web/week11/{victor,upneet}/screenshots/testing/.
 */
import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFor = (who) => path.join(root, 'docs/web/week11', who, 'screenshots/testing');

const victorSuites = [
  'src/models/__tests__/(contact|message|accessibilitySettings|vibrationPattern|flashCue).test.ts',
  'src/utils/__tests__/(search|validators|formatters|captions|notifications).test.ts',
  'src/pages/(Contacts|MessageThread|AccessibilitySettings|PlaceholderPage).test.tsx',
  'src/context/(MessagesContext|SettingsContext).test.tsx',
  'src/hooks/',
];
const upneetSuites = [
  'src/models/__tests__/(appointment|medicine|memory).test.ts',
  'src/utils/__tests__/(calendar|dates).test.ts',
  'src/pages/(Appointments|Medications|Memories).test.tsx',
  'src/context/CareContexts.test.tsx',
];

/** Runs a command and returns what it printed, colour codes removed. */
function run(label, cmd, args) {
  console.log('…', label);
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', CI: '' } });
  return `${result.stdout}${result.stderr}`.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '');
}

/** Only the lines worth showing: suite results and the summary. */
const jestSummary = (text) =>
  text
    .split('\n')
    .filter((l) => /^\s*(PASS|FAIL)\s|^(Test Suites|Tests|Snapshots|Time):/.test(l))
    .map((l) => l.trim().replace(/\s+\(\d+(\.\d+)? m?s\)$/, ''))
    .join('\n');

/** The coverage table and summary, then the totals. */
const coverageSummary = (text) => {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith('----'));
  return lines
    .slice(start)
    .filter((l) => !/^\s*(PASS|FAIL)\s/.test(l) && !/^\s+●/.test(l))
    .join('\n')
    .trim();
};

/** The Playwright line reporter's results, without the progress noise. */
const playwrightSummary = (text) =>
  text
    .split('\n')
    .filter((l) => /^\s+\d+\) |^\s+\[(chromium|webkit|mobile-safari)\]|^\s+\d+ (passed|failed|skipped|flaky)|^Running/.test(l))
    .join('\n');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const browser = await chromium.launch();

async function terminal(file, title, body) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 400 } });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#1e1e1e">
    <pre style="margin:0;padding:18px;font:14px/1.35 Menlo,Consolas,monospace;color:#e6e6e6;white-space:pre-wrap">` +
    `<b style="color:#6cb6ff">$ ${escape(title)}</b>\n\n${escape(body)}</pre></body></html>`);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

async function htmlPage(file, url, width = 1280, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url);
  await page.waitForTimeout(800);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

for (const who of ['victor', 'upneet']) await mkdir(outFor(who), { recursive: true });

// ── Jest: each owner's suites ─────────────────────────────────────────────────
/**
 * Runs Jest on `suites` and lists each file with its result and test count,
 * then the totals. Read from --json: piped, Jest prints only the totals.
 */
async function jestSuites(label, suites) {
  const file = path.join(os.tmpdir(), `careconnect-jest-${Date.now()}.json`);
  run(label, 'npx', ['jest', '--json', `--outputFile=${file}`, ...suites]);
  const report = JSON.parse(await readFile(file, 'utf8'));
  const rows = report.testResults
    .map((r) => {
      const passed = r.assertionResults.filter((a) => a.status === 'passed').length;
      const status = r.status === 'passed' ? 'PASS' : 'FAIL';
      return `${status}  ${path.relative(root, r.name)}  (${passed}/${r.assertionResults.length} tests)`;
    })
    .sort((a, b) => a.slice(6).localeCompare(b.slice(6)));
  return [
    ...rows,
    '',
    `Test Suites: ${report.numPassedTestSuites} passed, ${report.numTotalTestSuites} total`,
    `Tests:       ${report.numPassedTests} passed, ${report.numFailedTests} failed, ${report.numTotalTests} total`,
  ].join('\n');
}

await terminal(
  path.join(outFor('victor'), '01-jest-victor-suites.png'),
  "npx jest <Victor's suites>",
  await jestSuites("Victor's suites", victorSuites),
);
await terminal(
  path.join(outFor('upneet'), '01-jest-upneet-suites.png'),
  "npx jest <Upneet's suites>",
  await jestSuites("Upneet's suites", upneetSuites),
);

// ── Jest: the whole web app, with coverage (also refreshes coverage/) ─────────
const all = run('whole app with coverage', 'npm', ['run', 'test:coverage']);
const allBody = `${coverageSummary(all)}\n\n${jestSummary(all).split('\n').filter((l) => !/^(PASS|FAIL)/.test(l)).join('\n')}`;
for (const who of ['victor', 'upneet']) {
  await terminal(path.join(outFor(who), '02-jest-all-summary.png'), 'npm run test:coverage (whole web app)', allBody);
}
const coverageIndex = pathToFileURL(path.join(root, 'coverage/lcov-report/index.html')).href;
await htmlPage(path.join(outFor('victor'), '04-coverage-report.png'), coverageIndex);
await htmlPage(path.join(outFor('upneet'), '03-coverage-report.png'), coverageIndex);

// ── Playwright: production build, every project that runs on this machine ────
const e2e = run('Playwright', 'npx', [
  'playwright', 'test', '--project=chromium', '--project=webkit', '--project=mobile-safari', '--reporter=line,html',
]);
await terminal(
  path.join(outFor('victor'), '03-playwright-run.png'),
  'npx playwright test --project=chromium --project=webkit --project=mobile-safari',
  playwrightSummary(e2e),
);
const report = pathToFileURL(path.join(root, 'playwright-report/index.html')).href;
await htmlPage(path.join(outFor('victor'), '05-playwright-html-report.png'), report);
await htmlPage(path.join(outFor('upneet'), '04-playwright-html-report.png'), report);
await htmlPage(path.join(outFor('upneet'), '05-playwright-care-pages.png'), `${report}#?q=care-pages`);

await browser.close();
console.log('done');
