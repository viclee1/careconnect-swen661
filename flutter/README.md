# CareConnect — Flutter client

The mobile build of CareConnect. See the [Flutter mobile client](../README.md#flutter-mobile-client)
section of the root README for screens, architecture, assigned-constraint mapping, and AI usage.

## Quick start

```bash
flutter pub get
./run.sh        # boots an iPhone simulator + Android emulator and runs on both
# or: ./dev.sh  # interactively pick one device
```

## Tests

```bash
flutter analyze
flutter test --coverage    # writes coverage/lcov.info; 234 tests, 98.9% line coverage
```

That includes the accessibility guideline suite
(`test/accessibility/accessibility_guideline_test.dart`): 14 tests that run Flutter's
built-in [`AccessibilityGuideline`
API](https://api.flutter.dev/flutter/flutter_test/AccessibilityGuideline-class.html)
(`androidTapTargetGuideline`, `textContrastGuideline`, `labeledTapTargetGuideline`)
against every routed screen, the tablet layout, and both Home-screen call-overlay states.
See [`docs/testing/coverage-summary.md`](docs/testing/coverage-summary.md) for the
per-file breakdown, and [`docs/security-scan.md`](docs/security-scan.md) for the
dependency and secrets scan.

### On-device / emulator integration tests

```bash
flutter test integration_test/critical_flows_test.dart -d <device-id>
```

Six flows in `integration_test/critical_flows_test.dart` drive the real, assembled app
(real repositories, real `GoRouter`, real `SharedPreferences`) rather than the fakes the
widget tests use: sign-in, bottom-tab navigation across all six destinations, sending a
message, completing a daily task, an accessibility preference taking effect immediately,
and an accessibility-focused flow that navigates using only `find.bySemanticsLabel` — the
same thing a screen reader would key off — never raw visible text.

### Maestro E2E flows

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash    # one-time install
flutter build apk --debug
adb install -r build/app/outputs/flutter-apk/app-debug.apk
maestro test maestro/                                 # all 6 flows
```

`maestro/*.yaml` covers the same five critical flows as the integration tests, plus a
dedicated accessibility-focused flow (`06_accessibility_screen_reader_navigation.yaml`).
Maestro drives Android through UiAutomator, which resolves every `tapOn`/`assertVisible`
selector against the same accessibility tree TalkBack reads from — so a flow that only
ever selects elements by the sentence a screen reader would announce is itself evidence
that the label exists and is wired to the right action. All 6 flows pass on a connected
emulator; see [`docs/testing/maestro-results.xml`](docs/testing/maestro-results.xml) for
the JUnit report from the last run.

## Accessibility

CareConnect is a hearing-accessibility-focused app, so accessibility isn't a pass over
existing screens — it's a design constraint from the start. This assignment's cycle
audited every screen against WCAG 2.1 Level AA and fixed what it found:

- **Semantics on every interactive element** — explicit `Semantics(button:, label:,
  toggled:)` where a widget doesn't get a role/label for free (e.g. the Home-screen call
  and mute/pause/CC controls, previously silent `InkResponse`/`InkWell`), and native
  roles (e.g. `CheckboxListTile`'s `checkbox` role on the Medications screen) preferred
  over a hand-written label that could drift out of sync or double-announce.
- **Color contrast** — every screen and both Home-screen call-overlay states now pass an
  automated 4.5:1/3:1 contrast check. Real violations this cycle's audit found and fixed:
  the Decline/Answer/End-call buttons and "LIVE" badge (`Colors.red`/`Colors.green` at
  3.68:1/2.78:1 → `AppColors.dangerAction`/`successAction` at 5.6:1/5.1:1), the memories
  date text (4.07:1 → `AppColors.secondaryDark` at 5.11:1), and the incoming-call
  overlay's text, whose contrast used to vary with an animated scrim opacity and could
  dip to 2.68:1 (the backdrop is now a fixed, fully opaque black).
- **Touch targets** — a real 48×48-logical-pixel violation on the sign-in/sign-up
  "Create an account"/"Sign in" links (`MaterialTapTargetSize.shrinkWrap` shrank them to
  24px tall) was found and fixed.
- **Dynamic text scaling** — no `TextScaler`/`textScaleFactor` override exists anywhere
  in the app, so the OS text-scale setting (up to 200%) passes through untouched.
- **Focus order & keyboard navigation** — every interactive element is a standard
  Flutter widget (`InkWell`, the `ButtonStyleButton` family, `TextField`, `Checkbox`,
  `Slider`) that ships with keyboard focus/activation; no custom
  `FocusTraversalPolicy` overrides the default (visual/tree) order.
- **Screen reader testing** — manually verified with **TalkBack** on Android; VoiceOver
  (iOS) was not evaluated in this environment (no iOS device/simulator available).

Full WCAG 2.1 Level A/AA criterion-by-criterion conformance status, remarks, and known
limitations are in the team's VPAT, submitted separately as part of this assignment.

## Adding a screen

1. Add the path and name to `lib/core/routing/routes.dart` (most already exist).
2. Replace the `PendingScreen` in `lib/core/routing/app_router.dart` with the real screen —
   one line per route, inside the `ShellRoute` and wrapped in `page(...)` so it inherits the
   persistent navigation and swaps without a transition.
3. Build the screen inside `AppScaffold`, which supplies the app bar. Navigation is not the
   screen's concern — `AppShell` owns it, and `kDestinations` already lists every destination.

## Team member contributions — Week 4

| Member | Screens |
|:-------|:--------|
| Justin Zhang | Welcome, Sign In, Sign Up, Home, My Day|
| Rehman Uddin | Appointments, Medicines, Memories|
| Victor Lee | Contacts, Messaging, Accessibility Settings|
