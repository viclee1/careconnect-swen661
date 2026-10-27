# Page structure — CareConnect web app

Generated from the running app by `scripts/web-a11y-structure.mjs` (2026-10-27).
This is what a screen-reader user can navigate by: landmarks (VoiceOver rotor, NVDA `D`),
headings (`H`), links and form fields. "Shown at": M = mobile 375px, T = tablet 820px,
D = desktop 1280px.

## Landing — `/`

**Title:** CareConnect — Your Daily Companion

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| navigation | `<nav>` | Account navigation | M T D |
| main | `<main>` | — | M T D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Hearing accessibility features”

**Heading outline (desktop)**

```
h1  Your daily companion for calm, confident care.
  h2  Built for hearing accessibility
```

**Links (5):** “Skip to main content” · “Sign in” · “Sign up” · “Get started — it's free” · “I already have an account”

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

## Home (patient) — `/app` (patient)

**Title:** Home — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Upcoming appointment”, “Here's your day, Margaret”, “Video call with Maria”, “Later today”

**Heading outline (desktop)**

```
  h2  Upcoming appointment
h1  Here's your day, Margaret
  h2  Video call with Maria
  h2  Later today
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (11):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “View My Day →” · “Video preview — 3:00 pm Controls CC” · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status

---

## My Day — `/app/schedule` (patient)

**Title:** My Day — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Upcoming appointment”

**Heading outline (desktop)**

```
  h2  Upcoming appointment
h1  My Day
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (9):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status

---

## Appointments — `/app/appointments` (patient)

**Title:** My Appointments — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Upcoming appointment”, “Today”, “Later this week”, “Coming up”

**Heading outline (desktop)**

```
h1  My Appointments
  h2  Upcoming appointment
  h2  Today
  h2  Later this week
  h2  Coming up
  h2  Blood pressure check — Dr. Sharma
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| In My Day | checkbox |  |  |

**Links (10):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Get directions to Greenfield Surgery (opens in a new tab)” · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status

---

## Medicines — `/app/medications` (patient)

**Title:** Medicines — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Upcoming appointment”, “Today’s medicines”, “Amlodipine”

**Heading outline (desktop)**

```
h1  Medicines
  h2  Upcoming appointment
  h2  Today’s medicines
  h2  Amlodipine
    h3  How to take it
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| Amlodipine taken | checkbox |  |  |
| Lisinopril taken | checkbox |  |  |
| Metformin taken | checkbox |  |  |
| Atorvastatin taken | checkbox |  |  |

**Links (9):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status · status/polite “3 still to take today1 of 4 taken. 3 medicines still to take”

---

## Memories — `/app/memories` (patient)

**Title:** Memories — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Pinned”, “More memories”

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

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| All | radio |  |  |
| Family | radio |  |  |
| Places | radio |  |  |
| Memories | radio |  |  |
| Hobbies | radio |  |  |
| Pets | radio |  |  |

**Links (9):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status · status/polite

---

## Contacts — `/app/contacts` (patient)

**Title:** Contacts — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| form | `<form>` | Message Joyce | D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Conversation with Joyce”

**Heading outline (desktop)**

```
h1  Contacts
  h2  Joyce
  h2  Yesterday
  h2  Today
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| Find a contact | search |  |  |
| Message Joyce | textarea |  |  |

**Links (14):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “JOJoyce Primary Caregiver · Daughter Good morning Margaret! How are you feeling today?” · “DSDr. Sharma GP — Greenfield Surgery You: Thank you for typing that out. No questions from me.” · “MA1Maria Daughter Captions available — Hi Mum, the garden is finally done. Wait until you see the roses by the back gate. We will bring more photographs on Sunday. 1 message waiting” · “JAJames Son You: Taken now, thank you for checking.” · “NHNHS 111 Medical helpline No messages yet Urgent care service” · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status · status “Showing all 5 contacts.” · status “500 characters left” · status

---

## Conversation — `/app/contacts/c3` (patient)

**Title:** Conversation — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| form | `<form>` | Message Maria | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Conversation with Maria”

**Heading outline (desktop)**

```
h1  Messages
  h2  Maria
  h2  Yesterday
  h2  Today
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| Find a contact | search |  |  |
| Message Maria | textarea |  |  |

