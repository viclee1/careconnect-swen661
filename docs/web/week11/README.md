# Assignment 11 — CareConnect web app (team overview)

**SWEN 661 Team 2 (The Acuity Health Group).** The React web app at the
repository root, completed for Assignment 11: every screen built, the three
members' branches merged into `WK11-Victor`, and the whole app aligned to the
team's Figma web design (*Webpage design*) at 402, 768 and 1440 px. This page
explains how the pieces fit together and where each member's evidence is.

| Write-up | Screens |
|:--|:--|
| [Victor Lee](victor/README.md) | Contacts, Conversation (messaging), Accessibility Settings, and the app shell (header, sidebar, Menu drawer, search, account menu, status bar) |
| [Upneet Bir](upneet/README.md) | Appointments, Medicines, Memories |
| Justin Zhang (this page, [below](#justins-screens)) | Landing, Sign in, Sign up, Home, My Day |

Every screenshot linked from these pages was regenerated on 27 October 2026
from the merged app, with the browser clock fixed at 9:45 am so the demo data
looks the same whenever the scripts run.

---

## How the three branches became one app

1. **Justin's branch** (`WK11-Justin`: "Pages Done", "Tests") and **Upneet's**
   (`WK11-Upneet`, which already contained Justin's commits) were
   fast-forwarded into `WK11-Victor`. Nothing conflicted.
2. `SHOW_TEAMMATE_PAGES` in [`src/branchScope.ts`](../../../src/branchScope.ts)
   is `true`, so every route shows its real page instead of the "build in
   progress" placeholder Victor's branch used while it carried only his
   screens.
3. Typecheck and lint errors in the merged code (unused imports and an `any`
   in Justin's `Home.tsx` and `MockVideoCall.tsx`) were fixed.
4. The merged app was compared with the Figma board at all three widths.
   My Day, Contacts, Messaging, Settings and Landing were already close. The
   rest was changed to match (commit `c2fdf6b`):

| What differed from Figma | What it is now |
|:--|:--|
| A large date-and-time header with "Message my caregiver" on every screen; on phones it took about 40% of the screen | The Figma header (68 px): Menu, logo, search (Ctrl K), CC, high contrast, keyboard shortcuts, avatar with the alerts badge |
| A bottom tab bar on phones with cut-off labels ("Appoi…", "Medici…") | A ☰ Menu drawer on phones and tablets, holding the same panel as the desktop sidebar |
| No sidebar greeting, Settings or alerts; no status bar | Sidebar with the role, greeting, date and time, pages, Settings and an alerts list; a status bar with the connection state and active alerts |
| Medicines as a 2 × 2 card grid, with medicines that did not match My Day | A list with a detail panel, the "still to take" pill and a captioned reminder; the design's four medicines |
| Appointments as a card grid | A grouped list with a detail panel |
| Memories as a photo grid | One list of rows with small photos |
| Accessibility Settings only reached Victor's screens: Home's [CC] strip and the video call's captions ignored them | Captions, their size and colour, volume and balance apply on every screen; the header's CC button is the same switch |

The full comparison and its screenshots are in Victor's write-up
([the app shell](victor/README.md#the-app-shell-aligned-to-the-figma-design)).

---

## Every screen

| Screen | Route | Owner | Screenshots (375 / 768 / 1440 px unless noted) |
|:--|:--|:--|:--|
| Landing | `/` | Justin | [three widths](../implementation/screenshots/overview/01-landing.png) |
| Sign in | `/signin` | Justin | [three widths](../implementation/screenshots/overview/02-sign-in.png) |
| Sign up | `/signup` | Justin | [three widths](../implementation/screenshots/overview/03-sign-up.png) |
| Role chooser | `/role` | Base app | [three widths](../implementation/screenshots/overview/04-role-chooser.png) |
| Home | `/app` | Justin | [three widths](../implementation/screenshots/overview/05-today.png) |
| My Day | `/app/schedule` | Justin | [three widths](../implementation/screenshots/overview/06-my-day.png) |
| Appointments | `/app/appointments` | Upneet | [mobile](upneet/screenshots/mobile/01-appointments-top.png) · [tablet](upneet/screenshots/tablet/01-appointments.png) · [desktop](upneet/screenshots/desktop/01-appointments.png) |
| Medicines | `/app/medications` | Upneet | [mobile](upneet/screenshots/mobile/02-medicines-top.png) · [tablet](upneet/screenshots/tablet/02-medicines.png) · [desktop](upneet/screenshots/desktop/02-medicines.png) |
| Memories | `/app/memories` | Upneet | [mobile](upneet/screenshots/mobile/03-memories-top.png) · [tablet](upneet/screenshots/tablet/03-memories.png) · [desktop](upneet/screenshots/desktop/03-memories.png) |
| Contacts | `/app/contacts` | Victor | [mobile](victor/screenshots/mobile/01-contacts-top.png) · [tablet](victor/screenshots/tablet/01-contacts.png) · [desktop](victor/screenshots/desktop/01-contacts.png) |
| Conversation | `/app/contacts/:id` | Victor | [mobile](victor/screenshots/mobile/02-conversation-top.png) · [tablet](victor/screenshots/tablet/02-conversation.png) · [desktop](victor/screenshots/desktop/02-conversation.png) |
| Accessibility Settings | `/app/settings` | Victor | [mobile](victor/screenshots/mobile/03-settings-top.png) · [tablet](victor/screenshots/tablet/03-settings.png) · [desktop](victor/screenshots/desktop/03-settings.png) |
| App shell: navigation | every `/app` route | Victor | [mobile drawer](victor/screenshots/mobile/04-navigation.png) · [tablet drawer](victor/screenshots/tablet/04-navigation.png) · [desktop sidebar](victor/screenshots/desktop/04-navigation.png) |
| App shell: search | every `/app` route | Victor | [three widths](../implementation/screenshots/overview/17-search.png) |
| Caregiver dashboard, Manage medications, Manage appointments, Activity log, Notes | `/app`, `/app/manage-*`, `/app/activity`, `/app/caregiver` | Base app (not assigned this week) | [overview screenshots](../implementation/screenshots/overview) |

---

## Justin's screens

Justin's branch replaced the Landing, Sign in, Sign up, Home and My Day pages
with versions that follow the Figma frames.

- **Landing** (`src/pages/Landing.tsx`). "Your daily companion for calm,
  confident care", a "Fully accessible — no sound required" badge, and a
  **Built for hearing accessibility** card listing visual alerts, captions
  everywhere, and screen flash and desktop alerts. Get started and Sign in
  lead to the forms. (The base app's AI assistant panel is not on the new
  Landing page.)
- **Sign in and Sign up** (`SignIn.tsx`, `SignUp.tsx`). Labelled fields,
  inline validation, and mock authentication (`src/auth/mockAuth.ts`); any
  well-formed email and password works.
- **Home** (`Home.tsx`). Today's progress (read from My Day), the **next
  thing to do** (the 3 pm video call with Maria, with a video preview that
  opens her conversation), **Later today**, and **Simulate incoming call**,
  which opens `MockVideoCall`: an incoming-call screen that says the screen
  is flashing and captions will be on, then a call with a live caption bar,
  mute, pause, and volume and balance sliders. With the Figma pass, the
  appointment banner and [CC] strip at the top became the shared
  `AppointmentBanner` and `CaptionStrip`, and the call's captions, volume and
  balance became the Accessibility Settings values.
- **My Day** (`Schedule.tsx`). Every task for the day — medicines, check-ins,
  appointments — each a button that ticks it (`aria-pressed`), with its time,
  category and a progress count; ticks are kept in localStorage
  (`careconnect_web_myday_tasks`). Completed tasks are struck through; an
  `opacity-75` fade on them was removed because it took their text to 3.24:1
  (found by the re-run accessibility audit).

Justin's pages are covered by the team accessibility suite
(`src/accessibility.test.tsx`: axe, one `<main>` and `<h1>`, the skip link and
a unique title on every route, at desktop and phone width) and by the
accessibility audit below. They have no page-specific Jest suites yet.

---

## Testing, all members

| Check | Result | Evidence |
|:--|:--|:--|
| Jest (unit, component, accessibility) | **375 tests in 29 suites, all passing** | [summary with coverage](victor/screenshots/testing/02-jest-all-summary.png) · [Victor's 19 suites](victor/screenshots/testing/01-jest-victor-suites.png) · [Upneet's 9 suites](upneet/screenshots/testing/01-jest-upneet-suites.png) |
| Coverage (`npm run test:coverage`, 75% threshold) | **95.82% statements, 91.14% branches, 94.1% functions, 96.44% lines** | [`coverage/lcov-report/index.html`](../../../coverage/lcov-report/index.html) · [screenshot](victor/screenshots/testing/04-coverage-report.png) |
| Playwright (Chromium, WebKit, mobile Safari) | **58 passed, 7 skipped by design, 1 failed** (see known issues) | [run](victor/screenshots/testing/03-playwright-run.png) · [HTML report](victor/screenshots/testing/05-playwright-html-report.png) |
| Accessibility audit (`npm run a11y:web`) | **64 scans, 0 violations; 53/53 keyboard and structure checks** over 17 routes and the shell's interactive states at 375, 820 and 1280 px | [`../accessibility/audit/report.html`](../accessibility/audit/report.html) |
| Lint, typecheck, build | 0 errors; clean; builds | — |

Firefox is configured but cannot launch locally on macOS 27; CI
([`.github/workflows/web-tests.yml`](../../../.github/workflows/web-tests.yml))
runs all four browser projects on Ubuntu.

**Fixed while recreating this evidence.**

- *Seed messages in the future.* Just after midnight, this morning's demo
  messages (8:02, 9:05) were later than "now", so a new message sorted above
  them and two Jest tests failed. The seed now moves back so its newest
  message is never in the future (`src/data/messagesData.ts`).
- *Sidebar under the status bar.* On desktop the foot of the sidebar
  ("5 alerts") ran under the sticky status bar; the bar's height is now
  measured and the sidebar stops above it.
- *My Day contrast* (above), and a WebKit race in the captions end-to-end
  test (it now waits for the setting to be saved before leaving the page).
- *A single-key shortcut.* "?" opened the keyboard shortcuts dialog; a
  single-character shortcut that cannot be turned off fails WCAG 2.1.4, so
  it was removed (the header's keyboard button opens the dialog).

---

## Known issues

- **Memories end-to-end check (Chromium only).** After an empty Save, the
  test measures whether the focused field is below the sticky header, and
  sometimes measures before the browser has finished scrolling. It fails the
  same way on the commit before the Figma work and passed in one of the
  latest runs. WebKit and mobile Safari pass.
- **My Day and Home keep their own task list**, separate from the Medicines
  and Appointments stores, so ticking a medicine on one screen does not tick
  it on the other.
- **The Medicines reminder caption** names the next medicine still to come,
  not an overdue one.
- **"/" on Contacts** is a single-character shortcut that cannot be turned
  off (WCAG 2.1.4). Planned fix: active only while the list has focus, or an
  off switch in Settings.
- **The AI assistant** (`src/components/ChatBot.tsx`) is not mounted on the
  new Landing page.
- **The alert count is live** (5 in the demo: two unread messages, the
  medicines still to take, today's two visits), where the Figma frames show a
  fixed 3.
- **Manual screen-reader and keyboard passes** (VoiceOver, NVDA, Safari with
  Full Keyboard Access) are still to be done by each member before
  submission; the automated keyboard paths all pass.

---

## Running everything

```bash
npm install
npm run dev                                   # http://localhost:5173
npm test && npm run test:coverage
npx playwright install chromium firefox webkit && npm run test:e2e

# Screenshots and audits (start a dev server on :5180 first)
npm run dev -- --port 5180
npm run screenshots:responsive                # every screen at three widths
node scripts/week11-victor-evidence.mjs       # Victor's screens, shell, keyboard
node scripts/week11-upneet-evidence.mjs       # Upneet's screens, features, keyboard
npm run a11y:web && npm run a11y:structure    # axe audit, landmark report
npm run screenshots                           # README screenshots (builds and serves itself)
node scripts/week11-testing-evidence.mjs      # test screenshots from real runs
```
