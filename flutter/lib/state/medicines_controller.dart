import 'package:flutter/foundation.dart';

import '../data/medicine_repository.dart';
import '../models/caregiver.dart';
import '../models/medicine.dart';
import 'caregiver_controller.dart';

/// Today's medicines, shared by the care recipient's Medicines screen and the
/// caregiver's Manage medicines screen — one list, so an edit shows on both.
class MedicinesController extends ChangeNotifier {
  MedicinesController({required MedicineRepository repository, ActivityRecorder? record})
      : _repository = repository,
        _record = record;

  final MedicineRepository _repository;
  final ActivityRecorder? _record;

  List<Medicine> get medicines => _repository.getMedicines();
  int get takenCount => medicines.where((Medicine m) => m.taken).length;
  int get totalCount => medicines.length;

  void toggleTaken(String id) {
    final Medicine medicine = medicines.firstWhere((Medicine m) => m.id == id);
    _repository.setTaken(id, !medicine.taken);
    final event = activityForMedicine(medicine.name, !medicine.taken);
    _record?.call(event.kind, event.label);
    notifyListeners();
  }

  Medicine addMedicine({required String name, required String dosage, required String time}) {
    final Medicine added = _repository.addMedicine(name: name, dosage: dosage, time: time);
    notifyListeners();
    return added;
  }

  void updateMedicine(String id, {required String name, required String dosage, required String time}) {
    _repository.updateMedicine(id, name: name, dosage: dosage, time: time);
    notifyListeners();
  }

  void removeMedicine(String id) {
    _repository.removeMedicine(id);
    notifyListeners();
  }
}
