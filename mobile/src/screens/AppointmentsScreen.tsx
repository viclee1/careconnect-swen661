import { useCallback, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ReadableWidth } from '../components/ReadableWidth';
import { useResponsive } from '../hooks/useResponsive';
import { useAppointments } from '../state/AppointmentsProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { AppointmentCard } from './appointments/AppointmentCard';

/** The Appointments screen: upcoming medical visits, oldest first. */
export function AppointmentsScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { appointments, isLoading, error, load } = useAppointments();
  const { isTablet } = useResponsive();

  const bootstrap = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Appointments"
        subtitle="Upcoming medical visits"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth maxWidth={900}>
        <ScrollView contentContainerStyle={styles.content}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator accessible accessibilityLabel="Loading appointments" />
            </View>
          ) : error ? (
            <AlertBanner
              tone="error"
              title="Appointments could not be loaded"
              message="Your appointments are saved on this phone, so nothing has been lost. Try again in a moment."
              action={<AppButton label="Try again" icon="refresh" onPress={bootstrap} />}
            />
          ) : appointments.length === 0 ? (
            <EmptyState
              icon="event"
              title="No appointments yet"
              message="Upcoming visits will appear here once one is scheduled."
            />
          ) : (
            <View style={styles.list}>
              {appointments.map((appointment) => (
                <View
                  key={appointment.id}
                  style={isTablet ? styles.halfWidth : styles.fullWidth}
                >
                  <AppointmentCard appointment={appointment} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ReadableWidth>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: layout.gutter, gap: 16, paddingBottom: 32 },
  loading: { paddingVertical: 48 },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fullWidth: { width: '100%' },
  halfWidth: { width: '48.5%' },
});
