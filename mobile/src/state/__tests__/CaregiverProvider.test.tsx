import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createMockDailyTasksRepository } from '../../data/dailyTasksRepository';
import { createMockMedicineRepository } from '../../data/medicineRepository';
import { CaregiverProvider, useActivityRecorder, useCaregiver } from '../CaregiverProvider';
import { DailyTasksProvider, useDailyTasks } from '../DailyTasksProvider';
import { MedicinesProvider, useMedicines } from '../MedicinesProvider';

describe('CaregiverProvider', () => {
  it('starts as the given role, records events and notes newest first', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CaregiverProvider initialRole="caregiver" author="Maria Thompson" initialNotes={[]}>
        {children}
      </CaregiverProvider>
    );
    const { result } = await renderHook(() => useCaregiver(), { wrapper });
    expect(result.current.role).toBe('caregiver');

    await act(async () => result.current.record('check_in', 'Checked in for the day'));
    await act(async () => result.current.record('med_taken', 'Took Metformin'));
    expect(result.current.activity.map((event) => event.label)).toEqual([
      'Took Metformin',
      'Checked in for the day',
    ]);

    await act(async () => result.current.addNote('Bring the blue folder.', 'urgent'));
    expect(result.current.notes).toEqual([
      expect.objectContaining({ author: 'Maria Thompson', priority: 'urgent' }),
    ]);

    await act(async () => result.current.setRole('patient'));
    expect(result.current.role).toBe('patient');
  });

  it("logs the care recipient's medicine ticks and finished tasks, not un-ticked tasks", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CaregiverProvider>
        <DailyTasksProvider repository={createMockDailyTasksRepository()}>
          <MedicinesProvider repository={createMockMedicineRepository()}>{children}</MedicinesProvider>
        </DailyTasksProvider>
      </CaregiverProvider>
    );
    const { result } = await renderHook(
      () => ({ medicines: useMedicines(), tasks: useDailyTasks(), caregiver: useCaregiver() }),
      { wrapper },
    );
    await act(async () => result.current.medicines.toggleTaken('med2'));
    const checkIn = result.current.tasks.tasks.find((task) => /check-in/i.test(task.title))!;
    await act(async () => result.current.tasks.toggleTask(checkIn.id));
    await act(async () => result.current.tasks.toggleTask(checkIn.id)); // un-tick: not logged
    expect(result.current.caregiver.activity.map((event) => event.kind)).toEqual([
      'check_in',
      'med_taken',
    ]);
  });

  it('adds, changes and removes medicines through the provider', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MedicinesProvider repository={createMockMedicineRepository()}>{children}</MedicinesProvider>
    );
    const { result } = await renderHook(() => useMedicines(), { wrapper });
    let id = '';
    await act(async () => {
      id = result.current.addMedicine({ name: 'Aspirin', dosage: '75 mg', time: '9:00 am' }).id;
    });
    expect(result.current.medicines.find((m) => m.id === id)).toMatchObject({ taken: false });
    await act(async () => result.current.updateMedicine(id, { name: 'Aspirin', dosage: '150 mg', time: '9:00 am' }));
    expect(result.current.medicines.find((m) => m.id === id)?.dosage).toBe('150 mg');
    await act(async () => result.current.removeMedicine(id));
    expect(result.current.medicines.some((m) => m.id === id)).toBe(false);
  });

  it('records nothing, and does not fail, without one; useCaregiver needs one', async () => {
    const { result } = await renderHook(() => useActivityRecorder());
    expect(() => result.current('check_in', 'Checked in')).not.toThrow();

    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useCaregiver())).rejects.toThrow(
      'useCaregiver must be used inside a CaregiverProvider',
    );
    error.mockRestore();
  });
});
