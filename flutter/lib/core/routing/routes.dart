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
  static const String messageThread = '/contacts/:contactId';
  static const String messageThreadName = 'messageThread';
  static const String settings = '/settings';
  static const String settingsName = 'settings';
  static const String initial = welcome;
  static String threadPath(String contactId) => '/contacts/$contactId';
}
