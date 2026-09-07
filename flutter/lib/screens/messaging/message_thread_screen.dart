import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/routing/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/contact.dart';
import '../../models/message.dart';
import '../../state/contacts_controller.dart';
import '../../state/messages_controller.dart';
import '../../state/settings_controller.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_back_button.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/responsive.dart';
import '../contacts/widgets/contact_card.dart' show iconForRole;
import 'widgets/message_bubble.dart';
import 'widgets/message_composer.dart';
import 'widgets/notify_button.dart';
import 'widgets/visual_flash.dart';

/// The conversation with one contact, opened from the Contacts screen.
///
/// The contact is identified by the `contactId` path parameter, so the screen
/// works from a tap on a card and from a cold deep link alike, and an id that
/// no longer exists lands on a recoverable state rather than a crash.
class MessageThreadScreen extends StatefulWidget {
  const MessageThreadScreen({super.key, required this.contactId, this.now});

  final String contactId;

  /// Injectable clock for deterministic day grouping in tests.
  final DateTime? now;

  @override
  State<MessageThreadScreen> createState() => _MessageThreadScreenState();
}

class _MessageThreadScreenState extends State<MessageThreadScreen> {
  final ScrollController _scrollController = ScrollController();

  /// Incremented to play the Notify flash. Local to this screen, so this is
  /// exactly the sort of transient state `setState` is for.
  int _flashTrigger = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final MessagesController messages = context.read<MessagesController>();
    // Contacts may not be loaded yet if this screen was opened from a deep
    // link rather than by tapping a card.
    final ContactsController contacts = context.read<ContactsController>();
    if (contacts.allContacts.isEmpty) {
      await contacts.load();
    }
    await messages.loadThread(widget.contactId);
    if (!mounted) return;
    // Opening the conversation is what clears its badge on the Contacts
    // screen — the two screens share one controller, so nothing needs to be
    // passed back through the route.
    messages.markRead(widget.contactId);
    _scrollToEnd();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    });
  }

  Future<void> _send(String body) async {
    await context.read<MessagesController>().send(widget.contactId, body);
    if (!mounted) return;
    _scrollToEnd();
  }

  /// Sends the silent alert: a flash on their screen, a buzz in their pocket,
  /// and a line in the thread saying it went.
  Future<void> _notify(Contact contact) async {
    final SettingsController settings = context.read<SettingsController>();
    final MessagesController messages = context.read<MessagesController>();

    setState(() => _flashTrigger++);
    if (settings.vibrationEnabled) {
      await HapticFeedback.heavyImpact();
    }
    await messages.sendNotify(widget.contactId, contact.conversationName);
    if (!mounted) return;
    _scrollToEnd();
  }

  @override
  Widget build(BuildContext context) {
    final ContactsController contacts = context.watch<ContactsController>();
    final MessagesController messages = context.watch<MessagesController>();
    final SettingsController settings = context.watch<SettingsController>();

    final Contact? contact = contacts.byId(widget.contactId);
    if (contact == null) {
      return _NotFoundScaffold(isLoading: contacts.isLoading);
    }

    final List<Message> thread = messages.messagesFor(widget.contactId);
    final bool threadHasVideo = thread.any(
      (Message message) => message.kind == MessageKind.videoMessage,
    );
    final bool isTablet = Breakpoints.isTablet(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.primaryLight,
        elevation: 0,
        toolbarHeight: 76,
        titleSpacing: 0,
        // Explicit rather than automatic, so a conversation opened from a deep
        // link still has a way out.
        leading: const AppBackButton(),
        title: Row(
          children: <Widget>[
            _HeaderAvatar(contact: contact),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Semantics(
                    header: true,
                    child: Text(
                      contact.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 22,
                        height: 1.3,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryLight,
                      ),
                    ),
                  ),
                  Row(
                    children: <Widget>[
                      Icon(
                        iconForRole(contact.role),
                        size: 16,
                        color: AppColors.primaryLight,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          contact.relationship,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15,
                            height: 1.3,
                            color: AppColors.primaryLight,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: <Widget>[
          // A captioned video call, named as the prototype names it. There is
          // no audio-only call anywhere in CareConnect.
          if (isTablet && contact.supportsVideoRelay)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilledButton.icon(
                onPressed: () => _startVideoCall(contact),
                icon: const Icon(Icons.videocam_outlined, size: 20),
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, AppTheme.minTouchTarget),
                  backgroundColor: AppColors.primaryLight,
                  foregroundColor: AppColors.primaryDark,
                ),
                label: Text('Call ${contact.conversationName} now'),
              ),
            ),
          IconButton(
            onPressed: () => _notify(contact),
            icon: const Icon(Icons.vibration),
            tooltip: 'Alert ${contact.conversationName} you want to talk',
          ),
        ],
      ),
      body: SafeArea(
        child: VisualFlash(
          trigger: _flashTrigger,
          message: 'Alert sent to ${contact.conversationName}.\n'
              'Their screen flashed and their phone buzzed.',
          child: Column(
            children: <Widget>[
              // Cross-screen state: captions live in Settings, and turning them
              // off changes what this conversation can show. Saying so here,
              // with a way to fix it, beats letting a video arrive unread.
              if (threadHasVideo && !settings.captionsEnabled)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppTheme.gutter,
                    AppTheme.gutter,
                    AppTheme.gutter,
                    0,
                  ),
                  child: AlertBanner(
                    tone: AlertTone.warning,
                    title: 'Captions are turned off',
                    message: 'This conversation contains a video message. Turn '
                        'captions back on so its words appear on screen.',
                    action: FilledButton.icon(
                      onPressed: () => context.goNamed(Routes.settingsName),
                      icon: const Icon(Icons.settings_outlined, size: 20),
                      label: const Text('Open settings'),
                    ),
                  ),
                ),
              Expanded(
                child: messages.isLoading(widget.contactId)
                    ? const Center(child: CircularProgressIndicator())
                    : thread.isEmpty
                        ? EmptyState(
                            icon: Icons.chat_bubble_outline,
                            title: 'No messages yet',
                            message: 'Send ${contact.conversationName} the '
                                'first message. They will see it as text, not '
                                'as a call.',
                          )
                        : _ThreadList(
                            scrollController: _scrollController,
                            thread: thread,
                            contactName: contact.name,
                            now: widget.now,
                          ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                child: ReadableWidth(
                  child: NotifyButton(
                    contactName: contact.conversationName,
                    vibrationEnabled: settings.vibrationEnabled,
                    onPressed: () => _notify(contact),
                  ),
                ),
              ),
              MessageComposer(
                contactName: contact.conversationName,
                onSend: _send,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _startVideoCall(Contact contact) async {
    await showDialog<void>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        icon: const Icon(Icons.videocam_outlined, size: 32),
        title: const Text('Captioned video call requested'),
        content: Text(
          'We have asked ${contact.name} to join a video call with live '
          'captions turned on. You will get a banner here as soon as they '
          'answer. Nothing will ring — you can put the phone down.',
        ),
        actions: <Widget>[
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

/// The lettered avatar in the conversation header.
class _HeaderAvatar extends StatelessWidget {
  const _HeaderAvatar({required this.contact});

  final Contact contact;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.primaryLight, width: 2),
        ),
        child: Text(
          contact.initials,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryDark,
          ),
        ),
      ),
    );
  }
}

/// The scrolling list of bubbles, with a day separator before the first
/// message of each calendar day.
class _ThreadList extends StatelessWidget {
  const _ThreadList({
    required this.scrollController,
    required this.thread,
    required this.contactName,
    required this.now,
  });

  final ScrollController scrollController;
  final List<Message> thread;
  final String contactName;
  final DateTime? now;

  bool _startsNewDay(int index) {
    if (index == 0) return true;
    final DateTime previous = thread[index - 1].sentAt;
    final DateTime current = thread[index].sentAt;
    return previous.year != current.year ||
        previous.month != current.month ||
        previous.day != current.day;
  }

  @override
  Widget build(BuildContext context) {
    return ReadableWidth(
      child: ListView.builder(
        controller: scrollController,
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.gutter,
          vertical: 12,
        ),
        itemCount: thread.length,
        itemBuilder: (BuildContext context, int index) => MessageBubble(
          message: thread[index],
          contactName: contactName,
          showDayLabel: _startsNewDay(index),
          now: now,
        ),
      ),
    );
  }
}

/// Shown when the requested contact id is not in the contact list.
class _NotFoundScaffold extends StatelessWidget {
  const _NotFoundScaffold({required this.isLoading});

  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.primaryLight,
        leading: const AppBackButton(),
        title: const Text('Conversation'),
      ),
      body: Center(
        child: isLoading
            ? const CircularProgressIndicator()
            : EmptyState(
                icon: Icons.person_off_outlined,
                title: 'That contact is not in your list',
                message: 'They may have been removed. Go back to Contacts to '
                    'see everyone you can message.',
                action: FilledButton.icon(
                  onPressed: () => context.goNamed(Routes.contactsName),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Back to contacts'),
                ),
              ),
      ),
    );
  }
}
