# Web Accessibility Documentation — CareConnect web app

**SWEN 661 Team 2 (The Acuity Health Group) — Assignment 10, Part 2.**
The React web app at the repository root (Vite, React Router 7, Tailwind), targeting
**WCAG 2.1 Level AA**, with four Level AAA criteria also met (§10), at the three web breakpoints: mobile 320–767px, tablet
768–1023px, desktop 1024px and up.

This document describes the semantic HTML, ARIA landmarks, skip links, form
accessibility, keyboard and focus management, and screen-reader considerations
the web app uses, and the component-by-component rules the team follows as the
React implementation grows. Every rule is taken from the current source and was
checked against the running app (§8); file references let a reviewer trace each
claim.

> **Updated for Week 11 (27 October 2026).** The app shell was rebuilt to
> the team's Figma web design (header with search, CC, high contrast,
> shortcuts and the account menu; a sidebar from 1024 px; a ☰ Menu drawer
> below that; a status bar). The sections that describe the shell, the
> landmarks, the breakpoints and the component reference now describe that
> shell, and the audit and structure report were re-run on it. The
> Assignment 10 audit history in §8 is kept.

| Evidence | Where |
|:--|:--|
| Automated audit — 115 scans, 0 violations, 104/104 keyboard & structure checks; every route also scanned in high-contrast mode with axe's AAA rules (29 October 2026) | [`audit/axe-results.png`](audit/axe-results.png), [`audit/report.html`](audit/report.html) |
| Lighthouse accessibility — 100 on all 17 routes, mobile and desktop (34/34 runs) | [`lighthouse/summary.md`](lighthouse/summary.md) |
| WCAG 2.1 AAA criteria met, with evidence | [§10](#10-beyond-aa--wcag-21-aaa) |
| Audit before the fixes — 71 violations, 5 failed checks | [`audit-before/`](audit-before) |
| Landmarks, heading outline, links and fields of every page, at every breakpoint | [`structure.md`](structure.md) |
| Accessibility tests (77) | [`src/accessibility.test.tsx`](../../../src/accessibility.test.tsx) |
| Earlier project-wide notes (WCAG map, memory-loss design) | [`ACCESSIBILITY.md`](../../../ACCESSIBILITY.md) |

---

## Who this is for

CareConnect serves **care recipients** living with short-term memory loss (often
older, often with low vision or reduced dexterity, sometimes deaf or hard of
hearing) and the **caregivers** who manage their medicines and appointments.
That sets the bar: every screen must be operable with a keyboard or switch device,
must make sense read aloud in order, and must never depend on the user remembering
where they were. Most of the rules below follow from those three requirements.

---

## 1. Semantic HTML structure

**Rule: use the HTML element that already means the thing; add ARIA only where HTML
cannot say it.** A native element brings its role, keyboard behaviour and
accessible-name rules with it, in every browser and screen reader.

### 1.1 Elements and where they are used

| Element | Used for | Where |
|:--|:--|:--|
| `<header>` | The page banner. In the app: ☰ Menu (below 1024px), logo, search, CC, high contrast, keyboard shortcuts, and the avatar with the alerts badge | `Layout.tsx`, `Landing.tsx`, `SignIn.tsx`, `SignUp.tsx`, `RoleChooser.tsx` |
| `<nav>` | Groups of site navigation links only — never a toolbar of actions | App: the sidebar (1024px+) or the same panel inside the Menu drawer (below 1024px) — `src/components/navigation/`. Landing: Sign in / Sign up (`Landing.tsx`) |
| `<main id="main-content" tabindex="-1">` | The one primary content area per page; the skip link's and route-change focus target | Every shell |
| `<footer>` | Landing: copyright and accessibility note. App: the status bar (connection, active alerts, "WCAG 2.2 AA · No sound required") at every width | `Landing.tsx`; `navigation/StatusBar.tsx` |
| `<section aria-label/aria-labelledby>` | A titled part of a page; becomes a named *region* | `Card.tsx` (every card), Today, Appointments date groups, Memories (Pinned / More), dashboard Alerts |
| `<article>` | One self-contained item in a feed or list that makes sense on its own: a schedule entry, a medicine, a memory, a contact, a caregiver note | `Schedule.tsx`, `Medications.tsx`, `Memories.tsx`, `Contacts.tsx`, `Caregiver.tsx` |
| `<aside>` | **Not used.** Nothing in the app is tangential to the main content. The caregiver sidebar is navigation, so it is a `<nav>`, not an `<aside>`. If a "related tips" panel is added, it will be an `<aside aria-label="…">`. | — |
| `<h1>`–`<h3>` | Exactly one `<h1>` per page, then `<h2>` sections, `<h3>` items, no skipped levels | All pages (outlines in [`structure.md`](structure.md)) |
| `<button>` | Anything that **does** something on this page: toggle, open, delete, switch role, send | Everywhere |
| `<a href>` / `<Link>` | Anything that **goes** somewhere: another page, a map, the skip target. There is no `tel:` link anywhere (a test checks): a voice call is the one channel a deaf user cannot rely on | Nav, contacts, alerts list, Get directions |
| `<ul role="list">` / `<ol role="list">` | Lists of items; `role="list"` restores list semantics Safari/VoiceOver drops when CSS removes bullets | Nav items, schedule, medicines, appointments |
| `<form noValidate>`, `<label for>`, `<fieldset>` + `<legend>` | Forms; one visible label per field; groups such as "Schedule times" | `Field.tsx`, Sign in/up, Manage medications/appointments |
| `<time datetime>` | Dates and times machine-readably | Sidebar date and time, schedule and appointment times |

**Buttons vs links.** The test is what happens, not what it looks like: a
"Manage medications" card on the dashboard is a link (it goes to a page) even
though it looks like a button; "Add to My Day" is a button (it changes this
page). Screen readers announce the role, and users choose by it.

### 1.2 Page skeleton

```
<a class="skip-link" href="#main-content">Skip to main content</a>   ← first Tab stop
<header role="banner">  ☰ Menu · logo · search (combobox) · CC · contrast · shortcuts · avatar (account menu)
</header>
<main id="main-content" tabindex="-1" aria-label="Main content">
  <h1>…</h1>
  <section aria-labelledby="…"><h2 id="…">…</h2> … <article>…</article> </section>
</main>
<nav aria-label="Main navigation">  role · greeting · <time> · <ul role="list"> pages </ul> · Settings · alerts
</nav>                                         ← sidebar from 1024px; below that, inside the Menu dialog
<footer role="contentinfo"> connection · active alerts · WCAG note </footer>
```

The navigation comes **after** `<main>` in the source on purpose: a keyboard or
screen-reader user reaches the page's content first and the menu second. CSS
places it visually (the sidebar on the left from 1024px via `order-1`) without
changing that order. Below 1024px the sidebar is `display:none`, which removes it
from the accessibility tree, and the same navigation is rendered only while the
Menu drawer is open — so only one "Main navigation" exists at a time.

### 1.3 How the structure adapts across breakpoints

The landmarks stay the same at every width; only their presentation changes. This
matters because a screen-reader user who learned the page on a phone finds the
same structure on a desktop.

| | Mobile 320–767px | Tablet 768–1023px | Desktop 1024px+ |
|:--|:--|:--|:--|
| Header | ☰ Menu, logo icon, CC, avatar (its name "Margaret, account menu, 5 alerts" read from visually hidden text) | Same | Logo and name, search, CC, high contrast, shortcuts, avatar with the first name shown |
| Navigation (both roles) | **Menu** (`aria-expanded`, `aria-controls="nav-drawer"`) opens a modal drawer holding the navigation, search and high contrast | Same drawer, as in the design's 768px frames | Sidebar, always visible |
| Main content | Single column; list then detail on Medicines and Appointments | List beside detail | Same, wider |
| Footer (`contentinfo`) | The status bar, sticky | Same, plus the WCAG note | Same |

Verified per page and breakpoint in [`structure.md`](structure.md) ("Shown at" column).

---

## 2. ARIA landmarks

Landmarks are the table of contents a screen-reader user jumps through (VoiceOver
rotor → Landmarks; NVDA `D`; JAWS `R`). CareConnect's rules:

| Landmark role | Element | Explicit role kept? | Accessible name | Rule |
|:--|:--|:--|:--|:--|
| `banner` | `<header>` (top level) | `role="banner"` | — | Exactly one per page. A `<header>` inside a `<section>` or `<article>` is not a banner, so card headers never add extra ones. |
| `navigation` | `<nav>` | implicit | "Main navigation" (app), "Account navigation" (landing) | Every `<nav>` is named when a page has, or might have, more than one, so the rotor says which is which. |
| `main` | `<main>` | implicit | "Main content" / page name ("Sign in", "Choose your role") | Exactly one per page; carries `id="main-content"` and `tabindex="-1"`. |
| `contentinfo` | `<footer>` (top level) | `role="contentinfo"` | — | At most one per page. |
| `region` | `<section aria-label>` / `aria-labelledby` | implicit | The section's heading | Only sections with a name become regions; unnamed sections are not landmarks. |
| `dialog` | `ConfirmDialog`, the Menu drawer, the keyboard shortcuts dialog | `role="dialog"` | The heading via `aria-labelledby`, or "Menu" | All modal (`aria-modal="true"`, focus trapped). See §5. |

**Explicit roles on `<header>` and `<footer>`.** `role="banner"` and
`role="contentinfo"` repeat what the elements already mean. They are kept on
purpose: they are harmless, they make the landmark explicit to anyone reading the
source, and they protect against older assistive technology that did not map the
HTML5 elements. They are only ever put on the top-level header and footer.

**What is not a landmark.** Toolbars and button rows inside a page (e.g. the
Edit/Delete row on a medicine card) are not wrapped in `<nav>`; they are actions,
not navigation.

The audit checks every page at desktop width for one `main`, one top-level
`banner` and one `<h1>` (15/15 pass), and axe's landmark rules
(`landmark-one-main`, `landmark-no-duplicate-banner`, `landmark-unique`,
`region`) report no violations at any breakpoint.

---

## 3. Skip links

```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>
…
<main id="main-content" tabIndex={-1} …>
```

```css
.skip-link        { position: absolute; transform: translateY(-150%); … }   /* off-screen */
.skip-link:focus  { transform: translateY(0); }                             /* slides in  */
```

- **First focusable element on every shell** — landing, sign in, sign up, role
  chooser ("Skip to role selection"), and the patient and caregiver app shells.
  Sign in and Sign up had no skip link before this audit; both do now.
- **Visible when focused.** It is moved off-screen, not hidden with `display:none`
  or `visibility:hidden`, so it stays in the tab order and appears at the top-left
  in `calm-700` on white (8.7:1) the moment it receives focus.
- **It moves focus, not just the scroll position.** The target `<main>` has
  `tabindex="-1"`, so following the link puts keyboard focus inside main and the
  next `Tab` lands on the first control in the content. Without `tabindex="-1"`
  some browsers scroll but leave focus at the top.
- **Plain anchor, not a router link.** It is an in-page fragment, so React Router
  does not intercept it and it works before JavaScript has finished loading.
- **No focus ring on `<main>` itself** (`main[tabindex='-1']:focus { outline: none }`):
  main is a landmark, not a control; the next `Tab` shows the ring on a real control.
- **Focus is never moved on page load.** Two components used to steal it — the
  assistant pulled focus to its corner button on the landing page, and the confirm
  dialog focused every page's Delete button — which put the user *past* the skip
  link. Both are fixed (§5.3); the audit checks it.

Verified by the audit (first `Tab` is the skip link and `Enter` focuses `<main>`,
on all four shells) and by tests (`starts with a "Skip to main content" link that targets <main>`, 9 routes).

---

## 4. Form accessibility

All text inputs go through one component, `Field` (`src/components/Field.tsx`),
so the rules below hold on every form; selects use the same pattern
(`SelectField` in `ManageAppointments.tsx`).

### 4.1 Labels

- **Every field has a visible `<label for>`** — never a placeholder-only field.
  Placeholders are examples ("you@example.com"), not labels, because they vanish
  as soon as the user types, which is exactly when someone with short-term memory
  loss needs them.
- **Groups use `<fieldset>` and `<legend>`**: "Schedule times" on the medication
  form, where one requirement covers several inputs.
- **Icons inside fields are decorative** (`aria-hidden="true"`).

### 4.2 Required fields

| Signal | For whom | Markup |
|:--|:--|:--|
| Red `*` after the label | Sighted users | `<span aria-hidden="true">*</span>` |
| "(required)" read with the label | Screen-reader users | `<span class="sr-only">(required)</span>` |
| Required state | Assistive tech and browser | `required` + `aria-required="true"` |

The asterisk is hidden from screen readers so they hear "Email address, required"
rather than "Email address star". The caregiver forms used to put "(required)" in
the label text *as well*, so it was read and shown twice; that is fixed.

### 4.3 Error messages

1. The form uses `noValidate` and validates on submit, so error text is
   CareConnect's own plain-language message, not the browser's tooltip, which
   disappears and cannot be zoomed or styled.
2. Each field in error gets `aria-invalid="true"`, a 2px `alert-500` border **and**
   an inline message directly below it, prefixed by an icon — colour is never the
   only signal.
3. The message is tied to the field with `aria-describedby` (alongside any hint), so
   a screen reader reads "Email address, invalid, Please enter a valid email
   address" when focus reaches the field.
4. A summary at the top of the form ("Please correct the errors below to
   continue.") is `role="alert"`, announced when the form is submitted.
5. Messages say how to fix the problem ("Please enter a valid email address.",
   "At least one scheduled time is required."), not just that something is wrong.
6. Nothing is cleared on error: entered values stay.

### 4.4 Autocomplete

| Field | `autocomplete` |
|:--|:--|
| Your name | `name` |
| Email address | `email` |
| Password (sign in) | `current-password` |
| Password, Confirm password (sign up) | `new-password` |

Autofill reduces typing and recall (WCAG 1.3.5), and lets password managers work.

---

## 5. Keyboard navigation and focus management

### 5.1 Keyboard model

Every interaction uses native elements, so the keys are the ones users already know:

| Key | Does |
|:--|:--|
| `Tab` / `Shift+Tab` | Next / previous control, in reading order: skip link → header → page content → navigation → footer |
| `Enter` | Follow a link; press a button; submit a form from any field |
| `Space` | Press a button or toggle; tick a checkbox |
| `Esc` | Close the confirm dialog, the Menu drawer, the shortcuts dialog or the account menu (focus returns to the button that opened it); clear the search; dismiss the install banner |
| `Ctrl+K` / `⌘K` | Search: focuses the header search on desktop; below 1024px opens the Menu drawer with its search focused |
| `↑` `↓` `Enter` (in search) | Move through the matches and open one |
| Arrow keys | Native only: move within a `<select>`, move the caret in a field, scroll the page |

Shortcuts use a modifier (Ctrl/⌘), so nothing fires when a speech-recognition
user dictates text (WCAG 2.1.4). The one single-key shortcut — "/" jumps to
"Find a contact" — works only while focus is inside the contact list, and never
while typing in a field, which 2.1.4 allows.
The "?" shortcut that briefly opened the shortcuts dialog was removed for this
reason; the header's keyboard button opens it instead.

### 5.2 Focus visibility and order

- **One focus ring for the whole app**: `*:focus-visible { outline: 3px solid #146488; outline-offset: 3px }`
  — 6.5:1 on white. It appears for keyboard focus and not for mouse clicks, and is
  never removed. Verified at every stop by the audit.
- **Targets are at least 44 × 44px** (`min-h/min-w-[2.75rem]`), well above the
  24px WCAG 2.2 minimum; navigation links are 48px tall.
- **Focus order follows the source order** (§1.2); CSS `order` is used only for
  visual placement that keeps content-first reading order.
- **Route changes move focus to `<main>`** (`Layout.tsx`). In a single-page app
  the document never reloads, so without this a keyboard user who chose
  "Medicines" in the sidebar would stay on that link while the content changed
  silently above it. Now focus moves to main, the screen reader announces the new
  page, and the next `Tab` continues from the new content. The window title changes
  too ("Medicines — CareConnect"). It does not happen on the first load, so the
  skip link stays the first stop.
- **Current page** is marked with `aria-current="page"` on the nav link, as well as
  by colour and weight.

### 5.3 Modal dialogs — focus trap management (`ConfirmDialog.tsx`)

Every destructive action (`<Button variant="danger">`: delete a medication, delete
an appointment) asks for confirmation in a modal dialog that follows the WAI-ARIA
modal dialog pattern:

| Step | Behaviour | Implementation |
|:--|:--|:--|
| Name | Announced as "Delete medication, dialog", then its description | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → the `<h2>`, `aria-describedby` → the paragraph; ids unique per instance |
| Open | Focus moves into the dialog, to its first control | `querySelectorAll(TABBABLE)[0].focus()` on open |
| Trap | `Tab` from the last control goes to the first; `Shift+Tab` from the first goes to the last; focus cannot reach the page behind | `keydown` listener on `document` while open |
| Escape | Closes as Cancel | same listener |
| Click outside | Closes as Cancel | backdrop `onClick` when the target is the backdrop itself |
| Close | Focus returns to the button that opened it ("Delete Vitamin D3"), so the user is back where they were | `triggerRef.current.focus()` — **only after the dialog has actually been open** |
| Background | Page does not scroll behind it; dimming overlay hidden from AT | `body { overflow: hidden }`; overlay `aria-hidden="true"` |
| Safe default | The safe action (Cancel) is a full button next to the destructive one; the destructive one says exactly what it does ("Yes, delete") | Button labels per call site |

The "only after" in the Close row is a fix from this audit: the effect also ran on
first render, when the dialog was closed, so loading Manage medications or Manage
appointments focused the first **Delete** button — a keyboard user's first `Enter`
would have opened a delete confirmation.

**The assistant panel is deliberately non-modal** (`ChatBot.tsx`): it does not trap
focus, because the user may want to read the page while chatting. The launcher
exposes `aria-expanded` and `aria-controls`; opening focuses the message input;
`Esc` closes it and returns focus to the launcher. Like the dialog, it used to take
focus on page load; that is fixed.

### 5.4 Toggles and grouped controls

- Marking a task or medicine done is a `<button aria-pressed>`, operated with
  `Space` or `Enter` and reversible at any time. (Its label also changes with the
  state — see §9.)
- The Memories category filter is a `role="group"` named "Filter memories by
  category" of `aria-pressed` buttons. The caregiver note priority picker is the
  same set of `aria-pressed` buttons inside a `<fieldset>` whose `<legend>` is
  "Priority".

---

## 6. Screen-reader considerations

### 6.1 Heading hierarchy

- One `<h1>` per page that says what the page is ("Here's your day, Margaret",
  "My Appointments", "Dashboard").
- `<h2>` for each section, `<h3>` for items in it; no skipped levels. Headings are
  chosen for meaning, then styled; a heading is never picked for its size.
- `Card` takes a `headingLevel` prop so the same component nests correctly wherever
  it is used.
- Fixed in this audit: the appointment date groups ("Today", "Later this week",
  "Coming up") were styled `<span>`s, so the appointment cards' `<h3>`s sat directly
  under the `<h1>`. They are now `<h2>`s.

The outline of every page is in [`structure.md`](structure.md); for example:

```
h1  My Appointments                         h1  Dashboard
  h2  Today                                   h2  Margaret's status today
    h3  Blood pressure check — Dr. Sharma     h2  Alerts
  h2  Later this week                         h2  Recent activity
    h3  …                                     h2  Quick links
  h2  Coming up
```

### 6.2 Meaningful link and button text

- **Links say where they go** out of context, because screen-reader users list
  links on their own (VoiceOver rotor → Links; NVDA `Insert+F7`): "See full day
  schedule", "Manage appointments", "View contacts". No "click here" or "read
  more". The dashboard's "View all" is announced as "View all activity" (visible
  text plus screen-reader-only text).
- **The accessible name contains the visible words, first** (WCAG 2.5.3 Label in
  Name), so a voice-control user can say what they see. 18 controls broke this
  before the audit — for example a link showing "Call my caregiver" was named
  "Call your caregiver: Joyce…", and "Add to My Day" was named 'Add "Blood test" to
  My Day schedule'. Now: "Call my caregiver, Joyce — 07700 900 456", "Add to My Day:
  Blood test". Where the visible text already says everything, the `aria-label`
  was removed instead.
- **Icon-only controls have a name** ("Close dialog", "Dismiss install prompt",
  "Menu", "Close menu", "High contrast", "Keyboard shortcuts"), and every decorative icon is
  `aria-hidden="true"`.
- **Never `aria-label` on a plain `<span>` or `<div>`**: screen readers ignore it.
  Extra context goes in visually hidden text (`.sr-only`) instead — e.g. "In My
  Day — already in your My Day schedule".

### 6.3 Page titles

Every page sets its own `document.title` through `useDocumentTitle`
(`src/hooks/useDocumentTitle.ts`): "Medicines — CareConnect", "Sign in —
CareConnect", "Dashboard — CareConnect". Before this audit every page shared the
title from `index.html`, so the tab, browser history and the screen reader's
announcement were the same everywhere.

### 6.4 Status messages without moving focus

| Message | Markup | Announced |
|:--|:--|:--|
| Confirmations: checked in, saved, added | `Banner` info/success/warning: `role="status"`, `aria-live="polite"`, `aria-atomic="true"` | After the current sentence |
| Blocking errors, form summary | `Banner` error, form summary: `role="alert"` | Immediately |
| "N medicines still to take", schedule all done | `role="status"` | Politely, as the count changes |
| New caregiver alerts | Region "Alerts", `aria-live="polite"` | Each new alert |
| Assistant replies, typing indicator | visually hidden `aria-live="polite"` log; `role="status"` "Assistant is typing" | Each reply |
| Install banner | `role="region"` + `aria-live="polite"` | Once, without taking focus |

### 6.5 Other details

- `<html lang="en">`; dates are formatted with `toLocaleDateString` and also
  exposed as `<time datetime>`.
- Lists keep list semantics after the CSS reset (`role="list"`), so VoiceOver says
  "list, 6 items".
- Colour is never the only signal: statuses carry an icon **and** a word
  ("Done", "Now", "Coming up"); errors carry an icon, a border and text.
- Text contrast is at least 4.5:1 everywhere (see §8: 45 elements failed before).

---

## 7. Component reference — semantics, keyboard and ARIA

The implementation plan the team follows when building or changing a component.

| Component | Element(s) | Keyboard | Name / ARIA | Notes |
|:--|:--|:--|:--|:--|
| Skip link | `<a href="#main-content">` | Tab (first), Enter | Text "Skip to main content" | Off-screen until focused |
| App header (`Layout`) | `<header role="banner">` | Tab through controls | Every control's name starts with its visible text | Sticky, 68px; its height is measured into `--header-height` for `scroll-padding-top` |
| Main navigation (`SideNav`, `NavPanel`) | `<nav aria-label="Main navigation">` → `<ul role="list">` → `NavLink` | Tab, Enter | `aria-current="page"` on the current link | After `<main>` in source; one at a time |
| Menu drawer (`NavDrawer`, below 1024px) | `<button aria-expanded aria-controls="nav-drawer">` "Menu" + `role="dialog" aria-modal="true" aria-label="Menu"` | Enter/Space opens; Tab trapped inside; Esc or Close returns focus to Menu; following a link closes it | Name "Menu" | `useFocusTrap`; opened by Ctrl+K it starts in the search field |
| Search (`AppSearch`) | `<input type="search" role="combobox">` + `role="listbox"` of `role="option"` | Ctrl/⌘+K focuses; ↑↓ move; Enter opens; Esc clears | `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-keyshortcuts`; match count in `role="status"` | ARIA 1.2 combobox |
| CC / high contrast | `<button aria-pressed>` | Enter, Space | "CC captions" (printed "CC" + hidden "captions"); "High contrast" | CC is the Settings captions switch; high contrast adds `html.high-contrast` |
| Account menu (`AccountMenu`) | Disclosure `<button aria-expanded aria-controls>` + panel with Switch role and Sign out | Enter/Space; Esc closes and returns focus; click outside closes | Name from content: "Margaret, account menu, 5 alerts" | No `aria-label`, so the visible words are always in the name |
| Alerts (`NavPanel`) | `<button aria-expanded aria-controls>` "5 alerts" + list of links | Enter/Space | Each alert written out ("1 new message from Joyce") | Never colour alone |
| Keyboard shortcuts (`ShortcutsDialog`) | `role="dialog" aria-modal` + `<dl>` of `<kbd>` | The header's keyboard button opens it; Esc closes and returns focus | `aria-labelledby` its heading | No "?" shortcut (WCAG 2.1.4) |
| Status bar (`StatusBar`) | `<footer role="contentinfo">` | — | Connection as words beside the dot | Sticky; height in `--status-height` |
| Visual alert (`AppointmentBanner`) | `<section aria-labelledby>` "Upcoming appointment" with Pause (`aria-pressed`) and OK | Tab, Enter | OK named "OK, dismiss the reminder for …" | Dismissed for the day on every screen |
| Caption strip (`CaptionStrip`) | `<p>` with "[CC]" hidden and "Caption:" read first | — | — | Not rendered when captions are off; size and colour from Settings |
| Route change | `<main tabindex="-1">` | — | Focus moves to main; title updates | Not on first load |
| Button (`Button.tsx`) | `<button>` | Enter, Space | Visible text; `aria-label` only when icon-only | `danger` variant always opens `ConfirmDialog` |
| Confirm dialog | `role="dialog" aria-modal="true"` | Focus in, Tab trapped, Esc, return focus | `aria-labelledby`, `aria-describedby` | §5.3 |
| Assistant (`ChatBot.tsx`, not mounted since Week 11) | `<button aria-expanded aria-controls>` + `role="dialog"` panel | Enter opens, Esc closes, Tab can leave | Panel labelled by its heading; live log | Non-modal |
| Text field (`Field.tsx`) | `<label for>` + `<input>`/`<textarea>` | Native | `aria-required`, `aria-invalid`, `aria-describedby` (hint, error) | §4 |
| Select (`SelectField`) | `<label for>` + `<select>` | Arrows, type-ahead | Same as Field | Native list, no custom combobox |
| Field group | `<fieldset>` + `<legend>` | Native | Legend names the group | Schedule times |
| Done toggle | `<button aria-pressed>` | Space, Enter | Fixed name ("Breakfast done") + `aria-pressed` — target pattern, see §9 | Reversible |
| Filter group | `role="group" aria-label` + `aria-pressed` buttons | Tab, Space | Group name | Memories, note priority |
| Card (`Card.tsx`) | `<section aria-label>` + `<hN>` | — | Region named by its heading | `headingLevel` prop |
| List items | `<article>` inside `<li>` | — | `aria-label` on the article where the visible text is split | Schedule, medicines, memories, contacts |
| Banner (`Banner.tsx`) | `<div role="status|alert">` | Dismiss button if dismissible | `aria-live`, `aria-atomic` | §6.4 |
| Progress (My Day) | `role="progressbar"` | — | `aria-valuenow/min/max`, `aria-label` | Also shown as text |
| Install prompt | `role="region" aria-labelledby aria-live="polite"` | Tab to Install / Not now / Dismiss; Esc | Dismiss has `aria-label` | Never takes focus |
| Tooltips (planned, Part 1 design system) | Trigger `<button aria-describedby>` + `role="tooltip"` | Show on focus and hover; Esc hides | Never holds essential information | WCAG 1.4.13 |
| Tabs (planned) | `role="tablist/tab/tabpanel"` | Arrows move, Home/End, Tab into panel | `aria-selected`, `aria-controls` | Use links instead if each tab is a page |
| Dropdown menu (built: Quick replies in Messaging) | `<button aria-expanded aria-haspopup="menu">` + `role="menu"` | Enter/Space/↓ opens, arrows, Esc returns focus | | Prefer a native `<select>` for choosing a value |

---

## 8. Verification and results

**Week 11 re-run (27 October 2026)** — the same script, updated for the
Figma shell, over **17 routes** (Conversation and Accessibility Settings
added) and the interactive states that now exist: sign-in errors, the confirm
dialog, the Menu drawer for each role at 375px and 820px, and on desktop the
header search with results, the account menu and the shortcuts dialog. **64
scans, 0 violations; 53/53 keyboard and structure checks pass**, including
Tab staying inside the drawer and Escape returning focus to Menu at both
widths, Ctrl+K focusing search, Escape closing the account menu with focus
back on the avatar, and no horizontal scroll at 320px on every route. The
re-run found one regression and it was fixed: completed My Day tasks were
faded with `opacity-75`, putting their time and description at 3.24:1 (rule
1 below).

**Assignment 10 audit** — `npm run a11y:web` (`scripts/web-a11y-audit.mjs`): axe-core
4.14 with the WCAG 2.0/2.1 A and AA rule sets, best practices and the
label-in-name rule, in Chromium, over 15 routes and 3 interactive states (sign-in
errors, the assistant open, the confirm dialog open) at 375px, 820px and 1280px,
plus the caregiver's mobile menu open and the tablet sidebar expanded (56 scans),
and 44 keyboard and structure checks.

| | Before | After |
|:--|--:|--:|
| axe violations (54 scans before, 56 after) | **71** | **0** |
| — colour contrast (elements) | 153 | 0 |
| — label in name (elements) | 75 | 0 |
| — heading order (elements) | 3 | 0 |
| Keyboard & structure checks | 36 / 41 | **44 / 44** |
| Accessibility tests | 0 | **54** (310 in the suite, all passing) |

**Defects found and fixed**

| # | Defect | WCAG | Fix |
|--:|:--|:--|:--|
| 1 | Body text in `neutral-400` (2.85:1) and other sub-4.5:1 shades across 17 files; done items faded with `opacity-60`; the "not done" circle at 1.65:1 | 1.4.3, 1.4.11 | Text uses the next darker shade; opacity removed; circle 5.5:1. Palette comments corrected to measured ratios — several claimed 4.5:1+ for shades that were 2.9–4.3:1 |
| 2 | Confirm dialog focused every page's Delete button on load | 2.4.3 | Return focus only after a real close |
| 3 | Assistant pulled focus to its corner button on load, ahead of the skip link | 2.4.1, 2.4.3 | Same fix |
| 4 | No skip link on Sign in or Sign up | 2.4.1 | Added; `<main tabindex="-1">` |
| 5 | One document title for every page | 2.4.2 | `useDocumentTitle` on every page |
| 6 | Caregiver's home announced as "Current screen: Home" | 2.4.6 | "Dashboard" |
| 7 | Focus stayed on the nav link after navigating | 2.4.3, 4.1.3 | Focus moves to `<main>` on route change |
| 8 | 18 controls whose name did not contain their visible text | 2.5.3 | Names start with the visible words, or `aria-label` removed |
| 9 | `aria-label` on a plain `<span>` (ignored by AT) | 4.1.2 | Moved to `.sr-only` text |
| 10 | Appointment cards (`h3`) directly under the `h1` | 1.3.1 | Date groups are `<h2>` |
| 11 | "(required)" read and shown twice on caregiver forms | 3.3.2 | Removed from label text |
| 12 | "View all" link ambiguous out of context | 2.4.4 | "View all activity" for screen readers |

---

**High-contrast and AAA re-run (29 October 2026)** — the audit now scans
every route a second time at each breakpoint with the header's high-contrast
mode on and axe's AAA rules added (51 more scans, 51 more checks that the mode
applied): **115 scans, 0 violations; 104/104 checks**. It found that the mode
itself broke AA, and those were fixed:

