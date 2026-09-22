# Voluntary Product Accessibility Template (VPAT) — WCAG 2.1 Edition

**Product:** CareConnect — React Native (Expo) mobile app
**Report date:** September 21, 2026
**Version evaluated:** 0.5.0
**Product description:** The Expo port of the Week 4 Flutter client — a
hearing-accessibility-focused daily-companion app for care recipients and their
caregivers (contacts/messaging, daily tasks, appointments, medicines, memories, and an
accessibility-settings panel). Shares its color palette and product requirements with
the Flutter client (see `flutter/docs/VPAT-WCAG2.1-AA.md`), so several remarks below are
identical in substance to that document by design — the two clients are meant to behave
the same way for the same user.
**Contact:** SWEN 661 Team 2 — The Acuity Health Group (Upneet Bir, Victor Lee, Justin Zhang)
**Evaluation methods used:**

- Manual code review of every screen against each WCAG 2.1 success criterion.
- Automated checks: `npm run typecheck` (TypeScript), `npm run lint` (ESLint), and
  `npm run test:coverage` (Jest + React Native Testing Library) — 286 tests, 97.0% line
  coverage, including RNTL accessibility-role/label queries
  (`src/screens/__tests__/accessibility_theme.test.tsx`) and a full-app navigation
  integration suite (`src/screens/__tests__/navigation.test.tsx`).
- Numeric contrast verification of every fill/text pairing not already covered by the
  documented ratios in `src/theme/colors.ts`, computed against the WCAG relative-luminance
  formula (not eyeballed).
- Maestro E2E flow files exist (`mobile/maestro/*.yaml`) mirroring the Flutter client's
  flows, but **have not actually been run yet**. The build blocker that first prevented
  this has since been root-caused: `npx expo run:android` failed on one machine (JDK 25)
  during the native `react-native-screens` CMake step, but `./gradlew app:assembleDebug`
  succeeded cleanly on a second, independent machine with the *same* Gradle/NDK/CMake
  versions, once the build was pointed at JDK 17 instead. This confirms the failure is a
  JDK-25/26-vs-Gradle-9 native-toolchain incompatibility, not a defect in
  `react-native-screens`, Expo's CMake integration, or this app — see "Building for
  Android" in `mobile/README.md`. The APK itself now builds; the Maestro flows still need
  to actually be run against it on a device/emulator, which is recorded as an open item
  below.
- Manual screen-reader testing: **not performed in this environment** (no TalkBack/
  VoiceOver device pass was completed for the RN client at the time of this report).
  This is a materially different (weaker) evaluation basis than the Flutter client's
  VPAT, which did include a manual TalkBack pass — see Known Limitations.

