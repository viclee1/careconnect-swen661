import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/routing/routes.dart';

/// A back button that always has somewhere to go.
///
/// `Navigator`'s automatic back button disappears when there is nothing on the
/// stack to pop — which is exactly what happens when a screen is opened from a
/// deep link or a cold start. On a screen with no bottom navigation, that would
/// strand the user, so this falls back to the contact list rather than
/// rendering nothing.
class AppBackButton extends StatelessWidget {
  const AppBackButton({super.key, this.tooltip = 'Back'});

  final String tooltip;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      tooltip: tooltip,
      onPressed: () {
        final GoRouter router = GoRouter.of(context);
        if (router.canPop()) {
          router.pop();
        } else {
          router.go(Routes.contacts);
        }
      },
    );
  }
}
