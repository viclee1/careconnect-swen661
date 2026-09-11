import { Dimensions } from 'react-native';

// React Native Testing Library v13+ registers its matchers automatically, so
// this file only has to set up the environment the suite assumes.

/**
 * The test renderer reports a 750x1334 window, which is past the app's 720dp
 * tablet breakpoint. Every test would silently exercise the two-column path
 * without this, so the default is a phone and `useTabletSize()` opts in.
 */
jest.spyOn(Dimensions, 'get').mockImplementation(
  () =>
    ({ width: 400, height: 900, scale: 2, fontScale: 1 }) as ReturnType<
      typeof Dimensions.get
    >,
);

/**
 * AsyncStorage v3 no longer ships a Jest mock, so the suite supplies a simple
 * in-memory one. It is a faithful stand-in for what the settings repository
 * actually uses: get, set and remove of a single JSON string.
 */
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
      }),
      clear: jest.fn(async () => {
        store = {};
      }),
    },
  };
});

// expo-haptics talks to a native module that does not exist under Jest. The
// suite asserts that it is *called*, not what the device does with it.
jest.mock('expo-haptics', () => ({
  __esModule: true,
  impactAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
