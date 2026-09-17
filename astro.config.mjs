// @ts-check
import { defineConfig } from 'astro/config';

// Old URLs from the education-era site. The guides live on Jeff's own account now.
const guides = [
  'first-useful-thing',
  'is-ai-wrong',
  'prompt-anatomy',
  'use-case-menu',
  'make-it-better',
  'what-not-to-paste',
  'ai-good-and-bad',
];
const retired = ['/services', '/club', '/start-here', '/projects', '/brand', '/pages'];
const jeff = 'https://github.com/Jeff-Kazzee';

export default defineConfig({
  site: 'https://littleaicompany.com',
  server: { host: '127.0.0.1', port: 4399 },
  vite: { server: { strictPort: true } },
  redirects: {
    '/guides': jeff,
    ...Object.fromEntries(guides.map((slug) => [`/guides/${slug}`, jeff])),
    ...Object.fromEntries(retired.map((path) => [path, '/'])),
  },
});
