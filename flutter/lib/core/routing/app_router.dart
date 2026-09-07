import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../screens/contacts/contacts_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/my_day/my_day_screen.dart';
import '../../screens/messaging/message_thread_screen.dart';
import '../../screens/pending/pending_screen.dart';
import '../../screens/settings/settings_screen.dart';
import '../../screens/splash/welcome_screen.dart';
import '../../screens/auth/sign_in_screen.dart';
import '../../screens/auth/sign_up_screen.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';
import 'routes.dart';

GoRouter buildRouter({String initialLocation = Routes.initial}) {
  final GlobalKey<NavigatorState> rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');
  final GlobalKey<NavigatorState> shellKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

  NoTransitionPage<void> page(Widget child) => NoTransitionPage<void>(child: child);

  return GoRouter(
    navigatorKey: rootKey,
    initialLocation: initialLocation,
    routes: <RouteBase>[
      GoRoute(
        path: Routes.welcome,
        name: Routes.welcomeName,
        builder: (BuildContext context, GoRouterState state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: Routes.signIn,
        name: Routes.signInName,
        builder: (BuildContext context, GoRouterState state) => const SignInScreen(),
      ),
      GoRoute(
        path: Routes.signUp,
        name: Routes.signUpName,
        builder: (BuildContext context, GoRouterState state) => const SignUpScreen(),
      ),
      ShellRoute(
        navigatorKey: shellKey,
        builder: (BuildContext context, GoRouterState state, Widget child) =>
            AppShell(location: state.uri.path, child: child),
        routes: <RouteBase>[
          GoRoute(
            path: Routes.contacts,
            name: Routes.contactsName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const ContactsScreen()),
          ),
          GoRoute(
            path: Routes.settings,
            name: Routes.settingsName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const SettingsScreen()),
          ),
          GoRoute(
            path: Routes.home,
            name: Routes.homeName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const HomeScreen()),
          ),
          GoRoute(
            path: Routes.myDay,
            name: Routes.myDayName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const MyDayScreen()),
          ),
          GoRoute(
            path: Routes.appointments,
            name: Routes.appointmentsName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const PendingScreen(title: 'Appointments', owner: 'Rehman')),
          ),
          GoRoute(
            path: Routes.medicines,
            name: Routes.medicinesName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const PendingScreen(title: 'Medicines', owner: 'Rehman')),
          ),
          GoRoute(
            path: Routes.memories,
            name: Routes.memoriesName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(const PendingScreen(title: 'Memories', owner: 'Rehman')),
          ),
        ],
      ),
      GoRoute(
        path: Routes.messageThread,
        name: Routes.messageThreadName,
        builder: (BuildContext context, GoRouterState state) {
          final String contactId = state.pathParameters['contactId'] ?? '';
          return MessageThreadScreen(contactId: contactId);
        },
      ),
    ],
    errorBuilder: (BuildContext context, GoRouterState state) => Scaffold(
      body: Center(
        child: EmptyState(
          icon: Icons.explore_off_outlined,
          title: 'That screen does not exist',
          message: 'The link you followed does not lead anywhere in CareConnect. Go back to your contacts to carry on.',
          action: FilledButton(
            onPressed: () => context.go(Routes.contacts),
            child: const Text('Back to contacts'),
          ),
        ),
      ),
    ),
  );
}
