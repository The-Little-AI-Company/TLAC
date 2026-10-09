import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests read the built dist/ and the sources, so the site has to be built first (`pnpm verify` does that),
// and built again after any change to src/ or public/, or the tests would pass against the old build.
const root = fileURLToPath(new URL('.', import.meta.url));
const built = join(root, 'dist', 'index.html');

if (!existsSync(built)) {
  throw new Error('dist/ is missing. Run `pnpm build` before `pnpm test`.');
}

const builtAt = statSync(built).mtimeMs;
const newer: string[] = [];
for (const dir of ['src', 'public']) {
  for (const entry of readdirSync(join(root, dir), { recursive: true, encoding: 'utf8' })) {
    const file = join(dir, entry);
    const stat = statSync(join(root, file));
    if (stat.isFile() && stat.mtimeMs > builtAt) newer.push(file);
  }
}
if (newer.length > 0) {
  const shown = newer.slice(0, 3).join(', ');
  throw new Error(`dist/ is out of date: ${shown}${newer.length > 3 ? ` and ${newer.length - 3} more` : ''} changed after the last build. Run \`pnpm build\` before \`pnpm test\`.`);
}

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