| # | Defect | WCAG | Fix |
|--:|:--|:--|:--|
| 13 | In high contrast, white text on dark buttons turned near-black: the Home video-call button (1.34:1), its Controls and CC chips (1.16:1). Tailwind's `@apply text-calm-600` on `a` had copied the `.text-calm-600` override onto every link, outranking `text-white` | 1.4.3 | Link colours set with `theme()`; high-contrast links darkened by a `:where()` rule that a colour utility still beats |
| 14 | In high contrast, the selected Memories filter turned dark-on-dark (1.77:1): the `!important` override beat `peer-checked:text-white` | 1.4.3 | The state variant is `!important` in high contrast too |
| 15 | Landing, Sign in, Sign up and the role chooser ignored a stored high-contrast choice | 1.4.6 | They apply it (`StoredContrast` in `App.tsx`) |
| 16 | "/" on Contacts was a page-wide single-key shortcut with no off switch | 2.1.4 | Active only while focus is in the contact list |

Lighthouse (`npm run a11y:lighthouse`, `scripts/web-lighthouse.mjs`) scores the
accessibility category **100 on all 17 routes, mobile and desktop** — 34 of 34
runs; [`lighthouse/summary.md`](lighthouse/summary.md). New end-to-end tests
(`e2e/high-contrast.spec.ts`) keep high contrast at AA and AAA contrast on
every care-recipient screen in all four browser projects.

