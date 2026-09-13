import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  createMockMessageRepository,
  type MessageRepository,
} from '../../data/messageRepository';
import { MessagesProvider, useMessages } from '../MessagesProvider';

const kNow = new Date(2026, 8, 4, 10, 30).getTime();

async function mount(repository: MessageRepository = createMockMessageRepository({ now: kNow })) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MessagesProvider repository={repository}>{children}</MessagesProvider>;
  }
  return renderHook(() => useMessages(), { wrapper: Wrapper });
}

describe('loading conversations', () => {
  it('loads a conversation oldest first', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
    });
    expect(result.current.messagesFor('c1').map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('an unloaded conversation is empty rather than undefined', async () => {
    const { result } = await mount();
    expect(result.current.messagesFor('c9')).toEqual([]);
    expect(result.current.previewFor('c9')).toBe('No messages yet');
  });

  it('re-loading a cached conversation keeps what was sent this session', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
      await result.current.send('c1', 'Something new');
    });

    await act(async () => {
      await result.current.loadThread('c1');
    });

    expect(result.current.messagesFor('c1')).toHaveLength(3);
  });

  it('force re-loads from the repository', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
      await result.current.send('c1', 'Something new');
      await result.current.loadThread('c1', true);
    });
    expect(result.current.messagesFor('c1')).toHaveLength(3);
  });

  it('records an error and leaves an empty conversation on failure', async () => {
    const { result } = await mount(createMockMessageRepository({ now: kNow, failures: 99 }));

    await act(async () => {
      await result.current.loadThread('c1');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.messagesFor('c1')).toEqual([]);
    expect(result.current.isLoading('c1')).toBe(false);
  });

  it('loadThreads fetches every id it is given', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThreads(['c1', 'c2', 'c3']);
    });

    expect(result.current.messagesFor('c1')).toHaveLength(2);
    expect(result.current.messagesFor('c2')).toHaveLength(2);
    expect(result.current.messagesFor('c3')).toHaveLength(2);
  });
});

describe('previews and waiting counts', () => {
  it('previews a voicemail by its transcript', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c2');
    });
    expect(result.current.previewFor('c2')).toContain('You: Thank you for typing that out');
  });

  it('counts what is waiting, matching the prototype badges', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThreads(['c1', 'c2', 'c3']);
    });

    expect(result.current.waitingFor('c1')).toBe(1);
    expect(result.current.waitingFor('c3')).toBe(1);
    expect(result.current.waitingFor('c2')).toBe(0);
  });

  it('opening a conversation clears its count', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
    });
    expect(result.current.waitingFor('c1')).toBe(1);

    await act(async () => {
      result.current.markRead('c1');
    });

    expect(result.current.waitingFor('c1')).toBe(0);
  });
});

describe('sending', () => {
  it('appends an outgoing message', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
      await result.current.send('c1', 'On my way now');
    });

    const thread = result.current.messagesFor('c1');
    expect(thread).toHaveLength(3);
    expect(thread[thread.length - 1].body).toBe('On my way now');
  });

  it('refuses a blank message', async () => {
    const { result } = await mount();
    let sent: unknown = 'unset';
    await act(async () => {
      await result.current.loadThread('c1');
      sent = await result.current.send('c1', '   ');
    });

    expect(sent).toBeNull();
    expect(result.current.messagesFor('c1')).toHaveLength(2);
  });

  it('starts a conversation that has not been loaded yet', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.send('c9', 'First message');
    });
    expect(result.current.messagesFor('c9')).toHaveLength(1);
  });
});

describe('sendNotify', () => {
  it('writes the silent alert into the conversation', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
      await result.current.sendNotify('c1', 'Joyce');
    });

    const alert = result.current.messagesFor('c1').at(-1);
    expect(alert?.author).toBe('system');
    expect(alert?.kind).toBe('alert');
    expect(alert?.body).toContain('Joyce');
    // The written record is what lets the user check later that it went.
    expect(alert?.body).toContain('No sound was played');
  });

  it('does not count as somebody waiting', async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.loadThread('c1');
      await result.current.sendNotify('c1', 'Joyce');
    });
    expect(result.current.waitingFor('c1')).toBe(1);
  });
});
