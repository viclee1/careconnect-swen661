# React Native test coverage — Assignment 6

Generated from `npm run test:coverage` (Jest + `@testing-library/react-native`). The raw
report is committed at `mobile/coverage/lcov.info` (mirrors
`flutter/coverage/lcov.info`); the browsable HTML report (`coverage/lcov-report/`) is
regenerated locally and gitignored, same as Flutter's `coverage/html/`. Regenerate with:

```bash
npm run test:coverage
open coverage/lcov-report/index.html   # browsable report
```

## Headline number

**96.9% line coverage (673/694 lines), 96.9% statement coverage** across every source
file — well past the assignment's 60% minimum — via **279 tests** across 30 suites:

| Suite | Covers |
|---|---|
| `src/*/__tests__/*.test.ts(x)` — component tests | Every screen, including accessibility props/roles/state |
| `src/state/__tests__/*.test.tsx` | All seven providers (Contacts, Messages, Settings, Daily Tasks, Appointments, Medicines, Memories) |
| `src/screens/__tests__/accessibility_theme.test.tsx` | RNTL accessibility-role/label queries (`findByRole`, `findByLabelText`) — the specific matcher style the assignment asks for |
| `src/screens/__tests__/navigation.test.tsx` | Full-app integration suite: renders the real navigator + providers, drives multi-screen flows end to end — the Jest-based "integration tests" the assignment asks for on the RN side |

`mobile/maestro/*.yaml` (6 E2E flows) are not instrumented by `npm run test:coverage` —
Jest's coverage collector only instruments code running inside the Jest/JSDOM-style test
environment, not a real app process on a device/emulator — so their results are tracked
separately as pass/fail evidence (`mobile/docs/testing/maestro-results.xml`) rather than
folded into this line-coverage number. They exercise real on-device behavior (actual
native navigation, actual keyboard/window resize, actual Android accessibility tree)
that Jest's simulated environment cannot reproduce — see `mobile/docs/VPAT-WCAG2.1-AA.md`
for the Maestro-only bug that found (message composer becoming unreachable when the
keyboard opens, since fixed and re-verified on a real emulator).

## Files below 100% line coverage

| File | Lines | Notes |
|---|---:|---|
| `src/navigation/RootNavigator.tsx` | 74.54% | Route-definition wiring (`<Stack.Screen>`/`<Tab.Screen>` declarations) — exercised indirectly by every screen test, but several `onPress`/`navigate` callback bodies aren't independently unit-tested |
| `src/screens/SettingsScreen.tsx` | 80% | A few branches in the caption-size/color pickers and the "not wired up yet" sign-out path |
| `src/state/DailyTasksProvider.tsx` | 95.45% | One defensive branch |
| `src/screens/MessageThreadScreen.tsx` | 95.12% | Two lines in the `KeyboardAvoidingView` platform branch and an edge case in the empty-contact path |

Every other file — including all of `src/theme`, `src/models`, `src/data`, `src/hooks`,
and every other screen — is at 100% line coverage. None of these gaps are in
accessibility-relevant code paths; the accessibility props, roles, states, and contrast
tokens added this cycle are all covered by
`src/screens/__tests__/accessibility_theme.test.tsx` and the per-screen test suites.
