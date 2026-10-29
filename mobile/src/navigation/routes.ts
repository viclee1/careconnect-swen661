import type { AppDestination, CaregiverDestination } from './destinations';

/**
 * Every route name and its parameters in one place.
 *
 * Typed so `navigate` calls are checked at compile time — pass the wrong
 * parameter to a conversation and `tsc` says so rather than the app crashing on
 * a device.
 */
export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  RoleChooser: undefined;
  Tabs: undefined;
  CaregiverTabs: undefined;
  MessageThread: { contactId: string };
  Settings: undefined;
};

export type TabParamList = Record<AppDestination, undefined>;

export type CaregiverTabParamList = Record<CaregiverDestination, undefined>;
