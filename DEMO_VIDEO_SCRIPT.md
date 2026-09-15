# Demo Video Script & Outline (10-15 minutes)

## Pre-Recording Checklist
- [ ] Use OBS Studio or ScreenFlow for recording
- [ ] Record at 1280x720 (720p) resolution
- [ ] Microphone working, no background noise
- [ ] Test recording for 1-2 minutes before starting
- [ ] Clear desktop, close unnecessary windows
- [ ] Have dev server running: `npm run dev`
- [ ] Browser dev tools open (for tablet emulation)

---

## Full Demo Script

### SEGMENT 1: Introduction (0:30)
**What to say:**
> "Hi, I'm [Your Name]. This is my Assignment 5 submission for SWEN 661 Mobile Development. I'm demonstrating CareConnect, a patient health management application built with React and TypeScript. Today I'll show you three main screens I implemented: Appointments, Medications, and Memories."

**Actions:**
- Show your name on screen (title slide, notebook, or speak to camera)
- Show the CareConnect app loaded in browser

---

## SEGMENT 2: Appointments Screen (3-4 minutes)

**What to say:**
> "Starting with the Appointments screen. This shows upcoming medical appointments organized by time period. You'll notice today's appointment has a special 'Today' badge in the top right corner. The appointments are automatically grouped into three sections: Today, Later this week, and Coming up.

> Each appointment displays comprehensive information: the date and time in full English format — for example, 'Thursday, 4 June — 2:30 pm' — the location name, the address when available, and the type of visit: whether it's a clinic visit, hospital visit, phone call, or home visit.

> For in-person appointments, there's a 'Get directions' button that opens Google Maps. For telephone and home visits, we show a reassuring message that no travel is needed.

> This caregiver box shows who will be taking you to the appointment. And this notes section provides important preparation instructions.

> The 'Add to My Day' button lets patients add appointments to their daily schedule. Once added, it changes to show 'In My Day' status. Let me click this button to demonstrate..."

**Actions:**
1. **Show Today's Section** (0:30)
   - Scroll to show "Today" heading highlighted in blue
   - Point to the "Today" badge next to appointment title
   - Hover over appointment to show it has card styling

2. **Highlight Date/Time Formatting** (0:30)
   - Read appointment date/time out loud
   - Explain format: "Full day name, date, and 12-hour time format"
   - Show multiple appointments to demonstrate consistency

3. **Show Location Details** (0:45)
   - Point to location icon and name
   - Show address when available
   - Show location type label (clinic visit, phone, home visit, etc.)

4. **Demonstrate Get Directions** (0:30)
   - Click "Get directions" button for clinic/hospital
   - Show Google Maps opening in new tab
   - Go back to app

5. **Show Caregiver Box** (0:30)
   - Point out caregiver name box with green styling
   - Explain: "This person will take you to the appointment"

6. **Show Add to My Day** (0:45)
   - Click "Add to My Day" button
   - Show button changes to "In My Day" status
   - Explain this appears in daily schedule
   - Click again to toggle back

7. **Scroll through Sections** (0:45)
   - Scroll down to show "Later this week" section
   - Point out chronological ordering
   - Scroll to "Coming up" section
   - Show empty state briefly (if scrolling past all appointments)

---

## SEGMENT 3: Medications Screen (3-4 minutes)

**What to say:**
> "Next is the Medications screen, which is a daily medication tracker. At the top, there's a status summary showing how many medicines are pending today.

> When you first open this screen, it shows 'X medicines still to take today.' Once all are marked as taken, it changes to 'All medicines taken for today. Well done!'

> Each medication card shows the name, dosage, times to take it, and any special instructions. The colored circle represents the pill visually. You can tap the circular button on the right to mark a medicine as taken.

> Notice when a medicine is marked as taken, it gets a strikethrough and becomes semi-transparent. The status count at the top updates immediately.

> The app remembers which medicines you've taken today using browser storage, so if you leave and come back, your progress is saved.

> Let me demonstrate by marking a medicine as taken..."

**Actions:**
1. **Show Status Message** (0:30)
   - Point to status box at top
   - Read pending count message
   - Explain: "This updates as you mark medicines taken"

