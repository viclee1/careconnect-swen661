import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';

/// The box at the bottom of a conversation where a message is typed.
///
/// Validation is deliberately visible rather than silent: the send button
/// disables itself *and* an explanation appears under the field, because a
/// greyed-out button on its own is a colour-only signal.
class MessageComposer extends StatefulWidget {
  const MessageComposer({
    super.key,
    required this.contactName,
    required this.onSend,
  });

  final String contactName;

  /// Called with the trimmed message body when the user sends.
  final ValueChanged<String> onSend;

  @override
  State<MessageComposer> createState() => _MessageComposerState();
}

class _MessageComposerState extends State<MessageComposer> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  /// Only shown once the user has tried to send, so the field does not scold
  /// them for an empty box they have not touched yet.
  bool _showError = false;

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleSend() {
    final String text = _controller.text;
    if (!Validators.canSend(text)) {
      setState(() => _showError = true);
      return;
    }
    widget.onSend(text.trim());
    _controller.clear();
    setState(() => _showError = false);
    _focusNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final String? error = _showError ? Validators.message(_controller.text) : null;
    final bool canSend = Validators.canSend(_controller.text);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.primaryLight,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Expanded(
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.newline,
                  keyboardType: TextInputType.multiline,
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(fontSize: 17, height: 1.4),
                  decoration: InputDecoration(
                    labelText: 'Message ${widget.contactName}',
                    hintText: 'Message ${widget.contactName}\u2026',
                    filled: true,
                    fillColor: AppColors.secondaryLight,
                    errorText: error,
                    counterText:
                        '${Validators.remaining(_controller.text)} characters left',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radius),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radius),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radius),
                      borderSide: const BorderSide(
                        color: AppColors.primaryDark,
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Padding(
                padding: const EdgeInsets.only(bottom: 22),
                child: Semantics(
                  button: true,
                  enabled: canSend,
                  label: canSend
                      ? 'Send message to ${widget.contactName}'
                      : 'Send. Type a message first.',
                  child: ExcludeSemantics(
                    child: FilledButton(
                      onPressed: _handleSend,
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(
                          AppTheme.minTouchTarget,
                          AppTheme.minTouchTarget,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        backgroundColor: AppColors.primaryDark,
                        foregroundColor: AppColors.primaryLight,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Icon(Icons.send, size: 20),
                          SizedBox(width: 8),
                          Text('Send'),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
