import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest to transpile TypeScript on the fly — no separate build step needed
  preset: 'ts-jest',

  // Node environment — this is a backend REST API, not a browser app
  testEnvironment: 'node',

  // Point ts-jest at the test-aware tsconfig (includes tests/ directory)
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.test.json',
      // Disable type-check diagnostics in tests for speed — tsc --noEmit handles this
      diagnostics: false,
    }],
  },

  // Runs ONCE before anything is imported — sets process.env for config.ts
  globalSetup: '<rootDir>/tests/globalSetup.ts',

  // Scan both the src tree (co-located unit tests) and the dedicated tests/ folder
  roots: ['<rootDir>/tests', '<rootDir>/src'],

  // Match *.test.ts and *.spec.ts in any subdirectory
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],

  // Module resolution: support both node_modules and src-relative imports
  moduleDirectories: ['node_modules', 'src'],

  // Runs after Jest is initialised but before each test suite loads —
  // correct key is setupFilesAfterEnv (not setupFiles, which runs before the framework)
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',     // entry-point bootstrap, not unit-testable in isolation
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Readable output; prevent open handles from keeping the process alive
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};

export default config;

