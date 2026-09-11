import { StyleSheet, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../theme/colors';

/**
 * Stands in for a CareConnect screen another team member owns.
 *
 * The Week 3 prototype's navigation has six destinations, so the bar would
 * misrepresent the design if it listed only the screens finished on this
 * branch. These placeholders keep the navigation honest and give each
 * teammate's route somewhere to land.
 *
 * They are **not** functional screens and do not count toward the assignment's
 * screen requirement.
 */
export function PendingScreen({
  title,
  owner,
  onOpenSettings,
}: {
  title: string;
  owner: string;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.screen}>
      <AppHeader
        title={title}
        subtitle="Not on this branch yet"
        onOpenSettings={onOpenSettings}
      />
      <View style={styles.body}>
        <EmptyState
          icon="construction"
          title={`${title} is still being built`}
          message={`${owner} is building this screen on their own branch. It will appear here when the branches are merged.`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryLight },
  body: { flex: 1, justifyContent: 'center' },
});
