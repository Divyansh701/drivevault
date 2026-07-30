/**
 * Jest setupFilesAfterEnv — runs after the Jest framework is initialised,
 * before every individual test suite.
 *
 * NOTE: process.env variables are set in tests/globalSetup.ts which runs
 * before any module is imported. Do not set them here — config.ts is
 * evaluated at import time, which happens before this file runs.
 */

// Extend the default Jest timeout — integration tests that spin up the Express
// app and (later) hit a real DB need more than the default 5 s.
jest.setTimeout(30_000);

// Silence console.log / info during test runs so output stays clean.
// console.error is left intact so unexpected errors still surface clearly.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'info').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});
