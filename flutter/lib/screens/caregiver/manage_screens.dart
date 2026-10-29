import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../models/appointment.dart';
import '../../models/caregiver.dart';
import '../../models/medicine.dart';
import '../../state/appointments_controller.dart';
import '../../state/medicines_controller.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';
import 'widgets/caregiver_widgets.dart';

const List<EditField> _medicineFields = <EditField>[
  EditField(name: 'name', label: 'Medicine name', placeholder: 'e.g. Amlodipine'),
  EditField(
    name: 'dosage',
    label: 'Dose',
    placeholder: 'e.g. 5 mg — 1 tablet with food',
    hint: 'Strength, form, quantity, and anything about how to take it.',
  ),
  EditField(name: 'time', label: 'Time to take it', placeholder: 'e.g. 8:30 am'),
];

const List<EditField> _appointmentFields = <EditField>[
  EditField(name: 'doctor', label: 'Who it is with', placeholder: 'e.g. Dr. Sharma'),
  EditField(name: 'specialty', label: 'What it is for', placeholder: 'e.g. Blood pressure check'),
  EditField(name: 'date', label: 'Date', placeholder: 'e.g. Nov 3, 2026'),
  EditField(name: 'time', label: 'Time', placeholder: 'e.g. 10:30 am'),
  EditField(name: 'location', label: 'Where', placeholder: 'e.g. Greenfield Surgery'),
];

/// The list, or the form, of a caregiver's Manage screen — shared by
/// medicines and appointments.
sealed class _Mode {
  const _Mode();
}

class _ListMode extends _Mode {
  const _ListMode();
}

class _AddMode extends _Mode {
  const _AddMode();
}

class _EditMode extends _Mode {
  const _EditMode(this.id);
  final String id;
}

Widget _toolbar(BuildContext context, String count, String addLabel, VoidCallback onAdd) {
  return Wrap(
    alignment: WrapAlignment.spaceBetween,
    crossAxisAlignment: WrapCrossAlignment.center,
    spacing: 12,
    runSpacing: 12,
    children: <Widget>[
      Text(count, style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppColors.secondaryDark)),
      FilledButton.icon(onPressed: onAdd, icon: const Icon(Icons.add), label: Text(addLabel)),
    ],
  );
}

/// The caregiver's medicines list: add, change or remove what Margaret takes.
/// Every change shows on her Medicines screen straight away — it is the same list.
class ManageMedicinesScreen extends StatefulWidget {
  const ManageMedicinesScreen({super.key});

  @override
  State<ManageMedicinesScreen> createState() => _ManageMedicinesScreenState();
}

class _ManageMedicinesScreenState extends State<ManageMedicinesScreen> {
  _Mode _mode = const _ListMode();
  String _notice = '';

  void _done(String message) {
    setState(() {
      _notice = message;
      _mode = const _ListMode();
    });
    announce(context, message);
  }

  @override
  Widget build(BuildContext context) {
    final MedicinesController controller = context.watch<MedicinesController>();
    final List<Medicine> medicines = controller.medicines;
    final _Mode mode = _mode;
    final Medicine? editing = mode is _EditMode
        ? medicines.where((Medicine m) => m.id == mode.id).firstOrNull
        : null;

    final List<Widget> children;
    if (mode is _AddMode) {
      children = <Widget>[
        EditForm(
          heading: 'Add a medicine',
          fields: _medicineFields,
          initial: const <String, String>{},
          submitLabel: 'Add medicine',
          onSubmit: (Map<String, String> v) {
            controller.addMedicine(name: v['name']!, dosage: v['dosage']!, time: v['time']!);
            _done('Added ${v['name']}.');
          },
          onCancel: () => setState(() => _mode = const _ListMode()),
        ),
      ];
    } else if (editing != null) {
      children = <Widget>[
        EditForm(
          heading: 'Edit ${editing.name}',
          fields: _medicineFields,
          initial: <String, String>{'name': editing.name, 'dosage': editing.dosage, 'time': editing.time},
          submitLabel: 'Save changes',
          onSubmit: (Map<String, String> v) {
            controller.updateMedicine(editing.id, name: v['name']!, dosage: v['dosage']!, time: v['time']!);
            _done('Saved ${v['name']}.');
          },
          onCancel: () => setState(() => _mode = const _ListMode()),
        ),
      ];
    } else {
      children = <Widget>[
        if (_notice.isNotEmpty) ...<Widget>[
          Notice(message: _notice, onDismiss: () => setState(() => _notice = '')),
          const SizedBox(height: 12),
        ],
        _toolbar(context, countLabel(medicines.length, 'medicine'), 'Add medicine', () {
          setState(() {
            _notice = '';
            _mode = const _AddMode();
          });
        }),
        const SizedBox(height: 12),
        if (medicines.isEmpty)
          const EmptyState(
            icon: Icons.medication_outlined,
            title: 'No medicines yet',
            message: "Add Margaret's first medicine and it will appear on her Medicines screen.",
          )
        else
          for (final Medicine medicine in medicines)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: EditableCard(
                key: ValueKey<String>('manage-${medicine.id}'),
                icon: Icons.medication,
                title: medicine.name,
                details: <String>[medicine.dosage, medicine.time],
                onEdit: () => setState(() => _mode = _EditMode(medicine.id)),
                onDelete: () {
                  controller.removeMedicine(medicine.id);
                  _done('Deleted ${medicine.name}.');
                },
              ),
            ),
      ];
    }

