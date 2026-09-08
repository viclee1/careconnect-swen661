import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/routing/app_router.dart';
import 'core/routing/routes.dart';
import 'core/theme/app_theme.dart';
import 'data/contact_repository.dart';
import 'data/daily_tasks_repository.dart';
import 'data/message_repository.dart';
import 'data/settings_repository.dart';
import 'state/contacts_controller.dart';
import 'state/daily_tasks_controller.dart';
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
    this.initialLocation = Routes.initial,
  });

  final ContactRepository contactRepository;
  final MessageRepository messageRepository;
  final SettingsRepository settingsRepository;
  final DailyTasksRepository dailyTasksRepository;
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
        ChangeNotifierProvider<DailyTasksController>(
          create: (_) => DailyTasksController(
            repository: widget.dailyTasksRepository,
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
