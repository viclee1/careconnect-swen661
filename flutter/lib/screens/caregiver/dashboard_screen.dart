import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/appointment.dart';
import '../../models/caregiver.dart';
import '../../models/daily_task.dart';
import '../../state/appointments_controller.dart';
import '../../state/caregiver_controller.dart';
import '../../state/daily_tasks_controller.dart';
import '../../state/medicines_controller.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';

/// The caregiver's home: how the care recipient's day is going, at a glance,
/// with a way into each thing the caregiver looks after.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<AppointmentsController>().ensureLoaded();
    });
  }

  @override
  Widget build(BuildContext context) {
    final MedicinesController medicines = context.watch<MedicinesController>();
    final DailyTasksController tasks = context.watch<DailyTasksController>();
    final AppointmentsController appointments = context.watch<AppointmentsController>();
    final List<ActivityEvent> recent = context.watch<CaregiverController>().activity.take(3).toList();
    final bool checkedIn = tasks.tasks.any((DailyTask t) => isCheckIn(t) && t.isDone);
    final Appointment? next = appointments.appointments.isEmpty ? null : appointments.appointments.first;
    final String nextText = next != null
        ? '${next.doctor}, ${next.date} at ${next.time}'
        : appointments.hasLoaded
            ? 'None booked'
            : 'Loading…';
    final TextTheme text = Theme.of(context).textTheme;

    return AppScaffold(
      title: 'Dashboard',
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.gutter),
        children: <Widget>[
          Text("How Margaret's day is going", style: text.bodyLarge?.copyWith(color: AppColors.secondaryDark)),
          const SizedBox(height: 16),
          _StatCard(
            icon: Icons.medication_outlined,
            label: 'Medicines',
            value: '${medicines.takenCount} of ${medicines.totalCount} taken today',
            action: OutlinedButton(
              onPressed: () => context.go(Routes.manageMedicines),
              child: const Text('Manage medicines'),
            ),
          ),
          _StatCard(
            icon: Icons.wb_sunny_outlined,
            label: 'My Day',
            value: '${tasks.doneCount} of ${tasks.totalCount} tasks done',
          ),
          _StatCard(
            icon: Icons.person_outline,
            label: 'Check-in',
            value: checkedIn ? 'Checked in today' : 'Not checked in yet',
          ),
          _StatCard(
            icon: Icons.event_outlined,
            label: 'Next appointment',
            value: nextText,
            action: OutlinedButton(
              onPressed: () => context.go(Routes.manageAppointments),
              child: const Text('Manage appointments'),
            ),
          ),
          const SizedBox(height: 8),
          Semantics(
            header: true,
            child: Text('Recent activity', style: text.titleLarge?.copyWith(color: AppColors.primaryDark)),
          ),
          const SizedBox(height: 8),
          if (recent.isEmpty)
            Text(
              'Nothing yet today. Medicines taken and tasks finished will appear here.',
              style: text.bodyLarge?.copyWith(color: AppColors.secondaryDark),
            )
          else
            for (final ActivityEvent event in recent) ActivityRow(event: event),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: OutlinedButton(
              onPressed: () => context.go(Routes.activity),
              child: const Text('View all activity'),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.icon, required this.label, required this.value, this.action});

  final IconData icon;
  final String label;
  final String value;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(AppTheme.gutter),
      decoration: BoxDecoration(
        color: AppColors.secondaryLight,
        border: Border.all(color: AppColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(AppTheme.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Semantics(
            label: '$label: $value',
            excludeSemantics: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Icon(icon, size: 20, color: AppColors.primaryDark),
                    const SizedBox(width: 8),
                    Text(label, style: text.titleSmall?.copyWith(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.bold,
                    )),
                  ],
                ),
                const SizedBox(height: 4),
                Text(value, style: text.bodyLarge?.copyWith(color: AppColors.primaryDark)),
              ],
            ),
          ),
          if (action != null) ...<Widget>[const SizedBox(height: 12), action!],
        ],
      ),
    );
  }
}

/// One event of the activity log: what happened, its kind, and when.
class ActivityRow extends StatelessWidget {
  const ActivityRow({super.key, required this.event, this.showKind = false});

  final ActivityEvent event;
  final bool showKind;

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    final String time = formatEventTime(event.at);
    return Semantics(
      label: showKind ? '${event.label}. ${event.kind.label}, $time' : '${event.label}, $time',
      excludeSemantics: true,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border, width: 1.5),
          borderRadius: BorderRadius.circular(AppTheme.radius),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(event.label, style: text.titleSmall?.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.bold,
                  )),
                  if (showKind)
                    Text(event.kind.label, style: text.bodyMedium?.copyWith(color: AppColors.secondaryDark)),
                ],
              ),
            ),
            Text(time, style: text.bodyMedium?.copyWith(color: AppColors.secondaryDark)),
          ],
        ),
      ),
    );
  }
}

/// Everything the care recipient has done this session, newest first.
class ActivityScreen extends StatelessWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<ActivityEvent> activity = context.watch<CaregiverController>().activity;
    return AppScaffold(
      title: 'Activity',
      body: activity.isEmpty
          ? const EmptyState(
              icon: Icons.timeline,
              title: 'Nothing yet',
              message: 'When Margaret takes a medicine, finishes a task or checks in, it appears here.',
            )
          : ListView(
              padding: const EdgeInsets.all(AppTheme.gutter),
              children: <Widget>[
                Semantics(
                  liveRegion: true,
                  child: Text(
                    '${countLabel(activity.length, 'event')} this session',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppColors.secondaryDark),
                  ),
                ),
                const SizedBox(height: 12),
                for (final ActivityEvent event in activity) ActivityRow(event: event, showKind: true),
              ],
            ),
    );
  }
}
