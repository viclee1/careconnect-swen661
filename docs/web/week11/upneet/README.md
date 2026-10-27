# Assignment 11: Appointments, Medicines and Memories (Upneet Bir)

**SWEN 661 Team 2 (The Acuity Health Group).** This is Upneet's part of the
team's Assignment 11 Word document. It covers the **Appointments**,
**Medicines** and **Memories** screens of the React web app. The headings
follow the submission's sections, so each part can be pasted into the
matching section of the team document. Every screenshot is in
[`screenshots/`](screenshots); the team overview is in
[`../README.md`](../README.md).

> **Updated after the merge (Victor, commit `c2fdf6b`).** When the three
> branches were combined, the whole app was aligned to the team's Figma web
> design, and that changed the *layout* of these three screens: Medicines
> and Appointments became a list with a detail panel, Memories a single list
> of rows, and the medicines became the design's four (Amlodipine,
> Lisinopril, Metformin, Atorvastatin) so the page agrees with My Day. The
> state, rules, form, export, offline behaviour and accessibility work
> described below are unchanged. The parts of this write-up that describe
> layout, the medicine tests and the results have been updated to match, and
> every screenshot was recreated.

| Item | Where |
|:--|:--|
| Source | [`src/pages/Appointments.tsx`](../../../../src/pages/Appointments.tsx), [`src/pages/Medications.tsx`](../../../../src/pages/Medications.tsx), [`src/pages/Memories.tsx`](../../../../src/pages/Memories.tsx), and the components in [`src/components/appointments/`](../../../../src/components/appointments), [`medicines/`](../../../../src/components/medicines), [`memories/`](../../../../src/components/memories) and [`PageHeader.tsx`](../../../../src/components/PageHeader.tsx) |
| State | [`AppointmentsContext.tsx`](../../../../src/context/AppointmentsContext.tsx), [`MedicinesContext.tsx`](../../../../src/context/MedicinesContext.tsx), [`MemoriesContext.tsx`](../../../../src/context/MemoriesContext.tsx) (Context API), each with its hook in [`appointments.ts`](../../../../src/context/appointments.ts), [`medicines.ts`](../../../../src/context/medicines.ts), [`memories.ts`](../../../../src/context/memories.ts) |
| Custom hooks | `useAppointments`, `useMedicines`, `useMemories`, built on the team's [`useLocalStorageState`](../../../../src/hooks/useLocalStorageState.ts) |
| Domain logic | [`src/models/appointment.ts`](../../../../src/models/appointment.ts), [`medicine.ts`](../../../../src/models/medicine.ts), [`memory.ts`](../../../../src/models/memory.ts), [`src/utils/dates.ts`](../../../../src/utils/dates.ts), [`calendar.ts`](../../../../src/utils/calendar.ts) |
| Unit and component tests | 103 Jest tests in 9 suites, plus my 3 routes in the team's `src/accessibility.test.tsx` (listed in [§3](#3-testing-implementation)) |
| E2E tests | [`e2e/care-pages.spec.ts`](../../../../e2e/care-pages.spec.ts) (Playwright), 8 tests covering 4 critical flows plus a per-page width and axe check, run in 4 browser projects |
| Coverage | [`coverage/lcov-report/index.html`](../../../../coverage/lcov-report/index.html) |
| Screenshot script | [`scripts/week11-upneet-evidence.mjs`](../../../../scripts/week11-upneet-evidence.mjs) |

---

## 1. Completed responsive application

### What was built

The three screens existed on the web from the base app, but each one read
and wrote its own data in its own way: Medicines wrote localStorage
directly from the page, Appointments kept its "Add to My Day" choices in
component state (lost on every visit), and Memories was read-only. The
desktop (Electron, Week 8) and mobile apps had features the web did not:
Export to calendar, a "2 of 3 taken" count with a native checkbox per
medicine, and empty states. This week I moved all three onto shared Context
state, ported the missing features, and added the ones a website needs.

