import 'package:flutter/foundation.dart';

import '../data/contact_repository.dart';
import '../models/contact.dart';

/// Owns the Contacts screen's state.
///
/// This is deliberately a plain [ChangeNotifier] with no Flutter widget
/// imports: it can be unit tested without pumping a widget, and the screen
/// stays a thin rendering of whatever this object exposes.
class ContactsController extends ChangeNotifier {
  ContactsController({required ContactRepository repository})
      : _repository = repository;

  final ContactRepository _repository;

  List<Contact> _all = const <Contact>[];
  bool _isLoading = false;
  Object? _error;

  bool get isLoading => _isLoading;

  /// Non-null when the last load failed. The screen renders this as a banner
  /// with a retry button rather than an empty list.
  Object? get error => _error;

  /// Every contact, in the order the design lists them.
  List<Contact> get allContacts => List<Contact>.unmodifiable(_all);

  /// Loads the contact list. Safe to call more than once.
  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _all = await _repository.fetchContacts();
    } catch (error) {
      _error = error;
      _all = const <Contact>[];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Looks a contact up by id, returning `null` when it is not in the list.
  ///
  /// The message thread route resolves its contact through here, so a stale
  /// deep link shows a "contact not found" screen instead of crashing.
  Contact? byId(String id) {
    for (final Contact contact in _all) {
      if (contact.id == id) return contact;
    }
    return null;
  }
}
