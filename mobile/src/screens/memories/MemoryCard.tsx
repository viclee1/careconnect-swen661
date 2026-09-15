import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { memorySemanticLabel, type Memory } from '../../models/memory';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/** One saved memory: a placeholder thumbnail, title, date and description. */
export function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <View
      testID={`memory-${memory.id}`}
      accessible
      accessibilityLabel={memorySemanticLabel(memory)}
      style={styles.card}
    >
      <View style={styles.thumbnail}>
        <Icon name="photo" size={32} color={colors.secondaryDark} />
      </View>
      <Text style={styles.title}>{memory.title}</Text>
      <Text style={styles.date}>{memory.date}</Text>
      <Text style={styles.description}>{memory.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
    gap: 6,
  },
  thumbnail: {
    height: 96,
    borderRadius: layout.radius,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.cardTitle, color: colors.primaryDark },
  date: { ...type.caption, color: colors.secondaryDark, fontWeight: '600' },
  description: { ...type.bodySmall, color: colors.secondaryDark },
});
