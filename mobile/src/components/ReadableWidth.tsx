import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { layout } from '../theme/layout';

/**
 * Centres its child and stops it stretching past a comfortable reading width on
 * a tablet.
 */
export function ReadableWidth({
  children,
  maxWidth = layout.readableWidth,
}: {
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <View style={styles.centre}>
      <View style={[styles.inner, { maxWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center' },
  inner: { flex: 1, width: '100%' },
});
