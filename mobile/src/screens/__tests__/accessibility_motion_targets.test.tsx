import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { HomeScreen } from '../HomeScreen';
import { SignInScreen } from '../SignInScreen';
import { SignUpScreen } from '../SignUpScreen';
import { renderWithProviders } from '../../test-support/harness';

/**
 * The 48pt minimum (layout.minTouchTarget) is met on the text-only links by
 * growing the hit area, not the visible text: a ~24pt line plus 12pt above and
 * below is 48pt. These tests pin that arithmetic so a refactor cannot quietly
 * shrink the targets back to 24pt.
 */
const LINE_HEIGHT = 24;
const MIN_TOUCH_TARGET = 48;

function expectHitAreaReachesMinimum(element: { props: { hitSlop?: unknown } }) {
  const slop = element.props.hitSlop as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  expect(slop).toBeDefined();
  expect(LINE_HEIGHT + slop.top + slop.bottom).toBeGreaterThanOrEqual(
    MIN_TOUCH_TARGET,
  );
}

describe('touch targets on text-only links', () => {
  it('Sign In: "Forgot password?" and "Create an account" have a 48pt hit area', async () => {
    await renderWithProviders(
      <SignInScreen onSignIn={jest.fn()} onSignUp={jest.fn()} />,
    );

    expectHitAreaReachesMinimum(await screen.findByLabelText('Forgot password?'));
    expectHitAreaReachesMinimum(screen.getByLabelText('Create an account'));
  });

  it('Sign Up: the "Sign in" footer link has a 48pt hit area', async () => {
    await renderWithProviders(
      <SignUpScreen onSignIn={jest.fn()} onSignUp={jest.fn()} />,
    );

    expectHitAreaReachesMinimum(await screen.findByLabelText('Sign in'));
  });

  it('the links keep their roles so a screen reader announces them correctly', async () => {
    await renderWithProviders(
      <SignInScreen onSignIn={jest.fn()} onSignUp={jest.fn()} />,
    );

    expect(
      (await screen.findByLabelText('Create an account')).props.accessibilityRole,
    ).toBe('link');
    expect(
      screen.getByLabelText('Forgot password?').props.accessibilityRole,
    ).toBe('button');
  });
});

describe('Reduce Motion on the incoming-call glow', () => {
  let loopSpy: jest.SpyInstance;
  let reduceMotionListener: ((enabled: boolean) => void) | undefined;
  const removeListener = jest.fn();

  function mockReduceMotion(enabled: boolean) {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(enabled);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockImplementation(((event: string, handler: (v: boolean) => void) => {
        if (event === 'reduceMotionChanged') reduceMotionListener = handler;
        return { remove: removeListener };
      }) as never);
  }

  async function startIncomingCall() {
    await renderWithProviders(<HomeScreen onOpenSettings={jest.fn()} />);
    await act(async () => {
      await fireEvent.press(await screen.findByText('Simulate incoming call'));
    });
    expect(await screen.findByLabelText('Answer')).toBeTruthy();
  }

  beforeEach(() => {
    reduceMotionListener = undefined;
    removeListener.mockClear();
    loopSpy = jest.spyOn(Animated, 'loop');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loops the glow when Reduce Motion is off', async () => {
    mockReduceMotion(false);
    await startIncomingCall();

    expect(loopSpy).toHaveBeenCalled();

    // Declining ends the loop, so no animation tick outlives the test.
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Decline'));
    });
  });

  it('holds the glow static when Reduce Motion is already on', async () => {
    mockReduceMotion(true);
    await startIncomingCall();

    expect(loopSpy).not.toHaveBeenCalled();
    // The call itself must still be fully usable: nothing essential is lost.
    expect(screen.getByLabelText('Decline')).toBeTruthy();
  });

  it('stops looping when Reduce Motion is switched on during the call', async () => {
    mockReduceMotion(false);
    await startIncomingCall();
    expect(reduceMotionListener).toBeDefined();
    loopSpy.mockClear();

    await act(async () => {
      reduceMotionListener?.(true);
    });
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Decline'));
    });

    expect(loopSpy).not.toHaveBeenCalled();
  });

  it('unsubscribes from Reduce Motion changes when the screen unmounts', async () => {
    mockReduceMotion(false);
    const { unmount } = await renderWithProviders(
      <HomeScreen onOpenSettings={jest.fn()} />,
    );
    await screen.findByText('Dashboard');

    await unmount();

    expect(removeListener).toHaveBeenCalled();
  });
});
