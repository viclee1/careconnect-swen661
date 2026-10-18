import { useEffect } from 'react';

const APP_NAME = 'CareConnect';

/**
 * Sets the browser tab title to "<page> — CareConnect".
 *
 * A single-page app keeps one document, so without this every screen shares
 * the title from index.html. Screen readers announce the new title after a
 * route change, and it is what appears in the tab, the history list and a
 * bookmark (WCAG 2.4.2 Page Titled).
 */
export function useDocumentTitle(page: string | null): void {
  useEffect(() => {
    document.title = page ? `${page} — ${APP_NAME}` : `${APP_NAME} — Your Daily Companion`;
  }, [page]);
}
