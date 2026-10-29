import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

// Diagnostic only — not for merging. Records what happens around the tap
// that intermittently fails to select Metformin in mobile Safari on Linux.
test('diagnose the Metformin tap', async ({ page, browserName }) => {
  await signInAsPatient(page, '/app/medications');
  await page.evaluate(() => {
    const log: string[] = [];
    (window as unknown as { __log: string[] }).__log = log;
    const t0 = performance.now();
    const describe = (n: EventTarget | null) => {
      const el = n as HTMLElement | null;
      if (!el || !el.tagName) return String(n);
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} "${(el.textContent ?? '').trim().slice(0, 18)}"`;
    };
    for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'focusin', 'scroll']) {
      document.addEventListener(type, (e) => {
        log.push(`${Math.round(performance.now() - t0)}ms ${type} ${type === 'scroll' ? '' : describe(e.target)} y=${Math.round(scrollY)}`);
      }, true);
    }
    log.push(`scroll-behavior=${getComputedStyle(document.documentElement).scrollBehavior} reduce=${matchMedia('(prefers-reduced-motion: reduce)').matches}`);
  });

  const lisinopril = page.getByRole('checkbox', { name: 'Lisinopril taken' });
  if (browserName === 'webkit') await lisinopril.focus();
  await page.keyboard.press('Space');
  await expect(lisinopril).toBeChecked();
  await page.evaluate(() => (window as unknown as { __log: string[] }).__log.push('--- tap Metformin'));
  await page.getByRole('button', { name: /^Metformin/ }).click();
  await page.waitForTimeout(300);
  const selected = await page.getByRole('heading', { level: 2, name: 'Metformin' }).isVisible();
  const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log);
  console.log(`RESULT selected=${selected}\n${log.join('\n')}`);
});
