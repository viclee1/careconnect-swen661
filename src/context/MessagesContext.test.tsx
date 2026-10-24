import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { MESSAGES_KEY, MessagesProvider } from './MessagesContext';
import { useMessages } from './messages';

function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

function wrapper({ children }: { children: ReactNode }) {
  return <MessagesProvider>{children}</MessagesProvider>;
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
});

describe('MessagesProvider', () => {
  it('seeds the prototype conversations on first use', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current.contacts.map((c) => c.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
    expect(result.current.messagesFor('c1')).toHaveLength(2);
    expect(result.current.messagesFor('c5')).toEqual([]);
    expect(result.current.previewFor('c5')).toBe('No messages yet');
  });

  it('clears a waiting badge once the conversation is opened', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current.waitingFor('c1')).toBe(1);
    act(() => result.current.markRead('c1'));
    expect(result.current.waitingFor('c1')).toBe(0);
    // Marking twice changes nothing.
    act(() => result.current.markRead('c1'));
    expect(result.current.waitingFor('c1')).toBe(0);
  });

  it('never sends a blank message', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    let sent: unknown;
    act(() => {
      sent = result.current.send('c1', '   ');
    });
    expect(sent).toBeNull();
    expect(result.current.messagesFor('c1')).toHaveLength(2);
  });

  it('trims and appends a message, which becomes the preview', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    act(() => {
      result.current.send('c5', '  Hello  ');
    });
    expect(result.current.messagesFor('c5')[0]).toMatchObject({ body: 'Hello', author: 'me', status: 'sent' });
    expect(result.current.previewFor('c5')).toBe('You: Hello');
  });

  it('records a silent alert as a CareConnect message', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    act(() => {
      result.current.sendNotify('c3', 'Maria');
    });
    const latest = last(result.current.messagesFor('c3'));
    expect(latest).toMatchObject({ author: 'system', kind: 'alert' });
    expect(latest?.body).toMatch(/No sound was played/);
  });

  it('falls back to the seed when the store is corrupt', () => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify({ messages: 'nope' }));
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current.messagesFor('c1')).toHaveLength(2);
  });

  it('keeps stored messages but repairs a missing read list', () => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify({ messages: [] }));
    const { result } = renderHook(() => useMessages(), { wrapper });
    expect(result.current.messagesFor('c1')).toEqual([]);
    expect(result.current.waitingFor('c1')).toBe(0);
  });

  it('queues messages offline and counts them until the connection returns', () => {
    const { result } = renderHook(() => useMessages(), { wrapper });
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.online).toBe(false);

    act(() => {
      result.current.send('c1', 'Later');
    });
    expect(result.current.queuedCount).toBe(1);
    expect(last(result.current.messagesFor('c1'))?.status).toBe('sending');

    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.queuedCount).toBe(0);
    expect(last(result.current.messagesFor('c1'))?.status).toBe('sent');
  });

  it('throws a clear error outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useMessages())).toThrow('useMessages must be used inside MessagesProvider');
    jest.restoreAllMocks();
  });
});
