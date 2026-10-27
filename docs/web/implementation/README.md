# Early React implementation — CareConnect web app

**SWEN 661 Team 2 (The Acuity Health Group) — Assignment 10, expectation 2 /
Deliverables Part 4.** The React web app at the repository root, extended this
week toward the responsive web design: navigation, layout grid and primary screens
working at the three web breakpoints.

| Evidence | Where |
|:--|:--|
| React source | [`src/`](../../../src) — shell in [`src/components/Layout.tsx`](../../../src/components/Layout.tsx), navigation in [`src/components/navigation/`](../../../src/components/navigation) |
| Install and run | [below](#install-and-run) |
| Screenshots — every screen at all three breakpoints | [`screenshots/overview/`](screenshots/overview) (side by side); [`mobile/`](screenshots/mobile), [`tablet/`](screenshots/tablet), [`desktop/`](screenshots/desktop) |
| Completed work | [§3](#3-completed-this-week) |
| Differences between design and implementation | [§5](#5-differences-to-resolve-with-the-design) |
| Remaining tasks | [§6](#6-remaining-tasks) |

---

## Install and run

Requirements: Node.js 18 or newer (developed on 24), npm 9 or newer.

```bash
git clone https://github.com/viclee1/careconnect-swen661.git
cd careconnect-swen661          # the web app is the repository root
npm install

npm run dev                     # http://localhost:5173 — hot reload
npm run build && npm run preview  # production build, with the PWA service worker
```

Sign in with **any** well-formed email and password (sign-in is mocked in
`src/auth/mockAuth.ts`), then choose **care recipient** or **caregiver**. "Switch
role" in the header changes between them at any time. Data is mock data kept in
`localStorage`; nothing leaves the browser.

| Command | Does |
|:--|:--|
| `npm test` | Jest + React Testing Library — 310 tests |
| `npm run typecheck`, `npm run lint` | TypeScript and ESLint |
| `npm run a11y:web` | axe-core and keyboard checks at 375 / 820 / 1280px (needs `npm run dev -- --port 5180` running, and `npx playwright install chromium` once) |
| `npm run screenshots:responsive` | Regenerates every screenshot in this folder (same dev server) |

**Stack:** React 18 + TypeScript, Vite 5, React Router 7, Tailwind CSS 3
(design tokens in `tailwind.config.js`), lucide-react icons, Jest. PWA manifest
(`public/manifest.webmanifest`) and service worker (`public/sw.js`) are in place.

---

## 1. Application structure

```
src/
├── App.tsx                 routes: public (/, /signin, /signup), /role, and /app/* behind ProtectedRoute
├── components/
│   ├── Layout.tsx          app shell: skip link, header + orientation bar, <main>, navigation, footer
│   ├── navigation/
│   │   ├── navItems.ts     one link list per role, shared by every navigation surface
│   │   ├── SideNav.tsx     tablet (collapsible) and desktop (full) sidebar
│   │   ├── MobileMenu.tsx  caregiver's mobile "Menu" (hamburger) panel
│   │   └── BottomNav.tsx   care recipient's mobile tab bar
│   ├── Button, Card, Field, Banner, BigActionTile, ConfirmDialog, ChatBot, InstallPrompt
├── pages/                  15 screens (below)
├── hooks/useDocumentTitle  "<page> — CareConnect" per route
├── index.css               base styles, focus ring, .page-container and .card-grid layout primitives
└── auth/, context/, data/  mock auth, app state, mock data stores
```

| Area | Screens (route) |
|:--|:--|
| Public | Landing `/`, Sign in `/signin`, Sign up `/signup`, Role chooser `/role` |
| Care recipient | Today `/app`, My Day `/app/schedule`, Appointments `/app/appointments`, Medicines `/app/medications`, Memories `/app/memories`, Contacts `/app/contacts` |
| Caregiver | Dashboard `/app`, Manage medications `/app/manage-medications`, Manage appointments `/app/manage-appointments`, Activity log `/app/activity`, Notes `/app/caregiver` |

Primary workflows that work end to end: sign up / sign in → choose a role; mark
today's medicines and tasks done (and undo); add an appointment to My Day; check in;
caregiver adds, edits and deletes medications and appointments (deletion confirmed
in a dialog); caregiver writes a prioritised note; switch role; sign out.

---

## 2. Responsive behaviour

Breakpoints (`tailwind.config.js`), matching the web design spec:

| | Mobile 320–767px | Tablet 768–1023px (`md`) | Desktop 1024px+ (`lg`) |
|:--|:--|:--|:--|
| Navigation — caregiver | **Menu** button (hamburger) opens the navigation under the header | **Collapsible sidebar**: a rail with icon + label; "Expand menu" widens it; choice remembered | **Full sidebar** |
| Navigation — care recipient | Bottom tab bar, always visible (deliberate — §5) | Collapsible sidebar | Full sidebar |
| Header | Icon-only Switch role / Sign out (named for screen readers); logo icon only | Labels, role pill, orientation bar on one row | Same, wider |
| Page grid | Single column | Two columns for card lists (`.card-grid`); short form fields side by side | Two columns for card lists in a wider page (max 72rem); three for Memories; two-column Today and Notes layouts |
| Footer | Hidden | Hidden | Shown |

Checked at 320, 375, 820 and 1280px: no horizontal scrolling on any screen; axe
reports no accessibility violations at any of the three widths, with the menu open
and with the sidebar expanded (56 scans, 44/44 keyboard checks).

### Screenshots

Each image shows one screen at mobile (375 × 812), tablet (820 × 1180) and desktop
(1280 × 800), as rendered on 18 October 2026.

**Today (care recipient home)** — bottom tab bar → collapsed sidebar rail → full
sidebar with the Quick actions column beside the next task.

![Today at three breakpoints](screenshots/overview/05-today.png)

**Navigation opened** — caregiver's mobile Menu panel, tablet sidebar expanded,
desktop full sidebar.

![Navigation opened](screenshots/overview/16-navigation-open.png)

**Caregiver dashboard** — status tiles fit whatever width is available.

![Caregiver dashboard](screenshots/overview/11-dashboard.png)

**Medicines** — one column → two → two in a wider page.

![Medicines](screenshots/overview/08-medicines.png)

**Appointments**

![Appointments](screenshots/overview/07-appointments.png)

**Memories** — one → two → three columns.

![Memories](screenshots/overview/09-memories.png)

**Manage medications**

![Manage medications](screenshots/overview/12-manage-medications.png)

The other screens: [Landing](screenshots/overview/01-landing.png) ·
[Sign in](screenshots/overview/02-sign-in.png) · [Sign up](screenshots/overview/03-sign-up.png) ·
[Role chooser](screenshots/overview/04-role-chooser.png) · [My Day](screenshots/overview/06-my-day.png) ·
[Contacts](screenshots/overview/10-contacts.png) · [Manage appointments](screenshots/overview/13-manage-appointments.png) ·
[Activity log](screenshots/overview/14-activity.png) · [Notes](screenshots/overview/15-notes.png)

---

## 3. Completed this week

**Responsive navigation** (`src/components/navigation/`)
- One link list per role (`navItems.ts`), used by all three surfaces, so they can
  never disagree.
- Tablet collapsible sidebar with an accessible toggle (`aria-expanded`,
  `aria-controls`); collapsed is a labelled rail, never icon-only; preference saved.
- Caregiver mobile Menu: disclosure pattern, `Esc` closes and returns focus, closes
  on navigation, positioned so `Tab` goes straight into it.
- `<main>` stays before the navigation in the source at every width; CSS `order`
  places the sidebar on the left.

**Layout system**
- `.page-container` and `.card-grid` in `index.css`, applied to Medicines,
  Appointments, Contacts, Memories and the caregiver pages; dashboard status tiles
  use an auto-fitting grid.
- Fixed a breakpoint bug: the code used `sm:` classes but the config defines only
  `md` and `lg`, so those classes never applied — the header's "Switch role" and
  "Sign out" labels were hidden at every width. They are now `md:`.
- The logo is a router link (it reloaded the whole app before).

**Accessibility, carried through the layout work** (details in
[`../accessibility/`](../accessibility/README.md)): 71 axe violations → 0, page
titles, skip links on every page, focus management on navigation and dialogs,
contrast fixes.

**Tests**: 310 passing, including 54 accessibility and responsive-navigation tests
that simulate mobile and tablet widths.

---

## 4. How the implementation follows the design system

| Design-system element | Implementation |
|:--|:--|
| Colour, type, spacing, radius tokens | `tailwind.config.js` (`calm`, `warm`, `alert`, `success`, `neutral` ramps with measured contrast; 18px base) |
| Buttons (primary / secondary / danger) | `Button.tsx`; danger always confirms |
| Form controls with label, hint, error, required states | `Field.tsx`, `SelectField` |
| Cards | `Card.tsx` (`<section>` + heading level prop) |
| Status / alert banners | `Banner.tsx` (`role="status"` / `alert`) |
| Modal | `ConfirmDialog.tsx` |
| Responsive navigation | `navigation/` (above) |
| Grid | `.page-container`, `.card-grid` |
| Focus state | One 3px `calm-600` ring, `:focus-visible` |
| Selected state | `aria-current="page"` nav links; `aria-pressed` toggles and filters |
| Disabled / error states | `disabled` + `aria-disabled`; `aria-invalid` + inline message |

---

## 5. Differences to resolve with the design

To review against the team's Figma frames as they are finalised. Each row is a
difference between the Assignment 10 web design spec and what is built, or a
problem the screenshots show.

| # | Area | Spec / design | Implementation now | Proposed resolution |
|--:|:--|:--|:--|:--|
| 1 | Care recipient mobile navigation | Hamburger menu | Always-visible bottom tab bar | Keep the tab bar for the care recipient (a hidden menu has to be remembered) and record it in the design system as a deliberate exception; caregivers use the hamburger |
| 2 | Mobile header height | — | The sticky orientation bar (date, time, greeting, Call my caregiver) takes about 40% of a 375 × 812 screen, so content starts low | Design a compact mobile state: e.g. date and time on one line and the call button as an icon + short label, or collapse the bar on scroll while keeping the date visible |
| 3 | Mobile tab bar labels | — | At 375px "Appointments", "Medicines", "Memories", "Contacts" truncate ("Appoi…") | Choose shorter labels or two-line labels in the design; the full name is still the accessible name |
| 4 | Tablet layout of Today and My Day | Two columns on tablet | Single column on tablet (two columns from 1024px) | Decide in Figma: a single calm column may be better for the care recipient; if two, define what goes in the second column |
| 5 | Desktop card lists | Multi-column | Two columns (three on Memories) | Three columns wrapped titles word-by-word at the 18px base size; keep two unless the desktop type scale changes |
| 6 | 12-column grid | Formal 12-column grid | Content grids (`.card-grid`, auto-fit tiles), max width 72rem | Map Figma's columns and gutters to Tailwind (`grid-cols-12`, `gap-6`) when the frames are final |
| 7 | Web typography | Separate web type scale | One scale (18px base) for all clients | Adopt the Figma web scale in `tailwind.config.js` once agreed |
| 8 | Web components | Dropdowns, tooltips, tabs | Not built; native `<select>` used | Build to the patterns in the accessibility plan (§7) once designed |
| 9 | Footer | — | Desktop only | Confirm in the design; its one link (Contacts) is in the nav at every width |
| 10 | Sidebar default on tablet | "Collapsible sidebar" | Starts collapsed (labelled rail) | Confirm the default in Figma |

---

## 6. Remaining tasks

- Resolve §5 with the Figma designs; update tokens, type scale and grid to match.
- Build the remaining design-system components: dropdown menu, tooltip, tabs —
  each with tests for keyboard behaviour.
- Replace mock auth and `localStorage` data with the real backend (Supabase client
  is installed; the assistant already calls a Supabase function when configured).
- Real error and empty states for every list once data is remote.
- Offline behaviour per the PWA plan: cache the app shell and today's data; show a
  connectivity banner.
- Code-split routes (`React.lazy`) — the bundle is 339 kB / 95 kB gzip in one chunk.
- Fix the two accessibility gaps documented in the accessibility plan (modal
  background `inert`; done-toggle labels).
- Manual VoiceOver and NVDA pass on the main flows; test on real phones and tablets.
