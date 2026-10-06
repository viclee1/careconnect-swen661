# Desktop accessibility test — Assignment 8, Part 3

A script for the manual half of Part 3: the keyboard-only pass, the NVDA pass,
Windows Contrast Themes, and the demo video. Run it against the **installed**
Windows build (`desktop/release/CareConnect-Setup-1.0.0.exe`), not the dev
server, so what is tested is what is submitted.

Mark each row Pass / Fail and note anything odd. A failure goes in the
"Findings" table at the bottom with the page and the steps.

Tester: ______________ Date: ______________ Windows version: ______________
NVDA version: ______________

---

## 1. Keyboard only

Unplug or ignore the mouse for this whole section.

| # | Step | Expected | Result |
|:--|:-----|:---------|:-------|
| 1.1 | Launch the app, press <kbd>Tab</kbd> once | "Skip to main content" link appears and is focused | |
| 1.2 | Press <kbd>Enter</kbd> on the skip link | Focus moves into the page, past the sidebar | |
| 1.3 | Sign in using only <kbd>Tab</kbd>, typing and <kbd>Enter</kbd> | Lands on Home | |
| 1.4 | <kbd>Ctrl</kbd>+<kbd>1</kbd> … <kbd>Ctrl</kbd>+<kbd>6</kbd> | Home, My Day, Appointments, Medicines, Memories, Contacts in turn | |
| 1.5 | <kbd>Ctrl</kbd>+<kbd>,</kbd> | Accessibility Settings | |
| 1.6 | <kbd>Alt</kbd>+<kbd>←</kbd> | Back to the previous page | |
| 1.7 | Focus the sidebar, use <kbd>↑</kbd> / <kbd>↓</kbd> | Moves between sidebar items | |
| 1.8 | Contacts: <kbd>Ctrl</kbd>+<kbd>F</kbd>, type a name | Search field focused, list filters | |
| 1.9 | Open a contact with <kbd>Enter</kbd>, type a message, <kbd>Ctrl</kbd>+<kbd>Enter</kbd> | Message is sent | |
| 1.10 | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> in a conversation | Notify alert fires; visual flash and Windows toast appear | |
| 1.11 | Settings: switches with <kbd>Space</kbd>, sliders with arrows / <kbd>Home</kbd> / <kbd>End</kbd> | Every control changes; the value persists after restart | |
| 1.12 | Appointments (<kbd>Ctrl</kbd>+<kbd>3</kbd>): Tab to **Export to calendar**, <kbd>Enter</kbd> | Windows Save dialog opens for `.ics`; after saving, a banner confirms and focus returns to the button when it is dismissed | |
| 1.13 | Medicines (<kbd>Ctrl</kbd>+<kbd>4</kbd>): Tab to each medicine, <kbd>Space</kbd> | Checkbox toggles; "N of M taken" updates; state is kept after leaving and returning | |
| 1.14 | Memories (<kbd>Ctrl</kbd>+<kbd>5</kbd>): Tab through the cards | Every card is reachable with a visible focus ring | |
| 1.15 | <kbd>Ctrl</kbd>+<kbd>/</kbd> | Shortcut card opens, focus is trapped inside, <kbd>Esc</kbd> closes and returns focus | |
| 1.16 | <kbd>Alt</kbd> (or <kbd>F10</kbd>), then arrows | Native menu bar opens: File, Edit, View, Go, Window, Help | |
| 1.17 | <kbd>Ctrl</kbd>+<kbd>+</kbd> / <kbd>Ctrl</kbd>+<kbd>-</kbd> / <kbd>Ctrl</kbd>+<kbd>0</kbd> | Zooms in, out and resets without clipping | |
| 1.18 | Tab through every page | A focus ring is visible on every interactive element, including on the dark sidebar | |

## 2. Screen reader (NVDA)

Install NVDA from <https://www.nvaccess.org/>. Start it with
<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd>, then launch CareConnect.

| # | Step | Expected | Result |
|:--|:-----|:---------|:-------|
| 2.1 | Launch the app | Window title "CareConnect" is announced | |
| 2.2 | <kbd>Tab</kbd> through the sidebar | Each item is read by name, current page is announced as current | |
| 2.3 | Press <kbd>H</kbd> in browse mode | Moves between page headings in order | |
| 2.4 | Contacts list | Each contact's name, preview and waiting count are read | |
| 2.5 | Conversation, arrow down in browse mode | Messages are read one at a time with sender and time | |
| 2.6 | Send a message | Delivery status is announced | |
| 2.7 | Trigger Notify (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>) | The alert is announced, not only shown | |
| 2.8 | Settings switches and sliders | Role, name and state/value are read; changes are announced | |
| 2.9 | Appointments | Each visit's title, date, time and place are read; the export banner is announced | |
| 2.10 | Medicines: toggle one | Name, checked state and the updated "N of M taken" status are announced | |
| 2.11 | Memories, <kbd>H</kbd> in browse mode | Moves card to card by heading | |
| 2.12 | Open the shortcut card | Announced as a dialog with its title | |
| 2.13 | Sign-in with a wrong password | The error is announced | |

## 3. High contrast

**Settings → Accessibility → Contrast themes**, choose **Night sky** (dark) and then
**Desert** (light). <kbd>Left Alt</kbd>+<kbd>Left Shift</kbd>+<kbd>Print Screen</kbd>
toggles it.

| # | Step | Expected | Result |
|:--|:-----|:---------|:-------|
| 3.1 | Every page under a dark theme | Text, borders and icons use the theme's colours; nothing disappears | |
| 3.2 | Every page under a light theme | Same | |
| 3.3 | Tab through under both themes | Focus ring still visible | |
| 3.4 | Buttons and selected sidebar item | Distinguishable by a border, not only a fill | |
| 3.5 | Notify flash | Still visible | |

Take one screenshot per theme for the submission.

## 4. Demo video

The PDF asks for 10–15 min under Part 3 and 2–3 min under Submission, so check
which length your instructor wants. A tight cut of the steps below fits in
3 min; recording each step in full fills the long version. Record with
<kbd>Win</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd> (Xbox Game Bar) or OBS, with NVDA's
speech audible and a visible key overlay if possible.

1. **Intro (15 s):** name, app, "everything is keyboard only, NVDA is running".
2. **Launch and sign in (25 s):** steps 1.1–1.3, NVDA reading the fields.
3. **Navigation (20 s):** <kbd>Ctrl</kbd>+<kbd>1</kbd>–<kbd>6</kbd>, <kbd>Alt</kbd>+<kbd>←</kbd>, the native menu with <kbd>Alt</kbd>.
4. **Contacts and messaging (40 s):** <kbd>Ctrl</kbd>+<kbd>F</kbd>, open a contact, send with <kbd>Ctrl</kbd>+<kbd>Enter</kbd>, Notify with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>, the toast.
5. **Appointments, Medicines, Memories (30 s):** export to calendar through the Save dialog, tick a medicine with <kbd>Space</kbd> and let NVDA read the status, <kbd>H</kbd> through memories.
6. **Settings (20 s):** switch and slider by keyboard, NVDA reading value changes.
7. **Shortcut card (10 s):** <kbd>Ctrl</kbd>+<kbd>/</kbd>, focus trap, <kbd>Esc</kbd>.
8. **High contrast (10 s):** toggle a contrast theme, tab through one page.

---

## Findings

| Page | Steps | What happened | Fixed? |
|:-----|:------|:--------------|:-------|
| | | | |