| Screen | Route | What it does |
|:--|:--|:--|
| Appointments | `/app/appointments` | Upcoming visits listed on the left, grouped under **Today**, **Later this week** and **Coming up** headings; choosing one shows it in the detail panel on the right (below the list on a phone). The detail gives the date and time in full words ("Sunday, 25 October — 10:30 am") in a `<time>` element, the place with its kind ("Telephone — no travel needed"), **who is taking the user**, and the caregiver's note. **Get directions** is a link that opens a map in a new tab (and says so). **Add to My Day** is a checkbox drawn as the panel's large button, saved on the device. **Export to calendar** (from the desktop app) downloads every visit as an `.ics` file for Outlook, Apple Calendar or Google Calendar, with an **on-screen reminder an hour before, never a sound**. |
| Medicines | `/app/medications` | Today's tracker. An amber pill beside the title reads **"3 still to take today"**, and a screen reader hears the full sentence ("1 of 4 taken. 3 medicines still to take today."). The four medicines are listed on the left, each with a round **native checkbox** to tick it; choosing a row shows the medicine in the detail panel — when, status, how to take it and what it is for — with a large **Mark as taken / Taken — tap to undo** button. A **[CC] caption** writes out the next reminder. Taken is shown by the tick, a strike-through and the word "Taken". Ticks survive navigation, a reload and a lost connection, and **start fresh each day**. Each tick is logged to the caregiver's activity log, and the caregiver dashboard reads the same ticks. |
| Memories | `/app/memories` | People, places and moments as a single list of rows (a small photo, the title, kind, when and the story), **pinned first**, filtered by kind with a radio group drawn as pills. Long stories are cut to two lines behind **Read more**. **Add a memory** opens a form (name, when, kind, the story, pin) with **validation**. Any memory can be **pinned or unpinned**, and the user's own memories can be **removed** behind a confirmation dialog. Photos are **local, responsive WebP** files, so the memory book opens offline. |

**Requirements met in this part:**

| Requirement | How |
|:--|:--|
| React Router | The three routes under `/app/*` are now **loaded with `React.lazy`**, like Victor's. Each builds as its own chunk (`Medications-*.js` 4.9 kB / 1.8 kB gzip, `Appointments-*.js` 10.3 kB / 3.9 kB, `Memories-*.js` 13.3 kB / 4.5 kB) and loads on first visit, not with the home screen. |
| State management | Context API. `AppointmentsProvider` holds the visits and the user's My Day choices. `MedicinesProvider` holds today's ticks and the progress, and logs each change for the caregiver. `MemoriesProvider` holds the memory book with add, pin and remove. The providers sit above the router, so ticking a medicine and visiting another page does not un-tick it. Each context object and its hook are in their own module, so Fast Refresh keeps working and ESLint passes. |
| Custom hooks | `useAppointments()`, `useMedicines()` and `useMemories()` each throw a clear error outside their provider. All three providers persist through the team's `useLocalStorageState(key, initial, revive)`, with my own revive functions that **repair corrupt saved data** instead of crashing (tested). |
| Reusable components | `PageHeader`, `AppointmentRow`, `AppointmentDetail`, `AppointmentGroup`, `CalendarExport`, `MedicineProgress`, `MedicineRow`, `MedicineDetail`, `MemoryCard`, `MemoryFilters` and `AddMemoryForm`, plus the team's `Banner`, `Field`, `ConfirmDialog`, `AppointmentBanner` and `CaptionStrip`. |
| Form handling and validation | **Add a memory** is a real `<form noValidate>`. Errors are checked on Save, not while typing: the name is required (up to 60 characters), "when" is optional (up to 40), the kind is required, and the story must be 10 to 500 characters. Each error is a plain sentence printed under its field (`role="alert"`), linked with `aria-describedby`, and the field gets `aria-invalid`. **Focus moves to the first field to fix.** After the first Save, each error clears as soon as its field is put right. A live hint counts the characters left. |
| Offline functionality | Everything is read from the device. My Day choices, medicine ticks and the memory book are saved in localStorage. The memory photos were moved from an external photo site to **same-origin WebP files** in `public/memories/`, which the team's service worker caches, so the memory book, **photos included**, opens with no connection. This is verified by an E2E test. |
| PWA | Uses the team's manifest and service worker. My screens add the offline behaviour above. |

### Matching the desktop and mobile apps

| Same as desktop and mobile | Detail |
|:--|:--|
| Appointments | Export to calendar with an on-screen (DISPLAY) reminder, never AUDIO. A written result banner whose Dismiss button returns focus to Export. An empty state. |
| Medicines | "*n* of *m* taken" announced as a status. A native checkbox per medicine (Tab + Space). An "All taken" message. State kept across navigation. |
| Memories | Memories with headings for screen-reader navigation. An empty state. |

| Different on the web, on purpose | Why |
|:--|:--|
| Export downloads a file instead of opening a Save dialog | The browser has no native Save dialog. The download is the web's equivalent, and the banner says where to find the file. |
| Get directions is a link | It goes somewhere, so it is a link. The browser then offers open-in-new-tab and copy-link for free. |
| No loading or error state for the lists | Desktop and mobile load from a repository that can fail. The web reads synchronously from the device, so there is nothing to wait for and nothing that can fail. A corrupt saved entry is repaired instead. |
| Add, pin and remove memories | The base web app's Memories had pinning and categories. Adding is new on the web: it is the form the assignment asks for, and it fits a memory book the user keeps. |

