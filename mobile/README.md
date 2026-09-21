# CareConnect — React Native client

The Expo build of CareConnect for **SWEN 661 Team 2 (The Acuity Health Group)**,
targeting care recipients who are deaf or hard of hearing.

> **Scope of this branch.** This is the Week 5 React Native port, built
> feature-for-feature with the Week 4 Flutter client in
> [`../flutter`](../flutter). **Victor Lee** owns **Contacts**, **Messaging**
> and **Accessibility Settings**, plus the shared shell (theme, navigation,
> models, repositories, Context providers, test harness); **Justin Zhang**
> owns **Welcome, Sign In, Sign Up, Home** and **My Day**, merged in from his
> own branch; **Rehman Uddin** owns **Appointments, Medicines** and
> **Memories**, ported in from his standalone Expo prototype at
> [`careconnect-app/`](careconnect-app/) and rebuilt against this app's
> Context providers, repositories and theme.
>
> Both clients are built to match the **Week 3 design prototype**. Where the
> prototype and the original React web client disagreed, the prototype won.

**Status:** 274 tests passing, **96.5 % line coverage**, `eslint` and `tsc`
clean. The framework comparison (Assignment 5 Part 3) is not in this branch.

---

## What the application does

CareConnect is a daily companion for a care recipient and the people looking
after them. It is built on one governing rule, taken from the team's
Assignment 3 design philosophy:

> **Anything the application communicates through sound must also be
> communicated visually or in text.** Sound may supplement a notification. It is
> never the only carrier.

That rule is why the Contacts screen has no call button, why a voicemail arrives
as a transcript rather than a play button, why **Notify** replaces "give me a
ring" with a silent flash on the other person's phone, and why the Settings
screen will not let you switch the visible alert banner off.

### The assigned constraints, and where each one is answered

| # | Constraint | Where it lives in this code |
|:--|:-----------|:----------------------------|
| 1 | Captions for video | `MessageBubble` states in words whether a video carries captions; size, colour and on/off live in Settings → Captions, with a live preview |
| 2 | Text alternative for audio | A `voicemail` message renders its transcript as the body (`src/screens/messaging/MessageBubble.tsx`) |
| 3 | No sound-only alerts | `visualAlertBanners` is forced true by `withSettings` and `settingsFromStored`, so neither the UI nor a hand-edited preference store can turn it off |
| 4 | Clear visual notifications | `AlertBanner`, the in-thread CareConnect alert, and the `VisualFlash` pulse — each carries an icon, a heading and a body that says *what* happened |
| 5 | User control of audio | Settings → Audio carries the alert-volume slider (zero is valid) and the pause-control note; L/R balance supports a single aided ear |

---

## Screens

| Screen | What it does |
|:-------|:-------------|
| **Contacts** | One list, Joyce first with a **Primary** pill, then the GP, the two children and the medical helpline. Each row shows the lettered avatar, the relationship, a preview of the latest message, and a count of messages **waiting** — a number *and* the word. Tapping a row opens the conversation. |
| **Messaging** | Day separators, delivery state written out ("Read"), transcripts for voicemail, caption status for video, in-thread CareConnect alerts, a validated composer, and the **Notify** action. Warns, with a link into Settings, when captions are off and the conversation contains a video. On a tablet it also offers "Call *name* now" — a captioned video call, never audio-only. |
| **Accessibility Settings** | A live WCAG conformance badge, then Visual Alerts, Captions (size, colour, live preview), Audio (volume, L/R balance), Vibration (three named rhythms, tap to feel), and Account. Persisted with `AsyncStorage`. Sign out routes back to Welcome. |
| **Welcome** | The app's entry point: the accessibility promise up front (visual alerts, captions everywhere, vibration patterns) with **Get Started** and **Sign In** actions. |
| **Sign In / Sign Up** | Email-and-password forms into the app. Unauthenticated for now — see Known issues. |
| **Home** | The dashboard: a daily-task progress banner and a simulated incoming captioned video call (a non-strobing flash, answer/decline, and in-call volume, balance, mute, pause and caption controls) — a working demonstration of the "call" this app always means. |
| **My Day** | The task list behind Home's progress banner: a progress bar, and tappable task cards that toggle done/not-done. |
| **Appointments** | Upcoming medical visits — doctor, specialty, date, time and location — each rendered as one accessible card. Loading and failed-load states match Contacts: a spinner, then a retry banner that explains what happened rather than showing an empty list. |
| **Medicines** | Today's medication tracker: dosage and time under each name, a taken/total summary, and a tap on the row toggles taken status with `accessibilityRole="checkbox"` carrying the state in words, never colour alone. |
| **Memories** | The care recipient's saved memories — title, date and description — laid out one column on a phone and two across from the tablet breakpoint up, matching Contacts' and Appointments' layout rule. |

