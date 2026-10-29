import type { Page } from '@playwright/test';

const user = { id: 'u1', name: 'Margaret Whitfield', email: 'margaret@example.com' };

/** Signs in as the care recipient (sign-in is mocked) and opens `path`. */
export async function signInAsPatient(page: Page, path: string) {
  await page.goto('/');
  await page.evaluate((session) => {
    localStorage.clear();
    localStorage.setItem('careconnect_session', session);
  }, JSON.stringify({ user, role: 'patient' }));
  await page.goto(path);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
}
