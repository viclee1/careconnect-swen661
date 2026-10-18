module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.tsx'],
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
  ],
};
