import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/routing/routes.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import 'responsive.dart';

/// The top-level destinations, in the order the Week 3 prototype shows them.
enum AppDestination {
  home,
  myDay,
  appointments,
  medicines,
  memories,
  contacts,
  settings,
}

/// One navigation destination.
class NavEntry {
  const NavEntry({
    required this.destination,
    required this.icon,
    required this.shortLabel,
    required this.label,
    required this.path,
    this.inBottomBar = true,
  });

  final AppDestination destination;
  final IconData icon;

  /// The cramped label used in the phone's bottom bar — "Appts".
  final String shortLabel;

  /// The full label used in the tablet sidebar — "Appointments".
  final String label;

  final String path;

  /// Settings is reached from the app-bar gear on a phone and from the sidebar
  /// on a tablet, exactly as the prototype lays it out, so it is not one of the
  /// six tabs.
  final bool inBottomBar;
}

/// Every destination, in prototype order.
const List<NavEntry> kDestinations = <NavEntry>[
  NavEntry(
    destination: AppDestination.home,
    icon: Icons.home_outlined,
    shortLabel: 'Home',
    label: 'Home',
    path: Routes.home,
  ),
  NavEntry(
    destination: AppDestination.myDay,
    icon: Icons.wb_sunny_outlined,
    shortLabel: 'My Day',
    label: 'My Day',
    path: Routes.myDay,
  ),
  NavEntry(
    destination: AppDestination.appointments,
    icon: Icons.event_outlined,
    shortLabel: 'Appts',
    label: 'Appointments',
    path: Routes.appointments,
  ),
  NavEntry(
    destination: AppDestination.medicines,
    icon: Icons.medication_outlined,
    shortLabel: 'Medicines',
    label: 'Medicines',
    path: Routes.medicines,
  ),
  NavEntry(
    destination: AppDestination.memories,
    icon: Icons.photo_album_outlined,
    shortLabel: 'Memories',
    label: 'Memories',
    path: Routes.memories,
  ),
  NavEntry(
    destination: AppDestination.contacts,
    icon: Icons.people_outline,
    shortLabel: 'Contacts',
    label: 'Contacts',
    path: Routes.contacts,
  ),
  NavEntry(
    destination: AppDestination.settings,
    icon: Icons.settings_outlined,
    shortLabel: 'Settings',
    label: 'Settings',
    path: Routes.settings,
    inBottomBar: false,
  ),
];

/// The six destinations that appear in the phone's bottom bar.
List<NavEntry> get kBottomBarEntries =>
    kDestinations.where((NavEntry entry) => entry.inBottomBar).toList();

/// Which destination a route path belongs to, or null if it is not a
/// destination at all.
AppDestination? destinationForLocation(String location) {
  for (final NavEntry entry in kDestinations) {
    if (location == entry.path) return entry.destination;
  }
  return null;
}

