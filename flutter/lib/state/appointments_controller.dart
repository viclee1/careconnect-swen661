import 'package:flutter/foundation.dart';

import '../data/appointment_repository.dart';
import '../models/appointment.dart';

/// The appointment list, shared by the care recipient's Appointments screen and
/// the caregiver's Manage appointments screen.
class AppointmentsController extends ChangeNotifier {
  AppointmentsController({required AppointmentRepository repository}) : _repository = repository;

  final AppointmentRepository _repository;

  List<Appointment> _appointments = <Appointment>[];
  bool _isLoading = false;
  bool _hasLoaded = false;
  Object? _error;

  List<Appointment> get appointments => List<Appointment>.unmodifiable(_appointments);
  bool get isLoading => _isLoading;

  /// True once a load has succeeded, so a screen can tell "none" from "not yet".
  bool get hasLoaded => _hasLoaded;

  /// Non-null when the last load failed — shown as an error, never as "none".
  Object? get error => _error;

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _appointments = await _repository.fetchAppointments();
      _hasLoaded = true;
    } catch (caught) {
      _appointments = <Appointment>[];
      _error = caught;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Loads unless a load has succeeded, is running, or has just failed.
  void ensureLoaded() {
    if (!_hasLoaded && !_isLoading && _error == null) load();
  }

  // Each edit is stored first, then the list is read back, so the screen shows
  // what the repository holds rather than what it was asked to hold.
  Future<void> _refresh() async {
    _appointments = await _repository.fetchAppointments();
    _hasLoaded = true;
    notifyListeners();
  }

  Future<void> addAppointment(Appointment input) async {
    await _repository.addAppointment(input);
    await _refresh();
  }

  Future<void> updateAppointment(String id, Appointment input) async {
    await _repository.updateAppointment(id, input);
    await _refresh();
  }

  Future<void> removeAppointment(String id) async {
    await _repository.removeAppointment(id);
    await _refresh();
  }
}
