# Testing Guide - Jest & React Testing Library Examples

## Quick Start

### 1. Install Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest identity-obj-proxy
```

### 2. Update package.json Scripts
Add to `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### 3. Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm test:watch

# Generate coverage report
npm run test:coverage
```

---

## Test File Structure

### File Organization
```
src/
├── pages/
│   ├── Appointments.tsx
│   ├── Medications.tsx
│   ├── Memories.tsx
│   └── __tests__/
│       ├── Appointments.test.tsx     (30+ tests)
│       ├── Medications.test.tsx      (30+ tests)
│       └── Memories.test.tsx         (35+ tests)
```

### Test File Naming Convention
- Component: `Appointments.tsx`
- Test: `Appointments.test.tsx`
- Test file placed in `__tests__` subdirectory

---

## Jest Test Patterns

### Basic Test Structure
```typescript
describe('Component Name', () => {
  beforeEach(() => {
    // Runs before each test
    jest.clearAllMocks();
  });

  test('does something specific', () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    render(<Component {...testData} />);

    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Grouping Related Tests
```typescript
describe('Appointments Screen', () => {
  describe('Rendering and Display', () => {
    test('renders without crashing', () => { /* ... */ });
    test('displays page heading', () => { /* ... */ });
  });

  describe('Date Formatting', () => {
    test('formats dates correctly', () => { /* ... */ });
    test('formats times to 12-hour format', () => { /* ... */ });
  });
});
```

---

## React Testing Library Patterns

### Querying Elements

**By Text (most common for user interaction)**
```typescript
// Exact match
expect(screen.getByText('Exact text')).toBeInTheDocument();

// Partial match with regex
expect(screen.getByText(/partial text/i)).toBeInTheDocument();

// Case-insensitive
expect(screen.getByText(/medicines/i)).toBeInTheDocument();
```

**By Role (semantic, accessible)**
```typescript
// Common roles
screen.getByRole('button', { name: /Add to My Day/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('article')
screen.getByRole('status')  // For status messages
screen.getByRole('listitem')
screen.getByRole('region', { name: /.../ })
screen.getByRole('button', { pressed: true })
```

**By Label**
```typescript
screen.getByLabelText('Filter memories by category')
```

**By Alt Text (for images)**
```typescript
screen.getByAlt('Family Reunion 2023')
```

**Finding Multiple Elements**
```typescript
// Returns array
const allButtons = screen.getAllByRole('button');
allButtons.forEach(btn => expect(btn).toBeInTheDocument());

// Query (doesn't throw if not found)
const element = screen.queryByText('Optional text');
expect(element).not.toBeInTheDocument();
```

### User Interactions

**Clicking Elements**
```typescript
const button = screen.getByRole('button', { name: /Add to My Day/i });
fireEvent.click(button);
```

**Typing into Inputs**
```typescript
const input = screen.getByRole('textbox');
fireEvent.change(input, { target: { value: 'New value' } });
```

**Waiting for Changes**
```typescript
import { waitFor } from '@testing-library/react';

fireEvent.click(button);
await waitFor(() => {
  expect(screen.getByText('Updated text')).toBeInTheDocument();
});
```

### Asserting Component State

**Testing Visibility**
```typescript
expect(screen.getByText('Text')).toBeInTheDocument();
expect(screen.queryByText('Text')).not.toBeInTheDocument();
```

**Testing CSS Classes**
```typescript
const element = screen.getByText('Medication Name');
expect(element.className).toContain('line-through');  // Taken
expect(element.className).not.toContain('opacity-50'); // Not hidden
```

**Testing Aria Attributes**
```typescript
const button = screen.getByRole('button', { name: /Read more/i });
expect(button).toHaveAttribute('aria-expanded', 'false');
fireEvent.click(button);
expect(button).toHaveAttribute('aria-expanded', 'true');
```

**Testing Data Attributes**
```typescript
const card = screen.getByText('Memory Title').closest('article');
expect(card).toHaveAttribute('data-id', 'mem1');
```

---

## Mocking Common Patterns

### Mocking Data Fetching Functions
```typescript
import * as apptStore from '../../data/apptStore';

jest.mock('../../data/apptStore');

describe('Appointments', () => {
  beforeEach(() => {
    (apptStore.getAppointments as jest.Mock).mockReturnValue([
      {
        id: 'a1',
        title: 'Doctor Visit',
        date: '2024-06-04',
        time: '10:00',
        location: { name: 'Clinic', type: 'clinic' },
        isInMyDay: false,
      }
    ]);
  });

  test('displays appointments', () => {
    render(<Appointments />);
    expect(screen.getByText('Doctor Visit')).toBeInTheDocument();
  });
});
```

### Mocking Event Callbacks
```typescript
jest.mock('../../data/caregiverStore');

describe('Medications', () => {
  test('calls activity event on medication toggle', () => {
    const appendActivityEvent = jest.fn();
    (caregiverStore.appendActivityEvent as jest.Mock).mockImplementation(appendActivityEvent);

    render(<Medications />);
    const button = screen.getByRole('button', { name: /Mark.*as taken/i });
    fireEvent.click(button);

    expect(appendActivityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'med_taken',
      })
    );
  });
});
```

### Mocking localStorage
```typescript
// setupTests.ts already provides this, but here's the pattern:

beforeEach(() => {
  localStorage.clear();
});

test('persists data to localStorage', () => {
  render(<Medications />);
  
  const button = screen.getByRole('button', { name: /Mark.*taken/i });
  fireEvent.click(button);

  const stored = localStorage.getItem('careconnect_meds_taken');
  expect(stored).toBeTruthy();
  const data = JSON.parse(stored);
  expect(data['m1']).toBe(true);
});
```

### Mocking Date/Time
```typescript
beforeEach(() => {
  // Mock Date to return consistent value for testing
  jest.spyOn(global, 'Date').mockImplementation(
    () => new Date('2024-06-04T12:00:00Z') as any
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

---

## Common Assertions

### Text & Content
```typescript
expect(element).toHaveTextContent('Text');
expect(element.textContent).toContain('Part of text');
expect(screen.getByText('Text')).toBeInTheDocument();
```

### Visibility
```typescript
expect(element).toBeVisible();
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();
```

### CSS Classes & Styles
```typescript
expect(element).toHaveClass('active');
expect(element.className).toContain('line-through');
expect(element).toHaveStyle('display: block');
```

### Attributes
```typescript
expect(element).toHaveAttribute('aria-label', 'Expected label');
expect(element).toHaveAttribute('disabled');
expect(element).not.toHaveAttribute('hidden');
```

### Button/Form States
```typescript
expect(button).toHaveAttribute('aria-pressed', 'true');
expect(button).not.toBeDisabled();
expect(input).toHaveValue('text');
```

### Array/Collection Size
```typescript
const buttons = screen.getAllByRole('button');
expect(buttons).toHaveLength(5);
expect(buttons.length).toBeGreaterThan(0);
```

---

## Testing Accessibility

### Common Accessibility Tests
```typescript
describe('Accessibility', () => {
  test('uses proper heading hierarchy', () => {
    render(<Appointments />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('My Appointments');
  });

  test('provides aria labels for interactive elements', () => {
    render(<Medications />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  test('status messages are announced to screen readers', () => {
    render(<Medications />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('list items use semantic markup', () => {
    render(<Appointments />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });

  test('images have alt text', () => {
    render(<Memories />);
    const image = screen.getByAlt('Memory Title');
    expect(image).toBeInTheDocument();
  });

  test('expandable content uses aria-expanded', () => {
    render(<Memories />);
    const button = screen.getByText(/Read more/i);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
```

---

## Testing User Workflows

### Example: Marking Medication as Taken
```typescript
test('complete medication workflow', () => {
  // Setup
  render(<Medications />);

  // Initial state: 2 medications pending
  expect(screen.getByText(/2 medicines still to take/i)).toBeInTheDocument();

  // User marks first medicine as taken
  const amlodipineButton = screen.getByRole('button', {
    name: /Amlodipine.*taken/i,
  });
  fireEvent.click(amlodipineButton);

  // Verify state changed
  expect(screen.getByText('Amlodipine')).toHaveClass('line-through');
  expect(screen.getByText(/1 medicine still to take/i)).toBeInTheDocument();

  // Verify persistence
  const stored = JSON.parse(localStorage.getItem('careconnect_meds_taken')!);
  expect(stored['m1']).toBe(true);
});
```

### Example: Filtering Memories
```typescript
test('complete filtering workflow', () => {
  render(<Memories />);

  // All memories visible initially
  expect(screen.getByText('Family Reunion 2023')).toBeInTheDocument();
  expect(screen.getByText('Trip to Paris')).toBeInTheDocument();

  // User filters by Family
  const familyButton = screen.getByRole('button', { name: /^Family$/i });
  fireEvent.click(familyButton);

  // Verify filter applied
  expect(screen.getByText('Family Reunion 2023')).toBeInTheDocument();
  expect(screen.queryByText('Trip to Paris')).not.toBeInTheDocument();

  // User resets to All
  const allButton = screen.getByRole('button', { name: /^All$/i });
  fireEvent.click(allButton);

  // Both visible again
  expect(screen.getByText('Family Reunion 2023')).toBeInTheDocument();
  expect(screen.getByText('Trip to Paris')).toBeInTheDocument();
});
```

---

## Running Tests with Coverage

### Generate Coverage Report
```bash
npm run test:coverage
```

### What the Report Shows
```
Statements      : X%  - Actual statements executed
Branches        : X%  - If/else branches covered
Functions       : X%  - Functions called in tests
Lines           : X%  - Individual code lines executed
```

### Viewing Coverage
```bash
# Open in browser (Windows)
start coverage/index.html

# View summary in terminal
npm run test:coverage -- --verbose
```

### Improving Coverage
- Find untested lines in `coverage/index.html`
- Add tests that execute those code paths
- Aim for 60%+ coverage on all metrics

---

## Debugging Tips

### Print Rendered Output
```typescript
import { screen, render } from '@testing-library/react';

test('debug helper', () => {
  const { debug } = render(<Appointments />);
  debug();  // Prints full DOM tree
  
  // Or debug specific element
  const element = screen.getByText('Text');
  debug(element);
});
```

### Use screen.logTestingPlaygroundURL()
```typescript
test('debug with Testing Playground', () => {
  render(<Appointments />);
  screen.logTestingPlaygroundURL();  // Gives you a link to interactive debugger
});
```

### Console Logs in Tests
```typescript
test('with console output', () => {
  render(<Medications />);
  console.log('DOM:', screen.debug());
  console.log('Buttons:', screen.getAllByRole('button'));
});
```

---

## Common Test Scenarios

### Testing Conditional Rendering
```typescript
test('shows/hides elements based on state', () => {
  const { rerender } = render(<Appointments appointments={[]} />);
  expect(screen.getByText('No appointments')).toBeInTheDocument();

  rerender(<Appointments appointments={[mockAppointment]} />);
  expect(screen.queryByText('No appointments')).not.toBeInTheDocument();
  expect(screen.getByText(mockAppointment.title)).toBeInTheDocument();
});
```

### Testing Lists and Loops
```typescript
test('renders list items correctly', () => {
  render(<Medications medications={mockMeds} />);
  const items = screen.getAllByRole('article');
  expect(items).toHaveLength(mockMeds.length);
  mockMeds.forEach(med => {
    expect(screen.getByText(med.name)).toBeInTheDocument();
  });
});
```

### Testing Dynamic Content
```typescript
test('updates content dynamically', async () => {
  render(<Appointments />);
  
  const button = screen.getByRole('button', { name: /Add to My Day/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/In My Day/i)).toBeInTheDocument();
  });
});
```

---

## File Created

✅ **Appointments.test.tsx** - 40+ tests covering:
- Rendering and display
- Date/time formatting
- Appointment grouping
- Location details
- Add to My Day functionality
- Directions button
- Accessibility

✅ **Medications.test.tsx** - 35+ tests covering:
- Medication display
- Status summary
- Toggle functionality
- localStorage persistence
- Activity tracking
- Styling and opacity
- Accessibility

✅ **Memories.test.tsx** - 40+ tests covering:
- Filtering by category
- Pinned memories
- Expand/collapse
- Image display
- Category badges
- Grid layout
- Accessibility

---

## Coverage Goals

After implementing all tests:
```
npm run test:coverage

Expected output:
✓ Statements   : 60-70%
✓ Branches     : 60-70%
✓ Functions    : 60-70%
✓ Lines        : 60-70%
```

If coverage is lower, add more tests for untested branches and conditions.

---

## Next Steps

1. ✅ Jest configuration (jest.config.js created)
2. ✅ Setup file (src/setupTests.ts created)
3. ✅ Test files created (3 files with 100+ tests)
4. **Run tests**: `npm test`
5. **Check coverage**: `npm run test:coverage`
6. **Fix any failures**: Review test output and update code/tests
7. **Achieve 60%+ coverage**: Add more tests as needed

Good luck! 🎉
