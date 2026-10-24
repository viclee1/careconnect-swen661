import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '../auth/AuthContext';
import { MessagesProvider } from '../context/MessagesContext';
import { SettingsProvider } from '../context/SettingsContext';

const standIns: Array<[string, string]> = [
  ['/app/contacts', 'Contacts list'],
  ['/app/contacts/:contactId', 'Conversation page'],
  ['/app/settings', 'Settings page'],
];

/**
 * Renders `ui` at `path` inside the settings and messages providers, with a
 * router that also mounts stand-in pages for the places the screens link to,
 * so a test can assert that a link or Escape actually navigated.
 */
export function renderWithProviders(ui: ReactElement, { path = '/', route = '*' } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <SettingsProvider>
          <MessagesProvider>
            <Routes>
              <Route path={route} element={ui} />
              {standIns
                .filter(([standInPath]) => standInPath !== route)
                .map(([standInPath, heading]) => (
                  <Route key={standInPath} path={standInPath} element={<h1>{heading}</h1>} />
                ))}
            </Routes>
          </MessagesProvider>
        </SettingsProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}
