/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-support/**',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
