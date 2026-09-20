import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/daily_task.dart';
import '../../state/daily_tasks_controller.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_scaffold.dart';

class MyDayScreen extends StatefulWidget {
  const MyDayScreen({super.key});
  @override
  State<MyDayScreen> createState() => _MyDayScreenState();
}

class _MyDayScreenState extends State<MyDayScreen> {
  @override
  Widget build(BuildContext context) {
    final dailyTasks = context.watch<DailyTasksController>();

    return AppScaffold(
      title: 'My Day',
      subtitle: 'Everything to do — Thursday 4 June',
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.gutter),
        children: [
          if (dailyTasks.showNotification)
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: AlertBanner(
                tone: AlertTone.info, title: 'Upcoming appointment',
                message: 'You have a video call with Maria today at 3:00 PM.',
                action: FilledButton(onPressed: () => dailyTasks.dismissNotification(), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white), child: const Text('OK')),
              ),
            ),
          Row(children: [
            // Without semanticsLabel this merges with the adjacent "X of Y
            // done" text into one confusing announcement — e.g. "0, 0 of 7
            // done" — because the indicator's own auto-generated percentage
            // value and the sibling Text share one accessibility node.
            Expanded(child: ClipRRect(borderRadius: const BorderRadius.all(Radius.circular(6)), child: LinearProgressIndicator(value: dailyTasks.progress, backgroundColor: AppColors.secondaryLight, valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryDark), minHeight: 12, semanticsLabel: 'Tasks completed today'))),
            const SizedBox(width: 16),
            Text('${dailyTasks.doneCount} of ${dailyTasks.totalCount} done', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600, color: AppColors.secondaryDark)),
          ]),
          const SizedBox(height: 32),
          ...dailyTasks.tasks.map((task) => _TaskCard(task: task, onToggle: () => dailyTasks.toggleTask(task.id))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.onToggle});
  final DailyTask task; final VoidCallback onToggle;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onToggle, borderRadius: BorderRadius.circular(AppTheme.radius),
        child: Opacity(
          opacity: task.isDone ? 0.6 : 1.0,
          child: Container(
            padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(AppTheme.radius), border: Border.all(color: task.isDone ? AppColors.successText.withValues(alpha: 0.3) : AppColors.border, width: 1.5)),
            child: Row(children: [
              CircleAvatar(radius: 24, backgroundColor: AppColors.primaryDark, child: Icon(task.icon, color: Colors.white, size: 24)),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(task.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold, decoration: task.isDone ? TextDecoration.lineThrough : null)),
                const SizedBox(height: 2),
                Text('${task.subtitle} • ${task.time}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.secondaryDark)),
              ])),
              const SizedBox(width: 12),
              _CheckCircle(isDone: task.isDone),
            ]),
          ),
        ),
      ),
    );
  }
}

class _CheckCircle extends StatelessWidget {
  const _CheckCircle({required this.isDone});
  final bool isDone;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32, height: 32, decoration: BoxDecoration(shape: BoxShape.circle, color: isDone ? AppColors.successText : Colors.transparent, border: Border.all(color: isDone ? AppColors.successText : AppColors.secondaryDark, width: 2)),
      child: isDone ? const Icon(Icons.check, color: Colors.white, size: 20) : null,
    );
  }
}
