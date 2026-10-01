# CareConnect — Electron desktop client

SWEN 661 Team 2 (The Acuity Health Group), Assignment 8. The desktop port of the
Week 5 React Native client in [`../mobile`](../mobile), built from the Assignment 7
desktop design system and wireframes.

The full project write-up lives in the [repository README](../README.md#desktop--electron).
This file covers what a developer needs to build, run, test and package this
folder.

---

## What is in here

| Page | Owner | Status |
|:-----|:------|:-------|
| Contacts | Victor | Built |
| Messaging (conversation) | Victor | Built |
| Accessibility Settings | Victor | Built |
| Application shell — sidebar, native menu, shortcuts, window state | Victor | Built |
| Home, My Day | Justin | Placeholder page, wired into navigation |
| Appointments, Medicines, Memories | Rehman | Placeholder page, wired into navigation |

The pages that have not been ported yet render a page that names their owner.
They are wired into the sidebar, the native menu and the keyboard shortcuts now
rather than later, so navigation is complete and testable, and so a reviewer
pressing <kbd>Ctrl</kbd> + <kbd>3</kbd> finds an explanation rather than a dead
tab.

---

## Requirements

- Node.js 18 LTS or newer (developed against 24.19)
- npm 9 or newer

Electron downloads a ~120 MB runtime on first `npm install`.

---

## Getting started

```bash
cd desktop
npm install

npm run dev        # Vite dev server + Electron, with hot reload in the renderer
npm start          # production build, then launch it
```

`npm run dev` starts Vite on port 5273 and launches Electron against it once the
port answers. Edits to the renderer hot-reload; edits to `src/main` or
`src/shared` need the command restarted, because the main process is compiled
ahead of time.

The renderer also runs in a plain browser (`npm run dev:renderer`, then open
<http://localhost:5273>). Every keyboard shortcut is bound in the renderer as
well as in the native menu, and preferences fall back to `localStorage` when
`window.careconnect` is absent, so the whole application is usable — and
testable — without the Electron shell.

---

## Checks

```bash
npm run lint         # ESLint, renderer and main with their own globals
npm run typecheck    # three TypeScript projects: renderer, main, tests
npm test             # Jest + React Testing Library
npm run test:coverage
```

Current state: **288 tests, 18 suites, 88.6% statement coverage** (Assignment 8
requires 60%). The HTML report lands in `coverage/lcov-report/index.html`.

The only files not covered are `src/main/main.ts`, which cannot run outside an
Electron process — the pieces it is made of (`jsonStore`, `windowState`, `menu`,
`preload`) are each covered separately, at 100%, 97%, 81% and 100%.

---

## Packaging

```bash
npm run package        # the host platform
npm run package:mac    # .dmg
npm run package:win    # .exe (NSIS)
npm run package:linux  # .AppImage and .deb
```

Installers land in `release/`. **macOS is the platform this submission targets**,
and `release/CareConnect-1.0.0-arm64.dmg` is the artifact that was built and
launched for it.

The build is unsigned, so macOS quarantines it on first open. Right-click the
app and choose **Open**, or run
`xattr -dr com.apple.quarantine /Applications/CareConnect.app`. Electron builds
are most reliable on the OS being targeted; a Windows installer should be
produced on Windows or on a `windows-latest` CI runner.

---

## How it is put together

```
desktop/
├── src/
│   ├── main/            # the main process — no UI, owns the window and the disk
│   │   ├── main.ts          BrowserWindow, IPC handlers, security policy
│   │   ├── menu.ts          the native File/Edit/View/Go/Window/Help menu
│   │   ├── preload.ts       the context bridge — bundled, see below
│   │   ├── windowState.ts   remembering size and position, safely
│   │   └── jsonStore.ts     the small JSON files the app persists
│   ├── shared/          # imported by BOTH processes
│   │   ├── ipc.ts           channel names and payload types
│   │   └── shortcuts.ts     the one table of keyboard shortcuts
│   └── renderer/        # the React application
│       ├── models/          pure business logic, shared with the RN client
│       ├── data/            repositories — the UI never knows where data lives
│       ├── state/           React context providers
│       ├── navigation/      the typed router and the sidebar
│       ├── platform/        the Electron bridge, commands, key matching
│       ├── pages/           Contacts, MessageThread, Settings, Placeholder
│       ├── components/      buttons, banners, the shortcut card
│       └── index.css        the whole stylesheet, including high-contrast
└── electron-builder.yml
```

### Process separation

The main process owns the window, the native menu and the two JSON files the
application persists. It renders nothing. The renderer owns every pixel and
reaches the main process only through the typed surface in `preload.ts`.

`contextIsolation` is on, `nodeIntegration` is off and `sandbox` is on. The
renderer gets four objects on `window.careconnect` and no `ipcRenderer`, so
there is no channel it can invent and no filesystem it can reach. The renderer's
`index.html` carries a `script-src 'self'` Content Security Policy, so a message
body or a contact name can never be executed.

**The preload is bundled by Vite rather than compiled file-by-file.** A preload
running with `sandbox: true` gets a cut-down `require` that resolves `electron`
and a few built-ins and nothing else; a relative import of `../shared/ipc` fails
at load with "module not found", and the only symptom is that
`window.careconnect` is quietly absent. Bundling it lets the preload go on
importing the shared contract without giving up the sandbox.

### One table of keyboard shortcuts

`src/shared/shortcuts.ts` is the single source. `src/main/menu.ts` hangs the
native accelerators off it; the renderer binds the same table in-window; and the
Keyboard Shortcuts card in the Help menu prints it. The card therefore cannot
advertise a shortcut the application does not have, and a test asserts the menu
carries every bound entry.

| | Windows / Linux | macOS |
|:--|:--|:--|
| Home … Contacts | <kbd>Ctrl</kbd> + <kbd>1</kbd>–<kbd>6</kbd> | <kbd>Cmd</kbd> + <kbd>1</kbd>–<kbd>6</kbd> |
| Accessibility Settings | <kbd>Ctrl</kbd> + <kbd>,</kbd> | <kbd>Cmd</kbd> + <kbd>,</kbd> |
| Back | <kbd>Alt</kbd> + <kbd>←</kbd> | <kbd>Cmd</kbd> + <kbd>[</kbd> |
| Find a contact | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>F</kbd> |
| Send message | <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | <kbd>Cmd</kbd> + <kbd>Enter</kbd> |
| Alert this contact | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd> |
| Keyboard shortcuts | <kbd>Ctrl</kbd> + <kbd>/</kbd> | <kbd>Cmd</kbd> + <kbd>/</kbd> |

Copy, cut, paste, undo, select-all, zoom and full-screen are Electron's own menu
roles. They keep the platform's behaviour rather than being reimplemented, which
is the Assignment 7 rule about not fighting the OS — and zoom in particular is an
accessibility control here, so it has to live where users already look for it.

### Window state

Size, position and the maximized flag are written to
`<userData>/window-state.json`, debounced so a drag writes once rather than
sixty times. Two cases the plain version gets wrong are handled in
`windowState.ts`: a maximized window stores its *pre-maximize* bounds, because
storing the maximized ones means un-maximizing does nothing; and a position on a
display that is no longer attached is dropped, because a window restored
off-screen is indistinguishable from the application failing to start.

---

## Accessibility

The governing rule, inherited from Assignment 3 and shared with every other
client in this repository:

> **Anything communicated through sound must also be communicated visually or in
> text.**

What that means here:

- **No voice-call affordance.** A "call" is a captioned video call, named as
  such. A test asserts no call button exists on Contacts.
- **`visualAlertBanners` cannot be turned off.** The model forces it true on
  both write and read, so neither the UI nor a hand-edited preferences file can
  produce a sound-only alert. Three tests cover this.
- **Status is a shape *plus* a word.** Switches print "On"/"Off", the contact
  badge prints "waiting", the current sidebar item is filled, outlined, bold and
  carries `aria-current="page"`.
- **No toasts.** Nothing disappears on a timer. Confirmations are dismissible
  in-page banners.
- **The Notify flash is one slow fade, never a strobe** (WCAG 2.2 SC 2.3.1), and
  it carries words.
- **An error state never reads as an empty state.** "No messages yet" tells a
  deaf user that nobody wrote; a failed load is a different fact.

Desktop-specific work:

- **Keyboard-only.** Every control is a native element — `<button>`,
  `<input type="range">`, `<input type="checkbox" role="switch">` — so Tab,
  Enter, Space, the arrow keys, Home and End all come from the platform rather
  than being faked. A skip link is the first tab stop. The shortcut card traps
  focus and restores it on close.
- **Focus indicators.** One ring, defined once, never removed, and re-coloured
  on dark surfaces so it stays visible on the sidebar and the page header.
- **High contrast.** `@media (forced-colors: active)` restates the whole theme
  against the system's own colour pairs, and everything that was distinguished
  by a fill alone gains a border. `@media (prefers-contrast: more)` covers macOS
  Increase Contrast.
- **Zoom.** Every length is in `rem` and no `maximum-scale` is set, so
  <kbd>Ctrl/Cmd</kbd> + <kbd>+</kbd> scales the layout instead of clipping it.
  Below 960px the sidebar drops its labels and keeps its icons; the labels are
  still the accessible names, so a screen-reader user notices no difference.
- **Reduced motion.** `prefers-reduced-motion` holds the Notify flash as a
  steady panel instead of pulsing — the same fact, without movement.

Screen readers: tested with VoiceOver on macOS. Everything is real text in the
document rather than collapsed into `aria-label`s, so browse mode can walk a
conversation a line at a time and <kbd>Cmd</kbd> + <kbd>C</kbd> copies what is on
screen.

---

## Notes and known limitations

- **Vibration patterns are configured here, not felt here.** A desktop has no
  vibration motor, so activating a rhythm plays it back as a visual pulse in the
  pattern's real timing. The setting itself travels with the account, which is
  why it is edited on this client at all.
- **Data is in-memory.** Contacts and conversations come from the same fixtures
  as the React Native client, seeded from the Week 3 prototype. Messages sent
  during a session survive navigating away and back, and are lost on quit.
  Swapping in a real backend is a change to `App.tsx`, where the repositories are
  constructed.
- **Sign out is not wired up.** It belongs with the Welcome/Sign In/Sign Up
  pages, which are on another branch. The button says so rather than doing
  nothing.
- **No system tray icon.** CareConnect has one window and no background work to
  report, so a tray icon would be a permanently idle menu-bar item.
