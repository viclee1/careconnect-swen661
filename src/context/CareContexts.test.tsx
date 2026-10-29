import { renderHook } from '@testing-library/react';

import { useAppointments } from './appointments';
import { useMedicines } from './medicines';
import { useMemories } from './memories';
import { AppointmentsProvider } from './AppointmentsContext';
import { MedicinesProvider } from './MedicinesContext';
import { appendActivityEvent } from '../data/caregiverStore';
import { act } from 'react';

jest.mock('../data/caregiverStore');

beforeEach(() => localStorage.clear());

describe('Appointments, Medicines and Memories contexts', () => {
  it.each([
    ['useAppointments', useAppointments],
    ['useMedicines', useMedicines],
    ['useMemories', useMemories],
  ])('%s throws a clear error outside its provider', (name, hook) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => hook())).toThrow(`${name} must be used inside`);
    jest.mocked(console.error).mockRestore();
  });

  it('reports unknown appointments as not on My Day', () => {
    const { result } = renderHook(() => useAppointments(), { wrapper: AppointmentsProvider });
    expect(result.current.isInMyDay('nope')).toBe(false);
  });

  it('ignores ticks for medicines that are not on the list', () => {
    const { result } = renderHook(() => useMedicines(), { wrapper: MedicinesProvider });
    expect(result.current.isTaken('nope')).toBe(false);
    act(() => result.current.setTaken('nope', true));
    expect(appendActivityEvent).not.toHaveBeenCalled();
    expect(result.current.progress.taken).toBe(1);
  });

  it('keeps working when storage refuses writes', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useMedicines(), { wrapper: MedicinesProvider });
    act(() => result.current.setTaken('m2', true));
    expect(result.current.isTaken('m2')).toBe(true);
    setItem.mockRestore();
  });
});