2. **Show Medication Details** (1:00)
   - Point out each part of medication card:
     - Name (bold heading)
     - Dosage (gray text)
     - Times (blue badges showing 08:30, 20:00, etc.)
     - Instructions (italic text)
   - Point out colored pill circle

3. **Toggle Medicine Status** (1:00)
   - Click circle button on first medication
   - Show name gets strikethrough
   - Show opacity changes (becomes grayed out)
   - Point to status message at top changing count
   - Read new message: "X medicines still to take today"

4. **Toggle Multiple Times** (0:30)
   - Click another medication's toggle button
   - Show count decreases again
   - Click to toggle back to show it works both ways

5. **Explain Persistence** (0:45)
   - Explain: "This data is saved to your browser storage, called localStorage. Let me open the browser developer tools to show..."
   - Press F12 to open DevTools
   - Navigate to Application > LocalStorage
   - Show 'careconnect_meds_taken' key
   - Show JSON data with medication IDs and true/false values
   - Close DevTools
   - Explain: "Even if you close and reopen the app, your medicine progress is remembered"

6. **Scroll through List** (0:30)
   - Show multiple medications in list
   - Point out variety in times and instructions

---

## SEGMENT 4: Memories Screen (3-4 minutes)

**What to say:**
> "The third screen is Memories, designed for elderly patients to enjoy personal photos and reminiscences. It's a gentle, engaging way to connect with people, places, and moments that matter.

> At the top are filter buttons to organize memories by category: All, Family, Places, Memories (for events), Hobbies, and Pets.

> Below that, pinned memories appear first — these are favorites that the patient or caregiver want readily accessible. Then there's a 'More memories' section for additional memories.

> Each card shows a photo, title, category badge, and a description. If the description is long, there's a 'Read more' button to expand it.

> Let me show you the filtering in action..."

**Actions:**
1. **Show All Memories** (0:45)
   - Scroll through grid
   - Show pinned section at top
   - Point out "Pinned" badge on pinned cards
   - Point out "More memories" heading
   - Explain: "Favorite memories appear first for quick access"

2. **Demonstrate Filter Buttons** (1:00)
   - Click "Family" filter
   - Show only family memories appear
   - Click "Places" filter
   - Show only place memories appear
   - Click "Pets" filter
   - Show pet memories
   - Click "All" to reset

3. **Show Memory Details** (0:45)
   - Point to memory card structure:
     - Photo (large)
     - Title (heading)
     - Category badge (Family, Place, Pet, etc.)
     - Pinned badge (if applicable)
     - Description text

4. **Demonstrate Read More/Show Less** (0:45)
   - Find a memory with long text
   - Click "Read more" button
   - Show description expands
   - Read a bit of the expanded text
   - Click "Show less" to collapse

5. **Highlight Responsive Grid** (0:45)
   - Show grid layout adapts
   - Explain: "On tablets, this becomes 2 columns. On phones, it's single column"
   - Hover/point out card styling and spacing

---

## SEGMENT 5: Emulator Testing (1-2 minutes)

**What to say:**
> "Now let me demonstrate responsive design on different screen sizes. I'll use Chrome DevTools to test on phone and tablet emulators.

> Pressing F12 opens the developer tools. I'll click the device toggle button to enable device emulation. Now I can select different devices to preview how the app looks on phones, tablets, and other screens."

**Actions:**
1. **Open DevTools** (0:15)
   - Press F12
   - Show DevTools open

2. **Enable Device Emulation** (0:15)
   - Click device toggle (icon in top-left of DevTools)
   - Show device selection dropdown

3. **Test Phone View** (0:45)
   - Select "iPhone 12" (375px wide)
   - Navigate to Appointments screen
   - Point out: "Still readable, buttons easy to tap, no horizontal scrolling"
   - Scroll through medications on phone
   - Show memories grid stacks to single column

4. **Test Tablet View** (0:45)
   - Select "iPad" (768px wide)
   - Point out: "Memories now shows 2 columns, better use of screen space"
   - Scroll appointments to show it reflows nicely
   - Navigate between screens

