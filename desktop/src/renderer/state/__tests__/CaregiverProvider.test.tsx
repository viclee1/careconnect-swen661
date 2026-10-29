import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { createMockMedicineRepository } from '../../data/medicineRepository';
import {
  CaregiverProvider,
  seedNotes,
  useActivityRecorder,
  useCaregiver,
} from '../CaregiverProvider';
import { MedicinesProvider, useMedicines } from '../MedicinesProvider';

describe('CaregiverProvider', () => {
  it('records events and notes newest first, signing notes with the given author', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CaregiverProvider author="Maria Thompson" initialNotes={[]}>
        {children}
      </CaregiverProvider>
    );
    const { result } = renderHook(() => useCaregiver(), { wrapper });
    act(() => result.current.record('check_in', 'Checked in for the day'));
    act(() => result.current.record('med_taken', 'Took Metformin'));
    expect(result.current.activity.map((event) => event.label)).toEqual([
      'Took Metformin',
      'Checked in for the day',
    ]);
    expect(new Set(result.current.activity.map((event) => event.id)).size).toBe(2);

    act(() => result.current.addNote('Bring the blue folder.', 'urgent'));
    expect(result.current.notes).toEqual([
      expect.objectContaining({ author: 'Maria Thompson', text: 'Bring the blue folder.', priority: 'urgent' }),
    ]);
  });

  it('seeds one note today and one yesterday', () => {
    const now = new Date(2026, 5, 4, 10);
    const [today, yesterday] = seedNotes(now);
    expect(today.at).toEqual(now);
    expect(yesterday.at.getDate()).toBe(3);
  });

  it("logs the care recipient's medicine ticks when it is mounted", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CaregiverProvider>
        <MedicinesProvider repository={createMockMedicineRepository()}>{children}</MedicinesProvider>
      </CaregiverProvider>
    );
    const { result } = renderHook(() => ({ medicines: useMedicines(), caregiver: useCaregiver() }), { wrapper });
    act(() => result.current.medicines.toggleTaken('med2'));
    expect(result.current.caregiver.activity[0]).toMatchObject({ kind: 'med_taken', label: 'Took Metformin' });
  });

  it('records nothing, and does not fail, without one', () => {
    const { result } = renderHook(() => useActivityRecorder());
    expect(() => result.current('check_in', 'Checked in')).not.toThrow();
  });

  it('useCaregiver needs the provider', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useCaregiver())).toThrow('useCaregiver must be used inside a CaregiverProvider');
    error.mockRestore();
  });
});
