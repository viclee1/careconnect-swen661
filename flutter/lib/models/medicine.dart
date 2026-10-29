/// A tracked medication and whether today's dose has been taken.
///
/// The same shape, and the same seed doses, as the React Native and desktop
/// clients, so the three agree on what Margaret takes.
class Medicine {
  const Medicine({
    required this.id,
    required this.name,
    required this.dosage,
    required this.time,
    this.taken = false,
  });

  final String id;
  final String name;

  /// Dosage and instructions as the design prints them — "5 mg — 1 tablet with food".
  final String dosage;

  /// Time of day as the design prints it — "8:30 am".
  final String time;

  final bool taken;

  Medicine copyWith({String? name, String? dosage, String? time, bool? taken}) {
    return Medicine(
      id: id,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      time: time ?? this.time,
      taken: taken ?? this.taken,
    );
  }

  /// The single sentence a screen reader announces. Status is a word, never
  /// colour alone.
  String get semanticLabel =>
      '$name, $dosage, $time. ${taken ? 'Taken' : 'Not taken'}';
}
