import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ReadableWidth } from '../../components/ReadableWidth';
import { activityKindLabel, countLabel, formatEventTime } from '../../models/caregiver';
import { useCaregiver } from '../../state/CaregiverProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/** Everything the care recipient has done this session, newest first. */
export function ActivityScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { activity } = useCaregiver();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Activity"
        subtitle="Medicines taken, tasks finished and check-ins"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content}>
          {activity.length === 0 ? (
            <EmptyState
              icon="timeline"
              title="Nothing yet"
              message="When Margaret takes a medicine, finishes a task or checks in, it appears here."
            />
          ) : (
            <>
              <Text style={styles.count} accessibilityLiveRegion="polite">
                {countLabel(activity.length, 'event')} this session
              </Text>
              {activity.map((event) => {
                const time = formatEventTime(event.at);
                return (
                  <View
                    key={event.id}
                    style={styles.row}
                    accessible
                    accessibilityLabel={`${event.label}. ${activityKindLabel[event.kind]}, ${time}`}
                  >
                    <View style={styles.text}>
                      <Text style={styles.label}>{event.label}</Text>
                      <Text style={styles.kind}>{activityKindLabel[event.kind]}</Text>
                    </View>
                    <Text style={styles.time}>{time}</Text>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 12, paddingBottom: 32 },
  count: { ...type.label, color: colors.secondaryDark },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  text: { flex: 1, gap: 2 },
  label: { ...type.label, color: colors.primaryDark },
  kind: { ...type.bodySmall, color: colors.secondaryDark },
  time: { ...type.bodySmall, color: colors.secondaryDark },
});
