# CareConnect Web Accessibility Conformance Report

**WCAG 2.1 Edition (based on VPAT® Version 2.5Rev)**

| | |
|:--|:--|
| **Name of product / version** | CareConnect web app (React 18, Vite, React Router 7, Tailwind) — `main` at `f77fc2e`, deployed on Vercel |
| **Report date** | November 3, 2026 |
| **Prepared by** | SWEN 661 Team 2 — The Acuity Health Group (Upneet Bir, Victor Lee, Justin Zhang) |
| **Contact** | GitHub repository: <https://github.com/viclee1/careconnect-swen661> (repository root) |

## Product description

CareConnect is a medical companion for care recipients living with short-term
memory loss and for the caregivers who manage their medicines and appointments,
extended in this project for users who are deaf or hard of hearing. The web
client is a responsive single-page app with three breakpoints — mobile
320–767px, tablet 768–1023px, desktop 1024px and up — and can be installed as a
progressive web app.

Its governing rule is that anything communicated through sound is also
communicated visually or in text: there is no `tel:` link anywhere, alerts are
silent banners and flashes that always carry words, and spoken reminders and
video messages are captioned in the size and colour chosen in Accessibility
Settings.

**Pages covered (17 routes):** Landing, Sign in, Sign up, Role chooser; care
recipient — Home, My Day, Medicines, Appointments, Memories, Contacts,
Conversation, Accessibility Settings; caregiver — Dashboard, Manage
medications, Manage appointments, Activity, Notes. Also the interactive states
of the app shell: the Menu drawer, header search, account menu, keyboard
shortcuts dialog and confirm dialog.

## Notes

