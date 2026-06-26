// @ts-check
import { defineConfig } from 'astro/config';

// astro-grab is a dev-only tool (visual element targeting for coding agents).
// Imported only outside production builds so it never enters the prod graph.
const integrations = [];
if (process.env.NODE_ENV !== 'production') {
  const { astroGrab } = await import('astro-grab');
  integrations.push(astroGrab());
}

// https://astro.build/config
export default defineConfig({
  site: 'https://littleaicompany.com',
  // Dedicated dev port so TLAC never silently drifts onto another project's port.
  // strictPort makes a collision a clear error instead of a confusing bump.
  server: { port: 4399, strictPort: true },
  integrations,
});
