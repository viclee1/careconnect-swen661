# Flutter test coverage — Assignment 6

Generated from `flutter test --coverage` (`coverage/lcov.info`), rendered to HTML with
`genhtml` (`coverage/html/index.html`). Regenerate with:

```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html   # or: python3 -m http.server --directory coverage/html
```

## Headline number

**98.9% line coverage (1699 / 1718 lines)** across 47 source files — well past the
assignment's 60% minimum and the 75% target, via **234 tests**:

| Suite | Count | Covers |
|---|---:|---|
| `test/models`, `test/utils` | unit tests | Pure logic: contact/message/vibration models, validators, formatters |
| `test/state` | controller tests | `ContactsController`, `MessagesController`, `SettingsController`, `DailyTasksController` |
| `test/widgets` | widget tests | Every screen, navigation, and the settings/messaging widget tree |
| `test/accessibility/accessibility_guideline_test.dart` | **14 tests (new)** | `androidTapTargetGuideline`, `textContrastGuideline`, `labeledTapTargetGuideline` on every routed screen, the tablet layout, and both Home-screen call overlays |

`integration_test/critical_flows_test.dart` (6 on-device E2E tests) and the six
`maestro/*.yaml` flows are not instrumented by `flutter test --coverage` — Flutter's
coverage collector only instruments the single-isolate `flutter test` runner, not code
running inside an installed APK on a device/emulator — so their results are reported
separately as pass/fail evidence (`docs/testing/maestro-results.xml`) rather than folded
into this line-coverage number. They do exercise real app code paths (repositories,
routing, `SharedPreferences`) that the widget tests fake, so treat the two kinds of
evidence as complementary, not overlapping.

## Files below 100% (all pre-existing edge cases, not accessibility-related)

| File | Lines |
|---|---:|
| `lib/core/utils/haptics.dart` | 4/7 |
| `lib/screens/settings/settings_screen.dart` | 141/144 |
| `lib/data/settings_repository.dart` | 32/34 |
| `lib/models/message.dart` | 38/40 |
| `lib/models/contact.dart` | 51/52 |
| `lib/screens/splash/welcome_screen.dart` | 47/48 |
| `lib/widgets/alert_banner.dart` | 41/42 |
| `lib/screens/home/home_screen.dart` | 124/125 |
| `lib/data/contact_repository.dart` | 5/6 |
| `lib/data/message_repository.dart` | 19/20 |
| `lib/screens/appointments/appts_screen.dart` | 14/15 |
| `lib/screens/memories/memories_screen.dart` | 20/21 |
| `lib/models/daily_task.dart` | 8/9 |

Each gap is a single defensive branch (e.g. `haptics.dart`'s platform-unavailable
fallback, which cannot run under the test VM). None touch the accessibility fixes made
for this assignment — those are covered by the new
`test/accessibility/accessibility_guideline_test.dart` suite, `integration_test/`, and
the Maestro flows.
