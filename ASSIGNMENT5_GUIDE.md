# Assignment 5 - SWEN 661 Step-by-Step Guide

## Overview
You need to complete 8 tasks for Assignment 5. This guide provides step-by-step instructions with actual code examples from your project.

---

## Task 1: Wait for PR Merge (Status: ✅ PR #3 Open)
- PR #3 is already open and awaiting review from viclee1
- No action needed yet
- Once merged, pull the changes to your local branch

---

## Task 2 & 3: Jest + React Testing Library Tests

### Step 1: Install Testing Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui ts-jest @types/jest identity-obj-proxy
```

### Step 2: Create Jest Configuration
Create `jest.config.js` in project root:
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
};
```

### Step 3: Create Setup File
Create `src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### Step 4: Update package.json Scripts
Add these scripts to `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit -p tsconfig.app.json",
  "screenshots": "tsx scripts/screenshots.ts",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

---

## Test Files to Create

### Test 1: Appointments.test.tsx
Location: `src/pages/__tests__/Appointments.test.tsx`

Tests to include:
1. ✅ Component renders without crashing
2. ✅ Displays "My Appointments" heading
3. ✅ Groups appointments by Today/Later this week/Coming up
4. ✅ Formats dates correctly (full English date)
5. ✅ Formats times correctly (12-hour format with am/pm)
6. ✅ Shows "Today" badge for today's appointments
7. ✅ Shows empty state when no appointments exist
8. ✅ "Add to My Day" button toggles appointment state
9. ✅ Displays appointment location information
10. ✅ Shows caregiver name when present

### Test 2: Medications.test.tsx
Location: `src/pages/__tests__/Medications.test.tsx`

Tests to include:
1. ✅ Component renders without crashing
2. ✅ Displays "Medicines" heading
3. ✅ Shows pending medications count in status
4. ✅ Shows success message when all taken
5. ✅ Toggles medication "taken" status
6. ✅ Persists taken status to localStorage
7. ✅ Displays medication name, dosage, times
8. ✅ Shows medication instructions if present
9. ✅ Applies line-through styling to taken medicines
10. ✅ Calculates pending/taken counts correctly

### Test 3: Memories.test.tsx
Location: `src/pages/__tests__/Memories.test.tsx`

Tests to include:
1. ✅ Component renders without crashing
2. ✅ Displays "Memories" heading
3. ✅ Filter buttons work (All, Family, Places, Memories, Hobbies, Pets)
4. ✅ Displays pinned cards first
5. ✅ Displays "More memories" section for non-pinned
6. ✅ Shows empty state for empty category
7. ✅ "Read more" button expands long text
8. ✅ "Show less" button collapses expanded text
9. ✅ Displays memory cards with correct category
10. ✅ Shows pinned badge for pinned memories

---

## Task 4: Generate Coverage Report

### Run Coverage:
```bash
npm run test:coverage
```

### Coverage Requirements:
- Must show **60%+ coverage** across all components
- Coverage report will appear in `coverage/` directory
- Open `coverage/index.html` in browser to view detailed report

### Coverage Breakdown:
- **Statements**: Code statements executed (aim 60%+)
- **Branches**: If/else branches (aim 60%+)
- **Functions**: Function definitions (aim 60%+)
- **Lines**: Individual lines (aim 60%+)

---

## Task 5: Combine Team Code

### Steps:
1. **Wait for PR #3 merge** from viclee1
2. **Pull merged code**:
   ```bash
   git pull origin main
   ```
3. **Check for conflicts**:
   - Use `git status` to see any merge conflicts
   - Manually resolve any conflicts in VS Code
4. **Test integration**:
   ```bash
   npm run dev
   npm run test
   ```
5. **Commit merged changes**:
   ```bash
   git add .
   git commit -m "Merge team code and integrate tests"
   ```

### What to Verify:
- ✅ All screens render properly
- ✅ Routing works between screens
- ✅ Data persistence works (localStorage)
- ✅ No console errors or warnings
- ✅ All tests pass

---

## Task 6: Test on Emulator (Phone & Tablet)

### Chrome DevTools (Built-in, No Setup):
1. **Start dev server**: `npm run dev`
2. **Open Chrome DevTools**: Press `F12`
3. **Click device toggle**: Top-left icon (looks like phone/tablet)
4. **Test phone size** (375px wide):
   - Select "iPhone 12" preset
   - Test all 3 screens for layout
   - Check button/text readability
5. **Test tablet size** (768px+ wide):
   - Select "iPad Pro" preset
   - Verify 2-column grid layouts work
   - Check responsive spacing

### Responsive Design Breakpoints to Test:
- **Mobile**: 375px - 480px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### What to Check:
- ✅ Text readable on all sizes
- ✅ Buttons easy to tap (min 44px height)
- ✅ Images responsive (no overflow)
- ✅ Grid layouts stack properly on mobile
- ✅ No horizontal scrolling on mobile
- ✅ Spacing appropriate for screen size

---

## Task 7: Record Demo Video (10-15 min)

### What to Include:
1. **Intro (0:30)**
   - Show your name and assignment
   - "CareConnect - Appointments, Medications, Memories"

