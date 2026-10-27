/**
 * PWA evidence for the Week 11 write-up: installability as Chrome reports
 * it, the manifest's icons and shortcuts, the in-app install banner, a real
 * installation through the browser, and the app working offline.
 *
 *   npm run build && npx vite preview --port 4180    # terminal 1
 *   node scripts/week11-pwa-evidence.mjs             # terminal 2
 *
 * Opens a visible Chromium window: installing a web app needs a headed
 * browser. The app is uninstalled again at the end, and on macOS the script
 * checks that the app bundle Chromium created is gone.
 *
 * Writes docs/web/week11/pwa/screenshots/.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs/web/week11/pwa/screenshots');
const base = (process.env.WEB_URL ?? 'http://localhost:4180').replace(/\/$/, '');
const manifestId = `${base}/`;
const user = { id: 'u', name: 'Margaret Whitfield', email: 'margaret@example.com' };
const demoTime = new Date();
demoTime.setHours(9, 45, 0, 0);

await mkdir(out, { recursive: true });
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const browser = await chromium.launch({ headless: false });

/** A dark, terminal-style card listing what was checked. */
async function report(file, title, lines, extraHtml = '') {
  const page = await browser.newPage({ viewport: { width: 1100, height: 400 } });
  const body = lines
    .map((l) => (Array.isArray(l) ? `<span style="color:#9fb3c8">${escape(l[0])}</span> ${escape(l[1])}` : escape(l)))
    .join('\n');
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#1e1e1e;color:#e6e6e6;font:14px/1.45 Menlo,Consolas,monospace">
    <div style="padding:18px"><b style="color:#6cb6ff">${escape(title)}</b>${extraHtml}<pre style="margin:12px 0 0;white-space:pre-wrap">${body}</pre></div></body></html>`);
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  await page.close();
}

async function signedIn(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(demoTime);
  await page.goto(`${base}/`);
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem('careconnect_session', s);
  }, JSON.stringify({ user, role: 'patient' }));
  await page.goto(`${base}/app`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the service worker
  await page.locator('h1').first().waitFor();
  await page.waitForTimeout(800);
  return { ctx, page };
}

// ── 1. Installability, as Chrome itself reports it ────────────────────────────
// In a normal (persistent) profile: Playwright's other contexts count as
// incognito, where Chrome never offers to install ("in-incognito").
const profileDir = path.join(os.tmpdir(), `careconnect-pwa-${Date.now()}`);
const profile = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1280, height: 800 },
});
const page = profile.pages()[0] ?? (await profile.newPage());
await page.goto(`${base}/`);
await page.evaluate((s) => localStorage.setItem('careconnect_session', s), JSON.stringify({ user, role: 'patient' }));
await page.goto(`${base}/app`);
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
await page.locator('h1').first().waitFor();
await page.waitForTimeout(800);
const cdp = await profile.newCDPSession(page);
const { url: manifestUrl, data, errors: manifestErrors } = await cdp.send('Page.getAppManifest');
const manifest = JSON.parse(data);
const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
const { appId } = await cdp.send('Page.getAppId');
const sw = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  const names = await caches.keys();
  const counts = await Promise.all(names.map(async (n) => [n, (await (await caches.open(n)).keys()).length]));
  return {
    scope: reg?.scope,
    script: reg?.active?.scriptURL,
    state: reg?.active?.state,
    controlled: Boolean(navigator.serviceWorker.controller),
    counts,
  };
});

await report('01-installability.png', 'Chrome DevTools Protocol — installability of http://localhost:4180 (production build)', [
  ['Page.getInstallabilityErrors', installabilityErrors.length === 0 ? '[]  — no errors: Chrome considers the app installable' : JSON.stringify(installabilityErrors)],
  ['Page.getAppManifest       ', `${manifestUrl}  (parse errors: ${manifestErrors.length})`],
  ['Page.getAppId             ', appId],
  '',
  ['manifest.name             ', manifest.name],
  ['manifest.short_name       ', manifest.short_name],
  ['manifest.id / start_url   ', `${manifest.id}  /  ${manifest.start_url}`],
  ['manifest.display          ', `${manifest.display}  (override: ${manifest.display_override.join(', ')})`],
  ['manifest.theme / background', `${manifest.theme_color}  /  ${manifest.background_color}`],
  ['manifest.icons            ', manifest.icons.map((i) => `${i.type === 'image/svg+xml' ? 'SVG' : i.sizes} (${i.purpose})`).join(' · ')],
  ['manifest.shortcuts        ', manifest.shortcuts.map((s) => `${s.name} → ${s.url}`).join(' · ')],
  '',
  ['service worker            ', `${sw.script}  state: ${sw.state}  scope: ${sw.scope}`],
  ['page controlled by it     ', String(sw.controlled)],
  ['Cache Storage             ', sw.counts.map(([n, c]) => `${n} (${c} entries)`).join(' · ')],
]);
await profile.close();
await rm(profileDir, { recursive: true, force: true });
console.log('✔ installability');

// ── 2. The manifest's icons and shortcuts, as an installer shows them ─────────
{
  const icons = manifest.icons.filter((i) => i.type === 'image/png');
  const p = await browser.newPage({ viewport: { width: 1100, height: 400 } });
  await p.setContent(`<!doctype html><html><body style="margin:0;padding:24px;font:16px system-ui,sans-serif;background:#f7f8fa;color:#1e2631">
    <h1 style="font-size:20px;margin:0 0 4px">manifest.webmanifest — icons and shortcuts</h1>
    <p style="margin:0 0 18px;color:#46505f">"any" icons are drawn as supplied; "maskable" icons are shown inside the circle an Android launcher crops them to.</p>
    <div style="display:flex;gap:28px;align-items:flex-end;flex-wrap:wrap">
      ${icons
        .map(
          (i) => `<figure style="margin:0;text-align:center">
            <img src="${base}${i.src}" width="${i.sizes.startsWith('512') ? 160 : 96}" style="${i.purpose === 'maskable' ? 'border-radius:50%' : ''};display:block;margin:0 auto 6px">
            <figcaption style="font-size:13px">${i.sizes} · ${i.purpose}</figcaption></figure>`,
        )
        .join('')}
      <figure style="margin:0;text-align:center"><div style="width:96px;height:96px;border-radius:12px;background:${manifest.theme_color}"></div>
        <figcaption style="font-size:13px">theme ${manifest.theme_color}</figcaption></figure>
    </div>
    <h2 style="font-size:16px;margin:20px 0 6px">Shortcuts (right-click the installed app's icon)</h2>
    <ul style="margin:0">${manifest.shortcuts.map((s) => `<li>${s.name} — ${s.url}</li>`).join('')}</ul>
  </body></html>`);
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(out, '02-manifest-icons.png'), fullPage: true });
  await p.close();
  console.log('✔ icons');
}

// ── 3. The in-app install banner ──────────────────────────────────────────────
// Chrome fires beforeinstallprompt only after its own engagement checks, which
// an automated session does not pass, so the event is dispatched here with the
// same shape Chrome gives it. The banner's code path is the real one.
async function showBanner(p) {
  await p.evaluate(() => {
    localStorage.removeItem('careconnect_install_dismissed_until');
    const e = new Event('beforeinstallprompt');
    e.prompt = async () => {};
    e.userChoice = Promise.resolve({ outcome: 'dismissed' });
    window.dispatchEvent(e);
  });
  await p.getByRole('region', { name: 'Install CareConnect' }).waitFor();
}
const { ctx, page: app } = await signedIn(1280, 800);
await showBanner(app);
await app.getByRole('button', { name: 'Install', exact: true }).focus();
await app.screenshot({ path: path.join(out, '03-install-banner-desktop.png') });
{
  const phone = await signedIn(375, 812);
  await showBanner(phone.page);
  await phone.page.screenshot({ path: path.join(out, '03b-install-banner-mobile.png') });
  await phone.ctx.close();
}
console.log('✔ banner');

// ── 4. Install for real, through the browser, then uninstall ──────────────────
{
  const bcdp = await browser.newBrowserCDPSession();
  await bcdp.send('PWA.install', { manifestId, installUrlOrBundleUrl: `${base}/app` });
  const osState = await bcdp.send('PWA.getOsAppState', { manifestId });
  const { targetId } = await bcdp.send('PWA.launch', { manifestId, url: `${base}/app` });

  const lines = [
    ['PWA.install       ', `{ manifestId: "${manifestId}" } → {}  (installed, no error)`],
    ['PWA.getOsAppState ', `${JSON.stringify(osState)}  (known to the operating system)`],
    ['PWA.launch        ', `→ targetId ${targetId}  (the installed app opened)`],
  ];
  let iconHtml = '';
  const bundle = path.join(os.homedir(), 'Applications/Chromium Apps.localized/CareConnect.app');
  if (process.platform === 'darwin' && existsSync(bundle)) {
    const plist = JSON.parse(
      spawnSync('plutil', ['-convert', 'json', '-o', '-', path.join(bundle, 'Contents/Info.plist')], { encoding: 'utf8' }).stdout,
    );
    lines.push(
      '',
      'macOS app bundle created by the install:',
      ['  path                 ', bundle.replace(os.homedir(), '~')],
      ['  CFBundleName         ', plist.CFBundleName],
      ['  CFBundlePackageType  ', `${plist.CFBundlePackageType}  (an application)`],
      ['  CrAppModeShortcutURL ', plist.CrAppModeShortcutURL],
      ['  CFBundleIdentifier   ', plist.CFBundleIdentifier],
    );
    const png = path.join(os.tmpdir(), 'careconnect-app-icon.png');
    spawnSync('sips', ['-s', 'format', 'png', path.join(bundle, 'Contents/Resources/app.icns'), '--out', png]);
    if (existsSync(png)) {
      iconHtml = `<div style="margin-top:12px;display:flex;align-items:center;gap:14px"><img src="data:image/png;base64,${readFileSync(png).toString('base64')}" width="96" height="96"><span>The app icon macOS shows for CareConnect.app (made from the manifest's icons)</span></div>`;
    }
  }

  await new Promise((r) => setTimeout(r, 1500));
  await bcdp.send('PWA.uninstall', { manifestId });
  await new Promise((r) => setTimeout(r, 1500));
  lines.push('', ['PWA.uninstall     ', '→ {}  (removed again after the evidence was taken)']);
  if (process.platform === 'darwin') lines.push(['  app bundle still on disk', String(existsSync(bundle))]);

  await report('04-installed.png', 'Installing CareConnect through Chromium 148 (Chrome DevTools Protocol, headed browser)', lines, iconHtml);
  console.log('✔ install');
}

