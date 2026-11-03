# Voluntary Product Accessibility Template (VPAT) — WCAG 2.1 Edition

**Product:** CareConnect — Flutter mobile app
**Report date:** September 17, 2026
**Version evaluated:** 0.4.0+4
**Product description:** A hearing-accessibility-focused daily-companion app for care
recipients and their caregivers (contacts/messaging, daily tasks, appointments,
medicines, memories, and an accessibility-settings panel).
**Contact:** SWEN 661 Team 2 — The Acuity Health Group (Upneet Bir, Victor Lee, Justin Zhang)
**Evaluation methods used:**

- Manual code review of every screen against each WCAG 2.1 success criterion.
- Automated checks: `flutter test`'s `AccessibilityGuideline` API
  (`androidTapTargetGuideline`, `textContrastGuideline`, `labeledTapTargetGuideline`) run
  against all 11 routed screens, the tablet layout, and both Home-screen call-overlay
  states — 14 tests in `test/accessibility/accessibility_guideline_test.dart`.
- On-device end-to-end testing: 6 `integration_test` flows and 6 Maestro flows
  (`maestro/*.yaml`), the latter driven through Android's real accessibility tree
  (UiAutomator), on a connected Android emulator.
- Manual verification with **TalkBack** (Android) per the assignment's screen-reader
  demonstration requirement. **VoiceOver (iOS) was not evaluated** — no iOS
  device/simulator was available in this environment; this is recorded as a known
  limitation below.