    return AppScaffold(
      title: 'Manage medicines',
      body: ListView(padding: const EdgeInsets.all(AppTheme.gutter), children: children),
    );
  }
}

/// The caregiver's appointments list: add, change or cancel Margaret's visits.
/// Every change shows on her Appointments screen — it is the same list.
class ManageAppointmentsScreen extends StatefulWidget {
  const ManageAppointmentsScreen({super.key});

  @override
  State<ManageAppointmentsScreen> createState() => _ManageAppointmentsScreenState();
}

class _ManageAppointmentsScreenState extends State<ManageAppointmentsScreen> {
  _Mode _mode = const _ListMode();
  String _notice = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<AppointmentsController>().ensureLoaded();
    });
  }

  void _done(String message) {
    if (!mounted) return;
    setState(() {
      _notice = message;
      _mode = const _ListMode();
    });
    announce(context, message);
  }

  Appointment _fromForm(Map<String, String> v) => Appointment(
        id: '',
        doctor: v['doctor']!,
        specialty: v['specialty']!,
        date: v['date']!,
        time: v['time']!,
        location: v['location']!,
      );

  @override
  Widget build(BuildContext context) {
    final AppointmentsController controller = context.watch<AppointmentsController>();
    final List<Appointment> appointments = controller.appointments;
    final _Mode mode = _mode;
    final Appointment? editing = mode is _EditMode
        ? appointments.where((Appointment a) => a.id == mode.id).firstOrNull
        : null;

    final List<Widget> children = <Widget>[
      if (controller.error != null) ...<Widget>[
        // A failed load is its own fact — never shown as "no appointments".
        AlertBanner(
          tone: AlertTone.error,
          title: 'Appointments could not be loaded',
          message: 'Check the connection, then try again.',
          action: FilledButton(onPressed: controller.load, child: const Text('Try again')),
        ),
        const SizedBox(height: 12),
      ],
    ];

    if (mode is _AddMode) {
      children.add(EditForm(
        heading: 'Add an appointment',
        fields: _appointmentFields,
        initial: const <String, String>{},
        submitLabel: 'Add appointment',
        onSubmit: (Map<String, String> v) async {
          await controller.addAppointment(_fromForm(v));
          _done('Added the appointment with ${v['doctor']}.');
        },
        onCancel: () => setState(() => _mode = const _ListMode()),
      ));
    } else if (editing != null) {
      children.add(EditForm(
        heading: 'Edit the appointment with ${editing.doctor}',
        fields: _appointmentFields,
        initial: <String, String>{
          'doctor': editing.doctor,
          'specialty': editing.specialty,
          'date': editing.date,
          'time': editing.time,
          'location': editing.location,
        },
        submitLabel: 'Save changes',
        onSubmit: (Map<String, String> v) async {
          await controller.updateAppointment(editing.id, _fromForm(v));
          _done('Saved the appointment with ${v['doctor']}.');
        },
        onCancel: () => setState(() => _mode = const _ListMode()),
      ));
    } else {
      children.addAll(<Widget>[
        if (_notice.isNotEmpty) ...<Widget>[
          Notice(message: _notice, onDismiss: () => setState(() => _notice = '')),
          const SizedBox(height: 12),
        ],
        _toolbar(
          context,
          controller.isLoading && !controller.hasLoaded
              ? 'Loading appointments…'
              : countLabel(appointments.length, 'appointment'),
          'Add appointment',
          () => setState(() {
            _notice = '';
            _mode = const _AddMode();
          }),
        ),
        const SizedBox(height: 12),
        if (controller.hasLoaded && appointments.isEmpty)
          const EmptyState(
            icon: Icons.event_outlined,
            title: 'No appointments booked',
            message: "Add Margaret's next visit and it will appear on her Appointments screen.",
          )
        else
          for (final Appointment appointment in appointments)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: EditableCard(
                key: ValueKey<String>('manage-${appointment.id}'),
                icon: Icons.event,
                title: '${appointment.doctor} — ${appointment.specialty}',
                details: <String>['${appointment.date} at ${appointment.time}', appointment.location],
                onEdit: () => setState(() => _mode = _EditMode(appointment.id)),
                onDelete: () async {
                  await controller.removeAppointment(appointment.id);
                  _done('Deleted the appointment with ${appointment.doctor}.');
                },
              ),
            ),
      ]);
    }

    return AppScaffold(
      title: 'Manage appointments',
      body: ListView(padding: const EdgeInsets.all(AppTheme.gutter), children: children),
    );
  }
}