That's ten functional screens against the assignment's 7–10 target.

### Accessibility Addons (09/20/26)

Key Accessibility Enhancements:

• Semantic Navigation & Roles:

◦ Added accessibilityRole="header" to all major screen headings and section titles (Home, My Day, Appointments, etc.).

◦ Correctly identified buttons and links using accessibilityRole="button" and accessibilityRole="link".

• Form Accessibility (SignIn/SignUp):

◦ Every TextInput now carries an accessibilityLabel and accessibilityHint, ensuring users with screen readers understand exactly what information is required.

• Accessible Progress Indicators:

◦ The task progress bars on the Dashboard and My Day screens now use accessibilityRole="progressbar".

◦ They provide dynamic accessibilityValue updates (e.g., "3 of 7 tasks completed") so the current status is announced in real-time.

• Call Simulation Overlay:

◦ The Incoming Call and Active Call modals are now fully accessible.

◦ Added labels for the "LIVE" status, caller information, and accessible controls for volume and balance sliders.

◦ Live captions (CC) are marked with accessibilityLiveRegion="polite" to ensure they are announced as they appear.

• Task List Items:

◦ The My Day and Medicines items now act as semantic checkboxes (accessibilityRole="checkbox").

◦ The completion state is explicitly carried via accessibilityState={{ checked: ... }} and reflected in the descriptive labels.

• Touch Targets:

◦ `layout.minTouchTarget` (48pt) is used consistently across buttons, the tab bar, and form controls. The three text-only links that weren't covered — "Forgot password?" (Sign In) and the "Create an account"/"Sign in" footer links (Sign In, Sign Up) — now carry `hitSlop` padding their tap target to roughly 48pt without changing their visible size.

• Reduce Motion:

◦ The incoming-call avatar glow checks `AccessibilityInfo.isReduceMotionEnabled()` (and subscribes to `reduceMotionChanged`) and holds at a static opacity instead of looping when the OS Reduce Motion setting is on. The Notify "visual flash" is deliberately exempt — it's the single, brief, non-repeating fade that *is* the visual alert this app exists to provide, not decorative motion.

Full WCAG 2.1 Level A/AA criterion-by-criterion conformance status, remarks, and known
limitations (including an unverified Maestro/APK build in this environment) are in
[`docs/VPAT-WCAG2.1-AA.md`](docs/VPAT-WCAG2.1-AA.md).

---

## Maestro E2E Tests

