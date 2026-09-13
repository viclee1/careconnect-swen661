import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  createFlakyContactRepository,
  createMockContactRepository,
  type ContactRepository,
} from '../../data/contactRepository';
import { ContactsProvider, useContacts } from '../ContactsProvider';

const wrapperFor = (repository: ContactRepository) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <ContactsProvider repository={repository}>{children}</ContactsProvider>;
  };

async function mount(repository: ContactRepository) {
  return renderHook(() => useContacts(), { wrapper: wrapperFor(repository) });
}

describe('useContacts', () => {
  it('starts empty and not loading', async () => {
    const { result } = await mount(createMockContactRepository());
    expect(result.current.contacts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('populates the roster in the order the design lists it', async () => {
    const { result } = await mount(createMockContactRepository());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.contacts.map((c) => c.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('records the error and empties the list when loading fails', async () => {
    const { result } = await mount(createFlakyContactRepository(99));

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.contacts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('a successful retry clears the error', async () => {
    const { result } = await mount(createFlakyContactRepository(1));

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeInstanceOf(Error);

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.contacts).toHaveLength(5);
  });

  it('finds a loaded contact by id', async () => {
    const { result } = await mount(createMockContactRepository());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.byId('c2')?.name).toBe('Dr. Sharma');
  });

  it('returns undefined for an unknown id instead of throwing', async () => {
    const { result } = await mount(createMockContactRepository());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.byId('nobody')).toBeUndefined();
  });

  it('returns undefined before anything is loaded', async () => {
    const { result } = await mount(createMockContactRepository());
    expect(result.current.byId('c1')).toBeUndefined();
  });
});

describe('useContacts outside its provider', () => {
  it('fails loudly rather than returning a broken value', async () => {
    // Silence the error boundary noise React prints for the thrown render.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useContacts())).rejects.toThrow(
      'useContacts must be used inside a ContactsProvider',
    );
    spy.mockRestore();
  });
});
