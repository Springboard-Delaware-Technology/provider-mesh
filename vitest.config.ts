import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/boundary/fixtures/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
    // Fixture and secret values must never surface in test output (§5.8); keep reporters terse.
    reporters: ['default'],
  },
});
