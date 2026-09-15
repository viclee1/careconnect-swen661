import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { useMedicines } from '../state/MedicinesProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { MedicineCard } from './medicines/MedicineCard';

/** The Medicines screen: today's medication tracker, tap a row to mark it taken. */
export function MedicinesScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { medicines, takenCount, totalCount, toggleTaken } = useMedicines();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Medicines"
        subtitle="Today's medication tracker"
        onOpenSettings={onOpenSettings}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.summary}>
          {takenCount} of {totalCount} taken
        </Text>
        <View style={styles.list}>
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onToggle={() => toggleTaken(medicine.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  summary: { ...type.label, color: colors.secondaryDark },
  list: { gap: 16 },
});
