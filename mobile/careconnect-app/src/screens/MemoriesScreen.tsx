import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';

interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
}

export default function MemoriesScreen() {
  const [memories] = useState<Memory[]>([
    { id: '1', title: 'Family Picnic at Quiet Waters', date: 'August 2026', description: 'Enjoyed a sunny afternoon walk and lunch by the water with Idris.' },
    { id: '2', title: 'First Day of School', date: 'September 2026', description: 'Took pictures before heading out for the morning drop-off.' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>Captured moments and milestones</Text>
      </View>

      <FlatList
        data={memories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.memoryTitle}>{item.title}</Text>
            <Text style={styles.memoryDate}>{item.date}</Text>
            <Text style={styles.memoryDescription}>{item.description}</Text>
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
  memoryTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  memoryDate: { fontSize: 12, color: '#0284C7', marginTop: 2, fontWeight: '500' },
  memoryDescription: { fontSize: 14, color: '#475569', marginTop: 8 },
});