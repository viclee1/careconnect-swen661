import { useEffect, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { Icon, type IconName } from '../../components/Icon';
import { ReadableWidth } from '../../components/ReadableWidth';
import { formatEventTime, isCheckIn } from '../../models/caregiver';
import type { CaregiverDestination } from '../../navigation/destinations';
import { useAppointments } from '../../state/AppointmentsProvider';
import { useCaregiver } from '../../state/CaregiverProvider';
import { useDailyTasks } from '../../state/DailyTasksProvider';
import { useMedicines } from '../../state/MedicinesProvider';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/**
 * The caregiver's home: how the care recipient's day is going, at a glance,
 * with a way into each thing the caregiver looks after.
 */
export function DashboardScreen({
  onOpenSettings,
  onNavigate,
}: {
  onOpenSettings?: () => void;
  onNavigate: (destination: CaregiverDestination) => void;
}) {
  const { takenCount, totalCount } = useMedicines();
  const { tasks, doneCount, totalCount: taskCount } = useDailyTasks();
  const { appointments, hasLoaded, isLoading, load } = useAppointments();
  const { activity } = useCaregiver();

  useEffect(() => {
    if (!hasLoaded && !isLoading) void load();
  }, [hasLoaded, isLoading, load]);

  const checkedIn = tasks.some((task) => isCheckIn(task) && task.isDone);
  const next = appointments[0];
  const nextText = next
    ? `${next.doctor}, ${next.date} at ${next.time}`
    : hasLoaded
      ? 'None booked'
      : 'Loading…';
  const recent = activity.slice(0, 3);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Dashboard"
        subtitle="How Margaret's day is going"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth>
        <ScrollView contentContainerStyle={styles.content}>
          <StatCard icon="medication" label="Medicines" value={`${takenCount} of ${totalCount} taken today`}>
            <AppButton
              label="Manage medicines"
              variant="outlined"
              onPress={() => onNavigate('ManageMedicines')}
            />
          </StatCard>
          <StatCard icon="wb-sunny" label="My Day" value={`${doneCount} of ${taskCount} tasks done`} />
          <StatCard
            icon="person"
            label="Check-in"
            value={checkedIn ? 'Checked in today' : 'Not checked in yet'}
          />
          <StatCard icon="event" label="Next appointment" value={nextText}>
            <AppButton
              label="Manage appointments"
              variant="outlined"
              onPress={() => onNavigate('ManageAppointments')}
            />
          </StatCard>

          <Text style={styles.sectionTitle} accessibilityRole="header">
            Recent activity
          </Text>
          {recent.length === 0 ? (
            <Text style={styles.body}>
              Nothing yet today. Medicines taken and tasks finished will appear here.
            </Text>
          ) : (
            <View style={styles.list}>
              {recent.map((event) => (
                <View
                  key={event.id}
                  style={styles.activityRow}
                  accessible
                  accessibilityLabel={`${event.label}, ${formatEventTime(event.at)}`}
                >
                  <Text style={styles.activityLabel}>{event.label}</Text>
                  <Text style={styles.activityTime}>{formatEventTime(event.at)}</Text>
                </View>
              ))}
            </View>
          )}
          <AppButton label="View all activity" variant="outlined" onPress={() => onNavigate('Activity')} />
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  children,
}: {
  icon: IconName;
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardText} accessible accessibilityLabel={`${label}: ${value}`}>
        <View style={styles.cardLabelRow}>
          <Icon name={icon} size={20} color={colors.primaryDark} />
          <Text style={styles.cardLabel}>{label}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  card: {
    gap: 12,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.secondaryLight,
    alignItems: 'flex-start',
  },
  cardText: { gap: 4 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { ...type.label, color: colors.primaryDark },
  cardValue: { ...type.body, color: colors.primaryDark },
  sectionTitle: { ...type.sectionTitle, color: colors.primaryDark, marginTop: 8 },
  body: { ...type.body, color: colors.secondaryDark },
  list: { gap: 10 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  activityLabel: { ...type.label, color: colors.primaryDark, flex: 1 },
  activityTime: { ...type.bodySmall, color: colors.secondaryDark },
});
