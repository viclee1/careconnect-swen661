import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/contact.dart';
import '../../../widgets/status_badge.dart';

/// Icon paired with each role, shown beside the relationship in the
/// conversation header. The relationship is always printed next to it, so the
/// icon never carries the meaning alone.
IconData iconForRole(ContactRole role) {
  switch (role) {
    case ContactRole.careTeam:
      return Icons.health_and_safety_outlined;
    case ContactRole.family:
      return Icons.family_restroom_outlined;
    case ContactRole.doctor:
      return Icons.medical_services_outlined;
    case ContactRole.helpline:
      return Icons.support_agent_outlined;
  }
}

/// One person in the Contacts list, laid out as the Week 3 prototype draws it:
/// a lettered avatar, the name, the relationship underneath, a "Primary" pill
/// where it applies, and a count of messages waiting.
///
/// The whole row opens the conversation. There is deliberately no call button
/// here — a voice call is the one channel this app's users cannot use.
class ContactCard extends StatelessWidget {
  const ContactCard({
    super.key,
    required this.contact,
    required this.preview,
    required this.unreadCount,
    required this.onOpenThread,
  });

  final Contact contact;

  /// One-line preview of the latest message in the conversation.
  final String preview;

  /// Messages waiting for a reply. Rendered as a number **and** the word
  /// "waiting", never as a bare coloured dot.
  final int unreadCount;

  final VoidCallback onOpenThread;

  /// Everything a screen reader needs, in one sentence.
  String get _semanticLabel {
    final StringBuffer buffer = StringBuffer(contact.semanticLabel);
    if (unreadCount > 0) {
      buffer.write(', $unreadCount message');
      if (unreadCount != 1) buffer.write('s');
      buffer.write(' waiting');
    }
    buffer.write('. Latest: $preview. Opens the conversation.');
    return buffer.toString();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);

    return MergeSemantics(
      child: Semantics(
        button: true,
        label: _semanticLabel,
        child: Material(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(AppTheme.radius),
          child: InkWell(
            onTap: onOpenThread,
            borderRadius: BorderRadius.circular(AppTheme.radius),
            child: ExcludeSemantics(
              child: Container(
                constraints: const BoxConstraints(minHeight: 76),
                padding: const EdgeInsets.all(AppTheme.gutter),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppTheme.radius),
                  border: Border.all(
                    color: contact.isPrimary
                        ? AppColors.primaryDark
                        : AppColors.border,
                    width: contact.isPrimary ? 2 : 1,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: <Widget>[
                    _Avatar(contact: contact),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              Flexible(
                                child: Text(
                                  contact.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              if (contact.isPrimary) ...<Widget>[
                                const SizedBox(width: 8),
                                const StatusBadge(
                                  icon: Icons.star_outline,
                                  label: 'Primary',
                                ),
                              ],
                            ],
                          ),
                          Text(
                            contact.relationship,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            preview,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.labelMedium,
                          ),
                        ],
                      ),
                    ),
                    if (unreadCount > 0) ...<Widget>[
                      const SizedBox(width: 10),
                      _UnreadBadge(count: unreadCount),
                    ],
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.secondaryDark,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The count of waiting messages: a number in a circle, with the word
/// "waiting" beneath it so the badge is never a bare coloured dot.
class _UnreadBadge extends StatelessWidget {
  const _UnreadBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: AppColors.warningFill,
            shape: BoxShape.circle,
          ),
          child: Text(
            '$count',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.warningText,
            ),
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          'waiting',
          style: TextStyle(
            fontSize: 11,
            height: 1.1,
            color: AppColors.warningText,
          ),
        ),
      ],
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.contact});

  final Contact contact;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: contact.isEmergency
            ? AppColors.errorText
            : AppColors.primaryDark,
        shape: BoxShape.circle,
      ),
      child: Text(
        contact.initials,
        style: const TextStyle(
          color: AppColors.primaryLight,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
