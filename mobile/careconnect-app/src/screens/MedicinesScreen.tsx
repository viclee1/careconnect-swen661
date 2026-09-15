import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: 'Amlodipine', dosage: '5 mg - 1 tablet with food', time: '8:30 AM', taken: true },
    { id: '2', name: 'Atorvastatin', dosage: '20 mg - 1 tablet', time: '5:00 PM', taken: false },
    { id: '3', name: 'Metformin', dosage: '500 mg - 1 tablet with lunch', time: '12:30 PM', taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedicines(prev =>
      prev.map(med => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicines</Text>
        <Text style={styles.subtitle}>Today's medication tracker</Text>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.infoContainer}>
              <Text style={styles.medName}>{item.name}</Text>
              <Text style={styles.medDetails}>{item.dosage}</Text>
              <Text style={styles.medTime}>{item.time}</Text>
            </View>
            <TouchableOpacity
              style={[styles.statusButton, item.taken ? styles.takenButton : styles.pendingButton]}
              onPress={() => toggleTaken(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${item.name} as ${item.taken ? 'pending' : 'taken'}`}
            >
              <Text style={styles.statusButtonText}>{item.taken ? 'Taken' : 'Take'}</Text>
            </TouchableOpacity>
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  infoContainer: { flex: 1, marginRight: 12 },
  medName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  medDetails: { fontSize: 14, color: '#475569', marginTop: 2 },
  medTime: { fontSize: 12, color: '#0284C7', marginTop: 4, fontWeight: '500' },
  statusButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  takenButton: { backgroundColor: '#10B981' },
  pendingButton: { backgroundColor: '#0EA5E9' },
  statusButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});