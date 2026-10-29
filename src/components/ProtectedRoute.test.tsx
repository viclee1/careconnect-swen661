import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthRoute, ProtectedRoute, RoleRoute } from './ProtectedRoute';
import { AuthProvider } from '../auth/AuthContext';
import { persistSession } from '../auth/mockAuth';

const margaret = { id: 'u1', name: 'Margaret Whitfield', email: 'margaret@example.com' };

/** Each guard wraps a page; the places it may send you to are stand-ins. */
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<h1>Landing</h1>} />
          <Route path="/signin" element={<AuthRoute><h1>Sign in</h1></AuthRoute>} />
          <Route path="/role" element={<RoleRoute><h1>Choose your role</h1></RoleRoute>} />
          <Route path="/app" element={<ProtectedRoute><h1>App</h1></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const heading = () => screen.findByRole('heading', { level: 1 });

beforeEach(() => {
  localStorage.clear();
});

describe('Route guards', () => {
  describe('signed out', () => {
    it.each([
      ['/app', 'Landing'],
      ['/role', 'Landing'],
      ['/signin', 'Sign in'],
    ])('%s shows %s', async (path, page) => {
      renderAt(path);
      expect(await heading()).toHaveTextContent(page);
    });
  });

  describe('signed in, no role chosen yet', () => {
    beforeEach(() => persistSession({ user: margaret, role: null }));

    it.each([
      ['/app', 'Choose your role'],
      ['/role', 'Choose your role'],
      ['/signin', 'Choose your role'],
    ])('%s shows %s', async (path, page) => {
      renderAt(path);
      expect(await heading()).toHaveTextContent(page);
    });
  });

  describe('signed in with a role', () => {
    beforeEach(() => persistSession({ user: margaret, role: 'patient' }));

    it.each([
      ['/app', 'App'],
      ['/role', 'App'],
      ['/signin', 'App'],
    ])('%s shows %s', async (path, page) => {
      renderAt(path);
      expect(await heading()).toHaveTextContent(page);
    });
  });
});