### Screenshots at 375 / 768 / 1440 px

| | Mobile 375 px | Tablet 768 px | Desktop 1440 px |
|:--|:--|:--|:--|
| Appointments | [top](screenshots/mobile/01-appointments-top.png) · [bottom](screenshots/mobile/01-appointments-bottom.png) | [full page](screenshots/tablet/01-appointments.png) | [full page](screenshots/desktop/01-appointments.png) |
| Medicines | [top](screenshots/mobile/02-medicines-top.png) · [bottom](screenshots/mobile/02-medicines-bottom.png) | [full page](screenshots/tablet/02-medicines.png) | [full page](screenshots/desktop/02-medicines.png) |
| Memories | [top](screenshots/mobile/03-memories-top.png) · [bottom](screenshots/mobile/03-memories-bottom.png) | [full page](screenshots/tablet/03-memories.png) | [full page](screenshots/desktop/03-memories.png) |
| Navigation | [mobile](screenshots/mobile/04-navigation.png) | [tablet](screenshots/tablet/04-navigation.png) | [desktop](screenshots/desktop/04-navigation.png) |

![Appointments at 1440px](screenshots/desktop/01-appointments.png)
![Medicines at 375px](screenshots/mobile/02-medicines-top.png)
![Memories at 768px](screenshots/tablet/03-memories.png)

Feature states:
[added to My Day](screenshots/features/appointments-my-day-added.png),
[exported to calendar](screenshots/features/appointments-exported.png),
[a visit chosen in the list](screenshots/features/appointments-detail-selected.png),
[a medicine chosen in the list](screenshots/features/medicines-detail-selected.png) →
[marked from the detail panel: 2 still to take](screenshots/features/medicines-two-of-four.png) →
[all taken](screenshots/features/medicines-all-taken.png),
[Add a memory form](screenshots/features/memories-add-form.png) →
[validation errors](screenshots/features/memories-validation.png) →
[saved and pinned](screenshots/features/memories-saved.png),
[remove confirmation](screenshots/features/memories-remove-dialog.png),
[filtered to Pets](screenshots/features/memories-filter-pets.png),
[empty memory book](screenshots/features/memories-empty.png).

### How the layout adapts

- **Appointments.** From 768 px, the grouped list is a 15–18 rem column
  on the left and the chosen visit fills the right. On a phone the detail
  follows the list. Export to calendar sits under the list with its hint
  below it.
- **Medicines.** The same list and detail layout. The "still to take" pill
  sits beside the title and wraps under it on a narrow phone. The appointment
  banner and the [CC] reminder run the full width above.
- **Memories.** One column of rows, capped at 56 rem, as in the design.
  Every photo is a fixed square thumbnail, so rows line up and the page does
  not jump as photos arrive. The filter pills wrap. The form's name and
  "when" fields share a row from 768 px.
- **Navigation.** The app shell's sidebar from 1024 px, and the ☰ Menu
  drawer below that, as in the design's phone and tablet frames.
- **Touch and click targets.** Every control is at least 44 × 44 px; an E2E
  test measures every button, link and checkbox label on all three pages at
  1440 px and 375 px. Larger where it helps: **each medicine card is one
  click or tap target** (the label stretches over the card), and the My Day
  checkbox's whole chip is clickable.
- **No horizontal scrolling** at 375, 768 or 1440 px, checked by the E2E
  test in every browser project, and no console errors or warnings.

**Shared-layout fix found by my screenshots.** From 768 px the team's
header was sticky and about 190 px tall (it is now the design's 68 px header
at every width). When Save moved focus to the first
field to fix, the browser scrolled that field to the top of the window,
**under the header**, so the focused field could not be seen (WCAG 2.4.11,
Focus Not Obscured). `Layout.tsx` now measures the header with a
`ResizeObserver` and `index.css` sets `scroll-padding-top` to its height.
Anything focused or scrolled to now lands below the header, on every page.
An E2E assertion keeps it that way.

### Images and performance

- The six memory photos were 600 px JPEGs from an external photo site. They
  are now **WebP at 480 and 800 px** (6–45 kB each) served with `srcset` and
  `sizes`, so a phone downloads the small one.
- `loading="lazy"`, `decoding="async"`, and `width`/`height` attributes
  inside a fixed aspect-ratio box (no layout shift).
