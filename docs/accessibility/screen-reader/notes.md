# Screen-reader testing notes — CareConnect desktop

Assignment 9, Part 1.3. Two layers:

1. **Accessibility tree (done, automated).** `npm run a11y:keyboard` saves the tree
   Chromium exposes to the operating system for every screen, in
   [`accessibility-tree/`](accessibility-tree). This is exactly what VoiceOver and
   NVDA are given to read, so every name, role, state and landmark below was
   checked there first. Reading these trees found four of the fixed defects (the
   contrast toggle with no state, the helpline row's stray punctuation, a `div`
   inside a button, and the status-bar hint naming the wrong key on macOS) and
   confirmed the label fixes.
2. **Real screen reader (manual).** VoiceOver on macOS and NVDA on Windows, using
   the steps below. The tester records what was actually heard in the *Heard*
   column and in the demonstration video. Automated tools cannot tell you how a
   screen reader *sounds*; this pass is what does.

Tester: ______________ Date: ______________ OS: ______________
Screen reader and version: ______________ Build: installed `CareConnect-Setup-1.0.0.exe` / `CareConnect.app`

---

## Getting started

| | VoiceOver (macOS) | NVDA (Windows) |
|:--|:--|:--|
| Start / stop | <kbd>Cmd</kbd> + <kbd>F5</kbd> | <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>N</kbd> / <kbd>Insert</kbd> + <kbd>Q</kbd> |
| Read next item | <kbd>VO</kbd> (<kbd>Ctrl</kbd>+<kbd>Option</kbd>) + <kbd>→</kbd> | <kbd>↓</kbd> in browse mode |
| Next heading | <kbd>VO</kbd> + <kbd>Cmd</kbd> + <kbd>H</kbd> | <kbd>H</kbd> |
| Landmarks / rotor | <kbd>VO</kbd> + <kbd>U</kbd> | <kbd>D</kbd> (next landmark), <kbd>Insert</kbd> + <kbd>F7</kbd> (elements list) |
| Interact with a control | <kbd>Tab</kbd>, <kbd>Space</kbd> / <kbd>VO</kbd> + <kbd>Space</kbd> | <kbd>Tab</kbd>, <kbd>Enter</kbd> / <kbd>Space</kbd> (focus mode switches automatically) |
| Window title | <kbd>VO</kbd> + <kbd>F2</kbd> | <kbd>Insert</kbd> + <kbd>T</kbd> |

