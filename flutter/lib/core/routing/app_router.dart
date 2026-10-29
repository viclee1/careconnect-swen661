import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../screens/appointments/appts_screen.dart';
import '../../screens/auth/sign_in_screen.dart';
import '../../screens/auth/sign_up_screen.dart';
import '../../screens/caregiver/dashboard_screen.dart';
import '../../screens/caregiver/manage_screens.dart';
import '../../screens/caregiver/notes_screen.dart';
import '../../screens/caregiver/role_chooser_screen.dart';
import '../../screens/contacts/contacts_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/medicines/medicine_screen.dart';
import '../../screens/memories/memories_screen.dart';
import '../../screens/messaging/message_thread_screen.dart';
import '../../screens/my_day/my_day_screen.dart';
import '../../screens/settings/settings_screen.dart';
import '../../screens/splash/welcome_screen.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';
import 'routes.dart';

/// Builds the app's [GoRouter].
///
/// go_router sits on Navigator 2.0, which is what lets a conversation be
/// addressed by URL: `/contacts/c1` resolves the same whether it was reached by
/// tapping a card or restored from a cold start.
///
/// The six top-level destinations live inside a [ShellRoute], so [AppShell] —
/// and with it the bottom bar or the tablet sidebar — is built once and stays
/// mounted while only the page underneath changes. Each of those pages is a
/// [NoTransitionPage], so switching tabs swaps the content with no slide and no
/// fade: the navigation is furniture, not something that should move.
///
/// The conversation screen sits *outside* the shell, on the root navigator, so
/// it covers the bar the way a drill-down should and keeps a normal push
/// animation and back-swipe.
///
/// Welcome, sign in and sign up sit outside the shell too, ahead of it: they
/// are the app's cold-start flow, not a tab a user switches back to.
///
/// Appointments, Medicines and Memories are Rehman's screens, merged in from
/// his branch.
GoRouter buildRouter({String initialLocation = Routes.initial}) {
  // Built per router rather than at file scope, so two routers can exist at
  // once (as they do across widget tests) without clashing over one key.
  final GlobalKey<NavigatorState> rootKey =
      GlobalKey<NavigatorState>(debugLabel: 'root');
  final GlobalKey<NavigatorState> shellKey =
      GlobalKey<NavigatorState>(debugLabel: 'shell');

  /// A page that appears without animating.
  NoTransitionPage<void> page(Widget child) =>
      NoTransitionPage<void>(child: child);

  return GoRouter(
    navigatorKey: rootKey,
    initialLocation: initialLocation,
    routes: <RouteBase>[
      GoRoute(
        path: Routes.welcome,
        name: Routes.welcomeName,
        builder: (BuildContext context, GoRouterState state) =>
            const WelcomeScreen(),
      ),
      GoRoute(
        path: Routes.signIn,
        name: Routes.signInName,
        builder: (BuildContext context, GoRouterState state) =>
            const SignInScreen(),
      ),
      GoRoute(
        path: Routes.signUp,
        name: Routes.signUpName,
        builder: (BuildContext context, GoRouterState state) =>
            const SignUpScreen(),
      ),
      GoRoute(
        path: Routes.roleChooser,
        name: Routes.roleChooserName,
        builder: (BuildContext context, GoRouterState state) =>
            const RoleChooserScreen(),
      ),
      ShellRoute(
        navigatorKey: shellKey,
        builder: (BuildContext context, GoRouterState state, Widget child) =>
            AppShell(location: state.uri.path, child: child),
        routes: <RouteBase>[
          GoRoute(
            path: Routes.contacts,
            name: Routes.contactsName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const ContactsScreen()),
          ),
          GoRoute(
            path: Routes.settings,
            name: Routes.settingsName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const SettingsScreen()),
          ),

          GoRoute(
            path: Routes.home,
            name: Routes.homeName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const HomeScreen()),
          ),
          GoRoute(
            path: Routes.myDay,
            name: Routes.myDayName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const MyDayScreen()),
          ),

          GoRoute(
            path: Routes.appointments,
            name: Routes.appointmentsName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const ApptsScreen()),
          ),
          GoRoute(
            path: Routes.medicines,
            name: Routes.medicinesName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const MedicineScreen()),
          ),
          GoRoute(
            path: Routes.memories,
            name: Routes.memoriesName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const MemoriesScreen()),
          ),
          // The caregiver's, inside the same shell so the bar stays put.
          GoRoute(
            path: Routes.dashboard,
            name: Routes.dashboardName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const DashboardScreen()),
          ),
          GoRoute(
            path: Routes.manageMedicines,
            name: Routes.manageMedicinesName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const ManageMedicinesScreen()),
          ),
          GoRoute(
            path: Routes.manageAppointments,
            name: Routes.manageAppointmentsName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const ManageAppointmentsScreen()),
          ),
          GoRoute(
            path: Routes.activity,
            name: Routes.activityName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const ActivityScreen()),
          ),
          GoRoute(
            path: Routes.notes,
            name: Routes.notesName,
            pageBuilder: (BuildContext context, GoRouterState state) =>
                page(const NotesScreen()),
          ),
        ],
      ),

      // Outside the shell: a conversation covers the navigation entirely.
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
          message: 'The link you followed does not lead anywhere in '
              'CareConnect. Go back to your contacts to carry on.',
          action: FilledButton(
            onPressed: () => context.go(Routes.contacts),
            child: const Text('Back to contacts'),
          ),
        ),
      ),
    ),
  );
}
