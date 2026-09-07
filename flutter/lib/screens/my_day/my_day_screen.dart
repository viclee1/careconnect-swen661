import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_scaffold.dart';

class _Task {
  _Task({required this.title, required this.subtitle, required this.time, required this.icon, this.isDone = false});
  final String title; final String subtitle; final String time; final IconData icon; bool isDone;
}

class MyDayScreen extends StatefulWidget {
  const MyDayScreen({super.key});
  @override
  State<MyDayScreen> createState() => _MyDayScreenState();
}

class _MyDayScreenState extends State<MyDayScreen> {
  bool _showAppointmentNotification = true;
  final List<_Task> _tasks = [
    _Task(title: 'Take Amlodipine', subtitle: '5 mg — 1 tablet with food', time: '8:30 am', icon: Icons.medication),
    _Task(title: 'Morning check-in', subtitle: "Tap to confirm you're doing well", time: '9:00 am', icon: Icons.check_box),
    _Task(title: 'Blood pressure check', subtitle: 'Greenfield Surgery — Dr. Sharma', time: '10:30 am', icon: Icons.monitor_heart),
    _Task(title: 'Take Metformin', subtitle: '500 mg — 1 tablet with lunch', time: '12:00 pm', icon: Icons.medication),
    _Task(title: 'Video call with Maria', subtitle: 'Your daughter will call you', time: '3:00 pm', icon: Icons.video_call),
    _Task(title: 'Take Atorvastatin', subtitle: '20 mg — 1 tablet at night', time: '8:00 pm', icon: Icons.medication),
    _Task(title: 'Evening check-in', subtitle: "Tap to confirm you're doing well", time: '9:00 pm', icon: Icons.check_box),
  ];

  int get _doneCount => _tasks.where((t) => t.isDone).length;
  void _toggleTask(_Task task) { setState(() { task.isDone = !task.isDone; }); }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'My Day',
      subtitle: 'Everything to do — Thursday 4 June',
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.gutter),
        children: [
          if (_showAppointmentNotification)
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: AlertBanner(
                tone: AlertTone.info, title: 'Upcoming appointment',
                message: 'You have a video call with Maria today at 3:00 PM.',
                action: FilledButton(onPressed: () => setState(() => _showAppointmentNotification = false), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white), child: const Text('OK')),
              ),
            ),
          Row(children: [
            Expanded(child: ClipRRect(borderRadius: const BorderRadius.all(Radius.circular(6)), child: LinearProgressIndicator(value: _tasks.isEmpty ? 0 : _doneCount / _tasks.length, backgroundColor: AppColors.secondaryLight, valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryDark), minHeight: 12))),
            const SizedBox(width: 16),
            Text('$_doneCount of ${_tasks.length} done', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600, color: AppColors.secondaryDark)),
          ]),
          const SizedBox(height: 32),
          ..._tasks.map((task) => _TaskCard(task: task, onToggle: () => _toggleTask(task))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task, required this.onToggle});
  final _Task task; final VoidCallback onToggle;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onToggle, borderRadius: BorderRadius.circular(AppTheme.radius),
        child: Opacity(
          opacity: task.isDone ? 0.6 : 1.0,
          child: Container(
            padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(AppTheme.radius), border: Border.all(color: task.isDone ? AppColors.successText.withOpacity(0.3) : AppColors.border, width: 1.5)),
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