---

## 9. Known gaps and next steps

| Gap | Plan |
|:--|:--|
| The page behind the modal dialog is not `inert`; `aria-modal` relies on the screen reader honouring it | Set `inert` on the app root while a dialog is open |
| Each field error is also `role="alert"`, so submitting a form with four errors announces five times | Keep the summary as the only alert; field errors are read through `aria-describedby` when focused; move focus to the first invalid field |
| Done toggles (My Day, Medicines) change their label with the state ("Mark Breakfast as done" ↔ "…as not done") **and** set `aria-pressed`, so a screen reader hears "Mark Breakfast as not done, toggle button, pressed" — two state signals that read as contradictory | Keep `aria-pressed` and give the button a fixed name ("Breakfast done"), as the WAI-ARIA toggle-button pattern advises |
| ~~The app footer (`contentinfo`) is hidden below 1024px~~ | Resolved in Week 11: the status bar is shown at every width |
| ~~On Contacts, "/" is a single-character shortcut that cannot be turned off (WCAG 2.1.4)~~ | Resolved: "/" works only while focus is in the contact list |
| Five links are under the 44 × 44px AAA target size (2.5.5; AA's 24px minimum is met): the logo link on Sign in/Sign up (219 × 41), Landing's Sign in and Sign up (38px tall), Home's "View My Day →" (32px) and the caregiver dashboard's "View all activity" (27px) | `min-h-[2.75rem]` on each — Justin Zhang's pages, and the caregiver dashboard. The app header's logo link was brought to 44px on 29 October |
| The vibration-pattern preview lamp in Accessibility Settings blinks in time with the buzz — up to about 7 times a second for the "missed" pattern. Within 2.3.1 (Level A) by its size, but it rules out 2.3.2 Three Flashes (AAA), which has no size exception | Show the rhythm as a static bar diagram, or cap the lamp at 3 blinks a second |
| No manual screen-reader pass on the web app yet | VoiceOver (Safari, macOS and iOS) and NVDA (Chrome/Firefox, Windows) through the main flows before the next submission |
| Tooltips and tabs are in the Part 1 design system but not built | No Figma frame uses them; build to the patterns in §7 if one does. Menus (account, Quick replies) and a combobox (search) are built |
| The sticky status bar can sit over the last line of a long page while scrolling | `scroll-padding-bottom` keeps focused elements clear of it (WCAG 2.4.11); content is never hidden at the end of the page |

---

## 10. Beyond AA — WCAG 2.1 AAA

The web app conforms to WCAG 2.1 Level AA (§8), and these Level AAA success
criteria are also met. Each is backed by a check that runs, not only by design.

| AAA criterion | How CareConnect meets it | Evidence |
|:--|:--|:--|
| **1.4.6 Contrast (Enhanced)** — 7:1 text, 4.5:1 large text | The header's high-contrast switch (◐; in the Menu drawer below 1024px) darkens secondary text, links and status colours to at least 7:1. WCAG lets a page meet a criterion through a mechanism on the page, and the choice is remembered on every page, the sign-in screens included | `npm run a11y:web`: every route at 375/820/1280px with high contrast on and axe's `wcag2aaa` rules — 51 scans, 0 violations. `e2e/high-contrast.spec.ts` in Chromium, Firefox, WebKit and mobile Safari |
| **2.4.10 Section Headings** | Every page has one `h1`, and each titled part — every `Card`, date group, Pinned/More in Memories — is a `<section>` with a heading, in order with no skipped levels | [`structure.md`](structure.md): the heading outline of every page at every breakpoint; axe `heading-order` passes everywhere |
| **2.4.8 Location** | The current page is marked in the navigation (`aria-current="page"` and a visible bar), every page has its own `<title>`, and a route change moves focus to `<main>` | `useDocumentTitle`; the audit's keyboard checks ("Navigating with the keyboard moves focus to `<main>` and updates the title") |
| **2.2.3 No Timing** | Nothing the user does is timed: no session timeout, no timed form, no auto-advancing content. The screen flash fades on its own, but it is an extra cue: its message stays written in the conversation | By design; reviewed against `setTimeout`/`setInterval` use (the clock, the caregiver dashboard refresh, caption playback and the flash/lamp previews only) |

**Not claimed:** 2.5.5 Target Size — every button and form control is at
least 44 × 44px (a base rule in `index.css`), and so is every link in the app
shell, but five links on the public and dashboard pages are not yet (§9).
2.3.2 Three Flashes — the vibration-pattern lamp blinks faster
than 3 a second (§9). 1.2.6 Sign Language and 1.2.8 Media Alternative — the
demo videos are captioned and transcribed (AA) but have no sign-language
interpretation. 2.1.3 Keyboard (No Exception) is likely met, since nothing needs
a pointer, but has not been tested path by path.

---

## How to run the checks

```bash
npm install
npx playwright install chromium          # once
npm run dev -- --port 5180               # terminal 1
npm run a11y:web                         # terminal 2 — axe + keyboard checks, incl. high contrast + AAA → docs/web/accessibility/audit/
npm run a11y:lighthouse                  # Lighthouse accessibility, every route → docs/web/accessibility/lighthouse/ (against `npm run build && npm run preview -- --port 5180`)
npm run a11y:structure                   # landmarks, headings, links → structure.md
npm test                                 # includes src/accessibility.test.tsx
```
