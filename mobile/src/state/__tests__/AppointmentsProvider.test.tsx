import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import {
  createFlakyAppointmentRepository,
  createMockAppointmentRepository,
  type AppointmentRepository,
} from '../../data/appointmentRepository';
import { AppointmentsProvider, useAppointments } from '../AppointmentsProvider';

const wrapperFor = (repository: AppointmentRepository) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppointmentsProvider repository={repository}>{children}</AppointmentsProvider>;
  };

async function mount(repository: AppointmentRepository) {
  return renderHook(() => useAppointments(), { wrapper: wrapperFor(repository) });
}

describe('useAppointments', () => {
  it('starts empty and not loading', async () => {
    const { result } = await mount(createMockAppointmentRepository());
    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('populates the list in the order the design lists it', async () => {
    const { result } = await mount(createMockAppointmentRepository());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.appointments.map((a) => a.id)).toEqual(['appt1', 'appt2']);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('records the error and empties the list when loading fails', async () => {
    const { result } = await mount(createFlakyAppointmentRepository(99));

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('a successful retry clears the error', async () => {
    const { result } = await mount(createFlakyAppointmentRepository(1));

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeInstanceOf(Error);

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.appointments).toHaveLength(2);
  });
});

describe('useAppointments outside its provider', () => {
  it('fails loudly rather than returning a broken value', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useAppointments())).rejects.toThrow(
      'useAppointments must be used inside an AppointmentsProvider',
    );
    spy.mockRestore();
  });
});
