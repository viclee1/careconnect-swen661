import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// Plays a single bright pulse over [child] when [trigger] changes.
///
/// This is the visual half of the Notify action — what the other person's phone
/// does instead of ringing, previewed here so the sender can see what they
/// just sent.
///
/// It is deliberately **one** slow fade rather than a strobe. Anything flashing
/// more than three times a second risks triggering a seizure (WCAG 2.2 success
/// criterion 2.3.1), and this app's users are precisely the people most likely
/// to rely on a visual alert, so the pattern that helps them must not be the
/// pattern that harms someone else.
class VisualFlash extends StatefulWidget {
  const VisualFlash({
    super.key,
    required this.trigger,
    required this.message,
    required this.child,
  });

  /// Increment this to play the pulse. Its value carries no meaning.
  final int trigger;

  /// The words shown on the pulse, so the flash is never wordless.
  final String message;

  final Widget child;

  @override
  State<VisualFlash> createState() => _VisualFlashState();
}

class _VisualFlashState extends State<VisualFlash>
    with SingleTickerProviderStateMixin {
  static const Duration flashDuration = Duration(milliseconds: 900);

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: flashDuration,
  );

  @override
  void didUpdateWidget(VisualFlash oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.trigger != oldWidget.trigger) {
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        widget.child,
        // Fade in over the first third, then fade out — one pulse.
        // Positioned.fill so the pulse covers the screen rather than sizing
        // itself to the words inside it.
        Positioned.fill(
          child: IgnorePointer(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (BuildContext context, Widget? _) {
                final double t = _controller.value;
                if (t == 0) return const SizedBox.shrink();
                final double opacity = t < 0.3 ? t / 0.3 : (1 - t) / 0.7;
                return Opacity(
                  opacity: opacity.clamp(0.0, 1.0),
                  child: Container(
                    color: AppColors.warningFill,
                    alignment: Alignment.center,
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        const Icon(
                          Icons.vibration,
                          size: 64,
                          color: AppColors.warningText,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.message,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 22,
                            height: 1.4,
                            fontWeight: FontWeight.bold,
                            color: AppColors.warningText,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
