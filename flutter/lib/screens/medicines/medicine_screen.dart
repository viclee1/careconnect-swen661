import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../models/medicine.dart';
import '../../state/medicines_controller.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/empty_state.dart';

/// Today's medication tracker. The list is shared with the caregiver's Manage
/// medicines screen, so a medicine they add appears here at once.
class MedicineScreen extends StatelessWidget {
  const MedicineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final MedicinesController controller = context.watch<MedicinesController>();
    final List<Medicine> medicines = controller.medicines;

    return AppScaffold(
      title: 'Medicines',
      body: medicines.isEmpty
          ? const EmptyState(
              icon: Icons.medication_outlined,
              title: 'No medicines today',
              message:
                  'Medicines your care team adds will appear here, with the time to take each one.',
            )
          : ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                  child: Semantics(
                    liveRegion: true,
                    child: Text(
                      '${controller.takenCount} of ${controller.totalCount} taken',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.secondaryDark,
                          ),
                    ),
                  ),
                ),
                for (final Medicine medicine in medicines)
                  // CheckboxListTile already exposes the "checkbox" role, its
                  // checked state and its title and subtitle to screen readers,
                  // so it is left to speak for itself rather than wrapped in a
                  // second label that would be announced twice.
                  Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: CheckboxListTile(
                      key: ValueKey<String>('medicine-${medicine.id}'),
                      title: Text(
                        medicine.name,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text('${medicine.dosage}\n${medicine.time}'),
                      isThreeLine: true,
                      secondary: const Icon(Icons.medication, color: AppColors.primaryDark),
                      value: medicine.taken,
                      onChanged: (_) => controller.toggleTaken(medicine.id),
                    ),
                  ),
              ],
            ),
    );
  }
}
