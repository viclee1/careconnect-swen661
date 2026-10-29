import '../models/appointment.dart';

/// The appointment list, and the caregiver's changes to it. Asynchronous,
/// like a networked store would be, so the screens handle loading and failure.
abstract class AppointmentRepository {
  Future<List<Appointment>> fetchAppointments();
  Future<Appointment> addAppointment(Appointment input);
  Future<void> updateAppointment(String id, Appointment input);
  Future<void> removeAppointment(String id);
}

/// The visits the React Native and desktop clients are seeded with.
const List<Appointment> kSeedAppointments = <Appointment>[
  Appointment(
    id: 'a1',
    doctor: 'Dr. Robert Chen',
    specialty: 'Cardiology',
    date: 'Sept 18, 2026',
    time: '10:00 am',
    location: 'Annapolis Medical Center',
  ),
  Appointment(
    id: 'a2',
    doctor: 'Dr. Sarah Jenkins',
    specialty: 'Primary Care',
    date: 'Oct 2, 2026',
    time: '2:30 pm',
    location: 'Acuity Health Clinic',
  ),
];

class InMemoryAppointmentRepository implements AppointmentRepository {
  InMemoryAppointmentRepository([List<Appointment> seed = kSeedAppointments])
      : _appointments = List<Appointment>.of(seed),
        _nextId = seed.length + 1;

  List<Appointment> _appointments;
  int _nextId;

  @override
  Future<List<Appointment>> fetchAppointments() async =>
      List<Appointment>.unmodifiable(_appointments);

  @override
  Future<Appointment> addAppointment(Appointment input) async {
    final Appointment appointment = Appointment(
      id: 'appt-added-${_nextId++}',
      doctor: input.doctor,
      specialty: input.specialty,
      date: input.date,
      time: input.time,
      location: input.location,
    );
    _appointments = <Appointment>[..._appointments, appointment];
    return appointment;
  }

  @override
  Future<void> updateAppointment(String id, Appointment input) async {
    _appointments = <Appointment>[
      for (final Appointment a in _appointments)
        a.id == id
            ? Appointment(
                id: id,
                doctor: input.doctor,
                specialty: input.specialty,
                date: input.date,
                time: input.time,
                location: input.location,
              )
            : a,
    ];
  }

  @override
  Future<void> removeAppointment(String id) async {
    _appointments = _appointments.where((Appointment a) => a.id != id).toList();
  }
}

/// A repository whose first [failures] loads fail, for exercising the error
/// path — and the recovery from it — through the real screen.
class FlakyAppointmentRepository extends InMemoryAppointmentRepository {
  FlakyAppointmentRepository({this.failures = 1, List<Appointment> seed = kSeedAppointments})
      : super(seed);

  final int failures;
  int _attempts = 0;

  @override
  Future<List<Appointment>> fetchAppointments() async {
    _attempts += 1;
    if (_attempts <= failures) throw Exception('offline');
    return super.fetchAppointments();
  }
}
