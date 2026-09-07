import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../screens/contacts/contacts_screen.dart';
import '../../screens/messaging/message_thread_screen.dart';
import '../../screens/pending/pending_screen.dart';
import '../../screens/settings/settings_screen.dart';
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
/// The four screens owned by other team members are registered as
/// [PendingScreen] placeholders so the prototype's navigation works end to end.
/// Each is one line to replace when a branch merges.
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

          // ── Owned by other team members ─────────────────────────────────
          GoRoute(
            path: Routes.home,
            name: Routes.homeName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(
              const PendingScreen(title: 'Home', owner: 'Justin'),
            ),
          ),
          GoRoute(
            path: Routes.myDay,
            name: Routes.myDayName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(
              const PendingScreen(title: 'My Day', owner: 'Justin'),
            ),
          ),
          GoRoute(
            path: Routes.appointments,
            name: Routes.appointmentsName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(
              const PendingScreen(title: 'Appointments', owner: 'Rehman'),
            ),
          ),
          GoRoute(
            path: Routes.medicines,
            name: Routes.medicinesName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(
              const PendingScreen(title: 'Medicines', owner: 'Rehman'),
            ),
          ),
          GoRoute(
            path: Routes.memories,
            name: Routes.memoriesName,
            pageBuilder: (BuildContext context, GoRouterState state) => page(
              const PendingScreen(title: 'Memories', owner: 'Rehman'),
            ),
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
