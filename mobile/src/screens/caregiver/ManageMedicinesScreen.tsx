import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ReadableWidth } from '../../components/ReadableWidth';
import { countLabel } from '../../models/caregiver';
import type { MedicineInput } from '../../models/medicine';
import { useMedicines } from '../../state/MedicinesProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';
import { EditableCard, Notice } from './EditableCard';
import { EditForm, type EditField } from './EditForm';

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
 * Every change shows on her Medicines screen straight away — it is the same list.
 */
export function ManageMedicinesScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { medicines, addMedicine, updateMedicine, removeMedicine } = useMedicines();
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [notice, setNotice] = useState('');

  function done(message: string) {
    setNotice(message);
    AccessibilityInfo.announceForAccessibility(message);
    setMode({ kind: 'list' });
  }

  const editing = mode.kind === 'edit' ? medicines.find((m) => m.id === mode.id) : undefined;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Manage medicines"
        subtitle="Add, change or remove Margaret's medicines"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {mode.kind === 'add' ? (
            <EditForm
              heading="Add a medicine"
              fields={fields}
              initial={blank}
              submitLabel="Add medicine"
              onSubmit={(values) => {
                addMedicine(values);
                done(`Added ${values.name}.`);
              }}
              onCancel={() => setMode({ kind: 'list' })}
            />
          ) : editing ? (
            <EditForm
              heading={`Edit ${editing.name}`}
              fields={fields}
              initial={{ name: editing.name, dosage: editing.dosage, time: editing.time }}
              submitLabel="Save changes"
              onSubmit={(values) => {
                updateMedicine(editing.id, values);
                done(`Saved ${values.name}.`);
              }}
              onCancel={() => setMode({ kind: 'list' })}
            />
          ) : (
            <>
              {notice ? <Notice message={notice} onDismiss={() => setNotice('')} /> : null}
              <View style={styles.toolbar}>
                <Text style={styles.count}>{countLabel(medicines.length, 'medicine')}</Text>
                <AppButton
                  label="Add medicine"
                  icon="add"
                  onPress={() => {
                    setNotice('');
                    setMode({ kind: 'add' });
                  }}
                />
              </View>
              {medicines.length === 0 ? (
                <EmptyState
                  icon="medication"
                  title="No medicines yet"
                  message="Add Margaret's first medicine and it will appear on her Medicines screen."
                />
              ) : (
                medicines.map((medicine) => (
                  <EditableCard
                    key={medicine.id}
                    testID={`manage-${medicine.id}`}
                    icon="medication"
                    title={medicine.name}
                    details={[medicine.dosage, medicine.time]}
                    onEdit={() => setMode({ kind: 'edit', id: medicine.id })}
                    onDelete={() => {
                      removeMedicine(medicine.id);
                      done(`Deleted ${medicine.name}.`);
                    }}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  count: { ...type.label, color: colors.secondaryDark },
});
