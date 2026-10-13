# Accessibility testing checklist — CareConnect desktop (Assignment 9)

Result key: **Pass (auto)** — verified by `npm run a11y:audit`, `npm run a11y:keyboard`
or the jest-axe suite on 2026-10-07 (evidence linked). **Manual** — needs a person on
the installed build (native menu, OS notifications, OS contrast themes, a real
screen reader); fill in the result and initials.

Build tested: ______________ Tester(s): ______________ Date: ______________

## A. Automated (axe DevTools / axe-core)

| # | Check | Result | Evidence |
|:--|:--|:--|:--|
| A1 | axe scan of every main screen, WCAG 2.1 A + AA | Pass (auto) — 0 violations, 28 scans | [axe/axe-zero-violations.png](axe/axe-zero-violations.png) |
| A2 | Scans repeated in a narrow (900px) window | Pass (auto) | [axe/report.html](axe/report.html) |
| A3 | Dialog open, form errors showing, banners showing | Pass (auto) | [axe/](axe) |
| A4 | "Needs review" contrast items resolved | Pass (auto) — 149 measured, 0 below threshold | [axe/report.html](axe/report.html) |
| A5 | axe DevTools extension scan | Ran 9 Oct on the pre-fix build: 21 issues, 20 already fixed, 1 new (fixed, #16). Re-scan of this branch: __________ | [axe-devtools/](axe-devtools) |
| A6 | Contrast with the pointer over every control | Pass (auto) — 0 failures | [axe/report.html](axe/report.html) |

## B. Keyboard only (mouse unplugged)

| # | Step | Expected | Result | Evidence |
|:--|:--|:--|:--|:--|
| B1 | Launch, <kbd>Tab</kbd> once | "Skip to main content" visible and focused | Pass (auto) | [focus-01](keyboard/focus-01-skip-link.png) |
| B2 | <kbd>Enter</kbd> on the skip link | Focus moves into `<main>` | Pass (auto) | [results](keyboard/results.md) |
| B3 | Sign in with <kbd>Tab</kbd>, typing, <kbd>Enter</kbd>; first submit empty | Errors shown, focus on first bad field; then lands on Home | Pass (auto) | [focus-02](keyboard/focus-02-sign-in-errors.png) |
| B4 | <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> through every page | Every control reached, order follows the layout, focus wraps — no trap | Pass (auto) — 12 screens, 167 stops | [results](keyboard/results.md#tab-order-per-screen) |
| B5 | Focus indicator at every stop, including the dark sidebar | Always visible | Pass (auto) | [focus-03](keyboard/focus-03-sidebar.png) |
| B6 | <kbd>Ctrl</kbd>+<kbd>1</kbd>…<kbd>6</kbd>, <kbd>Ctrl</kbd>+<kbd>,</kbd> | Each page opens | Pass (auto) | [results](keyboard/results.md) |
| B7 | <kbd>Alt</kbd>+<kbd>←</kbd> (Mac <kbd>Cmd</kbd>+<kbd>[</kbd>) | Back to the previous page | Pass (auto) | [results](keyboard/results.md) |
| B8 | Sidebar <kbd>↑</kbd> / <kbd>↓</kbd> | Moves between items and wraps | Pass (auto) | [results](keyboard/results.md) |
| B9 | Contacts: <kbd>Ctrl</kbd>+<kbd>F</kbd>, type | Search focused, list filters | Pass (auto) | [results](keyboard/results.md) |
| B10 | <kbd>Enter</kbd> on a contact; <kbd>Ctrl</kbd>+<kbd>Enter</kbd> sends | Conversation opens; message sent | Pass (auto) | [focus-04](keyboard/focus-04-contact-row.png) |
| B11 | Conversation history scrolls with keys (<kbd>Home</kbd>, arrows, <kbd>PgUp</kbd>) | Scrolls | Pass (auto) | [results](keyboard/results.md) |
| B12 | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> | Visual flash with words | Pass (auto) | [focus-05](keyboard/focus-05-notify.png) |
| B13 | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> on Windows | Action Center toast appears; clicking it focuses the window | Manual | |
| B14 | <kbd>Esc</kbd> in a conversation | Back to Contacts | Pass (auto) | [results](keyboard/results.md) |
| B15 | Settings: <kbd>Space</kbd> on a switch | Toggles, On/Off text changes | Pass (auto) | [focus-06](keyboard/focus-06-switch.png) |
| B16 | Settings: slider <kbd>→</kbd> / <kbd>Home</kbd> / <kbd>End</kbd>; radio group arrows | Value / selection changes | Pass (auto) | [focus-07](keyboard/focus-07-slider.png) |
| B17 | Settings values persist after quitting and relaunching | Kept | Manual | |
| B18 | Appointments: <kbd>Enter</kbd> on Export; dismiss banner | Save dialog / banner; focus returns to Export | Pass (auto) for banner and focus; Manual for the native Save dialog | [results](keyboard/results.md) |
| B19 | Medicines: <kbd>Space</kbd> on a medicine | Checkbox toggles, count updates | Pass (auto) | [focus-08](keyboard/focus-08-medicine.png) |
| B20 | My Day: <kbd>Space</kbd> / <kbd>Enter</kbd> on a task | Toggles done / not done | Pass (auto) | [results](keyboard/results.md) |
| B21 | <kbd>Ctrl</kbd>+<kbd>/</kbd>; Tab and Shift+Tab repeatedly; <kbd>Esc</kbd> | Dialog opens, focus stays inside, Esc closes and restores focus | Pass (auto) | [focus-09](keyboard/focus-09-dialog.png) |
| B22 | <kbd>Alt</kbd> or <kbd>F10</kbd>, arrows, mnemonics (<kbd>Alt</kbd>+<kbd>F</kbd>) | Native menu bar File / Edit / View / Go / Window / Help | Manual (menu structure unit-tested in `menu.test.ts`) | |
| B23 | <kbd>Ctrl</kbd>+<kbd>+</kbd> to 200% and beyond, <kbd>Ctrl</kbd>+<kbd>0</kbd> | Layout scales, no sideways scrolling | Pass (auto) at 200% and 400% widths; Manual for Electron's zoom keys | [zoom-200](keyboard/zoom-200.png), [zoom-400](keyboard/zoom-400.png) |
| B24 | Single-key shortcuts | None exist — every shortcut uses a modifier | Pass (code review) | [`shared/shortcuts.ts`](../../desktop/src/shared/shortcuts.ts) |

## C. Screen reader

Full step list with expected announcements: [screen-reader/notes.md](screen-reader/notes.md).

| # | Check | Result | Evidence |
|:--|:--|:--|:--|
| C1 | Every control has a name, role and state in the accessibility tree | Pass (auto) | [accessibility-tree/](screen-reader/accessibility-tree) |
| C2 | Landmarks: one navigation "Main", one main, one top-level contentinfo | Pass (auto) | jest test "keeps one top-level contentinfo landmark" |
| C3 | Window title names the page | Pass (auto) | jest test "names the window after the current page" |
| C4 | Status messages (search count, export, Notify, errors) are live regions | Pass (code review + tree) | [conformance 4.1.3](conformance.md#level-aa) |
| C5 | VoiceOver pass, steps 1–31 | Manual | notes.md *Heard* column |
| C6 | NVDA pass on the Windows installer, steps 1–31 | Manual | notes.md *Heard* column |
| C7 | 3–5 minute demonstration video | Manual | link: __________ |

## D. Visual / platform settings

| # | Check | Result | Evidence |
|:--|:--|:--|:--|
| D1 | Text contrast 4.5:1 (3:1 large) | Pass (auto) | [axe report](axe/report.html) |
| D2 | Control borders and focus ring 3:1 | Pass (measured) — 3.96:1 borders, 8.5:1 ring | [report #11](README.md#issues-found-and-fixed) |
| D3 | Reflow at 320px | Pass (auto) | [zoom-400](keyboard/zoom-400.png) |
| D4 | WCAG 1.4.12 text spacing | Pass (auto) | [text-spacing](keyboard/text-spacing.png) |
| D5 | Windows Contrast Themes (Night sky, Desert): every page legible, focus ring visible, selected sidebar item has a border | Manual | screenshots: __________ |
| D6 | macOS Increase Contrast | Manual | |
| D7 | Reduce Motion: Notify flash is a steady panel | Manual (rule in `index.css`) | |
