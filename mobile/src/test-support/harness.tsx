import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { AppProviders } from '../AppProviders';
import {
  createMockContactRepository,
  type ContactRepository,
} from '../data/contactRepository';
import {
  createMockDailyTasksRepository,
  type DailyTasksRepository,
} from '../data/dailyTasksRepository';
import {
  createMockMessageRepository,
  type MessageRepository,
} from '../data/messageRepository';
import {
  createInMemorySettingsRepository,
  type SettingsRepository,
} from '../data/settingsRepository';
import type { AccessibilitySettings } from '../models/accessibilitySettings';
import type { AppDestination } from '../navigation/destinations';
import type { RootStackParamList } from '../navigation/routes';
import { RootNavigator } from '../navigation/RootNavigator';

/**
 * The clock the fixtures are built around: today's date at a fixed time.
 *
 * The date has to track the real calendar, because the day separators in a
 * conversation are rendered against `Date.now()`. Pinning the time of day keeps
 * everything else about the fixtures deterministic.
 */
export const kTestNow = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).getTime();
})();

/** Safe-area metrics, so insets resolve synchronously instead of measuring. */
const metrics: Metrics = {
  frame: { x: 0, y: 0, width: 400, height: 900 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

/**
 * Widens the window past the tablet breakpoint for one test.
 *
 * The default is a phone — see `jest.setup.ts` for why.
 */
export function useTabletSize(width = 1100, height = 1400): void {
  jest
    .spyOn(Dimensions, 'get')
    .mockImplementation(
      () => ({ width, height, scale: 2, fontScale: 1 }) as ReturnType<typeof Dimensions.get>,
    );
}

export interface HarnessOptions {
  contactRepository?: ContactRepository;
  messageRepository?: MessageRepository;
  settingsRepository?: SettingsRepository;
  dailyTasksRepository?: DailyTasksRepository;
  settings?: Partial<AccessibilitySettings>;
  initialRouteName?: keyof RootStackParamList;
  initialTabName?: AppDestination;
}

function buildRepositories(options: HarnessOptions) {
  const settingsRepository =
    options.settingsRepository ??
    createInMemorySettingsRepository({
      visualAlertBanners: true,
      smartEscalation: true,
      captionsEnabled: true,
      captionSize: 'medium',
      captionColor: 'white',
      alertVolume: 0.7,
      audioBalance: 0,
      vibrationEnabled: true,
      ...options.settings,
    });

  return {
    contactRepository: options.contactRepository ?? createMockContactRepository(),
    messageRepository:
      options.messageRepository ?? createMockMessageRepository({ now: kTestNow }),
    settingsRepository,
    dailyTasksRepository: options.dailyTasksRepository ?? createMockDailyTasksRepository(),
  };
}

/** Wraps a subtree in everything the real app provides. */
export function Harness({
  children,
  ...options
}: HarnessOptions & { children: ReactNode }) {
  const repositories = buildRepositories(options);
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders {...repositories}>
        <NavigationContainer>{children}</NavigationContainer>
      </AppProviders>
    </SafeAreaProvider>
  );
}

/** Renders a single component inside the app's providers and a navigator. */
export function renderWithProviders(ui: ReactElement, options: HarnessOptions = {}) {
  return render(<Harness {...options}>{ui}</Harness>);
}

/**
 * Renders the whole application, navigator and all.
 *
 * Component tests use this rather than a stripped-down wrapper so they exercise
 * the navigation, the contexts and the theme exactly as the shipped app
 * assembles them.
 */
export function renderApp(options: HarnessOptions = {}) {
  const { initialRouteName = 'Tabs', initialTabName = 'Contacts', ...rest } = options;
  return renderWithProviders(
    <RootNavigator initialRouteName={initialRouteName} initialTabName={initialTabName} />,
    rest,
  );
}