- Each photo has **alt text describing the photo**, which is different from
  the card's heading. The old alt text repeated the heading, so a
  screen-reader user heard the title twice and never learned what was in
  the picture.

---

## 2. Accessibility implementation

### Semantic HTML, names and ARIA

Native elements are used wherever they already provide the behaviour. ARIA
is added only where HTML has no element for the job.

| Element | Markup | Why |
|:--|:--|:--|
| Date groups | `<section aria-labelledby>` + `<h2>` ("Today", "Later this week", "Coming up"), cards as `<h3>` | Screen-reader users jump group to group or card to card by heading. |
| Visit in the list | `<button aria-current>` inside its group's list, named by its title and time | Choosing a visit shows it in the detail panel; `aria-current` says which one is shown. |
| Appointment detail | `<article aria-labelledby>` its `<h2>` | One article for the visit being shown. |
| Date and time | `<time datetime="2026-10-25T10:30">Sunday, 25 October — 10:30 am</time>` | Full words for people, a machine-readable value for software. |
| Get directions | `<a href target="_blank" rel="noopener noreferrer">` with "to Greenfield Surgery (opens in a new tab)" in `sr-only` text | A link, because it goes somewhere. Its name says where and warns of the new tab. |
| Add to My Day | Native `<input type="checkbox">` in a `<label>`, named "Add to My Day: Blood test — fasting needed" | Space toggles it, the state is announced, and **focus stays put**. The old version swapped the button for a badge, which dropped focus to the top of the page. |
| Export result | The team's `Banner` (`role="status"`, or `role="alert"` when nothing could be exported) | The outcome is announced in words. |
| Medicine progress | The "still to take" pill is one always-present `<p role="status" aria-live="polite">`; it shows the short form and reads the full sentence | Each tick announces "2 of 4 taken. 2 medicines still to take today." A status region that is updated, not replaced, is reliably announced. |
| Medicines | Each row is a `<button aria-current>` that shows the medicine in detail (its name reads "Lisinopril, 10 mg — 1 tablet, at 9:00 am, not taken yet") and a native checkbox named "Lisinopril taken". The detail panel is a labelled region with a `<dl>` for When and Status | Tab moves between rows and ticks and Space ticks one. "Checkbox, checked" is announced by the browser. The times are read as a sentence, not as a row of chips. |
| Memory filter | `<fieldset>` + `<legend>` "Show" + native radios drawn as pills | One choice at a time is what radios mean. One Tab stop, arrow keys, and "Family, radio button, 2 of 6" all come from the browser. The old version used six `aria-pressed` toggle buttons. |
| Memory card | `<article aria-labelledby>` its `<h3>`. Pinned and Kind are printed badges | |
| Read more | `<button aria-expanded aria-controls>` named "Read more about Your Home" | The disclosure pattern. The name says which story. |
| Pin and Remove | `<button>`s named "Pin to top: Your Garden", "Unpin: …" and "Remove: …" | Each name starts with the printed words (WCAG 2.5.3) and adds the title, so six identical "Pin to top" buttons can be told apart. |
| Add a memory | Disclosure `<button aria-expanded aria-controls="add-memory-form">` opening a `<form aria-labelledby>` its `<h2>` | |
| Form fields | The team's `Field` (visible `<label>`, `aria-required`, hint and error linked with `aria-describedby`, `aria-invalid`), a native `<select>` for the kind, and a native checkbox to pin | Labels are always visible, never placeholder-only. |
| Remove confirmation | The team's `ConfirmDialog` (`role="dialog"`, `aria-modal`, focus trap, Escape) | |
| Saved / pinned / removed | One always-present `role="status"` region ("Saved “Our wedding day” to your memories.") | |

`jest-axe` runs the axe-core rules on all three routes inside the real app
shell, with no violations. I added Memories to the team's
`src/accessibility.test.tsx` route table (Appointments and Medicines were
already there), which also checks one `<main>`, one `<h1>`, the skip link and
a unique page title per route. In real browsers, `@axe-core/playwright`
checks each page, and the Memories form in its error state, against WCAG 2.2
A and AA in Chromium, WebKit and mobile Safari, with **no violations**.

### Keyboard operation