/// The persistent chrome around every top-level screen.
///
/// This is built once by the router's [ShellRoute] and stays mounted while the
/// routed [child] swaps underneath it. That is what makes switching tabs change
/// the page and nothing else: the bar is not part of the page, so it never
/// animates, and the pages themselves are pushed with no transition.
///
/// On a tablet the bar becomes the prototype's left sidebar, which also carries
/// Settings. On a phone the bar is hidden on Settings, because Settings is
/// reached from the app bar rather than from the bar and behaves as a screen
/// you come back from.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.location, required this.child});

  /// The current route path, used to highlight the right destination.
  final String location;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final AppDestination? current = destinationForLocation(location);
    final bool isTablet = Breakpoints.isTablet(context);

    if (isTablet) {
      return Scaffold(
        body: Row(
          children: <Widget>[
            _Sidebar(current: current),
            const VerticalDivider(width: 1, color: AppColors.border),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: current == AppDestination.settings
          ? null
          : _BottomBar(current: current),
    );
  }
}

/// The app bar and body of a single top-level screen.
///
/// The navigation lives in [AppShell] rather than here, so a screen only has to
/// describe itself.
class AppScaffold extends StatelessWidget {
  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    this.subtitle,
    this.actions,
    this.leading,
    this.showSettingsAction = true,
  });

  final String title;

  /// Optional line under the title explaining what the screen is for.
  final String? subtitle;

  final Widget body;
  final List<Widget>? actions;

  /// Replaces the automatic back button when supplied.
  final Widget? leading;

  /// Whether to offer the settings gear. Off on the Settings screen itself,
  /// and on a tablet, where the sidebar already lists it.
  final bool showSettingsAction;

  @override
  Widget build(BuildContext context) {
    final bool isTablet = Breakpoints.isTablet(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.primaryLight,
        elevation: 0,
        titleSpacing: leading == null ? 16 : 0,
        toolbarHeight: subtitle == null ? 64 : 84,
        leading: leading,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Semantics(
              header: true,
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 24,
                  height: 1.3,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryLight,
                ),
              ),
            ),
            if (subtitle != null)
              Text(
                subtitle!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.3,
                  color: AppColors.primaryLight,
                ),
              ),
          ],
        ),
        actions: <Widget>[
          ...?actions,
          if (showSettingsAction && !isTablet)
            IconButton(
              onPressed: () => GoRouter.maybeOf(context)?.push(Routes.settings),
              icon: const Icon(Icons.settings_outlined),
              tooltip: 'Settings',
            ),
        ],
      ),
      body: SafeArea(child: body),
    );
  }
}

void _goTo(BuildContext context, NavEntry entry) {
  final GoRouter? router = GoRouter.maybeOf(context);
  if (router == null) return;
  // Settings is pushed so it has somewhere to come back to; the six tabs
  // replace each other, which is what keeps the bar from growing a back stack.
  if (entry.destination == AppDestination.settings) {
    router.push(entry.path);
  } else {
    router.go(entry.path);
  }
}

/// The phone navigation bar: six destinations, icon above a short label.
class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.current});

  final AppDestination? current;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.secondaryLight,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: kBottomBarEntries.map((NavEntry entry) {
              final bool selected = entry.destination == current;
              return Expanded(
                child: Semantics(
                  button: true,
                  selected: selected,
                  label: selected
                      ? '${entry.label}, current screen'
                      : 'Go to ${entry.label}',
                  child: InkWell(
                    onTap: () => _goTo(context, entry),
                    child: ExcludeSemantics(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Icon(
                            entry.icon,
                            size: 22,
                            color: AppColors.primaryDark,
                          ),
                          const SizedBox(height: 2),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            child: Text(
                              entry.shortLabel,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 11,
                                height: 1.1,
                                color: AppColors.primaryDark,
                                // The selected tab is bold and underlined as
                                // well as coloured, so its state is never
                                // carried by colour alone.
                                fontWeight: selected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                                decoration: selected
                                    ? TextDecoration.underline
                                    : TextDecoration.none,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

/// The tablet sidebar, listing every destination including Settings, as the
/// prototype's desktop layout does.
class _Sidebar extends StatelessWidget {
  const _Sidebar({required this.current});

  final AppDestination? current;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      color: AppColors.secondaryLight,
      child: SafeArea(
        right: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 12),
          children: kDestinations.map((NavEntry entry) {
            final bool selected = entry.destination == current;
            return Semantics(
              button: true,
              selected: selected,
              label: selected
                  ? '${entry.label}, current screen'
                  : 'Go to ${entry.label}',
              child: InkWell(
                onTap: () => _goTo(context, entry),
                child: ExcludeSemantics(
                  child: Container(
                    constraints: const BoxConstraints(
                      minHeight: AppTheme.minTouchTarget,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    color: selected ? AppColors.primaryDark : null,
                    child: Row(
                      children: <Widget>[
                        Icon(
                          entry.icon,
                          size: 22,
                          color: selected
                              ? AppColors.primaryLight
                              : AppColors.primaryDark,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            entry.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 16,
                              height: 1.3,
                              fontWeight: selected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: selected
                                  ? AppColors.primaryLight
                                  : AppColors.primaryDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
