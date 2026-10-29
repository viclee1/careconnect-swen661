import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/routing/app_router.dart';
import 'core/routing/routes.dart';
import 'core/theme/app_theme.dart';
import 'data/appointment_repository.dart';
import 'data/contact_repository.dart';
import 'data/daily_tasks_repository.dart';
import 'data/medicine_repository.dart';
import 'data/message_repository.dart';
import 'data/settings_repository.dart';
import 'models/caregiver.dart';
import 'state/appointments_controller.dart';
import 'state/caregiver_controller.dart';
import 'state/contacts_controller.dart';
import 'state/daily_tasks_controller.dart';
import 'state/medicines_controller.dart';
import 'state/messages_controller.dart';
import 'state/settings_controller.dart';

/// The root widget.
///
/// Every dependency is injected rather than constructed inside a screen, which
/// is what lets the widget tests below `test/widgets/` swap in fakes and pump
/// the real screens without touching storage.
class CareConnectApp extends StatefulWidget {
  const CareConnectApp({
    super.key,
    required this.contactRepository,
    required this.messageRepository,
    required this.settingsRepository,
    required this.dailyTasksRepository,
    this.medicineRepository,
    this.appointmentRepository,
    this.initialRole = Role.patient,
    this.initialLocation = Routes.initial,
  });

  final ContactRepository contactRepository;
  final MessageRepository messageRepository;
  final SettingsRepository settingsRepository;
  final DailyTasksRepository dailyTasksRepository;

  /// In memory with the shared seed doses when not given.
  final MedicineRepository? medicineRepository;

  /// In memory with the shared seed visits when not given.
  final AppointmentRepository? appointmentRepository;

  /// Who the session starts as; the role chooser sets it after sign-in.
  final Role initialRole;
  final String initialLocation;

  @override
  State<CareConnectApp> createState() => _CareConnectAppState();
}

class _CareConnectAppState extends State<CareConnectApp> {
  late final GoRouter _router =
      buildRouter(initialLocation: widget.initialLocation);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<ContactsController>(
          create: (_) => ContactsController(
            repository: widget.contactRepository,
          ),
        ),
        ChangeNotifierProvider<MessagesController>(
          create: (_) => MessagesController(
            repository: widget.messageRepository,
          ),
        ),
        ChangeNotifierProvider<SettingsController>(
          create: (_) =>
              SettingsController(repository: widget.settingsRepository)..load(),
        ),
        // Ahead of My Day and Medicines, so ticking one off reaches the log.
        ChangeNotifierProvider<CaregiverController>(
          create: (_) => CaregiverController(initialRole: widget.initialRole),
        ),
        ChangeNotifierProvider<DailyTasksController>(
          create: (BuildContext context) => DailyTasksController(
            repository: widget.dailyTasksRepository,
            record: context.read<CaregiverController>().record,
          ),
        ),
        ChangeNotifierProvider<MedicinesController>(
          create: (BuildContext context) => MedicinesController(
            repository: widget.medicineRepository ?? InMemoryMedicineRepository(),
            record: context.read<CaregiverController>().record,
          ),
        ),
        ChangeNotifierProvider<AppointmentsController>(
          create: (_) => AppointmentsController(
            repository: widget.appointmentRepository ?? InMemoryAppointmentRepository(),
          ),
        ),
      ],
      child: MaterialApp.router(
        title: 'CareConnect',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        routerConfig: _router,
      ),
    );
  }
}