The app includes a suite of [Maestro](https://maestro.mobile.dev/) UI tests for end-to-end verification of critical user flows.

### Prerequisites

Maestro drives the native application directly. Before running tests, you must build and install the app on your Android emulator or iOS simulator:

```bash
# For Android
npx expo run:android

```
### Running the tests

Once the app is installed and visible on your device/emulator:

```bash
# Run all critical flows
maestro test maestro/

# Run a specific flow (e.g., Sign In)
maestro test maestro/01_sign_in.yaml
```

### Test Cases

| File | Description |
|:-----|:------------|
| `01_sign_in.yaml` | Verifies the Welcome -> Sign In -> Home dashboard transition. |
| `02_bottom_navigation.yaml` | Confirms that every tab in the bottom bar reaches its target screen. |
| `03_send_message.yaml` | Tests opening a contact conversation and sending a text message. |
| `04_complete_daily_task.yaml` | Verifies that checking off a task on My Day updates the progress banner. |
| `05_toggle_accessibility_setting.yaml` | Confirms that changing a preference in Settings takes effect immediately. |
| `06_accessibility_screen_reader_navigation.yaml` | Navigates the entire app using only screen-reader labels to verify semantics. |

### Notify — the signature interaction

Tapping it plays one **non-strobing** pulse across the screen carrying the words
"Alert sent to *name*", fires a haptic if vibration is on in Settings, and writes
a line into the conversation saying the alert went and that no sound was played.

That last step matters more than it looks: an action whose only trace was a flash
would leave a deaf user with no way to check afterwards that it actually went.

The pulse is deliberately a single slow fade. Anything flashing more than three
times a second risks triggering a seizure (WCAG 2.2 SC 2.3.1), and the pattern
that helps this app's users must not be the pattern that harms someone else.

---

## Architecture

```
src/
├── AppProviders.tsx      # the seven contexts, with repositories injected
├── theme/                # Assignment 3 palette, typography scale, spacing
├── models/               # Contact, Message, AccessibilitySettings,
│                         #   VibrationPattern, DailyTask, Appointment,
│                         #   Medicine, Memory — plain data plus pure helpers
├── data/                 # repository interfaces + in-memory implementations
├── state/                # Context providers and their hooks
├── hooks/                # useResponsive
├── utils/                # formatters, validators, haptic playback
├── components/           # shared UI: header, banners, badges, buttons
├── navigation/           # destinations, the custom tab bar / sidebar, the root stack
└── screens/
    ├── contacts/  messaging/  settings/  appointments/  medicines/  memories/
    ├── WelcomeScreen.tsx  SignInScreen.tsx  SignUpScreen.tsx
    ├── HomeScreen.tsx  MyDayScreen.tsx
    └── AppointmentsScreen.tsx  MedicinesScreen.tsx  MemoriesScreen.tsx
```

`careconnect-app/` alongside `src/` is a separate, standalone Expo project —
Rehman's original scaffold, kept for reference with its own `node_modules`
and `tsconfig.json`, excluded from this app's lint and typecheck. Its screens
were ported into `src/screens/` above rather than run directly.

**State management — Context API.** Seven providers (`ContactsProvider`,
`MessagesProvider`, `SettingsProvider`, `DailyTasksProvider`,
`AppointmentsProvider`, `MedicinesProvider`, `MemoriesProvider`), each
exposing a hook that throws outside its provider. Business logic lives in
`src/models` and `src/utils` as pure functions, so it is unit tested without
rendering anything, and the providers stay thin.

Shared state earns its keep in two visible places: opening a conversation clears
that contact's badge back on the Contacts screen without passing anything
through the route, and switching captions off in Settings makes a warning appear
inside any conversation that contains a video.

**Navigation — React Navigation 7.** A native stack holds the tab navigator,
the conversation and Settings. The six top-level destinations live in the tab
navigator with `animation: 'none'`, so switching tabs swaps the page and nothing
else moves; the bar belongs to the navigator rather than to any screen, so it is
mounted once and never animates. The conversation and Settings sit above the
tabs and cover the bar the way a screen you come back from should. From the
tablet breakpoint up, the bar becomes a 220px left sidebar with full labels and
a Settings entry of its own — matching the Flutter client's `AppShell` — and
each screen's header gear is hidden, since the sidebar already offers Settings.

**Persistence.** `AsyncStorage` under one key. A corrupt or partially written
value degrades to safe defaults rather than throwing on startup — which matters
more here than elsewhere, because a user who cannot hear the app has no fallback
if it refuses to open.

**Accessibility.** Every interactive element carries an `accessibilityRole`, an
`accessibilityLabel` and, where it has one, an `accessibilityState`. Targets are
at least 48dp. Status is always "a word plus a shape": switches print "On"/"Off",
the badge prints "waiting", the selected tab is bold and underlined as well as
tinted. Decorative icons and badges are hidden from the accessibility tree so a
screen reader announces each card once, as a sentence, instead of stuttering
through its parts.

---

## Getting started

```bash
cd mobile
npm install
npx expo start          # then press a for Android, i for iOS, or scan the QR code
```

If your installed Expo SDK differs from the one this was built against
(SDK 57 / React Native 0.86), run `npx expo install --fix` once after
`npm install` to align the native module versions.

### Builds

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # produces an installable .apk
eas build --platform ios                          # requires an Apple developer account
```

`eas.json`'s `preview` profile sets `android.buildType: "apk"`, since the
default Android profile produces an `.aab` (App Bundle) — not directly
installable, and not what the assignment submission asks for.

`android/` and `ios/` are not committed — Expo generates them. Run
`npx expo prebuild` if you need the native projects locally.

---

## Tests

```bash
npm run lint            # eslint — expected: no output
npm run typecheck       # tsc --noEmit — expected: no output
npm test                # 274 tests
npm run test:coverage   # writes coverage/lcov-report/index.html
```

### Coverage

```
Statements   : 96.47 % ( 739/766 )
Branches     : 88.86 % ( 431/485 )
Functions    : 93.89 % ( 277/295 )
Lines        : 96.48 % ( 658/682 )
```

Open `coverage/lcov-report/index.html` for the browsable report and screenshot
the summary for the submission. The assignment floor is 60 %.

`npm audit` plus a manual secrets/network review found 13 moderate,
build-tooling-only dependency advisories and no code-level issues — see
[`docs/security-scan.md`](docs/security-scan.md).

### What is tested

**Jest unit tests** — business logic, models and utilities, with no rendering:

- `Contact` — the design's own avatar initials and the fallback that derives
  them, honorific handling, helpline naming, semantic labels
- `Message` — transcript and caption headings, authorship, the sentence a screen
  reader announces, previews, the waiting-messages rule, day-boundary grouping
- `AccessibilitySettings` — prototype defaults, volume and balance clamping
  (including `NaN`), the written balance label, storage round-trip, graceful
  recovery from a corrupt or partial store, and that the visual banner cannot be
  switched off through storage
- `VibrationPattern` — the three rhythms are well formed, bounded, printed as
  well as felt, and actually distinguishable from each other
- `formatters` / `validators` — 12-hour clock edge cases, calendar-day vs
  elapsed-hours labels, composer length and blank rules
- `haptics` — one impact per vibrating pulse, silence when vibration is off
- `Appointment` / `Medicine` / `Memory` — the sentence assistive technology
  announces for each, including the taken/not-taken wording
- the repositories, including the flaky variants and the AsyncStorage round-trip
- the seven context hooks via `renderHook`, including their failure paths and
  the fact that each throws outside its provider

**React Native Testing Library component tests** — behaviour through the real
screens, rendered inside the real navigator and providers:

- Contacts renders the design's five contacts with their initials, relationships
  and Primary pill, previews a video by its captions, and — asserted explicitly
  — offers **no voice-call affordance anywhere**
- The badges that are hidden from assistive technology are asserted both as
  drawn text and as part of the card's spoken label, which is the actual
  requirement
- The conversation renders messages in order, groups them by day, stamps them
  "8:02 am", shows a voicemail as a transcript, states caption availability, and
  renders a CareConnect alert
- Notify buzzes, flashes with words, and writes its record — and sends no buzz
  when vibration is off
- The composer rejects blank and whitespace-only messages with a written reason,
  sends, and counts characters down
- Settings renders every prototype section, writes each switch state out as a
  word, refuses to unlock the visual banner, flips the conformance badge when
  captions go off, repaints the caption preview in yellow, drives both sliders,
  and previews a rhythm without changing any setting
- Appointments, Medicines and Memories render their seeded lists, announce each
  card as one sentence, and — Appointments and Memories — show a spinner while
  loading, a retry banner that explains a failed load, and recover on retry;
  Medicines toggles a medicine's taken state on press and updates the
  taken/total summary
- Navigation: list → conversation → back, the six-destination bar, tab selection
  state, the header gear, the bar hiding on Settings, the cross-screen caption
  warning, a failed load that explains itself and recovers on retry, and — on a
  tablet — the bar becoming a full-label sidebar with its own Settings entry,
  reaching every destination the same way the bottom bar does, and dropping the
  header gear on every screen
- Sign In / Sign Up render their forms and forward to `onSignIn` / `onSignUp` /
  `onSignUp` ↔ `onSignIn` on the matching button and link presses
- Home renders its dashboard, dismisses the daily-task notification, and walks
  the simulated incoming call end to end — decline, answer into the active-call
  UI, and toggle CC, mute and pause from there
- My Day renders its task list, toggles a task's done state on press, and
  dismisses its notification

---

## Known issues and limitations

- **Data is in memory.** The repositories seed from the prototype's fixtures, and
  messages sent during a session are kept only for the life of the process. Only
  the accessibility settings persist to disk.
- **Video, audio and the captioned call are represented, not implemented.**
  Requesting a call shows a written confirmation; there is no media pipeline
  behind it, and the volume and balance settings are stored and displayed but not
  yet applied to a real audio stream.
- **Vibration patterns are approximated.** `expo-haptics` exposes named impacts
  rather than an arbitrary waveform, so each rhythm plays as a sequence of
  impacts and pauses. That is enough to tell them apart by feel; a true waveform
  needs a native module.
- **Sign in and sign up are unauthenticated.** Both forms take input but do not
  validate or store it — "Sign in" and "Create account" navigate straight into
  the app regardless of what, if anything, was typed. An account store and
  real validation belong with a backend, which is out of scope this week.

---

## Team member contributions — Week 5

| Member       | Screens                                                                                                                                                                                 |
|:-------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Justin Zhang | Welcome, Sign In, Sign Up, Home, My Day                                                                                                                                                 |
| Rehman Uddin | Appointments, Medicines, Memories                                                                                                                                                       |
| Victor Lee   | Contacts, Messaging, Accessibility Settings — plus the shared shell on this branch: theme, navigation, models, repositories, Context providers, shared components, and the test harness |

---

## AI usage summary

Claude (Opus) and Gemini were used on this branch to:

- scaffold the Expo project and port the Flutter client's architecture into
  React Native — Provider became Context, `ChangeNotifier` became pure helpers
  plus thin providers, and go_router became React Navigation;
- translate the Assignment 3 palette and typography scale into the theme;
- draft the screens, the shared components and the custom tab bar;
- generate the Jest and RNTL test cases, including edge cases that were not on
  the original list — `NaN` slider values, whitespace-only messages, corrupt
  stored preferences, calendar-day vs elapsed-hours grouping, and an attempt to
  disable the visual alert banner by editing storage;
- port Rehman's `AppointmentsScreen` / `MedicinesScreen` / `MemoriesScreen`
  (originally a static-data prototype in the standalone `careconnect-app/`
  project) into `src/`, rebuilding them against this app's repository/Context
  pattern, theme and accessibility conventions, and wiring them into the
  navigator in place of the `PendingScreen` placeholders — Claude Code, working
  from the assignment brief and this codebase's existing patterns;
- write this README.

Rejected AI suggestions: phone call-to-action buttons on contact cards, and
transient toast confirmations. Both were replaced — the first with text and
captioned-video actions, the second with dismissible in-page banners, because
the team's design philosophy rules out timed windows that penalise a user
reading at their own pace. A strobing implementation of the Notify flash was
also rejected in favour of a single fade, for the seizure-risk reason above.

Every generated file was reviewed, and the whole suite was run before submission.