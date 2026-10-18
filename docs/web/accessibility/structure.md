# Page structure — CareConnect web app

Generated from the running app by `scripts/web-a11y-structure.mjs` (2026-10-18).
This is what a screen-reader user can navigate by: landmarks (VoiceOver rotor, NVDA `D`),
headings (`H`), links and form fields. "Shown at": M = mobile 375px, T = tablet 820px,
D = desktop 1280px.

## Landing — `/`

**Title:** CareConnect — Your Daily Companion

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| navigation | `<nav>` | Account navigation | M T D |
| main | `<main>` | Main content | M T D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Your daily companion for calm, confident care.”, “How CareConnect helps”, “Stay on top of medications”, “Never miss an appointment”, “Stay connected to your caregiver”, “Made for two kinds of people”, “Ready to get started?”

**Heading outline (desktop)**

```
h1  Your daily companion for calm, confident care.
  h2  How CareConnect helps
    h3  Stay on top of medications
    h3  Never miss an appointment
    h3  Stay connected to your caregiver
  h2  Made for two kinds of people
    h3  For care recipients
    h3  For caregivers
  h2  Ready to get started?
```

**Links (7):** “Skip to main content” · “Sign in” · “Sign up” · “Get started — it's free” · “I already have an account” · “Create a free account” · “Sign in”

---

## Sign in — `/signin`

**Title:** Sign in — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Sign in | M T D |

Named regions inside main: none

**Heading outline (desktop)**

```
h1  Welcome back
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Email address*(required) | email | yes | email |
| Password*(required) | password | yes | current-password |

**Links (3):** “Skip to main content” · “CareConnect” (named “CareConnect home”) · “Sign up for free”

---

## Sign up — `/signup`

**Title:** Create an account — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Sign up | M T D |

Named regions inside main: none

**Heading outline (desktop)**

```
h1  Create your account
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Your name*(required) | text | yes | name |
| Email address*(required) | email | yes | email |
| Password*(required) | password | yes | new-password |
| Confirm password*(required) | password | yes | new-password |

**Links (3):** “Skip to main content” · “CareConnect” (named “CareConnect home”) · “Sign in”

---

## Role chooser — `/role`

**Title:** Choose your role — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Choose your role | M T D |

Named regions inside main: none

**Heading outline (desktop)**

```
h1  Welcome, Margaret!
```

**Links (1):** “Skip to role selection”

---

## Today (patient home) — `/app` (patient)

**Title:** Home — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Next thing to do”, “Later today”, “Walk in the garden”, “Lunch”, “Rest time”, “Evening medications”, “Quick actions”

**Heading outline (desktop)**

```
h1  Here's your day, Margaret
  h2  Later today
    h3  Walk in the garden
    h3  Lunch
    h3  Rest time
    h3  Evening medications
  h2  Quick actions
```

**Links (11):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “See full day schedule” · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

---

## My Day — `/app/schedule` (patient)

**Title:** My Day — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Day progress”, “Today's schedule”, “Category legend”

**Heading outline (desktop)**

```
h1  My Day
  h2  Today's schedule
  h2  Category key
```

**Links (10):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

---

## Appointments — `/app/appointments` (patient)

**Title:** My Appointments — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Today”, “Blood pressure check — Dr. Sharma”, “Heart checkup — Dr. Lee”, “Later this week”, “Blood test — fasting needed”, “Memory clinic follow-up — Dr. Patel”, “GP telephone review — Dr. Sharma”, “Coming up”, “Physiotherapy — shoulder exercises”, “Eye test — routine annual check”, “Annual health review — Dr. Sharma”

**Heading outline (desktop)**

```
h1  My Appointments
  h2  Today
    h3  Blood pressure check — Dr. Sharma
    h3  Heart checkup — Dr. Lee
  h2  Later this week
    h3  Blood test — fasting needed
    h3  Memory clinic follow-up — Dr. Patel
    h3  GP telephone review — Dr. Sharma
  h2  Coming up
    h3  Physiotherapy — shoulder exercises
    h3  Eye test — routine annual check
    h3  Annual health review — Dr. Sharma
```

**Links (10):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

---

## Medicines — `/app/medications` (patient)

**Title:** Medicines — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Medication list”

**Heading outline (desktop)**

```
h1  Medicines
  h2  Medication list
```

**Links (10):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

