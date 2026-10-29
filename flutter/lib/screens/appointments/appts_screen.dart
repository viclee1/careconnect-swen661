import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../models/appointment.dart';
import '../../state/appointments_controller.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';

/// Upcoming visits. The list is shared with the caregiver's Manage
/// appointments screen, so a visit they add appears here.
class ApptsScreen extends StatefulWidget {
  const ApptsScreen({super.key});

  @override
  State<ApptsScreen> createState() => _ApptsScreenState();
}

class _ApptsScreenState extends State<ApptsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<AppointmentsController>().ensureLoaded();
    });
  }

  @override
  Widget build(BuildContext context) {
    final AppointmentsController controller = context.watch<AppointmentsController>();

    final Widget body;
    if (controller.error != null) {
      // A failed load is its own fact — never shown as "no appointments".
      body = Padding(
        padding: const EdgeInsets.all(16),
        child: AlertBanner(
          tone: AlertTone.error,
          title: 'Appointments could not be loaded',
          message: 'Check the connection, then try again.',
          action: FilledButton(
            onPressed: controller.load,
            child: const Text('Try again'),
          ),
        ),
      );
    } else if (!controller.hasLoaded) {
      body = Center(
        child: Semantics(
          label: 'Loading appointments',
          child: const CircularProgressIndicator(),
        ),
      );
    } else if (controller.appointments.isEmpty) {
      body = const EmptyState(
        icon: Icons.event_outlined,
        title: 'No appointments booked',
        message: 'Visits your care team books will appear here.',
      );
    } else {
      body = ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: <Widget>[
          for (final Appointment appointment in controller.appointments)
            Semantics(
              label: appointment.semanticLabel,
              child: ExcludeSemantics(
                child: Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.calendar_today, color: AppColors.primaryDark),
                    title: Text(
                      appointment.doctor,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${appointment.date} at ${appointment.time}\n'
                      '${appointment.specialty} · ${appointment.location}',
                    ),
                    isThreeLine: true,
                  ),
                ),
              ),
            ),
        ],
      );
    }

    return AppScaffold(title: 'Appointments', body: body);
  }
}
