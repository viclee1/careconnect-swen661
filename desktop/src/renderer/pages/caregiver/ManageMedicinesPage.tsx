import { useEffect, useRef, useState } from 'react';

import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import type { MedicineInput } from '../../models/medicine';
import { useMedicines } from '../../state/MedicinesProvider';
import { EditableCard } from './EditableCard';
import { EditForm, type EditField } from './EditForm';
import '../carePages.css';
import './caregiver.css';

const fields: EditField<keyof MedicineInput>[] = [
  { name: 'name', label: 'Medicine name', placeholder: 'e.g. Amlodipine' },
  {
    name: 'dosage',
    label: 'Dose',
    placeholder: 'e.g. 5 mg — 1 tablet with food',
    hint: 'Strength, form, quantity, and anything about how to take it.',
  },
  { name: 'time', label: 'Time to take it', placeholder: 'e.g. 8:30 am' },
];

const blank: MedicineInput = { name: '', dosage: '', time: '' };

type Mode = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; id: string };

/**
 * The caregiver's medicines list: add, change or remove what Margaret takes.
 * Every change shows on her Medicines page straight away — it is the same list.
 */
export function ManageMedicinesPage() {
  const { medicines, addMedicine, updateMedicine, removeMedicine } = useMedicines();
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [announcement, setAnnouncement] = useState('');
  const addRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // Back to the list after Save or Cancel: focus returns to Add, not to the top.
  useEffect(() => {
    if (mode.kind === 'list' && returnFocus.current) {
      returnFocus.current = false;
      addRef.current?.focus();
    }
  }, [mode]);

  function backToList(message = '') {
    returnFocus.current = true;
    setAnnouncement(message);
    setMode({ kind: 'list' });
  }

  const editing = mode.kind === 'edit' ? medicines.find((m) => m.id === mode.id) : undefined;

  return (
    <>
      <PageHeader title="Manage medicines" subtitle="Add, change or remove Margaret's medicines" />
      <div className="page-body">
        <div className="readable stack">
          <p className="visually-hidden" role="status">
            {announcement}
          </p>

          {mode.kind === 'add' ? (
            <EditForm
              heading="Add a medicine"
              fields={fields}
              initial={blank}
              submitLabel="Add medicine"
              onSubmit={(values) => {
                addMedicine(values);
                backToList(`Added ${values.name}.`);
              }}
              onCancel={() => backToList()}
            />
          ) : editing ? (
            <EditForm
              heading={`Edit ${editing.name}`}
              fields={fields}
              initial={{ name: editing.name, dosage: editing.dosage, time: editing.time }}
              submitLabel="Save changes"
              onSubmit={(values) => {
                updateMedicine(editing.id, values);
                backToList(`Saved ${values.name}.`);
              }}
              onCancel={() => backToList()}
            />
          ) : (
            <>
              <div className="care-toolbar">
                <p className="appointments__count">
                  {medicines.length === 1 ? '1 medicine' : `${medicines.length} medicines`}
                </p>
                <Button
                  ref={addRef}
                  icon="add"
                  label="Add medicine"
                  onClick={() => setMode({ kind: 'add' })}
                />
              </div>
              {medicines.length === 0 ? (
                <EmptyState
                  icon="medicines"
                  title="No medicines yet"
                  message="Add Margaret's first medicine and it will appear on her Medicines page."
                />
              ) : (
                <ul className="card-grid" aria-label="Margaret's medicines">
                  {medicines.map((medicine) => (
                    <EditableCard
                      key={medicine.id}
                      icon="medicines"
                      title={medicine.name}
                      onEdit={() => setMode({ kind: 'edit', id: medicine.id })}
                      onDelete={() => {
                        removeMedicine(medicine.id);
                        returnFocus.current = true;
                        setAnnouncement(`Deleted ${medicine.name}.`);
                        setMode({ kind: 'list' });
                      }}
                    >
                      <p className="info-card__subtitle">{medicine.dosage}</p>
                      <p className="info-card__meta">{medicine.time}</p>
                    </EditableCard>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