This report covers the web client only. The desktop client has its own report
([`docs/accessibility/vpat/`](../../accessibility/vpat/)), as do the Flutter
([`flutter/docs/VPAT-WCAG2.1-AA.md`](../../../flutter/docs/VPAT-WCAG2.1-AA.md))
and React Native
([`mobile/docs/VPAT-WCAG2.1-AA.md`](../../../mobile/docs/VPAT-WCAG2.1-AA.md))
clients. Defects found during evaluation and fixed before the report date are
listed in the [accessibility documentation, §8](README.md#8-verification-and-results);
open gaps are in [§9](README.md#9-known-gaps-and-next-steps). The video
messages and the incoming video call are simulations — they draw a frame and
step through caption text but carry no real audio or video track — which is
why the media criteria under 1.2 are Not Applicable.

## Evaluation methods used

- **Automated testing:** axe-core 4.14 in Chromium (`npm run a11y:web`,
  `scripts/web-a11y-audit.mjs`), rule sets `wcag2a`, `wcag2aa`, `wcag21a`,
  `wcag21aa` and `best-practice` plus the label-in-name rule, over all 17
  routes and the shell's interactive states at 375px, 820px and 1280px, and
  every route again with high contrast on and the AAA rules added —
  **115 scans, 0 violations** (29 October 2026; 71 violations before fixes).
  Results: [`audit/report.html`](audit/report.html),
  [`audit/summary.json`](audit/summary.json).
- **Lighthouse** 13.6 accessibility category against the production build:
  **100 on all 17 routes, mobile and desktop** (34/34 runs) —
  [`lighthouse/summary.md`](lighthouse/summary.md).
- **Keyboard and structure checks:** 104 scripted checks with no mouse input
  in the same audit — first Tab is the skip link and Enter moves focus to
  `<main>` on every shell; one `main`, one `banner` and one `h1` per page;
  focus trapped in and returned from every dialog and the Menu drawer;
  Ctrl/⌘+K focuses search; route changes move focus and update the title;
  **no horizontal scroll at 320px on every route**. 104/104 pass.
- **Structure report:** landmarks, heading outline, links and form fields of
  every page at every breakpoint, generated from the running app
  (`npm run a11y:structure`) — [`structure.md`](structure.md).
- **Unit and end-to-end tests:** 77 accessibility tests in
  `src/accessibility.test.tsx` (React Testing Library role/name queries, skip
  link on 9 routes, dialog focus, labels, live regions); `e2e/high-contrast.spec.ts`
  checks AA and AAA contrast with high contrast on, in Chromium, Firefox,
  WebKit and mobile Safari.
- **Source-code review** of every page and shared component against each
  criterion below.
- **Not performed:** a manual screen-reader pass (VoiceOver, NVDA) and a
  manual text-spacing / 200% text-only zoom pass. The rows that rely on those
  say so.

## Applicable standards / guidelines

| Standard / guideline | Included in report |
|:--|:--|
| Web Content Accessibility Guidelines 2.1 | Level A (Yes) · Level AA (Yes) · Level AAA (No — four AAA criteria met are listed in [§10 of the accessibility documentation](README.md#10-beyond-aa--wcag-21-aaa)) |

## Terms

- **Supports:** the functionality of the product has at least one method that
  meets the criterion without known defects or meets with equivalent
  facilitation.
- **Partially Supports:** some functionality of the product does not meet the
  criterion.
- **Does Not Support:** the majority of product functionality does not meet
  the criterion.
- **Not Applicable:** the criterion is not relevant to the product.

## WCAG 2.1 Report

**Summary of results**

- **Level A:** 30 criteria — 24 Supports, 6 Not Applicable.
- **Level AA:** 20 criteria — 17 Supports, 1 Partially Supports, 2 Not Applicable.
- Automated: 0 axe-core violations in 115 scans; Lighthouse 100 on 34/34 runs;
  104/104 keyboard and structure checks.

### Table 1: Success Criteria, Level A

| Criteria | Conformance Level | Remarks and Explanations |
|:--|:--|:--|
| 1.1.1 Non-text Content (Level A) | Supports | Every icon beside text is `aria-hidden="true"`; icon-only controls are named ("Menu", "Close menu", "High contrast", "Keyboard shortcuts", "Close dialog", "Dismiss install prompt"). Memory photos carry `alt` text from the memory, or `alt=""` when the caption beside them already says it (`MemoryCard.tsx`). The "[CC]" marker on caption strips is hidden and replaced by "Caption:" for screen readers. axe `image-alt`, `button-name`, `svg-img-alt` pass on every scan. |
| 1.2.1 Audio-only and Video-only (Prerecorded) (Level A) | Not Applicable | The app contains no prerecorded audio or video. Video messages (`CaptionedVideo.tsx`) are simulated frames with no media track. |
| 1.2.2 Captions (Prerecorded) (Level A) | Not Applicable | No prerecorded video. The simulated video messages nevertheless show their words as captions while "playing", in the caption size and colour from Accessibility Settings, and print the full text under the frame. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A) | Not Applicable | No prerecorded video. Each video message's full text is printed in the conversation, so nothing depends on watching it. |
| 1.3.1 Info and Relationships (Level A) | Supports | Native landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page with `h2`/`h3` and no skipped levels, `<section>`s named by their heading, lists with `role="list"`, `<label for>` on every field, `<fieldset>`/`<legend>` for grouped fields ("Schedule times", "Priority"), `<time datetime>` for dates. Verified per page and breakpoint in [`structure.md`](structure.md). Fixed in evaluation: appointment date groups were styled `<span>`s and are now `<h2>`s. |
| 1.3.2 Meaningful Sequence (Level A) | Supports | Source order is skip link → header → main → navigation → footer at every width; CSS `order` places the sidebar visually on the left from 1024px without changing reading order. |
| 1.3.3 Sensory Characteristics (Level A) | Supports | No instruction refers to shape, position, colour or sound alone; statuses are written as words ("Done", "Now", "Coming up"). |
| 1.4.1 Use of Color (Level A) | Supports | Status carries an icon and a word; field errors carry an icon, a 2px border and text; the current page is marked with `aria-current="page"`, a bar and weight as well as colour; the connection state in the status bar is written beside its dot. axe `link-in-text-block` passes. |
| 1.4.2 Audio Control (Level A) | Not Applicable | The app plays no audio. Alerts are visual; the only non-visual cue is an optional device vibration (`navigator.vibrate`), which Accessibility Settings can turn off. |
| 2.1.1 Keyboard (Level A) | Supports | All interaction uses native buttons, links, inputs and selects; custom widgets (search combobox, Quick replies menu, account menu, dialogs, Menu drawer) follow their WAI-ARIA keyboard patterns. 104 keyboard checks pass with no mouse input. |
| 2.1.2 No Keyboard Trap (Level A) | Supports | The confirm dialog, Menu drawer, shortcuts dialog and incoming-call dialog trap focus by design and close with Escape or their Close/Cancel button, returning focus to the control that opened them — checked by the audit for each. The account menu and Quick replies close with Escape or a click outside. |
| 2.1.4 Character Key Shortcuts (Level A) | Supports | App-wide shortcuts use Ctrl/⌘. The one single-key shortcut, "/" to jump to "Find a contact", works only while focus is in the contact list and never while typing in a field. Fixed in evaluation: it was page-wide, and a "?" shortcut for the shortcuts dialog was removed. |
| 2.2.1 Timing Adjustable (Level A) | Not Applicable | No time limits: no session timeout, timed form or auto-advancing content. Simulated video-message captions step every 2.5 s only after the user presses Play, can be stopped, and the full text is printed below. |
| 2.2.2 Pause, Stop, Hide (Level A) | Supports | The appointment reminder banner repeats until paused (`aria-pressed` Pause) or dismissed with OK. The screen flash is a single 1.6 s fade. The caregiver dashboard re-reads its data every 30 s, which changes values in place rather than moving content. Under `prefers-reduced-motion` the global stylesheet removes all non-essential animation, including the incoming-call avatar's slow `animate-pulse` glow, which otherwise runs until the call is answered or declined. |
| 2.3.1 Three Flashes or Below Threshold (Level A) | Supports | The screen flash is at most two pulses in 1.6 s (`VisualFlash.tsx`). The vibration-pattern preview draws each rhythm as bars that fill in sequence and stay filled, so nothing blinks; AAA 2.3.2 is met as well ([§10](README.md#10-beyond-aa--wcag-21-aaa)). |
| 2.4.1 Bypass Blocks (Level A) | Supports | "Skip to main content" is the first focusable element on every shell (Landing, Sign in, Sign up, Role chooser as "Skip to role selection", both app shells), visible on focus, and moves focus to `<main tabindex="-1">`; named landmarks on every page. Fixed in evaluation: Sign in and Sign up had no skip link, and two components stole focus ahead of it on load. |
| 2.4.2 Page Titled (Level A) | Supports | Every page sets its own title through `useDocumentTitle` ("Medicines — CareConnect", "Dashboard — CareConnect"). Fixed in evaluation: every page shared one title. |
| 2.4.3 Focus Order (Level A) | Supports | Focus follows source order; route changes move focus to `<main>` (not on first load, so the skip link stays first); dialogs move focus in on open and back to their trigger on close. Fixed in evaluation: the confirm dialog focused every page's first Delete button on load. |
| 2.4.4 Link Purpose (In Context) (Level A) | Supports | Links say where they go out of context ("See full day schedule", "Manage appointments"); the dashboard's "View all" is named "View all activity". No "click here" or "read more". |
| 2.5.1 Pointer Gestures (Level A) | Supports | No multipoint or path-based gestures. The volume and balance sliders in the simulated call are native range inputs, operable with a single pointer or the arrow keys. |
| 2.5.2 Pointer Cancellation (Level A) | Supports | Controls activate on click (pointer up) through native elements. The `pointerdown` listeners on the account menu and Quick replies only close those menus on an outside press; they never activate anything. |
| 2.5.3 Label in Name (Level A) | Supports | Every control's accessible name starts with its visible words ("Call my caregiver, Joyce — 07700 900 456", "Add to My Day: Blood test"); the account menu takes its name from its content. axe `label-content-name-mismatch` passes everywhere. Fixed in evaluation: 18 controls broke this. |
| 2.5.4 Motion Actuation (Level A) | Not Applicable | No function is triggered by device motion. |
| 3.1.1 Language of Page (Level A) | Supports | `<html lang="en">` (`index.html`). |
| 3.2.1 On Focus (Level A) | Supports | Focus never changes context. Focusing the header search opens its result list in place, which is not a change of context. |
| 3.2.2 On Input (Level A) | Supports | Settings switches and selects apply their value in place without navigating or moving focus; forms submit only on their submit button or Enter. |
| 3.3.1 Error Identification (Level A) | Supports | Validation runs on submit (`noValidate`); each field in error gets `aria-invalid="true"`, a border and an inline message tied by `aria-describedby`, and the form shows a `role="alert"` summary. |
| 3.3.2 Labels or Instructions (Level A) | Supports | Every field has a visible `<label>`, never a placeholder alone; required fields show `*` (hidden from AT) plus screen-reader-only "(required)" and `aria-required`; hints sit under the field and are linked with `aria-describedby`. Fixed in evaluation: "(required)" was read twice on the caregiver forms. |
| 4.1.1 Parsing (Level A) | Supports | Markup is generated by React; axe's duplicate-ID and ARIA-validity rules pass on every scan. (Per the WCAG 2.1 errata this criterion is always satisfied for HTML.) |
| 4.1.2 Name, Role, Value (Level A) | Supports | Native elements throughout; custom widgets expose ARIA 1.2 roles and states (`combobox` with `aria-expanded`/`aria-activedescendant`, `aria-pressed` toggles, `role="switch"` in Settings, `aria-expanded`/`aria-controls` disclosures, `role="progressbar"` with values). Fixed in evaluation: an `aria-label` on a plain `<span>`, which assistive technology ignores, moved to `.sr-only` text. Known gap: the done toggles change their label with their state as well as setting `aria-pressed`, which reads as two state signals ([§9](README.md#9-known-gaps-and-next-steps)); the state is still exposed correctly. |

### Table 2: Success Criteria, Level AA

| Criteria | Conformance Level | Remarks and Explanations |
|:--|:--|:--|
| 1.2.4 Captions (Live) (Level AA) | Not Applicable | No live audio or video. The incoming video call on Home is a simulation; it still shows captions when CC is on, from the same setting as the rest of the app. |
| 1.2.5 Audio Description (Prerecorded) (Level AA) | Not Applicable | No prerecorded video. |
| 1.3.4 Orientation (Level AA) | Partially Supports | In the browser, no page restricts orientation; every route reflows at 320px. **When installed as a PWA, the manifest sets `"orientation": "portrait-primary"`** (`public/manifest.webmanifest`), which locks the installed app to portrait on phones and tablets that honour it. Remove the `orientation` member to conform. |
| 1.3.5 Identify Input Purpose (Level AA) | Supports | `autocomplete` on every field that collects user information: `name`, `email`, `current-password` (sign in), `new-password` (sign up). |
| 1.4.3 Contrast (Minimum) (Level AA) | Supports | Text is at least 4.5:1 (large text 3:1) in the default and high-contrast themes; axe `color-contrast` passes on all 115 scans. Fixed in evaluation: 153 elements failed before, mostly `neutral-400` body text and faded done items; and in high-contrast mode, button and filter text that a stylesheet override had darkened onto dark fills. |
| 1.4.4 Resize Text (Level AA) | Supports | Type is set in `rem` and layouts reflow (see 1.4.10), so browser zoom to 200% loses no content or function. Verified through the 320px reflow check (equivalent to 400% zoom of a 1280px window); a text-only zoom pass was not performed separately. |
| 1.4.5 Images of Text (Level AA) | Supports | No images of text; the logo wordmark is live text. |
| 1.4.10 Reflow (Level AA) | Supports | No horizontal scroll at 320px on all 17 routes (audit check). Below 768px pages are a single column; Medicines and Appointments show list then detail. |
| 1.4.11 Non-text Contrast (Level AA) | Supports | Focus ring `#146488` at 6.5:1 on white; field borders, switches and the done-toggle circle (raised from 1.65:1 to 5.5:1 during evaluation) meet 3:1. |
| 1.4.12 Text Spacing (Level AA) | Supports | Controls use minimum heights (`min-h-[2.75rem]`) rather than fixed ones and type is in `rem`, so the WCAG spacing overrides should not clip text. Rated from code review only; not yet checked with the text-spacing overrides applied (see Known limitations). |
| 1.4.13 Content on Hover or Focus (Level AA) | Supports | No tooltips or hover-only content. The search result list, shown on focus, stays until the user leaves it and is dismissed with Escape without moving focus. |
| 2.4.5 Multiple Ways (Level AA) | Supports | Main navigation on every app page, plus the header search (Ctrl/⌘+K), which finds every page by name and, for the care recipient, their medicines, appointments and contacts; the alerts list links straight to its items. |
| 2.4.6 Headings and Labels (Level AA) | Supports | Headings say what the page or section is ("Here's your day, Margaret", "My Appointments", "Dashboard"); labels name their field. Fixed in evaluation: the caregiver home was announced as "Current screen: Home". |
| 2.4.7 Focus Visible (Level AA) | Supports | One app-wide `:focus-visible` ring, 3px solid with a 3px offset, never removed; checked at every stop by the keyboard audit. |
| 3.1.2 Language of Parts (Level AA) | Supports | All content is in English; there are no passages in another language. |
| 3.2.3 Consistent Navigation (Level AA) | Supports | The header, navigation and status bar are one shared shell (`Layout.tsx`) in the same order on every page of each role. |
| 3.2.4 Consistent Identification (Level AA) | Supports | Shared components keep one name per function across pages (e.g. CC, High contrast, Menu, the Delete → "Yes, delete" confirmation). |
| 3.3.3 Error Suggestion (Level AA) | Supports | Messages say how to fix the problem ("Please enter a valid email address.", "At least one scheduled time is required."); entered values are kept. |
| 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA) | Supports | No legal or financial transactions. Every destructive action on the caregiver's data (delete a medication or appointment) asks for confirmation in a modal dialog whose safe default is Cancel; done toggles are reversible. |
| 4.1.3 Status Messages (Level AA) | Supports | Confirmations use `role="status"` / `aria-live="polite"`; blocking errors and the form summary use `role="alert"`; new caregiver alerts, the search match count, "N medicines still to take" and the install banner are live regions that never take focus. Known gap: each field error is also `role="alert"`, so a form with several errors is announced more than once ([§9](README.md#9-known-gaps-and-next-steps)). |

## Known limitations

1. **Installed-PWA orientation lock (1.3.4).** `public/manifest.webmanifest`
   sets `"orientation": "portrait-primary"`. This is the one criterion not
   fully supported. Fix: remove the member.
2. **No manual screen-reader pass.** Screen-reader behaviour is evidenced by
   the accessibility tree (axe, Lighthouse, `structure.md`) and RTL role/name
   tests, not by a VoiceOver or NVDA session. Planned before the next
   submission ([§9](README.md#9-known-gaps-and-next-steps)).
3. **1.4.4 and 1.4.12 by reflow check and code review.** Neither text-only
   zoom nor the WCAG text-spacing overrides have been run as a script; the
   desktop client's `a11y-keyboard.mjs` checks for both could be ported to
   `scripts/web-a11y-audit.mjs`.
4. **Screen-reader polish (4.1.2, 4.1.3) — resolved.** Toggles carry their
   state once (in `aria-pressed`, or in a name that says what they do next,
   never both); field errors are no longer separate alerts, so a form's
   summary is announced once; the page behind a modal dialog, drawer or
   shortcuts card is `inert` (issues #37–#39).