2. **Appointments Screen (3-4 min)**
   - Show today's appointments with "Today" badge
   - Scroll to show "Later this week" section
   - Scroll to show "Coming up" section
   - Click "Add to My Day" button
   - Show location details
   - Click "Get directions" button (for clinic/hospital)
   - Explain the time/date formatting

3. **Medications Screen (3-4 min)**
   - Show medication list
   - Click checkbox to toggle "taken" status
   - Show strikethrough styling for taken meds
   - Show status message (X medicines left / All done)
   - Explain time badges
   - Mention localStorage persistence

4. **Memories Screen (3-4 min)**
   - Show all memories pinned at top
   - Click filter buttons (Family, Places, Memories, etc.)
   - Show filtered results
   - Click "Read more" button for long text
   - Show pinned badge
   - Scroll through grid layout

5. **Technical Highlights (1 min)**
   - Show test coverage report
   - Mention Jest + React Testing Library
   - Note localStorage data persistence

6. **Outro (0:30)**
   - Summary of features
   - Thank you

### Recording Tips:
- Use OBS Studio (free) or ScreenFlow
- Record at 1280x720 (720p) for clarity
- Speak clearly and at moderate pace
- No background noise
- Total time: 10-15 minutes

---

## Task 8: React Native vs Flutter Comparison (500-750 words)

### Document Structure:

**1. Introduction (50 words)**
- Context: What are React Native and Flutter?
- Scope: Comparison for healthcare mobile apps

**2. Technology Stack (100 words)**
- React Native: JavaScript/TypeScript, React ecosystem
- Flutter: Dart, Material Design
- Learning curve comparison

**3. Development Speed (100 words)**
- React Native: Fast for web devs, code reuse with React web
- Flutter: Faster compilation, hot reload speed
- Time-to-market considerations

**4. Performance (100 words)**
- React Native: Bridge communication overhead
- Flutter: Native compilation, generally faster
- Real-world benchmarks

**5. Code Reusability (100 words)**
- React Native: Share logic with React web apps
- Flutter: Dart-only ecosystem
- Cross-platform advantages

**6. Community & Ecosystem (75 words)**
- React Native: Larger community, more libraries
- Flutter: Growing rapidly, Google backing
- Third-party dependency comparison

**7. CareConnect Case Study (150 words)**
- Why React used for web version
- How each would apply to healthcare app
- Accessibility considerations
- Data privacy in healthcare context

**8. Recommendation (75 words)**
- For CareConnect: React Native chosen because...
- When to use each framework
- Conclusion

---

## Full Testing Workflow Example

### 1. Create test directory:
```bash
mkdir -p src/pages/__tests__
```

### 2. Create first test file (see examples below)

### 3. Run single test:
```bash
npm test -- src/pages/__tests__/Appointments.test.tsx
```

### 4. Run all tests:
```bash
npm test
```

### 5. Generate coverage:
```bash
npm run test:coverage
```

### 6. View coverage report:
```bash
# On Windows:
start coverage/index.html

# On Mac:
open coverage/index.html

# On Linux:
firefox coverage/index.html
```

---

## Checklist Before Submission

- [ ] Jest installed and configured
- [ ] setupTests.ts created
- [ ] Appointments.test.tsx created (10+ tests)
- [ ] Medications.test.tsx created (10+ tests)
- [ ] Memories.test.tsx created (10+ tests)
- [ ] All tests passing (`npm test`)
- [ ] Coverage report shows 60%+ (`npm run test:coverage`)
- [ ] PR #3 merged and pulled
- [ ] Team code integrated and tested
- [ ] Phone emulator tested (Chrome DevTools)
- [ ] Tablet emulator tested (Chrome DevTools)
- [ ] Demo video recorded (10-15 min)
- [ ] React Native vs Flutter comparison written (500-750 words)

---

## Common Issues & Solutions

### Issue: Tests fail with "Cannot find module"
**Solution**: Make sure mock data paths are correct. Update imports in test files to match your `src/` structure.

### Issue: localStorage is not defined
**Solution**: Tests already run in jsdom environment (has localStorage). See `jest.config.js`.

### Issue: Coverage too low
**Solution**: Add more test cases. Aim for each function and branch to have at least one test.

### Issue: React components not rendering in tests
**Solution**: Make sure all context providers (AuthContext, AppContext) are mocked or wrapped properly.

### Issue: Emulator colors/fonts look different
**Solution**: Normal on different devices. Test for readability and functionality, not pixel-perfect appearance.

---

## File Structure After Completion

```
src/
├── pages/
│   ├── Appointments.tsx
│   ├── Medications.tsx
│   ├── Memories.tsx
│   └── __tests__/
│       ├── Appointments.test.tsx
│       ├── Medications.test.tsx
│       └── Memories.test.tsx
├── setupTests.ts
└── ...

jest.config.js
coverage/
├── index.html
├── lcov.info
└── ...
```

---

## Next Steps

1. **Install testing dependencies** (see Step 1 above)
2. **Create Jest config** (see Step 2)
3. **Create setup file** (see Step 3)
4. **Follow example test files** in this guide
5. **Run tests and generate coverage**
6. **See next document for actual test code examples**

Good luck! 🚀
