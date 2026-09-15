import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createMockMedicineRepository, type MedicineRepository } from '../../data/medicineRepository';
import { MedicinesProvider, useMedicines } from '../MedicinesProvider';

const wrapperFor = (repository: MedicineRepository) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MedicinesProvider repository={repository}>{children}</MedicinesProvider>;
  };

async function mount(repository: MedicineRepository) {
  return renderHook(() => useMedicines(), { wrapper: wrapperFor(repository) });
}

describe('useMedicines', () => {
  it('starts with the seeded medicines and their taken counts', async () => {
    const { result } = await mount(createMockMedicineRepository());
    expect(result.current.medicines).toHaveLength(3);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.takenCount).toBe(1);
  });

  it('toggles one medicine without touching the others', async () => {
    const { result } = await mount(createMockMedicineRepository());

    await act(async () => {
      result.current.toggleTaken('med2');
    });

    expect(result.current.medicines.find((m) => m.id === 'med2')?.taken).toBe(true);
    expect(result.current.takenCount).toBe(2);

    await act(async () => {
      result.current.toggleTaken('med2');
    });

    expect(result.current.medicines.find((m) => m.id === 'med2')?.taken).toBe(false);
    expect(result.current.takenCount).toBe(1);
  });

  it('ignores a toggle for an id that is not in the list', async () => {
    const { result } = await mount(createMockMedicineRepository());

    await act(async () => {
      result.current.toggleTaken('does-not-exist');
    });

    expect(result.current.takenCount).toBe(1);
  });
});

describe('useMedicines outside its provider', () => {
  it('fails loudly rather than returning a broken value', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useMedicines())).rejects.toThrow(
      'useMedicines must be used inside a MedicinesProvider',
    );
    spy.mockRestore();
  });
});
