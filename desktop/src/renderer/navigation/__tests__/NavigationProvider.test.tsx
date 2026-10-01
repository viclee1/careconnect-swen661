import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { destinationForCommand, destinations } from '../destinations';
import { isTopLevel, NavigationProvider, useNavigation, type Route } from '../NavigationProvider';

const wrapper =
  (initialRoute?: Route) =>
  ({ children }: { children: ReactNode }) => (
    <NavigationProvider initialRoute={initialRoute}>{children}</NavigationProvider>
  );

describe('NavigationProvider', () => {
  it('starts on Contacts by default', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });
    expect(result.current.route).toEqual({ name: 'Contacts' });
    expect(result.current.canGoBack).toBe(false);
  });

  it('pushes a drill-down and comes back from it', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });

    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c1' }));
    expect(result.current.route).toEqual({ name: 'MessageThread', contactId: 'c1' });
    expect(result.current.canGoBack).toBe(true);

    act(() => result.current.back());
    expect(result.current.route).toEqual({ name: 'Contacts' });
    expect(result.current.canGoBack).toBe(false);
  });

  it('replaces rather than stacks when moving between top-level pages', () => {
    // Clicking around the sidebar must not build a back history that then takes
    // a dozen presses to unwind. Back is for returning from a drill-down.
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });

    act(() => result.current.navigate({ name: 'Home' }));
    act(() => result.current.navigate({ name: 'Medicines' }));
    act(() => result.current.navigate({ name: 'Contacts' }));

    expect(result.current.history).toHaveLength(1);
    expect(result.current.canGoBack).toBe(false);
  });

  it('ignores navigation to the page already showing', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });

    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c1' }));
    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c1' }));

    expect(result.current.history).toHaveLength(2);
  });

  it('treats a different conversation as a different page', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });

    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c1' }));
    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c2' }));

    expect(result.current.history).toHaveLength(3);
    expect(result.current.route).toEqual({ name: 'MessageThread', contactId: 'c2' });
  });

  it('does nothing when there is nowhere to go back to', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });
    act(() => result.current.back());
    expect(result.current.route).toEqual({ name: 'Contacts' });
  });

  it('keeps Contacts marked in the sidebar while a conversation is open', () => {
    // The sidebar should say where you are in the application, not go blank the
    // moment you drill into something.
    const { result } = renderHook(() => useNavigation(), { wrapper: wrapper() });

    act(() => result.current.navigate({ name: 'MessageThread', contactId: 'c1' }));
    expect(result.current.activeDestination).toBe('Contacts');
  });

  it('keeps the page underneath marked while Settings is open', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: wrapper({ name: 'Medicines' }),
    });

    act(() => result.current.navigate({ name: 'Settings' }));
    expect(result.current.activeDestination).toBe('Medicines');
  });

  it('throws a useful error when used outside the provider', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useNavigation())).toThrow(
      /must be used inside a NavigationProvider/,
    );
    quiet.mockRestore();
  });
});

describe('isTopLevel', () => {
  it('recognises every sidebar destination', () => {
    for (const entry of destinations) {
      expect(isTopLevel({ name: entry.destination })).toBe(true);
    }
  });

  it('rejects the pages reached by drilling in', () => {
    expect(isTopLevel({ name: 'MessageThread', contactId: 'c1' })).toBe(false);
    expect(isTopLevel({ name: 'Settings' })).toBe(false);
  });
});

describe('destinationForCommand', () => {
  it('maps every navigation menu command to a page', () => {
    for (const entry of destinations) {
      expect(destinationForCommand[entry.command]).toBe(entry.destination);
    }
  });

  it('gives each destination a distinct digit shortcut', () => {
    const digits = destinations.map((entry) => entry.digit);
    expect(new Set(digits).size).toBe(digits.length);
  });
});
