import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../../components/Icon';
import { ReadableWidth } from '../../components/ReadableWidth';
import type { Role } from '../../models/caregiver';
import { useCaregiver } from '../../state/CaregiverProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/** After signing in: who is using CareConnect on this phone right now. */
export function RoleChooserScreen({ onChosen }: { onChosen: (role: Role) => void }) {
  const { setRole } = useCaregiver();

  function choose(role: Role) {
    setRole(role);
    onChosen(role);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            Welcome, Margaret
          </Text>
          <Text style={styles.subtitle}>Who is using CareConnect right now?</Text>
          <Choice
            icon="person"
            title="I am the care recipient"
            description="My day, my medicines, and the people I talk to."
            onPress={() => choose('patient')}
          />
          <Choice
            icon="volunteer-activism"
            title="I am a caregiver"
            description="How the day is going, and the medicines and visits I look after."
            onPress={() => choose('caregiver')}
          />
        </ScrollView>
      </ReadableWidth>
    </SafeAreaView>
  );
}

function Choice({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [styles.choice, pressed ? styles.choicePressed : null]}
    >
      <View style={styles.choiceIcon}>
        <Icon name={icon} size={28} color={colors.primaryLight} />
      </View>
      <View style={styles.choiceText}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingTop: 48 },
  title: { ...type.sectionTitle, color: colors.primaryDark, textAlign: 'center' },
  subtitle: { ...type.body, color: colors.secondaryDark, textAlign: 'center', marginBottom: 16 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    minHeight: layout.minTouchTarget,
    borderRadius: layout.radius,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
  },
  choicePressed: { borderColor: colors.primaryDark, backgroundColor: colors.secondaryLight },
  choiceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  choiceText: { flex: 1, gap: 4 },
  choiceTitle: { ...type.cardTitle, color: colors.primaryDark },
  choiceDescription: { ...type.bodySmall, color: colors.secondaryDark },
});
