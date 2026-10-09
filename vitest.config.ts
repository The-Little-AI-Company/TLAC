import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Unit tests read the built dist/ and the sources, so the site has to be built first (`pnpm verify` does that).
if (!existsSync(new URL('./dist/index.html', import.meta.url))) {
  throw new Error('dist/ is missing. Run `pnpm build` before `pnpm test`.');
}

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
