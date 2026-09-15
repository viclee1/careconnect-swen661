import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { appointmentSemanticLabel, type Appointment } from '../../models/appointment';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { type } from '../../theme/typography';

/** One upcoming appointment, laid out as a single accessible card. */
export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View
      testID={`appointment-${appointment.id}`}
      accessible
      accessibilityLabel={appointmentSemanticLabel(appointment)}
      style={styles.card}
    >
      <View style={styles.iconCircle}>
        <Icon name="event" size={24} color={colors.primaryLight} />
      </View>
      <View style={styles.details}>
        <Text style={styles.doctor}>{appointment.doctor}</Text>
        <Text style={styles.specialty}>{appointment.specialty}</Text>
        <Text style={styles.dateTime}>
          {appointment.date} at {appointment.time}
        </Text>
        <Text style={styles.location}>{appointment.location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    padding: layout.gutter,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondaryLight,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, gap: 2 },
  doctor: { ...type.cardTitle, color: colors.primaryDark },
  specialty: { ...type.bodySmall, color: colors.secondaryDark },
  dateTime: { ...type.label, color: colors.primaryDark, marginTop: 4 },
  location: { ...type.caption, color: colors.secondaryDark },
});