**Links (14):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “JO1Joyce Primary Caregiver · Daughter Good morning Margaret! How are you feeling today? 1 message waiting” · “DSDr. Sharma GP — Greenfield Surgery You: Thank you for typing that out. No questions from me.” · “MAMaria Daughter Captions available — Hi Mum, the garden is finally done. Wait until you see the roses by the back gate. We will bring more photographs on Sunday.” · “JAJames Son You: Taken now, thank you for checking.” · “NHNHS 111 Medical helpline No messages yet Urgent care service” · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status · status “Showing all 5 contacts.” · status “500 characters left” · status

---

## Accessibility Settings — `/app/settings` (patient)

**Title:** Accessibility Settings — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Visual Alerts”, “Captions”, “Audio”, “Screen Flash & Desktop Alerts”, “Vibration”, “Account”

**Heading outline (desktop)**

```
h1  Accessibility Settings
  h2  Visual Alerts
  h2  Captions
  h2  Audio
  h2  Screen Flash & Desktop Alerts
    h3  Flash cues — choose one to preview it
  h2  Vibration
    h3  Vibration patterns
  h2  Account
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |
| Visual alert banners | checkbox |  |  |
| Smart alert escalation | checkbox |  |  |
| Show captions | checkbox |  |  |
| Small | radio |  |  |
| Medium | radio |  |  |
| Large | radio |  |  |
| White | radio |  |  |
| Yellow | radio |  |  |
| Alert volume | range |  |  |
| Audio balance | range |  |  |
| Screen flash alerts | checkbox |  |  |
| Desktop notifications | checkbox |  |  |
| Alert my connected devices | checkbox |  |  |
| Vibration alerts | checkbox |  |  |

**Links (9):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Home” · “My Day” · “Appointments” · “Medicines” · “Memories” · “Contacts” · “Settings”

**Live regions:** status · status/polite “WCAG 2.2 CompliantHearing-accessibility requirements met” · status · status · status

---

## Caregiver dashboard — `/app` (caregiver)

**Title:** Dashboard — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Margaret's status today”, “Alerts”, “Recent activity”, “Quick links”

**Heading outline (desktop)**

```
h1  Dashboard
  h2  Margaret's status today
  h2  Alerts3
  h2  Recent activity
  h2  Quick links
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (13):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “View all activity” · “Manage medications1/4 taken today” · “Manage appointments3 in the next 24 h” · “Caregiver notesDaily observations log” · “Full activity logNo events yet today” · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “Settings”

**Live regions:** status · region/polite “Alerts3Appointment todayBlood pressure check — Dr. Sharma at”

---

## Manage medications — `/app/manage-medications` (caregiver)

**Title:** Manage Medications — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Current medications”, “Amlodipine”, “Lisinopril”, “Metformin”, “Atorvastatin”

**Heading outline (desktop)**

```
h1  Manage medications
  h2  Current medications
    h3  Amlodipine
    h3  Lisinopril
    h3  Metformin
    h3  Atorvastatin
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “Settings”

**Live regions:** status

---

## Manage appointments — `/app/manage-appointments` (caregiver)

**Title:** Manage Appointments — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

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

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “Settings”

**Live regions:** status

---

## Activity log — `/app/activity` (caregiver)

**Title:** Activity Log — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: none

**Heading outline (desktop)**

```
h1  Activity log
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “Settings”

**Live regions:** status

---

## Caregiver notes — `/app/caregiver` (caregiver)

**Title:** Caregiver Notes — CareConnect

| Landmark | Element | Accessible name | Shown at |
|:--|:--|:--|:--|
| banner | `<header role="banner">` | — | M T D |
| main | `<main>` | Main content | M T D |
| navigation | `<nav>` | Main navigation | D |
| contentinfo | `<footer role="contentinfo">` | — | M T D |

Named regions inside main: “Notes for Today”, “Notes for Wednesday 3 June”, “Notes for Tuesday 2 June”

**Heading outline (desktop)**

```
h1  Caregiver Notes
  h2  Today
  h2  Wednesday 3 June
  h2  Tuesday 2 June
```

| Field | Type | Required | autocomplete |
|:--|:--|:--|:--|
| Search medicines, appointments and people | search |  | off |

**Links (8):** “Skip to main content” · “CareConnect” (named “CareConnect — go to home”) · “Dashboard” · “Medications” · “Appointments” · “Activity” · “Notes” · “Settings”

**Live regions:** status

