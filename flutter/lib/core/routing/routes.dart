/// Every route path and name in one place.
///
/// Screens navigate by name rather than by literal string, so a path can change
/// here without hunting through the widget tree — and teammates landing the
/// remaining CareConnect screens have one file to edit.
abstract final class Routes {
  static const String home = '/home';
  static const String homeName = 'home';

  static const String myDay = '/my-day';
  static const String myDayName = 'myDay';

  static const String appointments = '/appointments';
  static const String appointmentsName = 'appointments';

  static const String medicines = '/medicines';
  static const String medicinesName = 'medicines';

  static const String memories = '/memories';
  static const String memoriesName = 'memories';

  static const String contacts = '/contacts';
  static const String contactsName = 'contacts';

  /// Conversation with a single contact. Takes a `contactId` path parameter.
  static const String messageThread = '/contacts/:contactId';
  static const String messageThreadName = 'messageThread';

  static const String settings = '/settings';
  static const String settingsName = 'settings';

  /// Where the app opens. Becomes [home] once that screen lands.
  static const String initial = contacts;

  /// Builds the concrete path for a contact's conversation.
  static String threadPath(String contactId) => '/contacts/$contactId';
}
