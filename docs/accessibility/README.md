# Desktop accessibility testing report — Assignment 9

SWEN 661 Team 2 (The Acuity Health Group) — CareConnect desktop client (Electron),
tested against **WCAG 2.1 Level AA**. October 7, 2026.

| Deliverable | Where |
|:--|:--|
| Accessibility testing report | this file |
| Conformance documentation (WCAG 2.1 A + AA, criterion by criterion) | [`conformance.md`](conformance.md) |
| Desktop VPAT (Word and PDF) | [`vpat/CareConnect-Desktop-VPAT.docx`](vpat/CareConnect-Desktop-VPAT.docx), [`vpat/CareConnect-Desktop-VPAT.pdf`](vpat/CareConnect-Desktop-VPAT.pdf) |
| axe results — zero violations | [`axe/axe-zero-violations.png`](axe/axe-zero-violations.png), [`axe/report.html`](axe/report.html), one JSON per scan in [`axe/`](axe) |
| axe results — before the fixes | [`axe-before/`](axe-before) (`axe-before-fixes.png`, `console.txt`) |
| Keyboard navigation evidence | [`keyboard/results.md`](keyboard/results.md) and the `keyboard/focus-*.png` screenshots |
| Testing checklist (completed) | [`testing-checklist.md`](testing-checklist.md) |
| Screen-reader testing notes | [`screen-reader/notes.md`](screen-reader/notes.md), accessibility tree per screen in [`screen-reader/accessibility-tree/`](screen-reader/accessibility-tree) |
| Issues fixed and how | [Issues found and fixed](#issues-found-and-fixed) below |
| Updated coverage report | [`../screenshots/desktop/coverage.png`](../screenshots/desktop/coverage.png); HTML report from `npm run test:coverage` |

---

## Summary

| | Before | After |
|:--|:--|:--|
| axe-core violations, default rule sets (28 scans) | 31 | **0** |
| axe-core violations, with the label-in-name rule | 55 | **0** |
| "Needs review" contrast results measured by hand | — | 149, all pass |
| Contrast with the pointer over every control | — | **0 failures** |
| axe DevTools extension (user-flow scan, 9 Oct) | 21 issues on the pre-fix build | all 21 resolved — see below |
| Scripted keyboard-only checks | — | **73 / 73 pass** |
| Distinct accessibility defects fixed | | **16** |
| Jest tests | 471 in 38 suites | **498 in 39 suites** |
| Statement coverage | 96.7% | **96.8%** (60% required) |
| WCAG 2.1 A (30 criteria) | | 26 Supports, 4 Not Applicable |
| WCAG 2.1 AA (20 criteria) | | 16 Supports, 1 Partially Supports, 3 Not Applicable |

The one *Partially Supports* is 2.4.6 Headings and Labels: two prototype placeholders
(the "3 alerts" entries open Settings, and the Home toolbar search does not search yet).
Both are listed with workarounds in the VPAT.

---

## How to run the tests

From `desktop/`:

```bash
npm install
npx playwright install chromium     # once — the browser the audit scripts drive

npm run dev:renderer                # terminal 1: the React renderer on http://localhost:5273
npm run a11y:audit                  # terminal 2: axe-core over every screen → docs/accessibility/axe/
npm run a11y:keyboard               # terminal 2: keyboard-only checks + a11y trees → docs/accessibility/keyboard/

npm test                            # includes src/renderer/__tests__/accessibility.test.tsx (jest-axe)
npm run test:coverage               # coverage report in coverage/lcov-report/index.html
```

Both audit scripts exit non-zero on any failure, so they can gate CI. Set
`A11Y_CHANNEL=chrome` to drive an installed Google Chrome instead of Playwright's
Chromium.

**axe DevTools extension.** The scripts run axe-core, the engine inside the axe
DevTools Chrome extension, with the same WCAG 2.0/2.1 A/AA tags. To reproduce a
scan in the extension itself: `npm run dev:renderer`, open
<http://localhost:5273> in Chrome, open DevTools → **axe DevTools** → *Scan all of
my page*, and repeat on each page (sign in with any well-formed email; `Ctrl/Cmd + 1`–`6`
and `Ctrl/Cmd + ,` move between pages).

---

## 1. Automated testing (axe-core)

**Tool.** axe-core 4.14 through `@axe-core/playwright`, in Chromium, against the
renderer served by Vite. Rule tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
`best-practice`, plus `label-content-name-mismatch` (WCAG 2.5.3), which axe ships
switched off as experimental and which found seven real defects here.

**Coverage.** 14 screens and states — Splash, Sign In with validation errors, Sign
Up, Home, My Day, Appointments, Appointments after Export, Medicines, Memories,
Contacts, Message thread, Message thread after Notify, Accessibility Settings, and
the Keyboard Shortcuts dialog — each at 1280×860 and at 900×700 (below the 960px
breakpoint where the sidebar collapses to icons). Every screen is reached with the
keyboard, so the scan also exercises keyboard navigation.

**Before.** 31 violations across four rules with the default rule sets
([`axe-before/console.txt`](axe-before/console.txt)):

| Rule | Impact | Where |
|:--|:--|:--|
| `button-name` | critical | All 8 sidebar buttons, on every signed-in page at 900px |
| `color-contrast` | serious | Sidebar "3 alerts" label; Medication badge on Home; completed My Day tasks |
| `scrollable-region-focusable` | serious | Conversation history; Keyboard Shortcuts dialog body |
| `landmark-contentinfo-is-top-level` | moderate | Status bar on Home and My Day |

Turning on the label-in-name rule added 24 more: Settings sidebar item, status-bar
shortcut button, Notify, contact rows, vibration-pattern rows, My Day tasks and the
appointment OK button.

**After.** 0 violations in all 28 scans
([`axe/axe-zero-violations.png`](axe/axe-zero-violations.png)).

**Needs review.** axe marks contrast "needs review" when it cannot sample the
background, here because text sits under the status bar or a scroll edge. The
script measures each of those against the nearest opaque background in its own
ancestry with the WCAG luminance formula: 149 measurements, lowest 4.37:1 for the
decorative ✓ (3:1 required), lowest real text 5.61:1. The table is at the bottom
of the report screenshot.

**Hover states.** axe sees the page at rest. After the axe DevTools run below
caught a contrast failure that only exists with the pointer over a control, the
audit gained a hover sweep: on every screen it hovers each button, link, radio and
checkbox row, waits for the hover style to land, and measures the text inside it
(translucent hover fills are blended over what is beneath). 0 failures after the
fixes; with the old CSS restored it reports the two defects in #16.

**axe DevTools extension.** The team ran the axe DevTools browser extension
(4.138, axe-core 4.13, WCAG 2.1 AA) as a user flow on 9 October; the export is
[`axe-devtools/axe-devtools-2026-10-09-old-code.json`](axe-devtools/axe-devtools-2026-10-09-old-code.json).
That run was against the dev server in the main checkout, which did not yet have
these fixes, so it found 21 issues:

| Rule | Count | Status |
|:--|--:|:--|
| `button-name` — narrow-window sidebar buttons | 17 | Already fixed (#1) |
| `color-contrast` — Medication badge | 1 | Already fixed (#2) |
| `scrollable-region-focusable` — conversation history, shortcut card | 2 | Already fixed (#4) |
| `color-contrast` — selected "Yellow" caption colour, under the pointer | 1 | **New — fixed (#16)** |

The last one was missed by every scan above, because none of them moved the
pointer. A re-scan with the extension against the fixed build
(`npm run dev:renderer` from this branch) should report 0.

**In the unit suite.** `src/renderer/__tests__/accessibility.test.tsx` runs jest-axe
on all 11 pages of the real application shell, the open dialog and the sign-in error
state, so `npm test` fails on a regression in names, roles, landmarks or ARIA.
(Contrast is left to the browser run: jsdom does no layout.) It also holds one
regression test per fix below.

---

## 2. Keyboard-only testing

`npm run a11y:keyboard` uses the keyboard only — no mouse event is sent — and writes
[`keyboard/results.md`](keyboard/results.md). Result: **73 of 73 checks pass.**

| Area | What was checked |
|:--|:--|
| Tab / Shift+Tab | Every screen swept from the top until focus wraps; the stops reached equal the tabbable elements on the page, so nothing is unreachable and nothing traps. Per-screen tab order is listed in the results. |
| Focus visible | At every one of the 167 stops a focus indicator is actually drawn (outline, or the ring on the switch track / medicine row). |
| Skip link | First Tab on launch; Enter moves focus to `<main>`. |
| Shortcuts | `Ctrl/Cmd + 1`–`6`, `Ctrl/Cmd + ,`, Back (`Alt+←` / `Cmd+[`), `Ctrl/Cmd + F`, `Ctrl/Cmd + Enter`, `Ctrl/Cmd + Shift + N`, `Ctrl/Cmd + /`. |
| Arrow keys | Sidebar ↑/↓ with wrap; slider →/Home/End; radio group →; conversation history scroll. |
| Enter / Space | Contact rows, Export to calendar, settings switch, medicine checkbox, My Day task. |
| Escape | Leaves a conversation; closes the shortcut dialog and returns focus to the control that opened it. |
| Focus management | Shortcut dialog traps Tab and Shift+Tab; dismissing the export banner returns focus to the button. |
| Zoom / reflow | Every page at 200% (640px) and 400% (320px) with no horizontal page scroll. |
| Text spacing | WCAG 1.4.12 overrides on every page with no clipped text. |

Screenshots of the focus indicator: skip link, sign-in errors, sidebar on dark,
contact row, Notify, switch, slider, medicine row, dialog, plus 200%, 400% and
text-spacing views — all in [`keyboard/`](keyboard).

The native menu bar (`Alt`/`F10`, mnemonics) and Electron's zoom roles are outside
the renderer, so they are covered by the main-process tests (`src/main/__tests__/menu.test.ts`)
and by the manual pass in the [testing checklist](testing-checklist.md).

---

## 3. Screen-reader testing

See [`screen-reader/notes.md`](screen-reader/notes.md). The accessibility tree
Chromium hands to VoiceOver and NVDA is saved for every screen in
[`screen-reader/accessibility-tree/`](screen-reader/accessibility-tree); reading it
is how the label, landmark and state problems below were found (for example the
helpline row announced "No messages yet , urgent care service", and the contrast
toggle announced no state). The notes give the expected announcement for each
step, the VoiceOver/NVDA commands, and the 3–5 minute video script.

---

## Issues found and fixed

| # | Issue | WCAG 2.1 | Found by | Fix |
|--:|:--|:--|:--|:--|
| 1 | Below a 960px window the sidebar's eight buttons had **no accessible name**: the labels were `display: none`. The README claimed the opposite. | 4.1.2 | axe `button-name` | Labels are visually hidden instead (clip pattern), so they stay the buttons' names. Brand, badge and greeting, which were clipped mid-word in the narrow column, are hidden the same way. |
| 2 | **Text contrast**: sidebar "3 alerts" `#f59f00` on `#0f5272` = 3.98:1; Medication badge `#f59f00` on `#fff9db` = 2.01:1; completed My Day tasks faded with `opacity: 0.85`. | 1.4.3 | axe `color-contrast` | `#ffd43b` (5.96:1; later `#ffec99`, 7.17:1, see #16); `--warning-text` (9.75:1); opacity removed — strike-through and the tick already mark "done". |
| 3 | The status bar `<footer role="contentinfo">` was **inside `<main>`** on Home and My Day, and missing on every other signed-in page. | 1.3.1, 3.2.3 | axe `landmark-contentinfo-is-top-level` | The shell renders the status bar once, beside `<main>`, for every signed-in page. |
| 4 | The **conversation history** and the **shortcut card** scroll, but could not be focused, so a keyboard user could not scroll them. | 2.1.1 | axe `scrollable-region-focusable` | `tabIndex={0}`, `role="region"` and a name ("Conversation with Joyce", "Shortcut list"); the dialog's focus trap includes the new stop. |
| 5 | **Label in Name** — the spoken name did not contain the visible text on seven controls: Settings sidebar item (named "Accessibility"), status-bar button ("Press Ctrl/ for shortcuts" read as "Open keyboard shortcuts guide"), Notify, contact rows, vibration-pattern rows, My Day tasks, appointment "OK". Voice-control users could not say what they saw. | 2.5.3 | axe `label-content-name-mismatch` | `aria-label`s removed so each name is built from the visible text, in order; extra facts not printed on screen ("Urgent care service", the pattern's action) appended after it or moved to `aria-describedby`. |
| 6 | **My Day tasks** were `<div role="button">` with hand-written key handling and an `aria-label` that differed from the card. | 4.1.2, 2.5.3 | Code review | Native `<button aria-pressed>`; inner `div`/`p` changed to `span` (valid inside a button). |
| 7 | The **toolbar search** on Home and My Day had `outline: none` and no replacement — no focus indicator — and its placeholder promised `Ctrl+F`, which does nothing there. | 2.4.7 | Keyboard script | Ring drawn round the whole box with `:focus-within`; placeholder says "Search". |
| 8 | The toolbar **contrast toggle** flipped a CSS class nothing used, and exposed no on/off state. | 4.1.2 | Accessibility tree | `body.high-contrast` applies the increased-contrast palette; the button has `aria-pressed`. |
| 9 | **Reflow**: at 400% zoom (320px) Splash, Home/My Day, every page's status bar, and Settings scrolled sideways. | 1.4.10 | Keyboard script | The bars wrap; long page titles and vibration-pattern text wrap. |
| 10 | **Sign In / Sign Up errors** were printed under each field but not tied to it; a screen-reader user heard "Please correct the errors below" and nothing about which field. | 1.3.1, 3.3.1 | Code review | `aria-invalid` and `aria-describedby` on each field; focus moves to the first field to fix. |
| 11 | **Control borders** — text fields, composer, toolbar search and the empty check circle used `#c7dce6`, 1.42:1 against white. | 1.4.11 | Manual contrast check | New `--control-border` `#5f8599` (3.96:1 on white, 3.61:1 on the lightest fill); `--border` stays for dividers. |
| 12 | The **window title** was "CareConnect" on every page except Settings. | 2.4.2 | Code review | The shell sets "<Page> — CareConnect" on every route, "Conversation with <name> — CareConnect" in a thread. |
| 13 | The shortcut card's **backdrop closed it on mouse-down**, so a press could not be abandoned and a text selection dragged out of the card closed it. | 2.5.2 | Code review | Closes on click, and only when press and release are both on the backdrop. |
| 14 | A `<div>` inside the Home "Video preview" `<button>` (invalid nesting). | 4.1.1 | Accessibility tree | Changed to `<span>`. |
| 15 | The status-bar shortcut hint said `Ctrl` on macOS. | 3.3.2 | Accessibility tree | Uses the platform key ("Keyboard shortcuts: Cmd + Slash"). |
| 16 | **Hover contrast.** Hovering the *selected* option of a segmented choice (caption size, caption colour) replaced its dark fill with the pale hover fill under white text — 1.09:1. Hovering the sidebar's "3 alerts" took its yellow to 4.17:1 over the hover tint. | 1.4.3 | axe DevTools extension; then the new hover sweep | The hover fill applies only to unselected options; the alerts yellow is `#ffec99` (7.17:1 at rest, 5.01:1 hovered). |

Each fix has a regression test in `src/renderer/__tests__/accessibility.test.tsx`
or the page's own test file, except the CSS-only fixes (2, 9, 11), which are
enforced by `a11y:audit` and `a11y:keyboard`.

---

## Coverage

`npm run test:coverage` — **498 tests in 39 suites, all passing**.

| Statements | Branches | Functions | Lines |
|--:|--:|--:|--:|
| 96.79% | 89.96% | 95.69% | 98.09% |

`src/renderer/__tests__/accessibility.test.tsx` adds 30 accessibility-focused
tests: 13 jest-axe scans (11 pages, the dialog, the sign-in error state) and 17
regression tests for the fixes above. Three tests of a helper the fixes made
obsolete (`contactSemanticLabel`) were removed, so the suite grew by 27.
Screenshot: [`../screenshots/desktop/coverage.png`](../screenshots/desktop/coverage.png).

---

## Known limitations

Listed with workarounds in the [VPAT](vpat/CareConnect-Desktop-VPAT.pdf) and
[`conformance.md`](conformance.md#known-limitations-and-workarounds): placeholder
"3 alerts" entries; the Home toolbar search does not search yet; the in-app contrast
toggle lasts one session; the narrow sidebar is icons only; the greeting date and
"Zoom 100%" are fixed prototype text; sign-in accepts any well-formed credentials
and the video call is simulated.