This template follows the structure recommended in the [section508.gov VPAT
guidance](https://www.section508.gov/sell/vpat/), scoped to the WCAG 2.1 Level A and AA
success criteria (the ITI VPAT's "WCAG 2.1 Report" table). Only that table applies here
— this is not a web product, so the WCAG "web page" framing is interpreted for a native
mobile app throughout (e.g. "page" → "screen").

**Conformance levels:** Supports · Partially Supports · Does Not Support · Not Applicable

---

## Table 1: WCAG 2.1 Level A

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| 1.1.1 Non-text Content | Supports | Meaningful icons sit next to text that says the same thing; the shared `Icon` component (`src/components/Icon.tsx`) hides decorative icons from the accessibility tree by default, and the one icon that carries independent meaning (a role icon) is not marked decorative. |
| 1.2.1 Audio-only/Video-only (Prerecorded) | Not Applicable | No prerecorded audio/video media. |
| 1.2.2 Captions (Prerecorded) | Not Applicable | No prerecorded video. (Live captioning is covered under 1.2.4.) |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | No prerecorded video. |
| 1.3.1 Info and Relationships | Supports | Headings use `accessibilityRole="header"`; form fields carry `accessibilityLabel`/`accessibilityHint`; task/medication rows use `accessibilityRole="checkbox"` with `accessibilityState={{checked}}` rather than a plain tap target. |
| 1.3.2 Meaningful Sequence | Supports | Component tree order matches visual reading order on every screen; the full-app `navigation.test.tsx` suite exercises this order via real navigation. |
| 1.3.3 Sensory Characteristics | Supports | Switch/toggle state is printed as a word ("On"/"Off"-equivalent labels and `accessibilityState`), not conveyed by color or icon shape alone. |
| 1.4.1 Use of Color | Supports | No control or state is conveyed by color alone; e.g. the Mute/Pause/CC toggles carry an explicit `accessibilityState={{checked}}` in addition to their icon/color change. |
| 1.4.2 Audio Control | Not Applicable | No audio plays automatically. |
| 2.1.1 Keyboard | Supports | All interactive elements are standard React Native components (`TouchableOpacity`, `Pressable`, `TextInput`, `Slider`) that are natively focusable/operable on platforms with an attached keyboard. **Not physically tested with an attached hardware keyboard** — verified by code review only; see Known Limitations. |
| 2.1.2 No Keyboard Trap | Supports | No custom focus-scoping code exists anywhere in the app. |
| 2.1.4 Character Key Shortcuts | Not Applicable | No single-character keyboard shortcuts are implemented. |
| 2.2.1 Timing Adjustable | Not Applicable | No session or content time limits exist in the app. |
| 2.2.2 Pause, Stop, Hide | Supports | **Fixed this cycle.** The incoming-call avatar glow is a purely decorative looping pulse; `HomeScreen` now checks `AccessibilityInfo.isReduceMotionEnabled()` on mount and subscribes to `reduceMotionChanged`, and skips starting the loop (holding the glow at a static opacity) whenever Reduce Motion is on. The Notify "visual flash" is deliberately left animating regardless of this setting: it is the single, brief (~900ms), non-repeating fade that *is* the visual alert for a deaf/hard-of-hearing user — WCAG's "essential to the functionality or the information being conveyed" exemption for 2.3.3-style motion accommodations applies, and disabling it would remove the app's core notification mechanism for exactly the users who most need it. |
| 2.3.1 Three Flashes or Below Threshold | Supports | The Notify "visual flash" is documented in `CLAUDE.md` as a single slow fade specifically to stay under the WCAG 2.3.1 flash-rate threshold; the Home-screen incoming-call glow is a single ~1.5s fade, not a strobe. |
| 2.4.1 Bypass Blocks | Not Applicable | Native mobile screens do not re-render a repeated navigation block on every "page load" the way a website does. |
| 2.4.2 Page Titled | Supports | Every screen renders a header-role title via `AppHeader`, announced on arrival. |
| 2.4.3 Focus Order | Supports | Verified by code review; no custom focus-traversal override exists. |
| 2.4.4 Link Purpose (In Context) | Supports | Interactive rows and links state their destination/action in full accessible name (e.g. "Create an account", "Go to Medicines" tab), not "tap here". |
| 2.5.1 Pointer Gestures | Supports | No control requires a multipoint or path-based gesture; sliders (volume/balance) are single-thumb drags with a keyboard/switch-access equivalent via their `accessibilityValue`. |
| 2.5.2 Pointer Cancellation | Supports | Standard `TouchableOpacity`/`Pressable` tap-up activation, which already supports cancel-by-dragging-away. |
| 2.5.3 Label in Name | Supports | Every control's programmatic name (`accessibilityLabel`) contains or matches its visible text; the task/medication checkboxes use a single label built from the visible title/subtitle rather than a separate, possibly-drifting string. |
| 2.5.4 Motion Actuation | Not Applicable | No feature is triggered by device motion/shake. |
| 3.1.1 Language of Page | Supports | Single-language (English) app using the platform default locale. |
| 3.2.1 On Focus | Supports | Focusing any field or control never triggers navigation or a context change. |
| 3.2.2 On Input | Supports | Every switch/slider applies its new value immediately and predictably. |
| 3.3.1 Error Identification | Supports | Where validation exists (e.g. the message composer's empty-message state) the error is visible text, not color alone. |
| 3.3.2 Labels or Instructions | Supports | Every form field has a visible label plus an `accessibilityLabel`/`accessibilityHint` pair (Sign In/Sign Up screens). |
| 4.1.1 Parsing | Not Applicable | Native component tree, not parsed markup. |
| 4.1.2 Name, Role, Value | Supports | Task/medication rows expose the native `checkbox` role and `checked` state; toggle buttons expose `switch` role and `checked` state; the volume/balance sliders expose `accessibilityValue` with a human-readable `text` (e.g. "Centered", "Leaning left") rather than only a raw number. |

## Table 2: WCAG 2.1 Level AA

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| 1.2.4 Captions (Live) | Supports | The simulated video call's live transcript is wrapped in `accessibilityLiveRegion="polite"`, so it is announced as it updates — not just visible. This is a genuine live-region implementation, ahead of the Flutter client's equivalent screen (which shows the same captions visibly but has no live-region announcement). |
| 1.2.5 Audio Description (Prerecorded) | Not Applicable | No prerecorded video. |
| 1.3.4 Orientation | Partially Supports | No orientation lock is set, but every screen was designed and tested in portrait only; landscape has not been manually verified. |
| 1.3.5 Identify Input Purpose | Partially Supports | The email fields set `keyboardType="email-address"` but no field sets `textContentType`/`autoComplete`, so platform autofill cannot identify field purpose (name, email, password). |
| 1.4.3 Contrast (Minimum) | Supports | **Fixed this cycle.** The Home screen's Decline/Answer buttons and "LIVE"/End-call badge used raw `#FF4B5C`/`#4BCB66` fills, measuring 3.27:1 and 2.09:1 white-on-fill — both failing 4.5:1. Replaced with new `colors.dangerAction` (`#C62828`, 5.62:1) and `colors.successAction` (`#2E7D32`, 5.13:1) tokens, added to the shared, ratio-documented palette (mirrors the Flutter client's `AppColors.dangerAction`/`successAction`). The Mute/Pause/CC toggle's inactive-state text/icon (`rgba(255,255,255,0.54)`, 3.68:1) was raised to 0.7 alpha (5.07:1). The incoming-call overlay's backdrop used to be the pulsing animation's own opacity (`rgba(0,0,0,0.48)`→`rgba(0,0,0,0.8)`), so the "Your daughter" text's contrast depended on the animation phase and could fail 4.5:1 at the dim end (~2.64:1 at its worst); the backdrop is now a fixed, fully opaque black (10:1+ regardless of animation phase), and the pulse animates a decorative glow behind the avatar instead. Every other screen's text/fill pairing was checked against the documented ratios in `colors.ts` and found compliant, including a translucent card on the Welcome screen (verified at 5.1–7.3:1 depending on the text layer). |
| 1.4.4 Resize Text | Supports | No `allowFontScaling={false}` or `maxFontSizeMultiplier` override exists anywhere in the app (verified by a full-codebase search), so the OS text-scale setting — up to 200% — passes through untouched. Not exhaustively screenshot-tested at every scale step. |
| 1.4.5 Images of Text | Supports | No image is used in place of real text anywhere in the app. |
| 1.4.10 Reflow | Supports | Every screen body is a `ScrollView` rather than a fixed-height layout; verified on the 400×900 test-renderer surface used throughout the Jest suite (`jest.setup.ts` pins this specifically to stay under the tablet breakpoint). |
| 1.4.11 Non-text Contrast | Supports | Interactive-control fills and borders use the shared, ratio-documented `colors` token set; the toggle-button and call-button violations found this cycle (see 1.4.3) are the same fills used for both text and their surrounding UI-component boundary, so fixing the text contrast fixed the non-text contrast for the same elements. |
| 1.4.12 Text Spacing | Supports | The app's typography scale (`src/theme/typography.ts`) already exceeds the criterion's minimums, and no text container clips content at a fixed pixel height. |
| 1.4.13 Content on Hover or Focus | Not Applicable | Touch-first mobile app; no hover-triggered content exists. |
| 2.4.5 Multiple Ways | Partially Supports | Settings is reachable two ways (an app-bar action and, on a tablet, the sidebar); every other screen is reachable only through the bottom tab bar (no search or site-map equivalent). Typical for a native app, but short of "two ways" for most destinations. |
| 2.4.6 Headings and Labels | Supports | Every screen has a descriptive header; every form field and switch has a specific, descriptive label. |
| 2.4.7 Focus Visible | Partially Supports | Relies on the platform's default focus highlight for keyboard/switch-access users; not manually confirmed on a physical device with an attached keyboard. |
| 3.1.2 Language of Parts | Not Applicable | No content in a language other than the page's declared language appears anywhere in the app. |
| 3.2.3 Consistent Navigation | Supports | The bottom tab bar is structurally identical and in the same relative position across every top-level screen. |
| 3.2.4 Consistent Identification | Supports | Recurring components (back button, settings action, status badges, icons) use the same icon, label, and behavior everywhere they appear. |
| 3.3.3 Error Suggestion | Partially Supports | Where validation exists it explains what's wrong, but Sign In/Sign Up perform no client-side validation at all (no backend exists yet for either screen) — both are still prototype-stage and were out of this cycle's remediation scope. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Not Applicable | The app performs no legal, financial, or data-deletion transactions. |
| 4.1.3 Status Messages | Partially Supports | Live captions correctly use `accessibilityLiveRegion="polite"` (see 1.2.4), but the Settings screen's "WCAG 2.2 Compliant"/"Check your captions" badge does not — a screen-reader user not focused on the badge when it changes will not hear an automatic announcement. Same gap as the Flutter client's equivalent badge. |

---

## Summary of known limitations (from the tables above)

1. **No manual screen-reader pass performed for this client.** Unlike the Flutter
   client (manually verified with TalkBack), the RN client's accessibility props have
   been verified by code review, automated RNTL role/label queries, and numeric contrast
   calculation — but not by an actual TalkBack or VoiceOver run. This is the single
   biggest gap in this report's evidence relative to the Flutter VPAT, and the
   assignment's required screen-reader demonstration video for this client is
   outstanding.
2. **Maestro E2E flows have not been run against a live build yet.** `mobile/maestro/*.yaml`
   exists (six flows mirroring the Flutter client's). The original build blocker — `npx
   expo run:android` failing during the native `react-native-screens` CMake step — is
   now root-caused rather than unconfirmed: `./gradlew app:assembleDebug` completed
   successfully on a second machine with the same Gradle 9.3.1/NDK 27.1.12297006/CMake
   3.22.1 versions once the build was pointed at JDK 17 instead of JDK 25/26 (see
   "Building for Android" in `mobile/README.md`). So the APK now builds; what's still
   outstanding is actually running the six Maestro flows against it on a device or
   emulator and capturing the results, matching what was done for the Flutter client.
3. ~~Touch targets on two text-only links are undersized.~~ **Fixed.** "Forgot
   password?" (Sign In) and the "Create an account"/"Sign in" footer links (Sign In,
   Sign Up) now carry `hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}`, bringing
   their effective tap target to roughly 48pt tall — matching `layout.minTouchTarget`
   without changing their visible size.
4. ~~No `AccessibilityInfo.isReduceMotionEnabled()` check anywhere.~~ **Fixed** for the
   incoming-call glow — see 2.2.2 above. (VisualFlash is intentionally left unaffected;
   see that row's remarks for why.)
5. **Landscape orientation (1.3.4) and every dynamic-text-scale step (1.4.4)** were
   verified by code review (no orientation lock, no font-scale override) rather than by
   capturing every intermediate visual state manually.
6. **Sign-in/Sign-up forms (3.3.3, 1.3.5)** have no backend, no client-side validation,
   and no `textContentType`/`autoComplete` hints; out of scope for this cycle's
   accessibility remediation, which focused on the screens with real behavior (Home, My
   Day, Medicines) plus labeling passes on the rest.
7. **Status messages aren't all live regions (4.1.3).** The Settings compliance badge
   should get the same `accessibilityLiveRegion="polite"` treatment already used
   correctly for live captions.

## What changed this cycle (traceability to the fixes above)

| Area | File(s) | What was wrong | What changed |
|---|---|---|---|
| Contrast | `src/screens/HomeScreen.tsx`, `src/theme/colors.ts` | Decline/Answer/End-call/LIVE-badge used raw `#FF4B5C`/`#4BCB66` at 3.27:1/2.09:1 | New `colors.dangerAction`/`successAction` tokens at 5.62:1/5.13:1 |
| Contrast | `src/screens/HomeScreen.tsx` | Incoming-call text contrast varied with an animated scrim and could dip to ~2.64:1 | Backdrop is now fixed opaque black; the pulse animates a decorative glow instead |
| Contrast | `src/screens/HomeScreen.tsx` | Toggle-button inactive state `rgba(255,255,255,0.54)` measured 3.68:1 | Raised to 0.7 alpha (5.07:1) |
| Build correctness | `src/screens/HomeScreen.tsx` | `accessibilityElementsHidden` passed directly to the custom `Icon` component, which doesn't declare that prop (`tsc` error TS2322) | Removed — `Icon` already hides decorative icons by default, so this changed nothing at runtime, only fixed the type error |
| Touch target | `src/screens/SignInScreen.tsx`, `SignUpScreen.tsx` | "Forgot password?"/"Create an account"/"Sign in" were plain `TouchableOpacity`s with no `minHeight`/padding, rendering at ~24pt tall | Added `hitSlop={{top:12,bottom:12,left:8,right:8}}` to reach ~48pt without changing visible size |
| Motion | `src/screens/HomeScreen.tsx` | The incoming-call avatar glow looped regardless of the OS Reduce Motion setting | Added an `AccessibilityInfo.isReduceMotionEnabled()`/`reduceMotionChanged` check; the loop is skipped (glow held static) when Reduce Motion is on |

Accessibility props (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`,
`accessibilityState`, `accessibilityValue`) across Sign In, Sign Up, Welcome, My Day, and
Medicines, plus the RNTL accessibility-role test suite and the Maestro flow files, were
added in the same pass but predate the contrast/typecheck fixes above — see
`mobile/README.md`'s "Accessibility Addons" section for that changelog.

The contrast fixes were verified against the existing 279-test regression suite, which
passed with unchanged coverage before and after. The touch-target and Reduce Motion
fixes now have their own tests (`accessibility_motion_targets.test.tsx`, 7 tests), which
brings the suite to 286 Jest tests with `npm run typecheck` and `npm run lint` both
clean. See `docs/testing/coverage-summary.md` for the coverage breakdown.
