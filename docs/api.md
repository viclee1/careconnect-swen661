# API reference

CareConnect has no backend: every client runs on mock data kept on the device, so there is no REST API to call. What the clients *do* expose are internal interfaces that other code builds on — the Electron bridge between its two processes, the web app's data modules and the storage keys they own, the mobile settings repositories, and one dormant serverless function. This page documents each.

| Interface | Client | Source |
|:--|:--|:--|
| [`window.careconnect` bridge](#desktop-the-windowcareconnect-bridge) | Electron | [`desktop/src/shared/ipc.ts`](../desktop/src/shared/ipc.ts), [`desktop/src/main/preload.ts`](../desktop/src/main/preload.ts) |
| [Auth module](#web-auth-module) | Web | [`src/auth/mockAuth.ts`](../src/auth/mockAuth.ts) |
| [Data stores](#web-data-stores) | Web | [`src/data/`](../src/data) |
| [`localStorage` keys](#web-localstorage-keys) | Web | listed per key |
| [Settings repositories](#mobile-settings-repositories) | Flutter, React Native | [`flutter/lib/data/settings_repository.dart`](../flutter/lib/data/settings_repository.dart), [`mobile/src/data/settingsRepository.ts`](../mobile/src/data/settingsRepository.ts) |
| [`chat-assistant` function](#supabase-chat-assistant-function-not-mounted) | Web (not mounted) | [`supabase/functions/chat-assistant/index.ts`](../supabase/functions/chat-assistant/index.ts) |

---

## Desktop: the `window.careconnect` bridge

The Electron renderer runs with `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`. The preload script exposes exactly one object, `window.careconnect` (type `CareConnectBridge`), and nothing else — no `ipcRenderer`, no `require`, no Node globals. Both processes import the channel names from `src/shared/ipc.ts`, so renaming a channel on one side and not the other is a compile error.

In a plain browser (`npm run dev:renderer`) the bridge is absent; [`src/renderer/platform/bridge.ts`](../desktop/src/renderer/platform/bridge.ts) falls back to `localStorage` for settings.

### Methods

| Method | Returns | IPC channel | Main-process behaviour |
|:--|:--|:--|:--|
| `settings.load()` | `Promise<Record<string, unknown>>` | `settings:load` | Reads `accessibility-settings.json` from the user-data folder; `{}` if missing or corrupt. The renderer coerces the untrusted JSON into `AccessibilitySettings`. |
| `settings.save(settings)` | `Promise<void>` | `settings:save` | Rejects anything that is not a plain object (`Settings must be an object`), then writes the file. A failed write (read-only disk) is ignored; the setting still applies for the session. |
| `settings.clear()` | `Promise<void>` | `settings:clear` | Resets the file to `{}`, so the next load gives the defaults. |
| `window.getState()` | `Promise<WindowStateInfo>` | `window:get-state` | Current `width`, `height`, `x`, `y`, `isMaximized`; defaults if the window is gone. Persisted to `window-state.json` on quit. |
| `app.getInfo()` | `Promise<AppInfo>` | `app:get-info` | `name`, `version`, `electron`, `chrome`, `node`, `platform`. |
| `notifications.show({ title, body })` | `Promise<boolean>` | `notification:show` | Re-validates: `title` must be a non-empty string, `body` a string; trims and cuts them to 64 and 256 characters. Shows a **silent** OS notification (Action Center toast on Windows) — nothing in CareConnect is communicated by sound. Resolves `false` where the OS has no notification service. Clicking it restores and focuses the window. |
| `onMenuCommand(handler)` | unsubscribe function | `menu:command` (main → renderer) | Calls `handler(command)` whenever a native menu item or its keyboard shortcut fires. The Electron event object is not forwarded. |

No handler takes a path, URL or command from the renderer, so a compromised page cannot reach the filesystem through the bridge.

### Menu commands

`MenuCommand` is the single list of commands; the native menu's accelerators and the in-app Keyboard Shortcuts card are both generated from [`desktop/src/shared/shortcuts.ts`](../desktop/src/shared/shortcuts.ts), so they cannot disagree.

| Command | Action |
|:--|:--|
| `navigate:home`, `navigate:myDay`, `navigate:appointments`, `navigate:medicines`, `navigate:memories`, `navigate:contacts`, `navigate:settings` | Go to that screen |
| `navigate:back` | Previous screen |
| `contacts:find` | Jump to the Contacts search box |
| `message:send` | Send the message being written |
| `message:notify` | Send a silent visual alert to the open contact |
| `help:shortcuts` | Open the Keyboard Shortcuts card |

### Example

```ts
const settings = await window.careconnect.settings.load();
await window.careconnect.notifications.show({ title: 'Medicine due', body: 'Metformin 500 mg at 12:30 pm' });
const stop = window.careconnect.onMenuCommand((command) => {
  if (command === 'navigate:settings') navigate('/settings');
});
// later: stop();
```

---

## Web: auth module

Sign-in is a mock: any well-formed email and password work, and nothing leaves the browser. Passwords are accepted and **not stored**.

```ts
type UserRole = 'patient' | 'caregiver';
interface MockUser { id: string; name: string; email: string }
interface MockSession { user: MockUser; role: UserRole | null }
type AuthResult = { user: MockUser } | { error: string };
```

| Function | Behaviour |
|:--|:--|
| `signUp(name, email, password)` | Creates the user in `careconnect_users` unless the email (case-insensitive) already exists; returns it. |
| `signIn(email, password)` | Returns the matching user, creating one named after the email's local part if none exists. |
| `getSession()` | The stored `MockSession`, or `null`. |
| `persistSession(session)` / `clearSession()` | Write or remove `careconnect_session`. |
| `persistRole(role)` | Sets the role on the current session (the role chooser and the avatar menu's *Switch role*). |
| `signOut()` | Clears the session. |

`AuthContext` (`src/auth/AuthContext.tsx`) wraps these for components.

---

## Web: data stores

Plain functions over `localStorage`, seeded the first time from the demo data in `src/data/mockData.ts` and `src/data/appointmentsData.ts`.

| Module | Functions | Key |
|:--|:--|:--|
| `medsStore.ts` | `getMedications(): Medication[]`, `saveMedications(meds)`, `pickColour(existingCount)` | `careconnect_medications_list` |
| `apptStore.ts` | `getAppointments(): Appointment[]`, `saveAppointments(appts)` | `careconnect_appointments_list` |
| `caregiverStore.ts` | Read-only views of what the care recipient did, for the caregiver dashboard (below), plus `appendActivityEvent` | several |

**`caregiverStore.ts`**

| Function | Returns |
|:--|:--|
| `getActivityLog()` / `appendActivityEvent(event)` | `ActivityEvent { id, kind, label, timestamp }`, `kind` one of `med_taken`, `med_skipped`, `schedule_done`, `check_in` |
| `getMedAdherence()` | `{ takenCount, totalCount, missedMeds[] }` — a dose counts as missed only once its time has passed |
| `getScheduleAdherence()` | `{ doneCount, totalCount }` for today's schedule |
| `getCheckInStatus()` | `{ checkedIn, time }` |
| `getNextAppointment()` | `{ title, date, time, locationName }` or `null` |
| `getUpcomingAlerts()` | Appointments within the next 24 hours |

**`useLocalStorageState(key, initial, revive?)`** (`src/hooks/useLocalStorageState.ts`) is `useState` mirrored into `localStorage`. `revive` runs on every read, so a corrupt or outdated entry falls back to a safe value rather than crashing the screen; full or blocked storage (a private window) is tolerated for the session. The Medicines, Appointments, Memories, Messages and Settings contexts use it, which is why those screens work offline.

**`useMyDay()`** (`src/hooks/useMyDay.ts`) is the My Day list, shared by the My Day screen and Home's progress line: `{ items, doneCount, totalCount, toggle(id) }`. `buildMyDay()` (`src/models/myDay.ts`) assembles it from the Medicines context (one row per medicine, `med:<id>`), today's visits on My Day from the Appointments context (`appt:<id>`), and three routines, in time order. Toggling a medicine row calls the Medicines context's `setTaken`, so the tick shows on Medicines and in the caregiver's adherence; routines and visits keep their ticks in `careconnect_myday_done`, which resets each day.

**`medicineReminder(medications, isTaken, now)`** (`src/models/medicine.ts`) picks the dose the Medicines caption names: the longest-overdue untaken dose if any, otherwise the soonest one still to come; `reminderSentence()` words it ("Overdue: … was due at 9:00 am." / "Reminder: … take at 8:00 pm.").

---

## Web: `localStorage` keys

Everything the web app remembers. Clearing site data resets the app to its demo state.

| Key | Holds | Owner |
|:--|:--|:--|
| `careconnect_users` | `MockUser[]` | `auth/mockAuth.ts` |
| `careconnect_session` | `MockSession` | `auth/mockAuth.ts` |
| `careconnect_patient` | Care recipient profile | `context/AppContext.tsx` |
| `careconnect_accessibility_settings` | Accessibility Settings | `context/SettingsContext.tsx` |
| `careconnect_high_contrast` | High-contrast mode on/off | `hooks/useHighContrast.ts` |
| `careconnect_medications_list` | `Medication[]` | `data/medsStore.ts` |
| `careconnect_meds_taken`, `careconnect_meds_taken_date` | Today's ticks (`Record<medId, boolean>`) and the day they belong to | `context/MedicinesContext.tsx` |
| `careconnect_appointments_list` | `Appointment[]` | `data/apptStore.ts`, `context/AppointmentsContext.tsx` |
| `careconnect_appointments_my_day` | Visits added to My Day | `context/AppointmentsContext.tsx` |
| `careconnect_myday_done` | `{ date, done }`: today's ticks on routines and visits (medicine ticks live in `careconnect_meds_taken`); reset each day | `hooks/useMyDay.ts` |
| `careconnect_schedule_done` | `{ date, ids[] }` | `data/caregiverStore.ts` |
| `careconnect_checkin` | `{ date, time }` | `data/caregiverStore.ts` |
| `careconnect_activity_log` | `ActivityEvent[]` | `data/caregiverStore.ts` |
| `careconnect_memories` | Memories, including pinned | `context/MemoriesContext.tsx` |
| `careconnect_messages` | Conversations, including the offline send queue | `context/MessagesContext.tsx` |
| `careconnect_dismissed_banners` | Dismissed appointment banners | `components/AppointmentBanner.tsx` |
| `careconnect_install_dismissed_until` | When to offer *Install app* again | `components/InstallPrompt.tsx` |

---

## Mobile: settings repositories

Both mobile clients persist only the accessibility settings; every other screen uses in-memory mock data. Each defines a small repository interface so tests inject an in-memory version.

| | Flutter | React Native |
|:--|:--|:--|
| Interface | `SettingsRepository` — `Future<AccessibilitySettings> load()`, `Future<void> save(settings)`, `Future<void> clear()` | `SettingsRepository` — `load(): Promise<AccessibilitySettings>`, `save(settings): Promise<void>`, `clear()` |
| Storage | `SharedPreferencesSettingsRepository`: one preference per field, prefixed `careconnect.a11y.` | `createAsyncStorageSettingsRepository()`: one JSON value under `careconnect.a11y` in AsyncStorage |

---

## Supabase: `chat-assistant` function (not mounted)

A Deno edge function for the AI assistant. The assistant component is **not mounted** in the current app, so nothing calls this function; it is kept for when the assistant returns.

**Request.** `POST /functions/v1/chat-assistant`

```json
{ "messages": [{ "role": "user", "content": "How do I sign up?" }] }
```

**Responses** (all `200` except the validation error, with CORS headers for any origin):

| Body | When |
|:--|:--|
| `{ "reply": "…" }` | The model answered. |
| `{ "useFallback": true }` | `ANTHROPIC_API_KEY` is not set, the model call failed, or anything threw. The client switches to its scripted answers. |
| `{ "error": "messages array is required" }` (`400`) | `messages` missing or empty. |

The system prompt limits it to explaining CareConnect, sign-up and sign-in, privacy and features, and it refuses medical advice. Replies are capped at 256 tokens. Deploy with `supabase functions deploy chat-assistant` and set `ANTHROPIC_API_KEY` as a function secret (`supabase secrets set ANTHROPIC_API_KEY=…`) — never as a `VITE_` variable, which would ship it to the browser.
