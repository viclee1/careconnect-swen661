# React Native test coverage — Assignment 6

Generated from `npm run test:coverage` (Jest + React Native Testing Library). The raw
`lcov.info` and the browsable HTML report (`coverage-html/index.html`) are committed
next to this file, because `mobile/coverage/` itself is gitignored. To regenerate:

```bash
cd mobile
npm run test:coverage
open coverage/lcov-report/index.html
# refresh the committed evidence
cp coverage/lcov.info docs/testing/lcov.info
rm -rf docs/testing/coverage-html && cp -R coverage/lcov-report docs/testing/coverage-html
```

## Headline numbers

| Metric | Covered | Total | % |
|---|---:|---:|---:|
| Statements | 755 | 779 | 96.9% |
| **Lines** | **673** | **694** | **97.0%** |
| Functions | 282 | 299 | 94.3% |
| Branches | 443 | 503 | 88.1% |

**286 tests in 31 suites, all passing**, across 70 source files — well past the
assignment's 60% minimum and the 75% target. `npm run typecheck` and `npm run lint` are
clean.

| Suite | Tests | Covers |
|---|---:|---|
| `src/models/__tests__` | 78 | Pure logic: contacts, messages, vibration patterns, accessibility settings clamping, appointments, medicines, memories |
| `src/data/__tests__` | 21 | Repositories, including the failure paths |
| `src/state/__tests__` | 44 | Context providers: contacts, messages, settings, appointments, medicines, memories |
| `src/utils/__tests__` | 24 | Formatters, validators, haptics |
| `src/screens/__tests__` (screens) | 94 | Every screen rendered through the real providers: roles, labels, interactions, loading/error states |
| `src/screens/__tests__/navigation.test.tsx` | 13 | **Integration:** the whole app, navigator and providers included, driven tab to tab |
| `src/screens/__tests__/accessibility_*.test.tsx` | 12 | **Accessibility** (see below) |

## Accessibility tests (counted in the numbers above)

`accessibility_theme.test.tsx` (5) asserts, through RNTL's role and label queries, that:
screen titles have the `header` role and the theme's type size; `AppButton` keeps the
48pt minimum height; and the Home progress bar exposes `progressbar` with a spoken value
("0 of 7 tasks completed").

`accessibility_motion_targets.test.tsx` (7) covers the two fixes recorded in the VPAT:

- **Touch targets (the app's 48pt minimum, which exceeds the assignment's 44pt):** "Forgot password?", "Create an
  account" and the Sign Up "Sign in" link keep a hit area that reaches 48pt
  (24pt line + 12pt `hitSlop` above and below), and keep their `link`/`button` roles.
- **Reduce Motion (2.2.2):** the incoming-call glow loops when Reduce Motion is off,
  stays static when it is already on, stops looping when the setting is switched on
  mid-call, and the screen unsubscribes from `reduceMotionChanged` on unmount. The call
  itself stays fully usable when motion is reduced.

These two files added assertions rather than percentage points: the code they exercise
was already executed by other tests, so line coverage did not move. They exist so that a
refactor cannot silently undo the fixes.

## Files below 100% line coverage

| File | Lines |
|---|---:|
| `src/navigation/RootNavigator.tsx` | 41/55 |
| `src/screens/SettingsScreen.tsx` | 16/20 |
| `src/screens/MessageThreadScreen.tsx` | 39/41 |
| `src/state/DailyTasksProvider.tsx` | 21/22 |

## What is not measured

- **The Maestro E2E flows** (`mobile/maestro/*.yaml`) and any run on a device are not
  instrumented by Jest, so they are not in this number. Their pass/fail results are
  recorded separately in `maestro-results.xml` in this folder.
- **Real screen-reader behavior.** Jest can check that the accessibility props are set
  (role, label, state, value); it cannot hear what VoiceOver or TalkBack actually says.
  That needs a manual pass on a device.
