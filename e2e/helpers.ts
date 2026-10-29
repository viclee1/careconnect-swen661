import type { Page } from '@playwright/test';

const user = { id: 'u1', name: 'Margaret Whitfield', email: 'margaret@example.com' };

/** Signs in as the care recipient (sign-in is mocked) and opens `path`. */
export async function signInAsPatient(page: Page, path: string) {
  // Seed the session before any app code runs. Writing it from a loaded page
  // raced Landing's mount effect, which clears the session — in slower WebKit
  // the effect could land after the write and sign the test back out. The
  // sessionStorage flag seeds once per tab, so a reload keeps the test's state.
  await page.addInitScript((session) => {
    if (sessionStorage.getItem('e2e-session-seeded')) return;
    sessionStorage.setItem('e2e-session-seeded', '1');
    localStorage.clear();
    localStorage.setItem('careconnect_session', session);
  }, JSON.stringify({ user, role: 'patient' }));
  await page.goto(path);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
}