**Live regions:** status/polite “2 medicines still to take today.”

---

## Memories — `/app/memories` (patient)

**Title:** Memories — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Pinned memories”, “More memories”

**Heading outline (desktop)**

```
h1  Memories
  h2  Pinned
    h3  Maria — Your Daughter
    h3  Your Home
    h3  Buddy — Your Cat
  h2  More memories
    h3  Your Garden
    h3  50th Wedding Anniversary
    h3  Favourite Walk — River Path
```

**Links (10):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

---

## Contacts — `/app/contacts` (patient)

**Title:** Contacts — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Emergency contacts”, “Other contacts”

**Heading outline (desktop)**

```
h1  Contacts
  h2  Emergency contacts
  h2  Other contacts
```

**Links (15):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Call my caregiver” (named “Call my caregiver, Joyce — 07700 900 456”) · “07700 900 123Call” (named “Call Maria Thompson on 07700 900 123”) · “07700 900 456Call” (named “Call Joyce Adeyemi on 07700 900 456”) · “999Call” (named “Call Emergency Services on 999”) · “01234 567 890Call” (named “Call Dr. Priya Sharma on 01234 567 890”) · “07700 900 789Call” (named “Call Tom Thompson on 07700 900 789”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “View contacts”

---

## Caregiver dashboard — `/app` (caregiver)

**Title:** Dashboard — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Margaret's status today”, “Alerts”, “Recent activity”, “Quick links”

**Heading outline (desktop)**

```
h1  Dashboard
  h2  Margaret's status today
  h2  Alerts5
  h2  Recent activity
  h2  Quick links
```

**Links (13):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “View all” · “Manage medications2/4 taken today” · “Manage appointments3 in the next 24 h” · “Caregiver notesDaily observations log” · “Full activity logNo events yet today” · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “View contacts”

**Live regions:** aria-live/polite “Viewing Margaret's care plan” · region/polite “Alerts5Atorvastatin — overdue20 mg — 1 tablet was due at 8:0”

---

## Manage medications — `/app/manage-medications` (caregiver)

**Title:** Manage Medications — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Current medications”, “Amlodipine”, “Atorvastatin”, “Sertraline”, “Vitamin D3”

**Heading outline (desktop)**

```
h1  Manage medications
  h2  Current medications
    h3  Amlodipine
    h3  Atorvastatin
    h3  Sertraline
    h3  Vitamin D3
```

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “View contacts”

**Live regions:** aria-live/polite “Viewing Margaret's care plan”

---

## Manage appointments — `/app/manage-appointments` (caregiver)

**Title:** Manage Appointments — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “All appointments”, “Blood pressure check — Dr. Sharma”, “Heart checkup — Dr. Lee”, “Blood test — fasting needed”, “Memory clinic follow-up — Dr. Patel”, “GP telephone review — Dr. Sharma”, “Physiotherapy — shoulder exercises”, “Eye test — routine annual check”, “Annual health review — Dr. Sharma”

**Heading outline (desktop)**

```
h1  Manage appointments
  h2  All appointments
    h3  Blood pressure check — Dr. Sharma
    h3  Heart checkup — Dr. Lee
    h3  Blood test — fasting needed
    h3  Memory clinic follow-up — Dr. Patel
    h3  GP telephone review — Dr. Sharma
    h3  Physiotherapy — shoulder exercises
    h3  Eye test — routine annual check
    h3  Annual health review — Dr. Sharma
```

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “View contacts”

**Live regions:** aria-live/polite “Viewing Margaret's care plan”

---

## Activity log — `/app/activity` (caregiver)

**Title:** Activity Log — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: none

**Heading outline (desktop)**

```
h1  Activity log
```

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “View contacts”

**Live regions:** aria-live/polite “Viewing Margaret's care plan”

---

## Caregiver notes — `/app/caregiver` (caregiver)

**Title:** Caregiver Notes — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | M T D |
| contentinfo | `<footer role="contentinfo">` | — | D |

Named regions inside main: “Notes for Sunday 18 October”, “Notes for Wednesday 3 June”, “Notes for Tuesday 2 June”

**Heading outline (desktop)**

```
h1  Caregiver Notes
  h2  Sunday 18 October
  h2  Wednesday 3 June
  h2  Tuesday 2 June
```

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “View contacts”

**Live regions:** aria-live/polite “Viewing Margaret's care plan”

