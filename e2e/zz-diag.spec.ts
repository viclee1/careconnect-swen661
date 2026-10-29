import { expect, test } from '@playwright/test';

import { signInAsPatient } from './helpers';

// Diagnostic only — not for merging. Records what happens around the click
// on the "Pets" filter that intermittently leaves it unchecked in mobile Safari.
test('diagnose the Pets filter click', async ({ page }) => {
  await signInAsPatient(page, '/app/memories');
  const all = page.getByRole('radio', { name: 'All' });
  await expect(all).toBeChecked();
  await all.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Family' })).toBeChecked();
  await expect(page.getByRole('article')).toHaveCount(1);

  await page.evaluate(() => {
    const log: string[] = [];
    (window as unknown as { __log: string[] }).__log = log;
    const t0 = performance.now();
    const describe = (n: EventTarget | null) => {
      const el = n as HTMLElement | null;
      if (!el || !el.tagName) return String(n);
      const v = (el as HTMLInputElement).value;
      return `${el.tagName.toLowerCase()}${v ? `[${v}]` : ''} "${(el.textContent ?? '').trim().slice(0, 12)}"`;
    };
    for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'input', 'change', 'focusin', 'focusout', 'selectstart', 'dblclick', 'touchstart', 'touchend', 'scroll']) {
      document.addEventListener(type, (e) => {
        const checked = (document.querySelector('input[value="pet"]') as HTMLInputElement).checked;
        log.push(`${Math.round(performance.now() - t0)}ms ${type} ${type === 'scroll' ? '' : describe(e.target)} pet=${checked} y=${scrollY.toFixed(1)} mainTop=${document.getElementById('main-content')!.getBoundingClientRect().top.toFixed(1)}`);
      }, true);
    }
    log.push(`scroll-padding-top=${getComputedStyle(document.documentElement).scrollPaddingTop}`);
    new MutationObserver(() => {
      const checked = (document.querySelector('input[value="pet"]') as HTMLInputElement).checked;
      log.push(`${Math.round(performance.now() - t0)}ms render pet=${checked}`);
    }).observe(document.querySelector('fieldset')!, { subtree: true, attributes: true, childList: true });
  });

  await page.getByText('Pets', { exact: true }).click();
  await page.waitForTimeout(300);
  const checked = await page.getByRole('radio', { name: 'Pets' }).isChecked();
  const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log);
  console.log(`RESULT checked=${checked}\n${log.join('\n')}`);
});
