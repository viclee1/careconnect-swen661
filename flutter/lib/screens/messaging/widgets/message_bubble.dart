import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/message.dart';

/// Icon paired with a delivery status. The word is always shown beside it.
IconData iconForStatus(DeliveryStatus status) {
  switch (status) {
    case DeliveryStatus.sending:
      return Icons.schedule;
    case DeliveryStatus.sent:
      return Icons.check;
    case DeliveryStatus.delivered:
      return Icons.done_all;
    case DeliveryStatus.read:
      return Icons.mark_chat_read_outlined;
  }
}

/// One message in a conversation.
///
/// Three of the assigned constraints land in this widget:
///
/// * a voicemail renders its **transcript**, so audio always has a text
///   alternative;
/// * a video message states in words whether captions are attached;
/// * delivery state is written out ("Delivered") next to its tick, so it is
///   never carried by an icon colour alone.
class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.message,
    required this.contactName,
    required this.showDayLabel,
    this.now,
  });

  final Message message;
  final String contactName;

  /// Whether this bubble starts a new day and needs a date separator above it.
  final bool showDayLabel;

  /// Injectable clock, so tests can assert on "Today" / "Yesterday" grouping.
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    final bool isMine = message.isMine;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        if (showDayLabel) _DaySeparator(date: message.sentAt, now: now),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Align(
            alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
            child: Semantics(
              container: true,
              label: message.semanticLabel(contactName),
              child: ExcludeSemantics(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: _Body(message: message, contactName: contactName),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.message, required this.contactName});

  final Message message;
  final String contactName;

  @override
  Widget build(BuildContext context) {
    if (message.isSystem) {
      return _SystemAlert(message: message);
    }

    final bool isMine = message.isMine;
    final Color fill = isMine ? AppColors.primaryDark : AppColors.secondaryLight;
    final Color ink = isMine ? AppColors.primaryLight : AppColors.primaryDark;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(AppTheme.radius),
        border: Border.all(
          color: isMine ? AppColors.primaryDark : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            isMine ? 'You' : contactName,
            style: TextStyle(
              fontSize: 14,
              height: 1.3,
              fontWeight: FontWeight.bold,
              color: ink,
            ),
          ),
          if (message.isTextAlternative) ...<Widget>[
            const SizedBox(height: 8),
            _MediaHeader(message: message, ink: ink),
          ],
          const SizedBox(height: 8),
          Text(
            message.body,
            style: TextStyle(fontSize: 17, height: 1.5, color: ink),
          ),
          const SizedBox(height: 8),
          _Footer(message: message, ink: ink),
        ],
      ),
    );
  }
}

/// The "Transcript" / "Captions available" heading above a media message.
class _MediaHeader extends StatelessWidget {
  const _MediaHeader({required this.message, required this.ink});

  final Message message;
  final Color ink;

  @override
  Widget build(BuildContext context) {
    final String heading = message.alternativeHeading ?? '';
    final IconData icon = message.kind == MessageKind.voicemail
        ? Icons.record_voice_over_outlined
        : Icons.closed_caption_outlined;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.warningFill,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.warningText),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 18, color: AppColors.warningText),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              message.mediaLabel == null
                  ? heading
                  : '$heading · ${message.mediaLabel}',
              style: const TextStyle(
                fontSize: 14,
                height: 1.3,
                fontWeight: FontWeight.w600,
                color: AppColors.warningText,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Timestamp plus, for outgoing messages, the delivery state in words.
class _Footer extends StatelessWidget {
  const _Footer({required this.message, required this.ink});

  final Message message;
  final Color ink;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Text(
          Formatters.clock(message.sentAt),
          style: TextStyle(fontSize: 13, height: 1.3, color: ink),
        ),
        if (message.isMine) ...<Widget>[
          const SizedBox(width: 10),
          Icon(iconForStatus(message.status), size: 16, color: ink),
          const SizedBox(width: 4),
          Text(
            message.status.label,
            style: TextStyle(fontSize: 13, height: 1.3, color: ink),
          ),
        ],
      ],
    );
  }
}

/// A CareConnect alert delivered inside the conversation.
class _SystemAlert extends StatelessWidget {
  const _SystemAlert({required this.message});

  final Message message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.warningFill,
        borderRadius: BorderRadius.circular(AppTheme.radius),
        border: Border.all(color: AppColors.warningText, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(
                Icons.notifications_active_outlined,
                size: 20,
                color: AppColors.warningText,
              ),
              const SizedBox(width: 8),
              Text(
                'CareConnect alert · ${Formatters.clock(message.sentAt)}',
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.3,
                  fontWeight: FontWeight.bold,
                  color: AppColors.warningText,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            message.body,
            style: const TextStyle(
              fontSize: 17,
              height: 1.5,
              color: AppColors.warningText,
            ),
          ),
        ],
      ),
    );
  }
}

/// "Today" / "Yesterday" / "Mon 1 Sep" divider between days.
class _DaySeparator extends StatelessWidget {
  const _DaySeparator({required this.date, required this.now});

  final DateTime date;
  final DateTime? now;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: <Widget>[
          const Expanded(child: Divider(color: AppColors.border)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Semantics(
              header: true,
              child: Text(
                Formatters.dayLabel(date, now: now),
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.3,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secondaryDark,
                ),
              ),
            ),
          ),
          const Expanded(child: Divider(color: AppColors.border)),
        ],
      ),
    );
  }
}
