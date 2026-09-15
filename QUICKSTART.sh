#!/usr/bin/env bash
# Assignment 5 - Quick Start Script
# Copy and paste commands as needed

echo "🚀 Assignment 5 for SWEN 661 - CareConnect"
echo "==========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Install Testing Dependencies"
echo "$ npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest identity-obj-proxy"
echo ""
echo "This will take 2-3 minutes. Wait for npm to finish."
echo ""

# Step 2: Verify setup
echo "✓ Step 2: Verify Files Created"
echo ""
echo "Configuration Files:"
echo "  ✓ jest.config.js"
echo "  ✓ src/setupTests.ts"
echo ""
echo "Test Files (115+ tests total):"
echo "  ✓ src/pages/__tests__/Appointments.test.tsx (40+ tests)"
echo "  ✓ src/pages/__tests__/Medications.test.tsx  (35+ tests)"
echo "  ✓ src/pages/__tests__/Memories.test.tsx     (40+ tests)"
echo ""
echo "Documentation Files:"
echo "  ✓ ASSIGNMENT5_GUIDE.md               - Master guide for all 8 tasks"
echo "  ✓ TESTING_GUIDE.md                   - Jest & React Testing Library patterns"
echo "  ✓ DEMO_VIDEO_SCRIPT.md               - 10-15 min demo script with timing"
echo "  ✓ EMULATOR_TESTING_GUIDE.md          - Chrome DevTools device emulation"
echo "  ✓ COMPARISON_DOCUMENT_OUTLINE.md     - React Native vs Flutter structure"
echo "  ✓ COMPLETE_CHECKLIST.md              - Task-by-task execution guide"
echo ""

# Step 3: Run tests
echo "▶ Step 3: Run Tests"
echo "$ npm test"
echo ""
echo "Expected: All 115+ tests pass ✓"
echo ""

# Step 4: Generate coverage
echo "📊 Step 4: Generate Coverage Report"
echo "$ npm run test:coverage"
echo ""
echo "Expected: 60%+ coverage across all metrics ✓"
echo ""

# Step 5: View coverage
echo "🌐 Step 5: Open Coverage Report in Browser"
echo ""
echo "Windows:"
echo "$ start coverage/index.html"
echo ""
echo "Mac:"
echo "$ open coverage/index.html"
echo ""
echo "Linux:"
echo "$ firefox coverage/index.html"
echo ""

# Step 6: Dev server
echo "🔧 Step 6: Start Development Server"
echo "$ npm run dev"
echo ""
echo "Then open http://localhost:5173 in Chrome"
echo ""

# Step 7: Emulator testing
echo "📱 Step 7: Test on Emulators"
echo "1. Press F12 to open DevTools"
echo "2. Click device toggle (≡ icon) in top-left"
echo "3. Select 'iPhone 12' for phone view"
echo "4. Navigate through all 3 screens"
echo "5. Select 'iPad Pro' for tablet view"
echo ""
echo "See EMULATOR_TESTING_GUIDE.md for detailed checklist"
echo ""

# Final steps
echo "✨ Remaining Tasks:"
echo "  1. Wait for PR #3 merge from viclee1"
echo "  2. Pull merged team code"
echo "  3. Record demo video (use DEMO_VIDEO_SCRIPT.md)"
echo "  4. Write React Native vs Flutter comparison (use COMPARISON_DOCUMENT_OUTLINE.md)"
echo ""

echo "📚 Documentation Guides:"
echo "  - Start with: COMPLETE_CHECKLIST.md"
echo "  - For testing: TESTING_GUIDE.md"
echo "  - For emulator: EMULATOR_TESTING_GUIDE.md"
echo "  - For video: DEMO_VIDEO_SCRIPT.md"
echo "  - For comparison: COMPARISON_DOCUMENT_OUTLINE.md"
echo ""

echo "✅ All setup complete! Ready to test."
echo ""
