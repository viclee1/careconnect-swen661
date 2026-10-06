import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import type { MenuCommand } from '../../shared/ipc';
import { bridge, isMacPlatform } from './bridge';
import { commandForEvent } from './keyboard';

export interface CommandValue {
  /** Runs the handler registered for a command, if any. Returns whether it ran. */
  dispatch: (command: MenuCommand) => boolean;
  /** Registers a handler. Returns the unregister function. */
  register: (command: MenuCommand, handler: () => void) => () => void;
}

const CommandContext = createContext<CommandValue | null>(null);

/**
 * One place where a command becomes an action.
 *
 * A command can arrive three ways — the native menu over IPC, a key press in
 * the window, or a click in the UI — and all three land here, so a menu item
 * and its accelerator and its button can never do three different things.
 *
 * Handlers are kept as a stack per command and the most recently registered one
 * wins. That is what lets "Send message" mean the composer that is currently on
 * screen without any page having to know about the others.
 */
export function CommandProvider({ children }: { children: ReactNode }) {
  const handlers = useRef(new Map<MenuCommand, (() => void)[]>());

  const register = useCallback((command: MenuCommand, handler: () => void) => {
    const stack = handlers.current.get(command) ?? [];
    stack.push(handler);
    handlers.current.set(command, stack);

    return () => {
      const current = handlers.current.get(command);
      if (!current) return;
      const index = current.lastIndexOf(handler);
      if (index !== -1) current.splice(index, 1);
      if (current.length === 0) handlers.current.delete(command);
    };
  }, []);

  const dispatch = useCallback((command: MenuCommand) => {
    const stack = handlers.current.get(command);
    if (!stack || stack.length === 0) return false;
    stack[stack.length - 1]();
    return true;
  }, []);

  // The native menu.
  useEffect(() => {
    const api = bridge();
    if (!api) return;
    return api.onMenuCommand((command) => {
      dispatch(command);
    });
  }, [dispatch]);

  // The same shortcuts, bound in the window.
  useEffect(() => {
    const isMac = isMacPlatform();

    const onKeyDown = (event: KeyboardEvent) => {
      const command = commandForEvent(event, isMac);
      if (!command) return;
      // Only swallow the key press when something actually handled it —
      // otherwise Ctrl/Cmd+F on a page with no search box should go on being
      // whatever the platform does with it.
      if (dispatch(command)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  const value = useMemo<CommandValue>(() => ({ dispatch, register }), [dispatch, register]);

  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
}

export function useCommands(): CommandValue {
  const value = useContext(CommandContext);
  if (!value) throw new Error('useCommands must be used inside a CommandProvider');
  return value;
}

/**
 * Handles one command for as long as the calling component is mounted.
 *
 * `enabled` is how a page declines a command it cannot currently service — the
 * conversation's Send handler steps aside when there is no draft to send, and
 * the command falls through to whatever registered it earlier.
 */
export function useCommand(
  command: MenuCommand,
  handler: () => void,
  enabled = true,
): void {
  const { register } = useCommands();
  // Held in a ref so a handler that closes over changing state does not have to
  // re-register on every keystroke.
  const latest = useRef(handler);
  latest.current = handler;

  useEffect(() => {
    if (!enabled) return;
    return register(command, () => latest.current());
  }, [command, enabled, register]);
}
