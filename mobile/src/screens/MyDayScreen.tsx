import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { type } from '../theme/typography';
import { Icon } from '../components/Icon';
import { AppHeader } from '../components/AppHeader';
import { AlertBanner } from '../components/AlertBanner';
import { AppButton } from '../components/AppButton';
import { useDailyTasks } from '../state/DailyTasksProvider';
import { DailyTask } from '../models/DailyTask';

export function MyDayScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const {
    tasks,
    showNotification,
    dismissNotification,
    progress,
    doneCount,
    totalCount,
    toggleTask,
  } = useDailyTasks();

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Day"
        subtitle="Everything to do — Thursday 4 June"
        onOpenSettings={onOpenSettings}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showNotification && (
          <View style={{ marginBottom: 24 }}>
            <AlertBanner
              tone="info"
              title="Upcoming appointment"
              message="You have a video call with Maria today at 3:00 PM."
              action={
                <AppButton label="OK" onPress={dismissNotification} variant="filled" />
              }
            />
          </View>
        )}

        <View
          style={styles.progressRow}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Daily task progress"
          accessibilityValue={{
            min: 0,
            max: totalCount,
            now: doneCount,
            text: `${doneCount} of ${totalCount} tasks completed`,
          }}
        >
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {doneCount} of {totalCount} done
          </Text>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function TaskCard({ task, onToggle }: { task: DailyTask; onToggle: () => void }) {
  const status = task.isDone ? 'completed' : 'pending';
  return (
    <Pressable
      testID={`task-${task.id}`}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.isDone }}
      accessibilityLabel={`${task.title}. ${task.subtitle} at ${task.time}. Status: ${status}`}
      accessibilityHint="Double tap to toggle completion status"
      style={({ pressed }) => [
        styles.taskCard,
        task.isDone && styles.taskCardDone,
        { opacity: task.isDone ? 0.6 : pressed ? 0.85 : 1.0 },
      ]}
    >
      <View style={styles.taskIconCircle} accessibilityElementsHidden>
        <Icon name={task.icon} size={24} color="white" />
      </View>
      <View style={styles.taskTitles} accessibilityElementsHidden>
        <Text style={[styles.taskTitle, task.isDone && styles.taskTitleDone]}>{task.title}</Text>
        <Text style={styles.taskSubtitle}>
          {task.subtitle} • {task.time}
        </Text>
      </View>
      <View
        style={[styles.checkCircle, task.isDone && styles.checkCircleDone]}
        accessibilityElementsHidden
      >
        {task.isDone && <Icon name="check" size={20} color="white" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  scrollContent: {
    padding: layout.gutter,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.secondaryLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryDark,
  },
  progressText: {
    ...type.label,
    color: colors.secondaryDark,
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.secondaryLight,
    borderRadius: layout.radius,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 16,
  },
  taskCardDone: {
    borderColor: 'rgba(7, 92, 63, 0.3)',
  },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitles: {
    flex: 1,
  },
  taskTitle: {
    ...type.cardTitle,
    color: colors.primaryDark,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskSubtitle: {
    ...type.bodySmall,
    color: colors.secondaryDark,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.successText,
    borderColor: colors.successText,
  },
});
