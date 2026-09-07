import 'package:flutter/widgets.dart';

/// Layout breakpoints.
///
/// One number, used everywhere, so "is this a tablet?" is answered the same way
/// on every screen. 720dp is the Material window-size-class boundary between a
/// compact (phone) and medium (small tablet / unfolded foldable) window.
abstract final class Breakpoints {
  static const double tablet = 720.0;

  /// Widest a single column of text is allowed to get. Beyond roughly this
  /// width a line becomes hard to track back to the start, which matters more
  /// than usual when the reader is also managing a larger text scale.
  static const double readableWidth = 680.0;

  static bool isTablet(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= tablet;
}

/// Centres [child] and stops it stretching past [maxWidth] on a tablet.
class ReadableWidth extends StatelessWidget {
  const ReadableWidth({
    super.key,
    required this.child,
    this.maxWidth = Breakpoints.readableWidth,
  });

  final Widget child;
  final double maxWidth;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: child,
      ),
    );
  }
}
