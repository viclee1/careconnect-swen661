import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../../../widgets/alert_banner.dart';

/// Announces [message] to a screen reader without moving focus.
void announce(BuildContext context, String message) {
  SemanticsService.sendAnnouncement(View.of(context), message, Directionality.of(context));
}

/// One field of an [EditForm].
class EditField {
  const EditField({required this.name, required this.label, this.hint, this.placeholder});

  final String name;
  final String label;
  final String? hint;
  final String? placeholder;
}

/// The caregiver's add / edit form: labelled text fields, all required.
///
/// Errors are checked on Save, not while typing. Each is printed under its
/// field, a summary is shown and announced, and focus moves to the first field
/// to fix — the same pattern as the web, desktop and React Native clients.
class EditForm extends StatefulWidget {
  const EditForm({
    super.key,
    required this.heading,
    required this.fields,
    required this.initial,
    required this.submitLabel,
    required this.onSubmit,
    required this.onCancel,
  });

  final String heading;
  final List<EditField> fields;
  final Map<String, String> initial;
  final String submitLabel;
  final void Function(Map<String, String> values) onSubmit;
  final VoidCallback onCancel;

  @override
  State<EditForm> createState() => _EditFormState();
}

class _EditFormState extends State<EditForm> {
  late final Map<String, TextEditingController> _controllers = <String, TextEditingController>{
    for (final EditField field in widget.fields)
      field.name: TextEditingController(text: widget.initial[field.name] ?? ''),
  };
  late final Map<String, FocusNode> _focus = <String, FocusNode>{
    for (final EditField field in widget.fields) field.name: FocusNode(),
  };
  Map<String, String> _errors = <String, String>{};

  @override
  void dispose() {
    for (final TextEditingController c in _controllers.values) {
      c.dispose();
    }
    for (final FocusNode f in _focus.values) {
      f.dispose();
    }
    super.dispose();
  }

  Map<String, String> get _values => <String, String>{
        for (final MapEntry<String, TextEditingController> e in _controllers.entries)
          e.key: e.value.text,
      };

  void _submit() {
    final Map<String, String> found = Validators.requiredFields(
      <({String name, String label})>[
        for (final EditField f in widget.fields) (name: f.name, label: f.label),
      ],
      _values,
    );
    setState(() => _errors = found);
    if (found.isNotEmpty) {
      final EditField first = widget.fields.firstWhere((EditField f) => found.containsKey(f.name));
      announce(context, '${Validators.fixSummary(found.length)}. ${found[first.name]}');
      _focus[first.name]!.requestFocus();
      return;
    }
    widget.onSubmit(<String, String>{
      for (final MapEntry<String, String> e in _values.entries) e.key: e.value.trim(),
    });
  }

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppTheme.gutter),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(AppTheme.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Semantics(
            header: true,
            child: Text(widget.heading, style: text.titleLarge?.copyWith(color: AppColors.primaryDark)),
          ),
          const SizedBox(height: 12),
          if (_errors.isNotEmpty) ...<Widget>[
            AlertBanner(
              tone: AlertTone.error,
              title: Validators.fixSummary(_errors.length),
              message: 'Each one is described under its field.',
            ),
            const SizedBox(height: 12),
          ],
          for (final EditField field in widget.fields) ...<Widget>[
            TextField(
              key: ValueKey<String>('field-${field.name}'),
              controller: _controllers[field.name],
              focusNode: _focus[field.name],
              decoration: InputDecoration(
                labelText: field.label,
                hintText: field.placeholder,
                helperText: field.hint,
                helperMaxLines: 2,
                errorText: _errors[field.name],
              ),
              onChanged: (String value) {
                if (_errors.containsKey(field.name) && value.trim().isNotEmpty) {
                  setState(() => _errors = Map<String, String>.of(_errors)..remove(field.name));
                }
              },
            ),
            const SizedBox(height: 14),
          ],
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              FilledButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.check),
                label: Text(widget.submitLabel),
              ),
              OutlinedButton(onPressed: widget.onCancel, child: const Text('Cancel')),
            ],
          ),
        ],
      ),
    );
  }
}

/// One item a caregiver can change: its details, then Edit and Delete.
///
/// Delete asks first, in place — "Delete Amlodipine?" with Yes / Cancel —
/// rather than in a dialog, so nothing covers the screen and nothing times out.
class EditableCard extends StatefulWidget {
  const EditableCard({
    super.key,
    required this.icon,
    required this.title,
    required this.details,
    required this.onEdit,
    required this.onDelete,
  });

  final IconData icon;
  final String title;
  final List<String> details;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  State<EditableCard> createState() => _EditableCardState();
}

class _EditableCardState extends State<EditableCard> {
  bool _confirming = false;

  @override
  Widget build(BuildContext context) {
    final TextTheme text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(AppTheme.gutter),
      decoration: BoxDecoration(
        color: AppColors.secondaryLight,
        border: Border.all(color: AppColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(AppTheme.radius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          MergeSemantics(
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AppColors.primaryDark,
                  child: ExcludeSemantics(child: Icon(widget.icon, color: AppColors.primaryLight)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(widget.title, style: text.titleMedium?.copyWith(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.bold,
                      )),
                      for (final String line in widget.details)
                        Text(line, style: text.bodyMedium?.copyWith(color: AppColors.secondaryDark)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (_confirming) ...<Widget>[
            Text(
              'Delete ${widget.title}?',
              style: text.titleSmall?.copyWith(color: AppColors.errorText, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: <Widget>[
                Semantics(
                  label: 'Yes, delete ${widget.title}',
                  container: true,
                  excludeSemantics: true,
                  button: true,
                  child: FilledButton(
                    onPressed: widget.onDelete,
                    style: FilledButton.styleFrom(backgroundColor: AppColors.errorText),
                    child: const Text('Yes, delete'),
                  ),
                ),
                OutlinedButton(
                  onPressed: () => setState(() => _confirming = false),
                  child: const Text('Cancel'),
                ),
              ],
            ),
          ] else
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: <Widget>[
                Semantics(
                  label: 'Edit ${widget.title}',
                  container: true,
                  excludeSemantics: true,
                  button: true,
                  child: OutlinedButton.icon(
                    onPressed: widget.onEdit,
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Edit'),
                  ),
                ),
                Semantics(
                  label: 'Delete ${widget.title}',
                  container: true,
                  excludeSemantics: true,
                  button: true,
                  child: OutlinedButton.icon(
                    onPressed: () => setState(() => _confirming = true),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.errorText,
                      side: const BorderSide(color: AppColors.errorText, width: 1.5),
                    ),
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Delete'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

/// A dismissible confirmation — "Added Vitamin D." — in place of a timed snackbar.
class Notice extends StatelessWidget {
  const Notice({super.key, required this.message, required this.onDismiss});

  final String message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.successFill,
        border: Border.all(color: AppColors.successText, width: 1.5),
        borderRadius: BorderRadius.circular(AppTheme.radius),
      ),
      child: Row(
        children: <Widget>[
          const ExcludeSemantics(child: Icon(Icons.check, color: AppColors.successText)),
          const SizedBox(width: 10),
          Expanded(
            child: Semantics(
              liveRegion: true,
              child: Text(
                message,
                style: const TextStyle(color: AppColors.successText, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          Semantics(
            label: 'OK, dismiss',
            container: true,
            excludeSemantics: true,
            button: true,
            child: TextButton(onPressed: onDismiss, child: const Text('OK')),
          ),
        ],
      ),
    );
  }
}