This template follows the structure recommended in the [section508.gov VPAT
guidance](https://www.section508.gov/sell/vpat/), scoped to the WCAG 2.1 Level A and AA
success criteria (the ITI VPAT's "WCAG 2.1 Report" table). Only that table applies here —
this is not a web product, so the WCAG "web page" framing is interpreted for a native
mobile app throughout (e.g. "page" → "screen", "page title" → the screen's `AppBar`
heading).

**Conformance levels:** Supports · Partially Supports · Does Not Support · Not Applicable

---

## Table 1: WCAG 2.1 Level A

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| 1.1.1 Non-text Content | Supports | All meaningful icons are paired with adjacent text (role icons, status icons); decorative icons (chevrons, avatars) carry no independent meaning. |
| 1.2.1 Audio-only/Video-only (Prerecorded) | Not Applicable | The app contains no prerecorded audio/video media. |
| 1.2.2 Captions (Prerecorded) | Not Applicable | No prerecorded video. (Live captioning is covered under 1.2.4.) |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | No prerecorded video. |
| 1.3.1 Info and Relationships | Supports | `Semantics`/`MergeSemantics` group related content; screen titles are marked `header: true`; switches expose state as both position and the word "On"/"Off". |
| 1.3.2 Meaningful Sequence | Supports | Widget-tree order matches visual reading order on every screen; verified by the automated guideline suite (which reads the same order a screen reader would). |
| 1.3.3 Sensory Characteristics | Supports | Selected-tab state is bold **and** underlined, not colour alone; unread counts show a number and the word "waiting", never a bare dot. |
| 1.4.1 Use of Color | Supports | No control or state in the app is conveyed by colour alone (see 1.3.3 examples; error text in the message composer is also shown as text, not just a red border). |
| 1.4.2 Audio Control | Not Applicable | No audio plays automatically. |
| 2.1.1 Keyboard | Supports | All interactive elements are standard Flutter widgets (`InkWell`, `ButtonStyleButton` family, `TextField`, `Checkbox`, `Slider`) that ship with keyboard focus/activation via `Focus`/`Actions`. **Not physically tested with an attached hardware keyboard** — verified by code review only; see Known Limitations. |
| 2.1.2 No Keyboard Trap | Supports | No custom focus-scoping code exists anywhere in the app that could trap focus; standard `Navigator`/`GoRouter` back behavior always available. |
| 2.1.4 Character Key Shortcuts | Not Applicable | No single-character keyboard shortcuts are implemented. |
| 2.2.1 Timing Adjustable | Not Applicable | No session or content time limits exist in the app. |
| 2.2.2 Pause, Stop, Hide | Partially Supports | The incoming-call avatar glow and the message "visual flash" pulse auto-play and have no pause control. Both are short (≤1.5s), user-triggered (not background/ambient), and non-essential to completing any task, but strictly do not offer pause/stop. See Known Limitations. |
| 2.3.1 Three Flashes or Below Threshold | Supports | `VisualFlash` and the call-glow animation are single slow pulses (900–1500ms), explicitly designed and documented in-code to stay under the seizure-risk flash-rate threshold. |
| 2.4.1 Bypass Blocks | Not Applicable | Native mobile screens do not re-render a repeated navigation block on every "page load" the way a website does; there is nothing to bypass. |
| 2.4.2 Page Titled | Supports | Every screen renders a `Semantics(header: true)` title in its `AppBar`, announced on arrival — the mobile equivalent of a descriptive page title. |
| 2.4.3 Focus Order | Supports | Verified by code review and by the automated guideline suite; no custom `FocusTraversalPolicy` overrides the default (visual/tree) order. |
| 2.4.4 Link Purpose (In Context) | Supports | Every tappable row's accessible name states its destination/action in full (e.g. "Opens the conversation", "Go to My Day"), not "tap here". |
| 2.5.1 Pointer Gestures | Supports | No control requires a multipoint or path-based gesture; all actions are a single tap (sliders are also adjustable via keyboard/switch-access focus + increase/decrease). |
| 2.5.2 Pointer Cancellation | Supports | All tap targets use standard Material tap-up activation (`InkWell`/`ButtonStyleButton`), which already supports cancel-by-dragging-away. |
| 2.5.3 Label in Name | Supports | This assignment's audit specifically corrected two violations of this criterion (the appointments/memories cards previously double-announced a hand-written label alongside visible text with a different wording — see Known Limitations for what changed) so that every element's programmatic name now contains its visible text. |
| 2.5.4 Motion Actuation | Not Applicable | No feature is triggered by device motion/shake. |
| 3.1.1 Language of Page | Supports | Single-language (English) app using the platform default locale; no mixed-language content. |
| 3.2.1 On Focus | Supports | Focusing any field or control never triggers navigation or a context change. |
| 3.2.2 On Input | Supports | Every switch/slider applies its new value immediately and predictably; no control submits or navigates as a side effect of a value change. |
| 3.3.1 Error Identification | Supports | The message composer identifies the "empty message" error in visible text under the field (`Validators.message`), not by colour alone. |
| 3.3.2 Labels or Instructions | Supports | Every form field has a visible label (`labelText`) in addition to its semantic label. |
| 4.1.1 Parsing | Not Applicable | Native widget tree, not parsed markup — the "duplicate ID / unclosed tag" failure mode this criterion targets does not exist in Flutter. |
| 4.1.2 Name, Role, Value | Supports | The primary focus of this assignment's remediation: the Home-screen call/mute/pause/CC controls now expose an explicit `button`/`toggled` role and state (previously silent); sliders are labeled; the medications checkbox now uses its native `checkbox` role instead of a conflicting hand-written label. |

## Table 2: WCAG 2.1 Level AA

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| 1.2.4 Captions (Live) | Supports | The simulated video call's live transcript ("[CC LIVE] ...") is a core, always-visible feature of the call screen, togglable in Settings — this app's captioning support is not an afterthought; it is the product's primary accessibility feature. |
| 1.2.5 Audio Description (Prerecorded) | Not Applicable | No prerecorded video. |
| 1.3.4 Orientation | Partially Supports | No orientation lock is set, but every screen was designed and tested in portrait only this cycle; landscape layout has not been manually verified. See Known Limitations. |
| 1.3.5 Identify Input Purpose | Partially Supports | The email field sets `keyboardType: TextInputType.emailAddress` but no field sets `autofillHints`, so platform autofill cannot identify field purpose. See Known Limitations. |
| 1.4.3 Contrast (Minimum) | Supports | This assignment's core fix area. An automated `textContrastGuideline` check now runs on every screen and both Home-screen call-overlay states. Concretely fixed: the Decline/Answer/End-call buttons and "LIVE" badge (previously `Colors.red`/`Colors.green` at 3.68:1/2.78:1 — now `AppColors.dangerAction`/`successAction` at 5.6:1/5.1:1); the memories-screen date text (`Colors.grey[600]` at 4.07:1 — now `AppColors.secondaryDark` at 5.11:1); and the incoming-call overlay's "Your daughter" text, whose contrast used to vary with an animated scrim opacity and could dip to 2.68:1 — the backdrop is now a fixed, fully opaque black. |
| 1.4.4 Resize Text | Supports | No `TextScaler`/`textScaleFactor` override exists anywhere in the app (verified by code review of `app.dart` and every screen), so the OS text-scale setting — up to 200% — passes through untouched. Not exhaustively screenshot-tested at every scale step; see Known Limitations. |
| 1.4.5 Images of Text | Supports | No image is used in place of real text anywhere in the app. |
| 1.4.10 Reflow | Supports | Every screen body is a `ListView`/scrollable rather than a fixed-height layout, so content reflows rather than clipping; verified on the phone-sized (400 logical px wide) test surface used throughout the test suites. |
| 1.4.11 Non-text Contrast | Supports | Interactive-control fills and borders use the documented `AppColors` token set (each with a recorded contrast ratio); the one exception found — the toggle-button inactive state at `Colors.white54` (3.68:1) — was raised to `Colors.white70` (5.07:1) as part of this audit. |
| 1.4.12 Text Spacing | Supports | The app's typography (`AppTheme`) already exceeds the criterion's minimums (1.5 line-height sitewide vs. the 1.5 minimum; generous letter/paragraph spacing by not using tightly-packed custom text layout), and no text container clips content at a fixed pixel height. |
| 1.4.13 Content on Hover or Focus | Not Applicable | This is a touch-first mobile app; the only hover-adjacent affordance is an `IconButton` tooltip (Settings gear), which is dismissable, hoverable, and persistent by Flutter's default tooltip behavior. |
| 2.4.5 Multiple Ways | Partially Supports | Settings is reachable two ways (the app-bar gear on a phone, the sidebar on a tablet); every other screen is reachable only through the bottom tab bar / sidebar (no search or site-map equivalent). Acceptable under typical native-app navigation conventions, but strictly short of "two ways" for five of the six destinations. See Known Limitations. |
| 2.4.6 Headings and Labels | Supports | Every screen has a descriptive `AppBar` heading; every form field and switch has a specific, descriptive label (never "field 1" or similar). |
| 2.4.7 Focus Visible | Partially Supports | Relies on the Material framework's default focus highlight for keyboard/switch-access users; not manually confirmed on a physical tablet with an attached keyboard this cycle. See Known Limitations. |
| 3.1.2 Language of Parts | Not Applicable | No content in a language other than the page's declared language appears anywhere in the app. |
| 3.2.3 Consistent Navigation | Supports | The `AppShell` bottom bar (phone) / sidebar (tablet) is structurally identical and in the same relative position across all seven top-level screens. |
| 3.2.4 Consistent Identification | Supports | Recurring components (back button, settings gear, status badges) use the same icon, label, and behavior everywhere they appear. |
| 3.3.3 Error Suggestion | Partially Supports | The message composer explains *why* Send is disabled ("Type a message first"). Sign-in/sign-up have no client-side validation or error suggestions at all — those two screens are still prototype-stage (no real backend) and out of this cycle's accessibility-remediation scope. See Known Limitations. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Not Applicable | The app performs no legal, financial, or data-deletion transactions. |
| 4.1.3 Status Messages | Partially Supports | The Settings screen's "WCAG 2.2 Compliant" / "Check your captions" badge and the contacts/messages error banners are visible but not marked as a live region (`Semantics(liveRegion: true)`), so a screen-reader user who is not focused on the badge when it changes will not hear an automatic announcement. Recommended follow-up; see Known Limitations. |

---

## Summary of known limitations (from the tables above)

1. **iOS/VoiceOver not evaluated.** No iOS device or simulator was available in this
   environment. TalkBack (Android) was used for the required manual screen-reader pass;
   an iOS pass is outstanding.
2. **No physical hardware-keyboard test.** Keyboard operability (2.1.1, 2.4.7) is
   supported by the framework and verified by code review, but not physically confirmed
   with an attached Bluetooth/USB keyboard on a tablet.
3. **Landscape orientation (1.3.4) and dynamic-text-scale screenshots (1.4.4)** were
   verified by design/code review (no orientation lock, no `TextScaler` override) rather
   than by capturing every intermediate state manually.
4. **Auto-playing pulse animations (2.2.2)** — the incoming-call glow and the message
   "visual flash" — have no pause control, though both are brief, user-triggered, and
   non-essential to task completion.
5. **Sign-in/Sign-up forms (3.3.3, 1.3.5)** are still prototype-stage screens with no
   backend and no client-side validation; they were out of scope for this cycle's
   accessibility remediation, which focused on the screens with real behavior
   (Home, My Day, Contacts, Messaging, Settings) plus the three prototype
   list screens (Appointments, Medicines, Memories).
6. **Status messages aren't live regions (4.1.3).** Recommended follow-up:
   `Semantics(liveRegion: true)` on the Settings conformance badge and on alert banners.
7. **Only one navigational path (2.4.5)** reaches most non-Settings destinations (the
   tab bar) — typical for a native app, but short of the letter of the criterion.

## What changed this cycle (traceability to the fixes above)

| Area | File(s) | What was wrong | What changed |
|---|---|---|---|
| Contrast | `lib/screens/home/home_screen.dart`, `lib/core/theme/app_colors.dart` | Decline/Answer/End-call/LIVE-badge used `Colors.red`/`Colors.green` at 3.68:1/2.78:1 | New `AppColors.dangerAction`/`successAction` tokens at 5.6:1/5.1:1 |
| Contrast | `lib/screens/home/home_screen.dart` | Incoming-call text contrast varied with an animated scrim and could dip to 2.68:1 | Backdrop is now fixed opaque black; the pulse animates a decorative glow instead |
| Contrast | `lib/screens/memories/memories_screen.dart` | Date text `Colors.grey[600]` measured 4.07:1 | Switched to `AppColors.secondaryDark` (5.11:1) |
| Contrast | `lib/screens/home/home_screen.dart` | Toggle-button inactive state `Colors.white54` measured 3.68:1 | Raised to `Colors.white70` (5.07:1) |
| Touch target | `lib/screens/auth/sign_in_screen.dart`, `sign_up_screen.dart` | "Create an account"/"Sign in" links used `MaterialTapTargetSize.shrinkWrap` + `Size.zero`, an explicit 24px-tall tap target | Restored a 48×48 minimum tap target |
| Name/Role/Value | `lib/screens/home/home_screen.dart` | Call/mute/pause/CC controls were raw `InkResponse`/`InkWell` with no semantic role, label, or toggled state | Added explicit `Semantics(button: true, label:, toggled:)`; sliders labeled |
| Name/Role/Value (label conflicts) | `lib/screens/appointments/appts_screen.dart`, `memories_screen.dart` | A hand-written sentence label and the visible row text were both exposed, so a screen reader announced the content twice | Visible content now wrapped in `ExcludeSemantics`; the row's tap action is forwarded to the outer `Semantics.onTap` |
| Name/Role/Value | `lib/screens/medicines/medicine_screen.dart` | A custom label duplicated (and could drift from) `CheckboxListTile`'s own checkbox role/state | Removed the redundant wrapper; the native `checkbox` role now speaks for itself |
| Status/labels | `lib/screens/home/home_screen.dart`, `lib/screens/my_day/my_day_screen.dart` | Progress bars had no distinguishing label, so the value merged with adjacent text into an unclear announcement (e.g. "0, 0 of 7 done") | Added `semanticsLabel: 'Tasks completed today'` |

All of the above are covered by automated regression tests: 14 new
`AccessibilityGuideline` tests, 6 `integration_test` flows, and 6 Maestro flows (see
`docs/testing/coverage-summary.md` and `docs/testing/maestro-results.xml`).
