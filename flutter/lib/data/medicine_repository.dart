import '../models/medicine.dart';

/// Today's medicines, and the caregiver's changes to them.
abstract class MedicineRepository {
  List<Medicine> getMedicines();
  void setTaken(String id, bool taken);

  /// A new medicine starts the day not taken.
  Medicine addMedicine({required String name, required String dosage, required String time});
  void updateMedicine(String id, {required String name, required String dosage, required String time});
  void removeMedicine(String id);
}

/// The doses the React Native and desktop clients are seeded with.
const List<Medicine> kSeedMedicines = <Medicine>[
  Medicine(id: 'med1', name: 'Amlodipine', dosage: '5 mg — 1 tablet with food', time: '8:30 am', taken: true),
  Medicine(id: 'med2', name: 'Metformin', dosage: '500 mg — 1 tablet with lunch', time: '12:30 pm'),
  Medicine(id: 'med3', name: 'Atorvastatin', dosage: '20 mg — 1 tablet', time: '5:00 pm'),
];

class InMemoryMedicineRepository implements MedicineRepository {
  InMemoryMedicineRepository([List<Medicine> seed = kSeedMedicines])
      : _medicines = List<Medicine>.of(seed),
        _nextId = seed.length + 1;

  List<Medicine> _medicines;
  int _nextId;

  @override
  List<Medicine> getMedicines() => List<Medicine>.unmodifiable(_medicines);

  @override
  void setTaken(String id, bool taken) {
    _medicines = <Medicine>[
      for (final Medicine m in _medicines) m.id == id ? m.copyWith(taken: taken) : m,
    ];
  }

  @override
  Medicine addMedicine({required String name, required String dosage, required String time}) {
    final Medicine medicine =
        Medicine(id: 'med-added-${_nextId++}', name: name, dosage: dosage, time: time);
    _medicines = <Medicine>[..._medicines, medicine];
    return medicine;
  }

  @override
  void updateMedicine(String id, {required String name, required String dosage, required String time}) {
    _medicines = <Medicine>[
      for (final Medicine m in _medicines)
        m.id == id ? m.copyWith(name: name, dosage: dosage, time: time) : m,
    ];
  }

  @override
  void removeMedicine(String id) {
    _medicines = _medicines.where((Medicine m) => m.id != id).toList();
  }
}