Shortcuts below are written for Windows; on a Mac use <kbd>Cmd</kbd> for
<kbd>Ctrl</kbd> and <kbd>Cmd</kbd> + <kbd>[</kbd> for Back.

---

## Expected announcements, screen by screen

"Expected" is taken from the accessibility tree (wording may differ slightly
between screen readers: VoiceOver says "button", NVDA "button" after the name,
and so on). Fill in *Heard* and mark Pass / Fail.

| # | Step | Expected | Heard | Result |
|:--|:--|:--|:--|:--|
| 1 | Launch the app | Window title "Welcome — CareConnect"; first <kbd>Tab</kbd>: "Skip to main content, link" | | |
| 2 | Landmarks on Splash | banner, navigation "Account actions", main, region "Hearing accessibility features", content information "Application status" | | |
| 3 | Sign In: Tab to fields | "Email address, edit text", "Password, secure edit text" | | |
| 4 | Submit empty Sign In | Alert "Please correct the errors below to continue."; focus lands on Email, read with its description "Please enter your email address.", invalid | | |
| 5 | Sign in | Title "Home — CareConnect"; heading level 1 "Here's your day, Margaret" | | |
| 6 | <kbd>D</kbd> / rotor: landmarks on a signed-in page | navigation "Main", main, content information "Application status" — one of each, the status bar outside main | | |
| 7 | Tab through the sidebar | "Home, button" … "Contacts, button", the current page announced as current page; "Settings, button"; "3 alerts, button"; "Keyboard shortcuts, button" | | |
| 8 | Narrow the window below 960px, Tab the sidebar again | Same names as step 7 although only icons show (was silent "button" before the fix) | | |
| 9 | Home: progress | "1 of 7 things done today, progress bar" | | |
| 10 | Home toolbar contrast button, press <kbd>Space</kbd> twice | "Toggle contrast mode, toggle button, not pressed" → "pressed" → "not pressed" | | |
| 11 | My Day (<kbd>Ctrl</kbd>+<kbd>2</kbd>): Tab to a task, <kbd>Space</kbd> | "Take Amlodipine 5 mg — 1 tablet with food 8:30 am, toggle button, pressed"; Space flips to "not pressed" | | |
| 12 | Appointments (<kbd>Ctrl</kbd>+<kbd>3</kbd>) | Heading "Appointments"; list "Upcoming appointments" with each visit's title, date, time and place | | |
| 13 | Export to calendar | Save dialog; afterwards the confirmation banner is read as a status without focus moving | | |
| 14 | Medicines (<kbd>Ctrl</kbd>+<kbd>4</kbd>): <kbd>Space</kbd> on a medicine | "<name>, checkbox, checked"; group "Mark each medicine as taken"; the "N of M taken" status is announced | | |
| 15 | Memories (<kbd>Ctrl</kbd>+<kbd>5</kbd>), <kbd>H</kbd> | Moves card to card by heading | | |
| 16 | Contacts (<kbd>Ctrl</kbd>+<kbd>6</kbd>), <kbd>Ctrl</kbd>+<kbd>F</kbd>, type "jo" | "Find a contact, search edit text"; status '1 contact matches "jo".' | | |
| 17 | Tab to the first contact | "Joyce Primary Caregiver · Daughter Good morning Margaret! How are you feeling today? 1 waiting, button" — the printed words in printed order | | |
| 18 | Tab to NHS 111 | "NHS 111 Medical helpline No messages yet Urgent care service, button" | | |
| 19 | Open Joyce | Title "Conversation with Joyce — CareConnect"; heading "Joyce" | | |
| 20 | Tab to the history, arrow through it | region "Conversation with Joyce"; headings "Yesterday", "Today"; each message with sender, text and time | | |
| 21 | Tab to Notify | "Alert Joyce you want to talk Sends a visual flash and vibration — no sound, button" | | |
| 22 | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> | Status "Alert sent to Joyce. Their screen flashed and their phone buzzed." and a new line appears in the conversation | | |
| 23 | Composer | "Message Joyce, edit text"; status "500 characters left"; "Send. Type a message first, button" when empty | | |
| 24 | Type and send with <kbd>Ctrl</kbd>+<kbd>Enter</kbd> | Message appears; delivery status read | | |
| 25 | Settings (<kbd>Ctrl</kbd>+<kbd>,</kbd>) | Title "Accessibility Settings — CareConnect"; "Visual alert banners, switch, on, dimmed" (locked on by design) | | |
| 26 | A switch, <kbd>Space</kbd> | "Smart alert escalation, switch, on" → "off" | | |
| 27 | Caption size, arrows | "Caption size, radio group"; "Medium, radio button, selected, 2 of 3" → "Large …" | | |
| 28 | Alert volume, arrows | "Alert volume 70 per cent, slider" — its `aria-valuetext`, not the raw "0.7" | | |
| 29 | Vibration pattern row | "Medication Double pulse, button" with description "Activate to see the Double pulse rhythm played back."; activating announces "Playing the Double pulse rhythm." once | | |
| 30 | <kbd>Ctrl</kbd>+<kbd>/</kbd> | "Keyboard shortcuts, dialog"; focus on "Close, button"; tables read with captions and column headers; <kbd>Esc</kbd> returns focus to where it was | | |
| 31 | Status bar | "Keyboard shortcuts: Ctrl + Slash, button" (Cmd on a Mac) | | |

---

## Findings log

What the tree review found, and what the manual pass adds.

| Screen | Finding | Fixed? |
|:--|:--|:--|
| All signed-in, narrow window | Sidebar buttons announced as "button" with no name | Yes — #1 in the report |
| Sidebar | Settings item announced as "Accessibility" | Yes — #5 |
| Status bar | "Press Ctrl/ for shortcuts" announced as "Open keyboard shortcuts guide"; said Ctrl on macOS | Yes — #5, #15 |
| Contacts | Row name was a rewritten sentence, not the printed words; helpline read "No messages yet , urgent care service" | Yes — #5 |
| My Day | Tasks were `div role="button"` with a name unlike the card | Yes — #6 |
| Home toolbar | Contrast toggle announced no state and did nothing | Yes — #8 |
| Home | `div` inside the Video preview button | Yes — #14 |
| Sign In / Sign Up | Field errors not read with the field | Yes — #10 |
| All | Window title the same on every page | Yes — #12 |
| *(manual pass)* | | |

---

## Demonstration video (3–5 minutes)

Record the installed build with the screen reader's speech audible (Windows:
<kbd>Win</kbd>+<kbd>Alt</kbd>+<kbd>R</kbd> or OBS; macOS: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>5</kbd>
with "Show mouse clicks" off and system audio captured). Keyboard only throughout;
a key-overlay (KeyCastr on macOS, Carnac on Windows) makes it easy to follow.

| Time | Segment | Steps above |
|:--|:--|:--|
| 0:00–0:20 | Intro: who, what, "keyboard only, VoiceOver/NVDA running" | — |
| 0:20–0:50 | Launch, skip link, landmarks, sign in with an error first | 1–5 |
| 0:50–1:20 | Sidebar and shortcuts, window title changing; narrow the window and repeat | 6–8 |
| 1:20–2:00 | Home contrast toggle, My Day toggle buttons, Medicines checkbox with status | 9–11, 14 |
| 2:00–2:50 | Contacts search status, row names, open a conversation, Notify, send | 16–24 |
| 2:50–3:40 | Settings: switch, radio group, slider value text, vibration pattern | 25–29 |
| 3:40–4:15 | Shortcut dialog: announced as dialog, trap, Esc returns focus | 30 |
| 4:15–4:30 | Close: what was fixed this week | — |
