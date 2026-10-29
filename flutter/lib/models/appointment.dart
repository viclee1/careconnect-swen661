/// A scheduled visit with a care provider.
class Appointment {
  const Appointment({
    required this.id,
    required this.doctor,
    required this.specialty,
    required this.date,
    required this.time,
    required this.location,
  });

  final String id;
  final String doctor;
  final String specialty;

  /// Calendar date as the design prints it — "Sept 18, 2026".
  final String date;

  /// Time of day as the design prints it — "10:00 am".
  final String time;

  final String location;

  /// Everything the card shows, said as one sentence.
  String get semanticLabel =>
      'Appointment with $doctor, $specialty, on $date at $time, at $location';
}
