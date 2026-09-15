import { useCallback, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { ReadableWidth } from '../components/ReadableWidth';
import { useResponsive } from '../hooks/useResponsive';
import { useMemories } from '../state/MemoriesProvider';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { MemoryCard } from './memories/MemoryCard';

/** The Memories screen: captured moments and milestones. */
export function MemoriesScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { memories, isLoading, error, load } = useMemories();
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
        title="Memories"
        subtitle="Captured moments and milestones"
        onOpenSettings={onOpenSettings}
      />
      <ReadableWidth maxWidth={900}>
        <ScrollView contentContainerStyle={styles.content}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator accessibilityLabel="Loading memories" />
            </View>
          ) : error ? (
            <AlertBanner
              tone="error"
              title="Memories could not be loaded"
              message="Your memories are saved on this phone, so nothing has been lost. Try again in a moment."
              action={<AppButton label="Try again" icon="refresh" onPress={bootstrap} />}
            />
          ) : memories.length === 0 ? (
            <EmptyState
              icon="photo-album"
              title="No memories yet"
              message="Moments you save will appear here."
            />
          ) : (
            <View style={styles.list}>
              {memories.map((memory) => (
                <View key={memory.id} style={isTablet ? styles.halfWidth : styles.fullWidth}>
                  <MemoryCard memory={memory} />
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
