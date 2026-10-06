/**
 * Shared test setup.
 *
 * Most of the suite runs under jsdom, but the main-process tests declare
 * `@jest-environment node` because they touch the real filesystem. This file is
 * loaded for both, so everything DOM-shaped is guarded rather than split across
 * two Jest projects for the sake of six lines.
 */
const hasDom = typeof window !== 'undefined';

if (hasDom) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@testing-library/jest-dom');

  /**
   * jsdom implements neither of these, and both are used by the renderer:
   * `matchMedia` backs the reduced-motion check, and `scrollIntoView` is how a
   * conversation jumps to its newest message.
   */
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });

  Element.prototype.scrollIntoView = jest.fn();

  beforeEach(() => {
    window.localStorage.clear();
  });
}