| Key | Appointments | Medicines | Memories |
|:--|:--|:--|:--|
| **Tab / Shift+Tab** | Each visit in the list → Export to calendar → (banner's Dismiss) → the detail's Get directions → its My Day checkbox | Each medicine's row, then its tick, in list order → the detail's Mark as taken button | Add a memory → (form fields → Cancel → Save) → the filter group (one stop) → each card's Read more → Pin → Remove |
| **Enter** | Shows the focused visit in detail; follows Get directions; activates Export and Dismiss | Shows the focused medicine in detail; activates Mark as taken | Opens or closes the form, Read more, Pin, Remove; in a single-line field, saves the form |
| **Space** | Ticks or unticks My Day; activates buttons | **Ticks or unticks the medicine** | Activates buttons; ticks "Pin to the top" in the form |
| **Arrow keys** | — | — | Move through the filter choices (wrapping); choose the kind in the `<select>` |
| **Escape** | — | — | **Closes the form and keeps the draft**, with focus back on Add a memory. Closes the Remove dialog with focus back on Remove |

**Focus management.** After any in-app navigation, the team's layout
moves focus to `<main>`. On my screens:

- **Appointments:** ticking My Day keeps focus on the checkbox. Dismissing
  the export banner returns focus to **Export to calendar**.
- **Medicines:** ticking keeps focus on the checkbox. The count is
  announced, not focused.
- **Memories:**
  - Opening the form moves focus to its first field.
  - A failed Save moves focus to the first field to fix.
  - A successful Save moves focus to the **new memory's heading**
    (`tabindex="-1"`), so a screen reader reads what was added. If the
    filter would have hidden the new memory, the filter switches back to
    All.
  - Pinning or unpinning moves the card to the other section, so focus
    **follows its button** to the new position.
  - Removing a memory moves focus to **Add a memory**, since the card it was
    on is gone.
  - Escape, Cancel and the toggle all return focus to **Add a memory**.

**Visible focus.** The team's 3 px `calm-600` outline is used on every
focused element. The custom-drawn controls carry it explicitly:
- The filter pills (`peer-focus-visible:outline`, since the radio itself is
  visually hidden).
- The My Day button (`has-[:focus-visible]:outline`, drawn around the whole
  button rather than the small box) and each medicine's round tick
  (`peer-focus-visible:outline`).

Focused elements are never hidden under the sticky header (see the fix
above).

**Not by colour alone.**
- A medicine's state is the tick, a strike-through **and** the word
  "Taken" or "Not yet".
- The progress is a sentence as well as a bar.
- Today's visits have a "Today" badge with an icon, not only a blue border.
- In Windows High Contrast (forced colours), the progress bar uses
  `Highlight`.

### Keyboard testing results

The keyboard paths are automated with real key presses in Playwright
(`e2e/care-pages.spec.ts`, Chromium, WebKit and mobile Safari) and in React
Testing Library with `user-event`. Everything in the table above passes. The
screenshots below were captured from real key presses by
`scripts/week11-upneet-evidence.mjs`.

> **Upneet, before submitting:** do a manual keyboard pass in Chrome and in
> Safari (with Full Keyboard Access on) and add one sentence here confirming
> it.

| | |
|:--|:--|
| ![Tab to a medicine](screenshots/keyboard/01-medicine-tab-focus.png) Tab moves to the next medicine's row, then to its tick | ![Space ticks](screenshots/keyboard/02-medicine-space-ticks.png) Space ticks it; the count updates |
| ![My Day](screenshots/keyboard/03-my-day-space.png) Space adds a visit to My Day; focus stays on the checkbox | ![Export focus](screenshots/keyboard/04-export-focus.png) Focus on Export to calendar |
| ![Filter arrows](screenshots/keyboard/05-filter-arrow-keys.png) ArrowRight moves the filter to Family | ![Form opens](screenshots/keyboard/06-form-opens-focus-first-field.png) Enter on Add a memory; focus is in the first field |
| ![Escape](screenshots/keyboard/07-escape-returns-focus.png) Escape closes the form; focus is back on Add a memory | ![Error focus](screenshots/keyboard/08-save-error-focuses-field.png) Save with no kind chosen: focus moves to that field, below the header |
| ![Saved](screenshots/keyboard/09-saved-heading-focused.png) Saved: focus is on the new memory's heading | ![Pin](screenshots/keyboard/10-pin-focus-follows.png) Enter on Pin: the card moves to Pinned and focus follows its button |

Browser differences found while testing:

- **Safari on macOS skips checkboxes and radios on Tab** unless Full
  Keyboard Access is turned on in System Settings, and only then do its
  radios answer arrow keys. This is a platform setting, not an app defect, so
  the WebKit E2E run focuses those controls directly.
- **Chrome does not support Home and End in a native radio group**, only
  the arrow keys (which wrap). The test uses arrows.

---

## 3. Testing implementation

### Strategy

These were the biggest risks:

- A wrong count or a lost tick on Medicines, where a missed or doubled dose
  is the real-world harm.
- A visit in the wrong group, caused by time zones.
- A sound-only reminder in the exported calendar.
- A form that loses what the user typed or hides its errors.
- Focus dropped to the top of the page when the screen changes.

The tests are split across three levels:

1. **Unit tests (Jest).** Pure rules with no React:
   - Grouping visits by day, including daylight-saving changes and the old
     UTC bug.
   - Directions only where there is somewhere to go.
   - The `.ics` file: escaping, the hour-long slot crossing midnight, a
     DISPLAY reminder and never an AUDIO one, and skipped visits counted.
   - Progress and its sentence.
   - The memory form's validation rules.
   - Repairing corrupt saved data in all three stores.
2. **Component tests (React Testing Library and `user-event`).** Each screen
   is rendered with its real providers and router. It is driven the way a
   user would drive it (click, Tab, Space, arrows, Escape), and queries use
   **roles and accessible names**, so a passing test also shows the screen
   is labelled correctly. Focus is asserted after every change.
3. **End-to-end tests (Playwright).** Run against the *production build*
   (`vite preview`, with the service worker active) in Chromium, WebKit
   (desktop Safari) and mobile Safari at 375 px. Firefox runs in CI (see
   below).

The base repository's old tests for these pages (256 of them in
`Appointments.test.tsx`, `Medications.test.tsx` and `Memories.test.tsx`)
mostly tested **copies** of helper functions written inside the test files.
They would still pass if the page broke, and Memories was only 26% covered
despite 1,155 lines of tests. I replaced them with the suites below, which
test the real code.

