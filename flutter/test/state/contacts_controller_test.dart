import 'package:careconnect_mobile/data/contact_repository.dart';
import 'package:careconnect_mobile/models/contact.dart';
import 'package:careconnect_mobile/state/contacts_controller.dart';
import 'package:flutter_test/flutter_test.dart';

import '../support/harness.dart';

/// A repository that always fails, so the error path can be exercised.
class _FailingContactRepository implements ContactRepository {
  @override
  Future<List<Contact>> fetchContacts() async {
    throw StateError('network down');
  }
}

void main() {
  late List<Contact> seed;

  setUp(() {
    seed = <Contact>[
      testContact(id: 'c1', name: 'Joyce', isPrimary: true),
      testContact(id: 'c2', name: 'Dr. Sharma', role: ContactRole.doctor),
      testContact(id: 'c3', name: 'Maria'),
      testContact(
        id: 'c5',
        name: 'NHS 111',
        role: ContactRole.helpline,
        isEmergency: true,
      ),
    ];
  });

  ContactsController build({List<Contact>? contacts}) => ContactsController(
        repository: MockContactRepository(seed: contacts ?? seed),
      );

  group('load', () {
    test('starts empty and not loading', () {
      final ContactsController controller = build();
      expect(controller.allContacts, isEmpty);
      expect(controller.isLoading, isFalse);
      expect(controller.error, isNull);
    });

    test('populates the list and notifies twice', () async {
      final ContactsController controller = build();
      int notifications = 0;
      controller.addListener(() => notifications++);

      await controller.load();

      expect(controller.allContacts, hasLength(4));
      expect(controller.isLoading, isFalse);
      // Once when loading starts, once when it finishes.
      expect(notifications, 2);
    });

    test('keeps the order the design lists contacts in', () async {
      final ContactsController controller = build();
      await controller.load();
      expect(
        controller.allContacts.map((Contact c) => c.id),
        <String>['c1', 'c2', 'c3', 'c5'],
      );
    });

    test('records the error and empties the list when loading fails', () async {
      final ContactsController controller =
          ContactsController(repository: _FailingContactRepository());

      await controller.load();

      expect(controller.error, isA<StateError>());
      expect(controller.allContacts, isEmpty);
      expect(controller.isLoading, isFalse);
    });

    test('a successful load leaves no error behind', () async {
      final ContactsController controller = build();
      await controller.load();
      expect(controller.error, isNull);
    });

    test('the returned list cannot be mutated by a caller', () async {
      final ContactsController controller = build();
      await controller.load();
      expect(
        () => controller.allContacts.add(testContact(id: 'nope')),
        throwsUnsupportedError,
      );
    });
  });

  group('byId', () {
    test('finds a loaded contact', () async {
      final ContactsController controller = build();
      await controller.load();
      expect(controller.byId('c2')?.name, 'Dr. Sharma');
    });

    test('returns null for an unknown id instead of throwing', () async {
      final ContactsController controller = build();
      await controller.load();
      expect(controller.byId('does-not-exist'), isNull);
    });

    test('returns null before anything is loaded', () {
      expect(build().byId('c1'), isNull);
    });
  });
}
