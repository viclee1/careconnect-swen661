import 'package:flutter/material.dart';

import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';

/// Stands in for a CareConnect screen another team member owns.
///
/// The Week 3 prototype's navigation has six destinations, so the bar would
/// misrepresent the design if it listed only the screens finished on this
/// branch. These placeholders keep the navigation honest and give each
/// teammate's route somewhere to land.
///
/// They are **not** functional screens and do not count toward the assignment's
/// 7–10 screen requirement.
class PendingScreen extends StatelessWidget {
  const PendingScreen({
    super.key,
    required this.title,
    required this.owner,
  });

  final String title;

  /// The team member building this screen.
  final String owner;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: title,
      subtitle: 'Not on this branch yet',
      body: Center(
        child: EmptyState(
          icon: Icons.construction_outlined,
          title: '$title is still being built',
          message: '$owner is building this screen on their own branch. '
              'It will appear here when the branches are merged.',
        ),
      ),
    );
  }
}