---

## SEGMENT 6: Technical Highlights (1 minute)

**What to say:**
> "Behind the scenes, this app is built with modern web technologies: React, TypeScript, Tailwind CSS for styling, and Vite for fast development. The data persists using the browser's localStorage API, so changes are remembered even after closing the app.

> For Assignment 5, I've also created comprehensive Jest unit tests and React Testing Library component tests. Here's the coverage report..."

**Actions:**
1. **Show Coverage Report** (0:30)
   - Open terminal
   - Run `npm run test:coverage`
   - Wait for it to complete
   - Show output showing coverage percentages
   - Mention: "60%+ coverage across statements, branches, functions, and lines"

2. **Optional: Show Test Files** (0:30)
   - Open VS Code file explorer
   - Show `src/pages/__tests__/` directory
   - Mention: "Appointments.test.tsx, Medications.test.tsx, Memories.test.tsx"
   - Explain: "Each has 30+ tests covering business logic and user interactions"

---

## SEGMENT 7: Outro (0:30)

**What to say:**
> "This completes my demonstration of CareConnect's Appointments, Medications, and Memories screens. The app is designed with elderly users in mind: clear typography, generous spacing, high contrast colors, and intuitive interactions.

> All three screens are fully tested, responsive across devices, and persistent with local data storage. Thank you for watching!"

**Actions:**
1. Final screen or look at camera
2. End recording

---

## Technical Setup for Recording

### Terminal Commands to Prepare
```bash
# Start dev server
npm run dev

# (In another terminal, if showing tests)
npm test

# (Another terminal, if showing coverage)
npm run test:coverage
```

### Browser Preparation
1. Open http://localhost:5173
2. Open DevTools (F12)
3. Set DevTools to right side or bottom side
4. Have Chrome DevTools device emulator ready

### Files to Reference
- `src/pages/Appointments.tsx`
- `src/pages/Medications.tsx`
- `src/pages/Memories.tsx`
- `src/pages/__tests__/*.test.tsx` (for showing test files)

---

## Recording Tips

**DO:**
- ✅ Speak clearly and slowly
- ✅ Point to UI elements while explaining
- ✅ Pause between topics
- ✅ Use developer tools to show technical details
- ✅ Show both phone AND tablet emulator
- ✅ Read text out loud from the app
- ✅ Demonstrate actual user interactions
- ✅ Mention key features and design decisions

**DON'T:**
- ❌ Rush through sections
- ❌ Assume viewer knows the app
- ❌ Click too fast (pause to let viewers see)
- ❌ Minimize windows while recording
- ❌ Have terminal errors visible
- ❌ Skip the emulator testing
- ❌ Ignore code quality/tests

---

## Sample Timeline
```
0:00 - 0:30  → Introduction
0:30 - 4:30  → Appointments Screen (4 min)
4:30 - 8:30  → Medications Screen (4 min)
8:30 - 12:00 → Memories Screen (3.5 min)
12:00 - 13:00 → Emulator Testing (1 min)
13:00 - 14:00 → Technical Highlights (1 min)
14:00 - 14:30 → Outro (0.5 min)
─────────────────────────────────
TOTAL: ~14 minutes ✓ (within 10-15 min target)
```

---

## Backup Plan

If recording goes wrong:
1. ✅ Re-record the problem section
2. ✅ Keep multiple takes
3. ✅ Export/save highest quality version
4. ✅ Test video plays before submitting
5. ✅ Keep unedited original as backup

---

## Final Checklist Before Submission

- [ ] Recording is 10-15 minutes
- [ ] Audio is clear (no background noise)
- [ ] All 3 screens demonstrated
- [ ] Filters work on Memories
- [ ] Add to My Day works on Appointments
- [ ] Toggle works on Medications
- [ ] Phone emulator shown
- [ ] Tablet emulator shown
- [ ] Developer tools shown for localStorage/tests
- [ ] No long pauses or dead air
- [ ] File size reasonable (<500MB)
- [ ] Format is MP4 or supported video format
- [ ] Playback tested on another device

Good luck! 🎬