// ── 5. Offline ────────────────────────────────────────────────────────────────
// Visit the memory book online first, so its photos are in the cache.
await app.goto(`${base}/app/memories`);
await app.locator('h1').first().waitFor();
for (const img of await app.locator('main img').all()) await img.scrollIntoViewIfNeeded();
await app.waitForLoadState('networkidle');
await app.evaluate(() => window.scrollTo(0, 0));

await ctx.setOffline(true);
await app.goto(`${base}/app`);
await app.locator('h1').first().waitFor();
await app.getByText('Offline · changes will sync when you reconnect').waitFor();
await app.screenshot({ path: path.join(out, '05-offline-home.png') });
await app.goto(`${base}/app/memories`);
await app.locator('h1').first().waitFor();
await app.waitForTimeout(500);
await app.screenshot({ path: path.join(out, '06-offline-memories.png') });
await app.goto(`${base}/app/contacts/c1`);
await app.locator('h1').first().waitFor();
await app.getByRole('textbox', { name: 'Message Joyce' }).fill('Written with no connection');
await app.getByTestId('composer-send').click();
await app.screenshot({ path: path.join(out, '07-offline-message-queued.png') });
await ctx.setOffline(false);
await app.getByText('Online · synced just now').waitFor();
await app.screenshot({ path: path.join(out, '08-back-online-sent.png') });
console.log('✔ offline');

await browser.close();
console.log('done');
