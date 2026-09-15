# Framework Comparison: Flutter vs. React Native

SWEN 661 Team 2 (The Acuity Health Group) — Victor Lee, Rehman Uddin, Justin Zhang

Both clients implement the same ten CareConnect screens — Contacts, Messaging,
Accessibility Settings, Welcome, Sign In, Sign Up, Home, My Day, Appointments,
Medicines, and Memories — plus the same tablet-breakpoint left-sidebar
navigation. Appointments, Medicines and Memories were the last screens
finished on the React Native side: Rehman scaffolded them separately as a
standalone Expo prototype, and they were ported into the shared app and
rebuilt against its Context/repository pattern once that branch merged.

## 1. Development Experience

Flutter was easier to learn. Dart's single widget-tree model and hot reload
meant there was only one way to build a screen, while React Native assumes
you already know React (hooks, JSX, state vs. props) before its mobile-specific
pieces make sense — a real cost for anyone new to React, though it made the
team, who already write JavaScript daily, more *productive* once past that hill.

Flutter also had the better documentation: a single cohesive source
(api.flutter.dev plus the widget catalog) versus React Native's docs, which
route everyday questions — navigation, forms, testing — to separate projects
(React Navigation, RNTL, Expo) with their own version quirks; we hit this
directly when `npx expo install` couldn't resolve on a restricted network and
we had to pin versions by hand.

Hot reload was a virtual tie, both sub-second on a running simulator.
Debugging favored Flutter: DevTools' widget inspector shows the render tree
directly, where React Native's Chrome/Flipper debugging felt one layer more
indirect, and a bad style value more often failed silently instead of throwing.

## 2. Performance Observations

Neither felt faster or smoother in practice — both compile to native views,
and our list-heavy screens (Contacts, Messaging) use small mocked data sets,
so no perceptible difference showed up on a modern device. The one performance
issue we noted was about *predictability*, not speed: Flutter's
`ChangeNotifier` controllers scope rebuilds to `context.watch()` callers,
while our Context-based providers re-render every consumer on any state
change unless memoized. We never saw a dropped frame, but it's the more
likely spot a larger React Native app would need optimization first.

## 3. Accessibility Implementation

Flutter made accessibility easier to implement. Its `Semantics`/
`ExcludeSemantics` widgets are explicit and composable — a decorative icon is
silenced by wrapping it once, and the spoken label is asserted directly in
`flutter_test`. React Native's accessibility props
(`accessibilityLabel`, `accessibilityElementsHidden`,
`importantForAccessibility`) reach the same result but are looser: plain props
on any component rather than a distinct semantics layer, so it's easy to
forget one with no compile-time or lint warning. Both frameworks handled the
project's hard constraint — forcing `visualAlertBanners` to always be `true` —
equally well, since that logic lives in a shared pure function
(`meetsHearingConstraints`), not the UI layer, in both codebases.

## 4. Code Complexity

For the same feature, React Native generally took less code. The Flutter
`SettingsScreen` runs ~450 lines against React Native's ~290, mostly because
Dart's widget composition is more verbose per node, where JSX plus
`StyleSheet.create` collapses layout and style into fewer expressions. The
tablet sidebar made this sharper still: React Navigation exposes
`tabBarPosition: 'left'` as a one-line screen option, while Flutter has no
built-in concept of a tab bar doubling as a rail, so the whole switch is
hand-built in a single `AppShell` widget.

Maintainability felt roughly equivalent — TypeScript's structural types
caught prop-shape mistakes during the port that Dart's nominal types would
also catch, and React Native's provider/hook split mirrors Flutter's
controller/model split closely. Both suites clear the assignment's 60% floor
comfortably (Flutter: 220 tests, 98.8% coverage; React Native: 274 tests,
96.5%).

## 5. Recommendation

For a real project, we'd choose **React Native**, primarily because the
team's existing web/JavaScript skills transfer directly and the hiring pool
for React is larger than for Dart. The tablet-sidebar work is a good data
point for that choice: React Navigation handed us the layout switch as a
configuration option where Flutter asked us to hand-build it, and that kind
of ecosystem leverage compounds as an app grows.

Flutter remains the better fit for a team starting from scratch with no JS
background, or a project prioritizing pixel-perfect custom UI over ecosystem
breadth. For an accessibility-first app like CareConnect specifically,
Flutter's `Semantics` API is the more rigorous tool, but React Native's props
were sufficient once we adopted the discipline of hiding decorative elements
and testing against `accessibilityLabel` explicitly.
