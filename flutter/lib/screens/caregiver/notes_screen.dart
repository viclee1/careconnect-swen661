import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/caregiver.dart';
import '../../state/caregiver_controller.dart';
import '../../widgets/app_scaffold.dart';
import 'widgets/caregiver_widgets.dart';

/// The badge colours for each priority — a word as well, never colour alone.
const Map<NotePriority, ({Color fill, Color text})> _priorityColours =
    <NotePriority, ({Color fill, Color text})>{
  NotePriority.routine: (fill: AppColors.secondaryLight, text: AppColors.primaryDark),
  NotePriority.note: (fill: AppColors.warningFill, text: AppColors.warningText),
  NotePriority.urgent: (fill: AppColors.errorFill, text: AppColors.errorText),
};

/// Notes caregivers leave for each other about Margaret, newest first.
class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  final TextEditingController _text = TextEditingController();
  final FocusNode _focus = FocusNode();
  NotePriority _priority = NotePriority.routine;
  String? _error;
  String _notice = '';

  @override
  void dispose() {
    _text.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _save() {
    if (_text.text.trim().isEmpty) {
      const String message = 'Write the note before saving it.';
      setState(() => _error = message);
      announce(context, message);
      _focus.requestFocus();
      return;
    }
    context.read<CaregiverController>().addNote(_text.text.trim(), _priority);
    final String message = '${_priority.label} note saved.';
    setState(() {
      _text.clear();
      _priority = NotePriority.routine;
      _error = null;
      _notice = message;
    });
    announce(context, message);
  }

  @override
  Widget build(BuildContext context) {
    final List<CaregiverNote> notes = context.watch<CaregiverController>().notes;
    final TextTheme text = Theme.of(context).textTheme;

    return AppScaffold(
      title: 'Care notes',
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.gutter),
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(AppTheme.gutter),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(AppTheme.radius),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Semantics(
                  header: true,
                  child: Text('Add a note', style: text.titleLarge?.copyWith(color: AppColors.primaryDark)),
                ),
                const SizedBox(height: 12),
                TextField(
                  key: const ValueKey<String>('note-text'),
                  controller: _text,
                  focusNode: _focus,
                  minLines: 3,
                  maxLines: 6,
                  decoration: InputDecoration(
                    labelText: 'Note',
                    hintText: 'What happened, and what the next caregiver should know',
                    errorText: _error,
                  ),
                  onChanged: (String value) {
                    if (_error != null && value.trim().isNotEmpty) setState(() => _error = null);
                  },
                ),
                const SizedBox(height: 12),
                Text('Priority', style: text.titleSmall?.copyWith(color: AppColors.primaryDark)),
                RadioGroup<NotePriority>(
                  groupValue: _priority,
                  onChanged: (NotePriority? value) {
                    if (value != null) setState(() => _priority = value);
                  },
                  child: Wrap(
                    children: <Widget>[
                      for (final NotePriority value in NotePriority.values)
                        SizedBox(
                          width: 160,
                          child: RadioListTile<NotePriority>(
                            value: value,
                            title: Text(value.label),
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                FilledButton.icon(onPressed: _save, icon: const Icon(Icons.check), label: const Text('Save note')),
              ],
            ),
          ),
          if (_notice.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            Notice(message: _notice, onDismiss: () => setState(() => _notice = '')),
          ],
          const SizedBox(height: 20),
          Semantics(
            header: true,
            child: Text('Notes', style: text.titleLarge?.copyWith(color: AppColors.primaryDark)),
          ),
          const SizedBox(height: 8),
          for (final CaregiverNote note in notes) _NoteCard(note: note),
        ],
      ),
    );
  }
}

class _NoteCard extends StatelessWidget {
  const _NoteCard({required this.note});

  final CaregiverNote note;

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    final String when = '${formatEventDay(note.at)}, ${formatEventTime(note.at)}';
    final ({Color fill, Color text}) colours = _priorityColours[note.priority]!;
    return Semantics(
      label: '${note.priority.label} note from ${note.author}, $when. ${note.text}',
      excludeSemantics: true,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border, width: 1.5),
          borderRadius: BorderRadius.circular(AppTheme.radius),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(note.text, style: text.titleSmall?.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w600,
                  )),
                  const SizedBox(height: 4),
                  Text('${note.author} · $when', style: text.bodySmall?.copyWith(color: AppColors.secondaryDark)),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
              decoration: BoxDecoration(
                color: colours.fill,
                border: Border.all(color: colours.text, width: 1.5),
                borderRadius: BorderRadius.circular(AppTheme.radius),
              ),
              child: Text(note.priority.label, style: text.labelMedium?.copyWith(
                color: colours.text,
                fontWeight: FontWeight.bold,
              )),
            ),
          ],
        ),
      ),
    );
  }
}
