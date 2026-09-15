# CareConnect React Native client — working notes

SWEN 661 Team 2, Week 5. This is the Expo port of the Week 4 Flutter client in
`../flutter`. Victor owns Contacts, Messaging and Accessibility Settings, plus
the shared shell; Justin owns Welcome, Sign In, Sign Up, Home and My Day,
merged in from his own branch; Rehman owns Appointments, Medicines and
Memories, ported in from his `AppointmentsScreen`/`MedicinesScreen`/
`MemoriesScreen` implementation and rebuilt against this app's Context/
repository conventions and theme.

## The rule everything else follows

**Anything communicated through sound must also be communicated visually or in
text.** The users are deaf or hard of hearing. Breaking any of these breaks the
assignment, not just the style guide:

- **No voice-call affordance.** A "call" in this app is a captioned video call,
  named as such. A component test asserts no call button exists on Contacts.
- **`visualAlertBanners` cannot be turned off.** `withSettings` and
  `settingsFromStored` both force it true, so neither the UI nor a hand-edited
  store can produce a sound-only alert. Do not add a way to set it false.
- **Status is a shape *plus* a word.** Switches print "On"/"Off", the badge
  prints "waiting", the selected tab is bold and underlined as well as tinted.
- **No timed windows.** No toasts. Confirmations are dismissible in-page banners.
- **The Notify flash is one slow fade, never a strobe** (WCAG 2.3.1).
- **An error state must not read as an empty state.** "No messages yet" tells a
  deaf user nobody wrote; a failed load is a different fact.

## Conventions

- The **Week 3 design prototype** outranks the original React web client at the
  repository root. Avatar initials are stored per contact because the design's
  choices ("Joyce" → JO, "NHS 111" → NH) follow no mechanical rule.
- Business logic is pure functions in `src/models` and `src/utils`. Providers
  hold state and call them; they do not contain rules worth testing on their own.
- Colours only from `src/theme/colors.ts`, which records each measured contrast
  ratio. Do not introduce a colour that is not in that file.
- Decorative icons and badges are hidden from the accessibility tree
  (`accessibilityElementsHidden` + `importantForAccessibility`), because the card
  around them carries one full spoken label. This is deliberate — see the testing
  note below.

## Testing

`npm run lint && npm run typecheck && npm run test:coverage` from this directory.

- RNTL v14's `render`, `fireEvent` and `renderHook` are **async**. Every call
  must be awaited, and state updates driven by a press need `act`.
- Queries skip elements hidden from accessibility by default. That is correct
  behaviour, not a bug: assert those through the parent's `accessibilityLabel`,
  and use `{ includeHiddenElements: true }` when checking that the text is drawn.
- `jest.setup.ts` pins the window to 400×900, because the test renderer's
  default 750×1334 is past the 720dp tablet breakpoint and every test would
  otherwise exercise the two-column path. `useTabletSize()` opts in.
- `src/test-support/harness.tsx` renders the real navigator and providers, with
  repositories injectable for the failure paths.
- AsyncStorage and `expo-haptics` are mocked in `jest.setup.ts`; AsyncStorage v3
  no longer ships its own Jest mock.

## Gotchas

- `npx expo install` cannot reach the Expo API from a restricted network; plain
  `npm install` with explicit versions works, and `npx expo install --fix`
  aligns them later on an unrestricted machine.
- `android/` and `ios/` are not committed. Use EAS, or `npx expo prebuild`.
- `careconnect-app/` is a separate, standalone Expo project nested in this
  directory (Rehman's original scaffold, with its own `node_modules` and
  `tsconfig.json`) — excluded from this app's `tsconfig.json` and
  `eslint.config.js`. Its screens were ported into `src/` rather than wired in
  directly; the nested project itself is not part of the shipped app.
