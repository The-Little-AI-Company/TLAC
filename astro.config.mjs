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
  // Bind IPv4 loopback so BOTH 127.0.0.1:4399 and localhost:4399 work on Windows
  // (default binds IPv6 ::1 only, which refuses 127.0.0.1).
  server: { host: '127.0.0.1', port: 4399 },
  // strictPort belongs to Vite's config, not Astro's server config.
  vite: { server: { strictPort: true } },
  integrations,
});
