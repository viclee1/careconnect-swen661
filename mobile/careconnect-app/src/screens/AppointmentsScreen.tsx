import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  location: string;
}

export default function AppointmentsScreen() {
  const [appointments] = useState<Appointment[]>([
    { id: '1', doctor: 'Dr. Robert Chen', specialty: 'Cardiology', date: 'Sept 18, 2026 - 10:00 AM', location: 'Annapolis Medical Center' },
    { id: '2', doctor: 'Dr. Sarah Jenkins', specialty: 'Primary Care', date: 'Oct 02, 2026 - 2:30 PM', location: 'Acuity Health Clinic' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.subtitle}>Upcoming medical visits</Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card} accessibilityRole="summary" accessibilityLabel={`Appointment with ${item.doctor}, ${item.specialty}, on ${item.date}`}>
            <Text style={styles.doctorName}>{item.doctor}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
            <Text style={styles.dateTime}>{item.date}</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16 },
  header: { paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  doctorName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  specialty: { fontSize: 14, color: '#0284C7', marginTop: 2 },
  dateTime: { fontSize: 14, fontWeight: '500', color: '#334155', marginTop: 8 },
  location: { fontSize: 12, color: '#64748B', marginTop: 2 },
});