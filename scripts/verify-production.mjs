// Production PWA verification against the live Vercel deployment.
//   node scripts/verify-production.mjs
//   PROD_URL=https://<preview>.vercel.app node scripts/verify-production.mjs
// Writes screenshots to docs/web/week11/production/.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = (process.env.PROD_URL || 'https://careconnect-swen661.vercel.app').replace(/\/$/, '');
const OUT = 'docs/web/week11/production';
const SESSION = {
  user: { id: 'verify_user', name: 'Margaret Okafor', email: 'margaret@example.com' },
  role: 'patient',
};
mkdirSync(OUT, { recursive: true });

let pass = 0;
let fail = 0;
const check = (ok, label, extra = '') => {
  console.log(`[${ok ? 'ok' : 'FAIL'}] ${label}${extra ? '  ' + extra : ''}`);
  ok ? pass++ : fail++;
};

// ── 1. HTTP: HTTPS, deep links, PWA files served with the right types ──────────
for (const [path, type] of [
  ['/', 'text/html'],
  ['/app', 'text/html'],
  ['/app/contacts', 'text/html'],
  ['/app/settings', 'text/html'],
  ['/manifest.webmanifest', 'application/manifest+json'],
  ['/sw.js', 'javascript'],
  ['/icons/icon-512.png', 'image/png'],
  ['/icons/maskable-512.png', 'image/png'],
]) {
  const res = await fetch(BASE + path);
  const ct = res.headers.get('content-type') || '';
  check(res.ok && ct.includes(type), `GET ${path}`, `${res.status} ${ct}`);
}
const root = await fetch(BASE + '/');
check(BASE.startsWith('https://') && !!root.headers.get('strict-transport-security'), 'served over HTTPS with HSTS');
check(
  (await fetch(BASE + '/sw.js')).headers.get('cache-control')?.includes('max-age=0'),
  'sw.js is not long-cached (updates reach users)',
);

// ── 2. In the browser: manifest, service worker, offline ───────────────────────
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/01-landing-live.png` });

const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href');
const manifest = await page.evaluate(async (h) => (await fetch(h)).json(), manifestHref);
check(manifest.name === 'CareConnect' && manifest.display === 'standalone', 'manifest: name + standalone');
check(manifest.start_url === '/app' && manifest.scope === '/', 'manifest: start_url /app, scope /');
check(
  manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable') &&
    manifest.icons.some((i) => i.sizes === '192x192'),
  'manifest: 192 + 512 maskable icons',
);
for (const icon of manifest.icons) {
  const ok = await page.evaluate(async (s) => (await fetch(s)).ok, icon.src);
  check(ok, `icon loads ${icon.src}`);
}

const sw = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  return { active: !!reg.active, scope: reg.scope, script: reg.active?.scriptURL };
});
check(sw.active && sw.scope === BASE + '/', 'service worker active', sw.script);

// Chrome's own installability check (what decides whether "Install" is offered).
const cdp = await context.newCDPSession(page);
const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
const { errors: manifestErrors } = await cdp.send('Page.getAppManifest');
check(installabilityErrors.length === 0, 'Chromium: installable', JSON.stringify(installabilityErrors));
check(manifestErrors.length === 0, 'Chromium: manifest has no errors', JSON.stringify(manifestErrors));

// Sign in (mock session), then reload so the SW controls the page and caches the app.
await page.evaluate((s) => localStorage.setItem('careconnect_session', JSON.stringify(s)), SESSION);
await page.goto(BASE + '/app', { waitUntil: 'networkidle' });
const appLoads = await page.locator('text=/Next thing to do/i').first().isVisible().catch(() => false);
check(appLoads, 'start_url /app opens Home directly');
check(await page.evaluate(() => !!navigator.serviceWorker.controller), 'page controlled by the service worker');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/02-home-live.png` });

const cached = await page.evaluate(async () => {
  const keys = await caches.keys();
  let n = 0;
  for (const k of keys) n += (await (await caches.open(k)).keys()).length;
  return { keys, n };
});
check(cached.keys.some((k) => k.startsWith('careconnect-shell')) && cached.n > 5, 'caches populated', `${cached.keys.join(', ')} (${cached.n} entries)`);

await context.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
await page.waitForTimeout(1500);
const offlineHome = await page.locator('text=/Next thing to do/i').first().isVisible().catch(() => false);
check(offlineHome, "offline: Home and today's schedule still render");
const offlineStatus = await page.locator('text=/offline/i').first().isVisible().catch(() => false);
check(offlineStatus, 'offline: status bar says the app is offline');
await page.screenshot({ path: `${OUT}/03-home-offline.png` });
await context.setOffline(false);

check(errors.length === 0, 'no uncaught page errors', errors.join(' | '));

// ── 3. Phone width, the size most care recipients will install it at ──────────
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
await phone.addInitScript((s) => localStorage.setItem('careconnect_session', JSON.stringify(s)), SESSION);
const pp = await phone.newPage();
await pp.goto(BASE + '/app', { waitUntil: 'networkidle' });
await pp.waitForTimeout(800);
await pp.screenshot({ path: `${OUT}/04-home-phone-live.png` });

await browser.close();
console.log(`\n${fail === 0 ? 'ALL PRODUCTION CHECKS PASSED' : fail + ' PRODUCTION CHECK(S) FAILED'} (${pass} ok) — ${BASE}`);
process.exit(fail === 0 ? 0 : 1);
