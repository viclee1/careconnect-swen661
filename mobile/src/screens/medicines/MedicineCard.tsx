import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { medicineSemanticLabel, type Medicine } from '../../models/medicine';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * One medicine, toggled taken / not taken by tapping the whole row.
 *
 * `accessibilityRole="checkbox"` plus `accessibilityState.checked` carries the
 * taken state to assistive technology the same way the check circle carries it
 * visually — never colour alone.
 */
export function MedicineCard({
  medicine,
  onToggle,
}: {
  medicine: Medicine;
  onToggle: () => void;
}) {
  return (
    <Pressable
      testID={`medicine-${medicine.id}`}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: medicine.taken }}
      accessibilityLabel={medicineSemanticLabel(medicine)}
      style={[
        styles.card,
        medicine.taken && styles.cardTaken,
        { opacity: medicine.taken ? 0.6 : 1.0 },
      ]}
    >
      <View style={styles.iconCircle}>
        <Icon name="medication" size={24} color={colors.primaryLight} />
      </View>
      <View style={styles.titles}>
        <Text style={[styles.name, medicine.taken && styles.nameTaken]}>{medicine.name}</Text>
        <Text style={styles.dosage}>
          {medicine.dosage} • {medicine.time}
        </Text>
      </View>
      <View style={[styles.checkCircle, medicine.taken && styles.checkCircleDone]}>
        {medicine.taken ? <Icon name="check" size={20} color={colors.primaryLight} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.secondaryLight,
  },
  cardTaken: { borderColor: 'rgba(7, 92, 63, 0.3)' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, gap: 2 },
  name: { ...type.cardTitle, color: colors.primaryDark },
  nameTaken: { textDecorationLine: 'line-through' },
  dosage: { ...type.bodySmall, color: colors.secondaryDark },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: colors.successText, borderColor: colors.successText },
});
