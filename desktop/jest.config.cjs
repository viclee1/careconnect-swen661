/**
 * Renderer and main-process tests both run here.
 *
 * `jsdom` is the default because most of the suite is React Testing Library
 * against the renderer; the main-process tests declare `@jest-environment node`
 * at the top of the file where they need the real Node globals.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  collectCoverageFrom: [
    'src/renderer/**/*.{ts,tsx}',
    'src/main/**/*.ts',
    'src/shared/**/*.ts',
    '!src/renderer/main.tsx',
    '!src/renderer/vite-env.d.ts',
    '!src/**/__tests__/**',
    '!src/renderer/test-support/**',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
