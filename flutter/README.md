# CareConnect — Flutter client

The mobile build of CareConnect for **SWEN 661 Team 2 (The Acuity Health Group)**,
targeting care recipients who are deaf or hard of hearing.

> **Scope of this branch.** This branch delivers the four screens assigned to
> **Justin Zhang** in the Week 4, **Sign Up**, **Sign In**, **Home** and **My Day** 
> plus the shared application shell
> they need in order to run and be tested on their own. Victor's screens (Contacts,
> Messaging, Settings) are also present with minimal changes. The only change made 
> was to the settings files to link the sign-out button to the Splash page.
> Rehman's screens (Appointments, Medicines,
> Memories) land on their own branches; their navigation destinations already
> exist here as clearly-labelled placeholders. See [Adding a screen](#adding-a-screen).
>
> Every screen here is built to match the **Week 3 design prototype**. Where the
> prototype and the earlier React web client disagreed, the prototype won.

---

## What the application does

CareConnect is a daily companion for a care recipient and the people looking
after them. This client is built on one governing rule, taken from the team's
Assignment 3 design philosophy:

> **Anything the application communicates through sound must also be
> communicated visually or in text.** Sound may supplement a notification. It is
> never the only carrier.

That rule is why the Contacts screen has no call button, why a voicemail arrives
as a transcript rather than a play button, why "Notify" replaces "give me a
ring" with a silent flash on the other person's phone, and why the Settings
screen will not let you switch the visible alert banner off.

### The assigned constraints, and where each one is answered

| # | Constraint | Where it lives in this code |
|:--|:-----------|:----------------------------|
| 1 | Captions for video | `MessageBubble` states in words whether a video carries captions; size, colour and on/off live in Settings → Captions, with a live preview |
| 2 | Text alternative for audio | A `MessageKind.voicemail` renders its transcript as the message body (`lib/screens/messaging/widgets/message_bubble.dart`) |
| 3 | No sound-only alerts | `visualAlertBanners` has no setter and cannot be switched off, even by editing the stored preferences (`lib/models/accessibility_settings.dart`) |
| 4 | Clear visual notifications | `AlertBanner`, the in-thread `CareConnect alert` card, and the `VisualFlash` pulse — each carries an icon, a heading and a body that says *what* happened |
| 5 | User control of audio | Settings → Audio carries the alert-volume slider (zero is a valid setting) and the pause-control note; L/R balance supports a single aided ear |

---

## Screens in this branch

| Screen      | Route | What it does                                                                           |
|:------------|:------|:---------------------------------------------------------------------------------------|
| **Welcome** | `/welcome` | Initial splash screen linking to sign up and sign in.                                  |
| **Sign In** | `/sign-in` | Form asking for email and password, letting the user sign into their account.          |
| **Sign Up** | `/sign-up` | Form asking for name, email, password, and password confirmation to create an account. |
| **Home**    | `/home` | A dashboard showing the most urgent notifications and activites of the day.            |
| **My Day**  | `/my-day` | Shows a checklist of activities the user needs to do today.                            |

Placeholders exist at `/appointments`, `/medicines` and
`/memories` so the prototype's six-destination navigation works end to end. They
are **not** functional screens and do not count toward the assignment's 7–10
screen requirement.

Screens are laid out for **phone and tablet**: contact rows stack in one column
below 720dp and go two across above it; the phone's bottom bar becomes the
prototype's left sidebar on a tablet, with Settings listed in it rather than
behind the app-bar gear.

## Architecture

```
lib/
├── main.dart                    # entry point; wires the concrete repositories
├── app.dart                     # MultiProvider + MaterialApp.router + theme
├── core/
│   ├── routing/                 # route names, paths, and the GoRouter
│   ├── theme/                   # Assignment 3 palette and typography scale
│   └── utils/                   # pure formatters, validators, haptic patterns
├── models/                      # Contact, Message, AccessibilitySettings,
│                                #   VibrationPattern
├── data/                        # repository interfaces + prototype fixtures
├── state/                       # ChangeNotifier controllers (no widget imports)
├── widgets/                     # shared UI: scaffold, banners, badges
└── screens/
    ├── auth/
    ├── contacts/
    ├── home/
    ├── messaging/
    ├── my_day/
    ├── settings/
    ├── splash/
    └── pending/                 # teammates' destinations, clearly labelled
```

**State management — Provider.** Three `ChangeNotifier` controllers
(`ContactsController`, `MessagesController`, `SettingsController`) are supplied
by a `MultiProvider` in `app.dart`. None of them import a Flutter widget, so
every one is unit tested directly. `setState` is used only for genuinely local
state — the composer's draft text and the Notify flash trigger.

Shared state earns its keep in two visible places: opening a conversation clears
that contact's badge back on the Contacts screen without passing anything
through the route, and switching captions off in Settings makes a warning appear
inside any conversation that contains a video.

**Navigation — go_router (Navigator 2.0).** Routes are declared in
`lib/core/routing/app_router.dart`.

The six top-level destinations live inside a `ShellRoute`, so `AppShell` — and
with it the bottom bar, or the sidebar on a tablet — is built once and stays
mounted while only the page underneath changes. Each of those pages is a
`NoTransitionPage`: switching tabs swaps the content with no slide and no fade,
because the navigation is furniture and should not move. Settings is also in the
shell, so a tablet keeps its sidebar there, but it is *pushed* rather than
switched to, and the phone's bottom bar hides while it is open — it is a screen
you come back from, not a seventh tab.

The conversation screen sits outside the shell, on the root navigator, so it
covers the navigation the way a drill-down should and keeps a normal push
animation and back-swipe. The contact is identified by the `contactId` path
parameter, so the screen works from a tap and from a cold deep link alike. An id
that no longer exists lands on a recoverable "contact is not in your list"
screen; an unknown path lands on the router's error screen. Screens that can be
reached by deep link carry an explicit back button rather than the automatic
one, which would render nothing when there is no history to pop.

**Persistence.** `SharedPreferences`, one key per preference
(`lib/data/settings_repository.dart`), so a preference added later cannot
invalidate the whole stored object. A corrupt or partially written store falls
back to safe defaults rather than throwing on startup.

**Accessibility.** Every interactive element carries a `Semantics` label,
interactive targets are at least 48dp, section headings are marked as headers so
a screen reader can jump between them, and status is always "a word plus a
shape" — never colour alone, which is why switches print "On"/"Off", the badge
prints "waiting", and the selected navigation tab is bold and underlined as well
as coloured. Colours and their measured contrast ratios come straight from the
Assignment 3 design system (`lib/core/theme/app_colors.dart`); both caption
colours were checked against the caption panel (white 8.5:1, yellow 8.1:1).

---

## Getting started

### Prerequisites

| Tool | Version |
|:-----|:--------|
| Flutter SDK | 3.x, stable channel |
| Dart | bundled with Flutter |
| Android Studio + SDK | for the Android build |
| Xcode | for the iOS build (macOS only) |

Run `flutter doctor` before reporting a broken build.

### Run the app

```bash
cd flutter
flutter pub get
flutter devices          # confirm an emulator or device is attached
flutter run
```

### Generate the platform folders

`android/` and `ios/` are **not** committed, so generate them once after
cloning. Do it through a throwaway project rather than `flutter create .` in
place, which would overwrite `lib/main.dart`:

```bash
cd flutter
flutter create --platforms=android,ios --project-name careconnect_mobile ../_platform_tmp
cp -r ../_platform_tmp/android ../_platform_tmp/ios .
rm -rf ../_platform_tmp
```

`flutter analyze`, `flutter test` and `flutter test --coverage` all work
**without** this step; only `flutter build` needs it.

### Release builds

```bash
flutter build apk --release          # Android
flutter build ios --release          # iOS, macOS only
```

---

## Tests

```bash
cd flutter
flutter analyze                      # expected: No issues found!
flutter test                         # all tests should pass
flutter test --coverage              # writes coverage/lcov.info
```

### Coverage report

```bash
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html        # or: start coverage\html\index.html
```

The report is written to `flutter/coverage/html/index.html`. Attach the summary
screenshot to the submission; the assignment floor is **60 % line coverage**.

If `genhtml` is not installed (it ships with `lcov`), the Dart alternative is:

```bash
dart pub global activate coverage
```

### What is tested

**Unit tests** (`test/models/`, `test/state/`, `test/utils/`)

- `Contact` — the design's own avatar initials and the fallback that derives
  them, honorific handling, helpline naming, semantic labels, equality
- `Message` — transcript and caption headings, authorship, the sentence a screen
  reader announces, delivery-status labels
- `AccessibilitySettings` — prototype defaults, volume and balance clamping
  (including `NaN`), the written balance label, map round-trip, graceful
  recovery from a corrupt or partial store, and that the visual banner cannot be
  switched off through storage
- `VibrationPattern` — the three named rhythms are well formed, bounded in
  length, printed as well as felt, and actually distinguishable from each other
- `Formatters` / `Validators` — 12-hour clock edge cases (midnight, noon),
  calendar-day vs elapsed-hours day labels, composer length and blank rules
- `ContactsController` — load, failure, ordering, lookup, unmodifiable exposure
- `MessagesController` — thread caching, transcript previews, the
  waiting-messages rule, Notify records, send validation
- `SettingsController` and all three repositories — persistence, no-op writes,
  clamping on write, and a `SharedPreferences` round-trip

**Widget tests** (`test/widgets/`)

- Contacts renders the design's five contacts with their initials, relationships
  and Primary pill, previews a video by its captions, shows waiting counts as a
  number and a word, and — asserted explicitly — offers **no voice-call
  affordance anywhere**
- Contacts stacks one column on a phone and two plus a sidebar on a tablet
- The conversation renders bubbles in order, groups them by day, stamps them
  "8:02 am" as the prototype does, shows a voicemail as a transcript, states
  caption availability, and renders a CareConnect alert
- Notify plays the flash, writes the record into the thread, and tells the truth
  in its sub-line when vibration is off
- The composer rejects blank and whitespace-only messages with a written reason,
  sends, and counts characters down
- Settings renders every prototype section, writes each switch state out as a
  word, refuses to unlock the visual banner, flips the conformance badge when
  captions go off, repaints the caption preview in yellow, drives both sliders,
  and previews a vibration rhythm without changing any setting
- Navigation: list → conversation → back, bottom bar, app-bar gear, tablet
  sidebar, deep links, the unknown-route screen, and the cross-screen caption
  warning
- The navigation bar does not move while a tab changes (its rect is identical
  one frame into the switch), the outgoing page is gone on the next frame rather
  than sliding out, and the bar hides on Settings while the tablet sidebar
  stays

---

## Adding a screen

1. Add the path and name to `lib/core/routing/routes.dart` (most already exist).
2. Replace the `PendingScreen` in `lib/core/routing/app_router.dart` with the
   real screen — one line per route. Keep it inside the `ShellRoute` and wrapped
   in `page(...)` so it inherits the persistent navigation and swaps without a
   transition.
3. Build the screen inside `AppScaffold`, which supplies the app bar. The
   navigation is not the screen's concern — `AppShell` owns it, and
   `kDestinations` already lists every destination.

---

## Known issues and limitations

- **Data is in memory.** `MockContactRepository` and `MockMessageRepository` seed
  from the prototype's fixtures, and messages sent during a session are kept only
  for the life of the process. Only the accessibility settings persist to disk.
- **`android/` and `ios/` are not committed** — generate them with the command
  above before `flutter build`.
- **Video, audio and the captioned call are represented, not implemented.**
  Requesting a call opens a written confirmation; there is no media pipeline
  behind it yet, and the alert-volume and balance settings are stored and
  displayed but not yet applied to a real audio stream.
- **Vibration patterns are approximated.** Flutter's `HapticFeedback` exposes
  named impacts rather than an arbitrary waveform, so each rhythm is played as a
  sequence of impacts and pauses. That is enough to tell them apart by feel; a
  true waveform needs a platform channel.
- **Sign out is not wired up.** It belongs with the authentication screens on
  another branch, so the control is present and says so rather than failing
  silently.
- Assignment 3 mentions requesting an ASL interpreter. The Week 3 prototype has
  no surface for it, so it is not built here.
- No font asset is bundled; the app uses each platform's system sans-serif, which
  the design system permits and which inherits the reader's platform font
  settings.

---

## Team member contributions — Week 4

| Member           | Screens                                                                                                                                                                           |
|:-----------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Justin Zhang** | Login, Signup, Home, My Day                                                                                                                                                       |
| Rehman Uddin     | Appointments, Medicines, Memories                                                                                                                                                 |
| Victor Lee       | Contacts, Messaging, Accessibility Settings — plus the shared shell on this branch: theme, router, navigation, models, repositories, Provider controllers, and the shared widgets |

---

## AI usage summary

Gemini 3 Flash was used for Sign In, Sign Up, Home, My Day

- read the Week 3 design prototype and rebuild five screens against it,
  including the Splash screen, Sign Up, Sign In, Home, and My Day pages.
- Generated unit and widget tests for the relevant pages and the new Sign Out feature in the settings

Rejected AI suggestions: New top header that clashed with the existing headers from Victor's initial pages.

Claude (Opus) was used on this branch (Contacts, Messaging, Accessibility Settings) to:

- scaffold the Flutter project and translate the Assignment 3 colour palette and
  typography scale into `ThemeData`;
- read the Week 3 design prototype and rebuild the three screens against it,
  including the contact roster, the Notify interaction, and the five Settings
  sections;
- draft the Provider controllers, the repositories and the shared widgets;
- generate unit and widget test cases, including edge cases the author had not
  listed — `NaN` slider values, whitespace-only messages, corrupt preference
  values, calendar-day vs elapsed-hours date grouping, and an attempt to disable
  the visual alert banner by editing stored preferences;
- write this README.

Rejected AI suggestions: telephone call-to-action buttons on contact cards, and
transient snack-bar confirmations. Both were replaced — the first with text and
captioned-video actions, the second with dismissible dialogs, because the team's
design philosophy rules out timed windows that penalise a user reading at their
own pace. A strobing implementation of the Notify flash was also rejected in
favour of a single fade, for the seizure-risk reason given above.

All generated code was reviewed, and every test was run before submission.
