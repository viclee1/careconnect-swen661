import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App, type Repositories } from '../App';
import type { Route } from '../navigation/NavigationProvider';

/**
 * Renders the real application — real providers, real router, real sidebar —
 * with the repositories swapped out.
 *
 * Nothing here stubs a page or a component. The whole point is that a test
 * presses the same buttons a user does, which is the only way a test can say
 * anything useful about whether the application is keyboard-navigable.
 */
export function renderApp(
  options: { repositories?: Repositories; initialRoute?: Route } = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const user = userEvent.setup();
  const initialRoute = options.initialRoute ?? { name: 'Contacts' };
  const result = render(
    <App repositories={options.repositories} initialRoute={initialRoute} />,
  );
  return { ...result, user };
}

/**
 * The elements a keyboard user can Tab to, in document order.
 *
 * Used by the keyboard-navigation tests to assert that a page can be worked
 * through with Tab alone, and that nothing interactive has been left out of the
 * tab order — which is the failure a mouse-driven review never catches.
 */
export function tabbableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.getAttribute('tabindex') !== '-1',
  );
}

/**
 * Installs a fake `window.careconnect`, so the IPC-facing code can be exercised
 * without booting Electron. Returns the spies and a teardown.
 */
export function installBridge(
  overrides: Partial<{
    load: jest.Mock;
    save: jest.Mock;
    clear: jest.Mock;
  }> = {},
) {
  const load = overrides.load ?? jest.fn().mockResolvedValue({});
  const save = overrides.save ?? jest.fn().mockResolvedValue(undefined);
  const clear = overrides.clear ?? jest.fn().mockResolvedValue(undefined);

  let menuHandler: ((command: never) => void) | null = null;

  window.careconnect = {
    settings: { load, save, clear },
    window: {
      getState: jest
        .fn()
        .mockResolvedValue({ width: 1280, height: 840, isMaximized: false }),
    },
    app: {
      getInfo: jest.fn().mockResolvedValue({
        name: 'CareConnect',
        version: '1.0.0',
        electron: '44.0.0',
        chrome: '140.0.0',
        node: '22.0.0',
        platform: 'darwin',
      }),
    },
    onMenuCommand: (handler) => {
      menuHandler = handler as (command: never) => void;
      return () => {
        menuHandler = null;
      };
    },
  };

  return {
    load,
    save,
    clear,
    /** Fires a menu command as the main process would. */
    emitMenuCommand: (command: string) => {
      menuHandler?.(command as never);
    },
    uninstall: () => {
      delete window.careconnect;
    },
  };
}
