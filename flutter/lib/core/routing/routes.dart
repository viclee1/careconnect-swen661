/// Every route path and name in one place.
///
/// Screens navigate by name rather than by literal string, so a path can change
/// here without hunting through the widget tree — and teammates landing the
/// remaining CareConnect screens have one file to edit.
abstract final class Routes {
  static const String welcome = '/welcome';
  static const String welcomeName = 'welcome';

  static const String signIn = '/sign-in';
  static const String signInName = 'signIn';

  static const String signUp = '/sign-up';
  static const String signUpName = 'signUp';

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

  /// After sign-in: who is using the app.
  static const String roleChooser = '/role';
  static const String roleChooserName = 'roleChooser';

  // The caregiver's screens.
  static const String dashboard = '/caregiver';
  static const String dashboardName = 'dashboard';

  static const String manageMedicines = '/caregiver/medicines';
  static const String manageMedicinesName = 'manageMedicines';

  static const String manageAppointments = '/caregiver/appointments';
  static const String manageAppointmentsName = 'manageAppointments';

  static const String activity = '/caregiver/activity';
  static const String activityName = 'activity';

  static const String notes = '/caregiver/notes';
  static const String notesName = 'notes';

  /// Where the app opens: the welcome screen, ahead of sign in/sign up.
  static const String initial = welcome;

  /// Builds the concrete path for a contact's conversation.
  static String threadPath(String contactId) => '/contacts/$contactId';
}
