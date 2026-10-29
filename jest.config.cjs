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
  // Every source file counts, so the figure is the whole app's. The three
  // exclusions are code no unit test can reach:
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/setupTests.ts',
    // The Vite entry point and the service-worker registration read
    // import.meta.env, which Jest cannot load; Playwright covers both
    // (e2e: offline launch and the PWA tests).
    '!src/main.tsx',
    '!src/pwa/registerSW.ts',
    // The AI assistant is not mounted anywhere since the Week 11 Landing page;
    // its accessibility checks still run in src/accessibility.test.tsx.
    '!src/components/ChatBot.tsx',
  ],
  // lcov writes the HTML report too, to coverage/lcov-report.
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 85, branches: 85, functions: 85, lines: 85 },
  },
};
