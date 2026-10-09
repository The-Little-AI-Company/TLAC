import { defineConfig } from 'vitest/config';

// Unit tests read the built dist/ and the sources. `pnpm verify` builds first.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
