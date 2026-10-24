module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Vite's import.meta.env cannot be parsed by Jest; use the stub.
    '^(\\.{1,2}/)+lib/env$': '<rootDir>/src/lib/__mocks__/env.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    }],
  },
  collectCoverageFrom: [
    'src/pages/Appointments.tsx',
    'src/pages/Medications.tsx',
    'src/pages/Memories.tsx',
    // Contacts, Messaging and Accessibility Settings (Victor)
    'src/pages/Contacts.tsx',
    'src/pages/MessageThread.tsx',
    'src/pages/AccessibilitySettings.tsx',
    'src/pages/PlaceholderPage.tsx',
    'src/components/contacts/**/*.tsx',
    'src/components/messaging/**/*.tsx',
    'src/components/settings/**/*.tsx',
    'src/context/MessagesContext.tsx',
    'src/context/SettingsContext.tsx',
    'src/context/messages.ts',
    'src/context/settings.ts',
    'src/hooks/useLocalStorageState.ts',
    'src/hooks/useOnlineStatus.ts',
    'src/hooks/useMediaQuery.ts',
    'src/models/**/*.ts',
    'src/utils/**/*.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: { statements: 75, branches: 75, functions: 75, lines: 75 },
  },
};