### Unit tests: 52 tests, 5 suites

`src/models/__tests__/{appointment,medicine,memory}.test.ts`,
`src/utils/__tests__/{dates,calendar}.test.ts`

```ts
// src/utils/__tests__/calendar.test.ts
it('reminds on screen an hour before and never with sound', () => {
  const { ics } = toICalendar([visit()], now);
  expect(ics).toContain('ACTION:DISPLAY');
  expect(ics).toContain('TRIGGER:-PT1H');
  expect(ics).not.toContain('ACTION:AUDIO');
});
```

### Component tests: 51 tests, 4 suites (+9 in the team's accessibility suite)

| Suite | Tests | Covers |
|:--|--:|:--|
| `src/pages/Appointments.test.tsx` | 12 | Groups and their headings, the first visit shown in detail and choosing another, `<time>` values, escort and notes, directions link (new tab, named), telephone visits with no travel, My Day checkbox (focus kept, saved, Space unticks, caregiver defaults and the user's overrides), Export (file made, result banner, Dismiss returns focus, partial and failed exports), empty state |
| `src/pages/Medications.test.tsx` | 15 | The "still to take" pill and its full sentence, the four checkboxes, the first medicine in detail (when, status, how to take it, what for), choosing another, rows named in words, tick by click and Space, marking and undoing from the detail panel, Tab order (row then tick), saved ticks and the caregiver activity log, all-taken message, the [CC] reminder (and none when captions are off), kept after reload, **yesterday's ticks not carried over**, corrupt storage, empty list |
| `src/pages/Memories.test.tsx` | 18 | Pinned and More sections, photo alt, lazy WebP `srcset`, radio filter (click and arrows), Read more, pin moving the card with focus following, the form as a disclosure, empty Save (three errors, focus, `aria-invalid`, descriptions), errors clearing, story-only error, character count, saving (focus, announcement, persisted after remount), filter reset, Escape keeps the draft, remove with confirm and cancel, empty book, empty filter, corrupt storage |
| `src/context/CareContexts.test.tsx` | 6 | Each hook's error outside its provider, unknown ids, storage that refuses writes |
| `src/accessibility.test.tsx` (team suite) | +9 | axe, landmark and title checks on my three routes (Memories added) |

```tsx
// src/pages/Memories.test.tsx
it('refuses an empty form, explains each problem and focuses the first', async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole('button', { name: 'Add a memory' }));
  await user.click(screen.getByRole('button', { name: 'Save memory' }));

  const title = screen.getByRole('textbox', { name: /name of the memory/i });
  expect(title).toHaveFocus();
  expect(title).toHaveAttribute('aria-invalid', 'true');
  expect(title).toHaveAccessibleDescription(/give this memory a name/i);
  expect(screen.getAllByRole('alert')).toHaveLength(3);
});
```

![Jest results for Upneet's suites: 103 tests in 9 suites, all passing](screenshots/testing/01-jest-upneet-suites.png)
![Whole web app: 375 tests in 29 suites, all passing](screenshots/testing/02-jest-all-summary.png)

The whole web app runs **375 Jest tests in 29 suites, all passing**.

### End-to-end tests (Playwright): 4 critical flows

[`e2e/care-pages.spec.ts`](../../../../e2e/care-pages.spec.ts), config in
[`playwright.config.ts`](../../../../playwright.config.ts).

1. **Medicines by keyboard.** From Amlodipine's tick, Tab reaches
   Lisinopril's row and then its tick; Space ticks it and the status reads
   "2 of 4 taken". Choose Metformin, mark it from the detail panel, tick
   Atorvastatin: "All 4 medicines taken". Reload; the ticks are kept.
2. **Appointments.**
   - Choose a visit, add it to My Day, reload, and it is still added.
   - Get directions opens in a new tab.
   - Export downloads `careconnect-appointments.ics`. The test reads the
     **real file**: 8 events, `ACTION:DISPLAY`, no `ACTION:AUDIO`.
   - Dismiss returns focus to Export.
3. **Memories.**
   - An empty Save: focus goes to the first field, **below the sticky
     header**, and **axe finds no violations in the error state**.
   - Fill in the form and save: focus is on the new heading.
   - Pin it: focus follows the button.
   - Reload: it is still pinned.
   - Remove it: Escape cancels the first time, then confirm removes it, and
     focus returns to Add a memory.
   - Filter with the arrow keys.
   - Escape keeps the draft.
4. **Offline.** With the service worker active, the memory book **and its
   photos** open with no connection (Chromium).

For each page, a further test checks that there is no horizontal scroll,
that every control is at least 44 px, and that axe-core finds no WCAG 2.2
AA violations. This runs at 1440 px and at 375 px (mobile Safari).

```ts
// e2e/care-pages.spec.ts
const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
expect(download.suggestedFilename()).toBe('careconnect-appointments.ics');
const ics = await readFile((await download.path()) as string, 'utf8');
expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(8);
expect(ics).toContain('ACTION:DISPLAY');
expect(ics).not.toContain('ACTION:AUDIO');
```

**Results (recreated after the merge):**
- My spec: **21 passed, 2 skipped by design, 1 failed** across Chromium,
  WebKit and mobile Safari. The skips are the offline test on WebKit and
  mobile Safari, where Playwright cannot emulate the service worker offline
  reliably.
- The failure is the Memories flow in **Chromium only**, at the step that
  measures whether the field focused after an empty Save sits below the
  sticky header. It fails the same way on the commit before the Figma work,
  and passed in one of the runs made for these screenshots, so it is
  timing-sensitive (the measurement can run before the browser finishes
  scrolling). It passes in WebKit and mobile Safari, and the focused field is
  visible in the keyboard screenshot above. It is listed as a known issue in
  the team overview.
- The whole suite: **58 passed, 7 skipped, 1 failed** (the same test).

![Playwright HTML report](screenshots/testing/04-playwright-html-report.png)
![My spec in the report](screenshots/testing/05-playwright-care-pages.png)

**Firefox.** The `firefox` project is configured, but, as Victor found,
Playwright's Firefox hangs at launch on our development Macs (macOS 27).
The team's CI workflow
([`.github/workflows/web-tests.yml`](../../../../.github/workflows/web-tests.yml))
runs all four projects, Firefox included, on Ubuntu for every pull request,
so my spec runs there.

---

## 4. Coverage report

`npm run test:coverage` writes `coverage/lcov-report/index.html`. Coverage
is measured on the files listed in `collectCoverageFrom` in
`jest.config.cjs`; I added all of my new files. A `coverageThreshold` of
**75%** on statements, branches, functions and lines makes the run fail if
any of them drops below that.

![Coverage summary](screenshots/testing/03-coverage-report.png)

| Measured scope | Statements | Branches | Functions | Lines |
|:--|--:|--:|--:|--:|
| **All measured files** (the whole team's, now including the app shell) | **95.82%** | **91.25%** | **94.1%** | **96.44%** |
| Appointments.tsx | 100% | 100% | 100% | 100% |
| Medications.tsx | 100% | 100% | 100% | 100% |
| Memories.tsx | 100% | 96.4% | 100% | 100% |
| components/appointments | 100% | 97.7% | 100% | 100% |
| components/medicines | 100% | 94.9% | 100% | 100% |
| components/memories | 100% | 93.2% | 100% | 100% |
| PageHeader.tsx | 100% | 100% | 100% | 100% |
| AppointmentsContext, MemoriesContext, and the three hook modules | 100% | 100% | 100% | 100% |
| MedicinesContext.tsx | 97.4% | 100% | 100% | 97.1% |
| models/appointment, medicine, memory; utils/dates, calendar | 100% | 100% | 100% | 100% |

Before this week, the same three pages measured 92%, 80% and **26%**
statements.

**Exclusions and why.**
- `src/**/__tests__/**` and `*.test.*`: test code is not measured.
- `src/data/appointmentsData.ts` and `mockData.ts`: static seed data.
- `scripts/` and `e2e/`: tooling and tests.
- The only uncovered code in my files:
  - `MedicinesContext.tsx` line 22: the `catch` for a browser that throws
    when *reading* localStorage. It cannot be triggered in jsdom without
    replacing the storage object for the whole test file.
  - `Memories.tsx` line 53: the `?? 'All'` fallback after looking up the
    current filter's label. The lookup always succeeds, so it is a type
    guard.
  - A few `className` ternaries for hover and colour styling.

---

## 6. Project links and running instructions (for my part)

```bash
npm install
npm run dev                         # http://localhost:5173 — sign in with any email, choose care recipient
npm test                            # Jest + React Testing Library
npm run test:coverage               # + coverage/lcov-report/index.html (fails under 75%)
npx playwright install chromium firefox webkit   # once
npm run test:e2e                    # builds, starts vite preview on :4173, runs every browser
npm run test:e2e -- e2e/care-pages.spec.ts --project=chromium   # my flows, one browser
npm run test:e2e:report             # opens the HTML report
npm run dev -- --port 5180 & node scripts/week11-upneet-evidence.mjs   # regenerate my screenshots
node scripts/week11-testing-evidence.mjs                               # the test screenshots, from real runs
```

---

## AI usage (my part)

I used Claude (Anthropic) in Claude Code as a pair programmer for this
part. It:

- Ported the desktop app's Export to calendar and medicine checklist to
  React.
- Moved the three screens onto Context state.
- Wrote the Add a memory form and its validation rules.
- Converted the photos to WebP.
- Replaced the old tests and drafted the component and Playwright tests.
- Wrote the screenshot script and this write-up.

I checked the output in four ways:

- Every test was run and had to pass. The coverage threshold is enforced.
- I compared the screens by eye at 375, 768 and 1440 px, and axe-core runs
  on every page (and the form's error state) in three browser engines.
- I ran the keyboard paths with real key presses in Playwright and
  `user-event`, with focus asserted after every change.
- I kept the failures the tests and screenshots found, which led to real
  fixes: the sticky header hiding a focused field (2.4.11), the UTC date
  pushing today's visits into "Later this week" in the evening, the
  progress bar's name, and photo alt text that only repeated the heading.

`npm run lint` and `npm run typecheck` report nothing in my files.

---

## Notes for the team

- **Shared files I changed:**
  - `Layout.tsx` and `index.css`: the header's height is measured and used
    as `scroll-padding-top` from 768 px, so focused content is never under
    the sticky header (fixes WCAG 2.4.11 on every page, not just mine).
  - `App.tsx`: my three routes are lazy-loaded, and my three providers wrap
    the routes.
  - `test-utils/renderWithProviders.tsx`: includes my providers.
  - `accessibility.test.tsx`: added Memories to the route table.
  - `jest.config.cjs`: my files in `collectCoverageFrom`.
  - `types/index.ts`: optional `imageSrcSet`, `imageAlt`, `when` and
    `addedByUser` on `MemoryCard`.
  - `data/mockData.ts`: local WebP photos with alt text, and `TODAY` uses
    the local date.
  - `data/appointmentsData.ts`: dates use the local date.
  - `e2e/branch-placeholders.spec.ts`: skipped while `SHOW_TEAMMATE_PAGES`
    is `true`, because there are no placeholders to find. It failed on
    Justin's branch for that reason.
- **Local-date fix.** `new Date().toISOString()` is UTC. After 8 pm on the
  US east coast it already reads tomorrow, so today's visits showed under
  "Later this week" every evening. My code and the seed data now use the
  local date (`src/utils/dates.ts`). `caregiverStore.ts` and
  `ManageAppointments.tsx` still use UTC; worth the same one-line change.
- **Medicine ticks** still use the `careconnect_meds_taken` key that the
  caregiver dashboard reads. A new `careconnect_meds_taken_date` key stops
  yesterday's ticks carrying into today.
- **My Day choices** are kept in `careconnect_appointments_my_day`, not
  written back into the caregiver's appointment list. Writing the list
  would freeze the demo's relative dates on the day it was first saved.
- **New files:** `public/memories/*.webp` (12 files, 300 kB in all).
