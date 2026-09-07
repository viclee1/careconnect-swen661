import '../models/contact.dart';
import 'mock_contacts.dart';

/// Read access to the contact list.
///
/// The interface exists so the UI never depends on where contacts come from.
/// Week 4 ships the in-memory implementation below; swapping in an HTTP or
/// SQLite backed version later is a one-line change in `main.dart`.
abstract interface class ContactRepository {
  Future<List<Contact>> fetchContacts();
}

/// In-memory implementation backed by [kMockContacts].
class MockContactRepository implements ContactRepository {
  MockContactRepository({List<Contact>? seed, this.latency = Duration.zero})
      : _contacts = List<Contact>.unmodifiable(seed ?? kMockContacts);

  final List<Contact> _contacts;

  /// Artificial delay, so loading states can be demonstrated. Tests pass
  /// [Duration.zero] and therefore never need to wait on a real timer.
  final Duration latency;

  @override
  Future<List<Contact>> fetchContacts() async {
    if (latency > Duration.zero) {
      await Future<void>.delayed(latency);
    }
    return _contacts;
  }
}
