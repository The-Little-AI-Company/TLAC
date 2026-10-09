/**
 * The exact strings and numbers of SPEC sections 1 to 9, written once so the unit and
 * end-to-end tests quote the same contract. Change the spec, change this file.
 *
 * Curly quotes do not matter when comparing copy (see `straighten` in text.ts).
 */
import { SITE } from './dist';

export const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;
export const RELEASED_PATTERN = /^Released · v\d+\.\d+\.\d+$/;

// ---------------------------------------------------------------------------
// Head and chrome (SPEC 6)

export const HEAD = {
  ogImage: `${SITE}/og.png`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  twitterCard: 'summary_large_image',
  colorScheme: 'light dark',
  themeColorLight: { content: '#f6f3ec', media: '(prefers-color-scheme: light)' },
  themeColorDark: { content: '#15120f', media: '(prefers-color-scheme: dark)' },
  favicons: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  /** Preloaded, in this order, with `crossorigin`. The italic is never preloaded. */
  preloads: ['/fonts/instrument-serif-latin.woff2', '/fonts/instrument-sans-latin.woff2'],
} as const;

export const FOOTER = {
  line: 'The Little AI Company · Jeff Kazzee · rural Idaho',
  links: [
    { label: 'jeff@littleaicompany.com', href: 'mailto:jeff@littleaicompany.com' },
    { label: 'GitHub', href: 'https://github.com/The-Little-AI-Company' },
    { label: 'JeffKazzee.dev', href: 'https://jeffkazzee.dev' },
  ],
  note: 'No cookies, no trackers, nothing loaded from anyone else.',
} as const;

export const SKIP_LINK = { label: 'Skip to content', href: '#main' } as const;
export const BRAND = 'The Little AI Company';

// ---------------------------------------------------------------------------
// Fonts and assets (SPEC 2)

export const FONT_FILES = [
  'instrument-serif-latin.woff2',
  'instrument-serif-italic-latin.woff2',
  'instrument-sans-latin.woff2',
] as const;

/** The staged font files, byte for byte (`$STAGE/fonts`). */
export const FONT_SHA256: Record<(typeof FONT_FILES)[number], string> = {
  'instrument-serif-latin.woff2': '5eb09b5ac0e28b67c2f041c8ba6d244604ca0c0980d65912ab2d47fed84ddc31',
  'instrument-serif-italic-latin.woff2': '5a51946dfffa82972bc98745359c46761515641fda557c25116459a9f83da4a7',
  'instrument-sans-latin.woff2': '2ee17598a98d8a59e4df8152d015bec9ab8e4d5672cc0ab42bef806b568e3971',
};

export const FONT_FACES = [
  { family: 'Instrument Serif', file: 'instrument-serif-latin.woff2', weight: '400' },
  { family: 'Instrument Serif Italic', file: 'instrument-serif-italic-latin.woff2', weight: '400' },
  { family: 'Instrument Sans', file: 'instrument-sans-latin.woff2', weight: '400 700' },
] as const;

export const OFL_FILES = {
  'OFL-instrument-serif.txt': 'Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif)',
  'OFL-instrument-sans.txt': 'Copyright 2022 The Instrument Sans Project Authors (https://github.com/Instrument/instrument-sans)',
} as const;

/** sha256 of the OFL 1.1 body (from the dashed rule before "SIL OPEN FONT LICENSE" to the end) in the old OFL-archivo.txt. */
export const OFL_BODY_SHA256 = 'f05e84c3000faf09cf8e445d35018b01fc0d6026953840e9398aeab501b86da2';

/** Font files that must be gone from public/fonts. */
export const RETIRED_FONT_FILES = [
  'big-shoulders-stencil-latin.woff2',
  'archivo-latin.woff2',
  'OFL-big-shoulders-stencil.txt',
  'OFL-archivo.txt',
] as const;

export interface StagedImage {
  src: string;
  width: number;
  height: number;
  sha256: string;
}

/** The staged images, byte for byte (`$STAGE/images`). */
export const IMAGES = {
  mascot760: { src: '/images/vivary-mascot-skate-760.webp', width: 760, height: 678, sha256: '0849a457e494783b40cdc984f85331b3f1c27da3db8c52ee24a94e63e34dcdd3' },
  mascot640: { src: '/images/vivary-mascot-skate-640.webp', width: 640, height: 571, sha256: '4b5176741d1c554a0be662cccb0bcb80e41e00f5227de9ec882bee50bb2eecc7' },
  workspace: { src: '/images/vivary-workspace-2026-10-03.webp', width: 1200, height: 844, sha256: 'da6e372374a7f7e9d50621a9590fae37a04055b8bffac4ffff244c4be5c45e23' },
  vivarySite: { src: '/images/vivary-site-2026-10-08.webp', width: 1200, height: 750, sha256: '1dd7b9a4b31098a80f054aa6719ce37ff9298aa5aa74a516900f4d2022b3eed4' },
  factbook: { src: '/images/open-world-factbook-2026-10-08.webp', width: 960, height: 600, sha256: 'fd642db3b9d93a32dd9d4605aba6c177541b99eb8f2f9a1a0d26ec575e086e5d' },
  arcade: { src: '/images/llm-arcade-jeffkazzee-dev.webp', width: 960, height: 600, sha256: '9c1d7149eca6e2e50d876c9b701a0704684f8408fdc0eff4db3fec120ac67e59' },
  puckwork: { src: '/images/puckwork-jeffkazzee-dev.webp', width: 960, height: 548, sha256: '5b3fd6de21ad4c854ea0a3c8fa4ddf1145ed100149e1f4df883d2786bf5af9ad' },
  neonNoir: { src: '/images/neon-noir-2026-10-08.webp', width: 960, height: 600, sha256: 'dd3a9dcb110cc73dd6d259bd9d68febe36a9751307b727895d34df45cc171631' },
} as const satisfies Record<string, StagedImage>;

// ---------------------------------------------------------------------------
// Home (SPEC 8)

export const HOME = {
  title: BRAND,
  description:
    "I'm Jeff Kazzee. I build Callout, a hotkey that checks what you read, and Vivary, a desktop workspace for AI agents. Small tools that keep you in charge.",
  now: 'Now building Vivary. A Windows preview came out Sept 22.',
  h1: 'Tools for the work you keep doing by hand.',
  lede:
    "I'm Jeff Kazzee. I build Callout, a hotkey that checks what you read, and Vivary, a desktop workspace for AI agents. Small tools that keep you in charge of the AI you use.",
  buttons: [
    { label: 'Get Callout', href: '/callout/', variant: 'primary' },
    { label: 'See Vivary', href: '/vivary/', variant: 'secondary' },
  ],
  mascot: {
    phoneMedia: '(max-width: 860px)',
    phone: IMAGES.mascot640,
    desktop: IMAGES.mascot760,
    alt: 'The Vivary mascot, a felt creature with antlers, riding a skateboard with a paintbrush, a potted flower and a notebook.',
  },
  vivary: {
    numeral: 'I. The main project',
    title: 'Vivary',
    plate: {
      ...IMAGES.workspace,
      alt: 'Vivary development build, captured Oct 3, 2026, before Claude Code sign-in.',
      caption: 'Development build, Oct 3, 2026, before Claude Code sign-in.',
    },
    body:
      'A desktop workspace for working with AI agents on your own projects. Conversations sit beside your notes, research, drafts and code. You bring your own Claude Code or Codex account, and the files stay on your machine.',
    tone: 'wip',
    status: 'Unsigned Windows preview · Sept 22, 2026',
    button: { label: 'More about Vivary', href: '/vivary/' },
  },
  callout: {
    numeral: 'II. Released',
    title: 'Callout',
    rows: [
      { term: 'Runs on', detail: 'Windows 10 and 11' },
      { term: 'Version', detail: VERSION_PATTERN },
      { term: 'License', detail: 'MIT' },
      { term: 'Price', detail: 'Free. Bring your own API keys.' },
    ],
    quote: 'Signals in the text itself. Not a truth check.',
    quoteCaption: 'The header on every Callout result.',
    tone: 'shipped',
    button: { label: 'More about Callout', href: '/callout/' },
  },
  other: {
    heading: 'Other things I have made',
    maxWidth: 940,
  },
  how: {
    heading: 'How I work',
    text: 'Everything I make keeps you in the loop. You can read what it did, stop it, and undo it.',
    lanes: [
      { term: 'You decide', detail: 'The tool proposes and you approve. A human gate is a feature, not a speed bump.' },
      { term: 'You can read everything', detail: 'State is plain files on your machine, not a hosted store you cannot open.' },
      { term: 'You keep learning', detail: 'A tool that thinks for you leaves you weaker. Mine show their work so you get sharper.' },
      { term: 'Sources or silence', detail: 'Every claim carries where it came from. Unsure is a real answer.' },
    ],
  },
} as const;

export interface ProjectExpectation {
  title: string;
  line: string;
  tone: 'shipped' | 'alpha' | 'demo';
  status: string;
  href: string;
  linkLabel: string;
  image: StagedImage;
}

/** The four "other things I have made", in the order they appear. */
export const PROJECTS: readonly ProjectExpectation[] = [
  {
    title: 'Open World Factbook',
    line: 'An open-source database of 262 countries and territories.',
    tone: 'shipped',
    status: 'Shipped',
    href: 'https://worldfactbook.xyz',
    linkLabel: 'worldfactbook.xyz',
    image: IMAGES.factbook,
  },
  {
    title: 'LLM Arcade',
    line: 'A social arcade with 11 games. AI agents wrote every line.',
    tone: 'alpha',
    status: 'Alpha',
    href: 'https://llmarcade.fun',
    linkLabel: 'llmarcade.fun',
    image: IMAGES.arcade,
  },
  {
    title: 'Puckwork',
    line: 'Air hockey with a simulated air cushion, in one canvas file.',
    tone: 'demo',
    status: 'Demo',
    href: 'https://puckwork.vercel.app',
    linkLabel: 'puckwork.vercel.app',
    image: IMAGES.puckwork,
  },
  {
    title: 'Neon Noir Detective Agency',
    line: 'A fictional agency site in pure HTML and CSS.',
    tone: 'demo',
    status: 'Demo',
    href: 'https://neon-noir-detective-agency.vercel.app',
    linkLabel: 'neon-noir-detective-agency.vercel.app',
    image: IMAGES.neonNoir,
  },
] as const;

// ---------------------------------------------------------------------------
// Callout page (SPEC 8). Body copy is carried over from the previous callout.astro.

export interface LaneExpectation {
  term: string;
  detail: string;
}

export interface SectionExpectation {
  heading: string;
  /** Paragraphs outside the lanes, in order. */
  paragraphs: readonly string[];
  lanes: readonly LaneExpectation[];
}

export const CALLOUT_PAGE = {
  h1: 'Callout',
  lede: 'Press a key. Get the receipts.',
  buttons: [
    { label: 'Download for Windows', href: 'https://github.com/The-Little-AI-Company/callout/releases/latest/download/Callout-Setup.exe', variant: 'primary' },
    { label: 'Source on GitHub', href: 'https://github.com/The-Little-AI-Company/callout', variant: 'secondary' },
  ],
  facts: 'Windows 10 and 11 · MIT · No account',
  sections: [
    {
      heading: 'What it does',
      paragraphs: [
        'Select text anywhere on Windows, press the hotkey, and a small popover answers two questions. Every result carries the same header: signals in the text itself, not a truth check.',
      ],
      lanes: [
        {
          term: 'Fast lane, under a second',
          detail:
            'Is this text trying to manipulate you? Callout scores the passage against a battery of manipulation signals, such as false urgency, loaded framing, and appeals that stand in for evidence.',
        },
        {
          term: 'Deep lane, a few seconds',
          detail:
            'Do the specific claims hold up? Callout pulls out the checkable claims, looks first at the sources the text cites, then searches the web, and shows you what it found. Nothing is shown without a source. Unsure is a real answer.',
        },
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'Three parts with one rule between them. The model that judges never writes prose, and the model that writes prose never judges.',
      ],
      lanes: [
        {
          term: 'A judging model',
          detail:
            'Returns probabilities, never sentences. It scores content kind, the manipulation battery, passage relevance, claim-versus-evidence support, and every sentence the helper writes.',
        },
        {
          term: 'A writing helper',
          detail:
            'Any OpenAI-compatible or Anthropic endpoint. It extracts claims, drafts search queries, reads screenshots, and writes the two-sentence summary. Everything it writes goes back through the judge.',
        },
        {
          term: 'Code owns the thresholds',
          detail: 'Every threshold, cap, and question lives in one readable file in the repository. Nothing is tuned behind a server.',
        },
      ],
    },
    {
      heading: 'What stays on your machine',
      paragraphs: [],
      lanes: [
        {
          term: 'Everything',
          detail:
            'No server, no account, no telemetry. The text you check goes to the three APIs you configure and to the pages Callout fetches for evidence, and nowhere else.',
        },
        { term: 'Your keys', detail: 'You bring your own API keys. They sit in Windows Credential Manager, never in a plain-text file.' },
        { term: 'Your history', detail: 'Off by default. Usage counters stay local.' },
      ],
    },
  ] satisfies readonly SectionExpectation[],
  get: {
    heading: 'Get it',
    lede: 'Download the installer for Windows 10 and 11, run it, and paste your API keys into Settings. No account. Open source under MIT.',
    button: { label: 'Download for Windows', href: 'https://github.com/The-Little-AI-Company/callout/releases/latest/download/Callout-Setup.exe' },
    note:
      "The installer is not code-signed yet, so Windows SmartScreen warns on first run. Choose More info, then Run anyway. The source is on GitHub if you'd rather build it yourself.",
  },
} as const;

// ---------------------------------------------------------------------------
// Vivary page (SPEC 8)

export const VIVARY_PAGE = {
  h1: 'Vivary',
  lede: 'Your projects. Your agents. Your machine.',
  status: 'Unsigned Windows preview · Sept 22, 2026',
  buttons: [
    { label: 'Visit vivaryagent.xyz', href: 'https://vivaryagent.xyz', variant: 'primary' },
    { label: 'Release queue on GitHub', href: 'https://github.com/vivary-dev/vivary/milestone/1', variant: 'secondary' },
  ],
  plate: {
    ...IMAGES.vivarySite,
    alt: 'The vivaryagent.xyz home page, Oct 8, 2026.',
    caption: 'vivaryagent.xyz, Oct 8, 2026.',
  },
  sections: [
    {
      heading: 'What it is',
      paragraphs: [
        'One app where you open a project, talk to an agent about it, and watch what the agent does to your files. The agents, your credentials, your files, and the conversation history stay on the machine that runs Vivary.',
      ],
      lanes: [
        { term: 'Work on a project', detail: 'Open a project and work with an agent that can read files, edit them, and run tools. Every change lands in your own folder.' },
        { term: 'Come back to it', detail: "Return to a project's conversations, search past sessions, and keep the memory worth keeping in files you can open." },
        {
          term: 'Use the harnesses you have',
          detail:
            'Supported coding harnesses you already installed, such as Claude Code, run inside the workspace with their own tools. Guidance for them lives in files in the project.',
        },
        { term: "See what you're building", detail: 'Preview the site or dashboard the agent is working on, and let the agent inspect and debug it.' },
        {
          term: 'Reach it from your phone',
          detail: 'Run the instance on your computer or a server of your own, and connect a phone browser to it when you choose to turn on remote access.',
        },
      ],
    },
    {
      heading: 'What it asks of you',
      paragraphs: [],
      lanes: [
        { term: 'No Vivary account', detail: 'Local desktop use needs none. Your provider accounts are yours and separate.' },
        { term: 'Remote access is opt-in', detail: "Off until you set it up, and authenticated when it's on." },
        { term: 'Windows first', detail: 'The desktop app targets Windows. A Mac build is possible later work, not a promise.' },
      ],
    },
  ] satisfies readonly SectionExpectation[],
  statusSection: {
    heading: 'Status',
    lede:
      'In development. A Windows preview came out on Sept 22, 2026 as a pre-release: an unsigned portable ZIP, not a stable release. The release queue lists what is verified and what is still required, in the open. MIT.',
    links: [
      { label: 'release queue', href: 'https://github.com/vivary-dev/vivary/milestone/1' },
      { label: 'pre-release', href: 'https://github.com/vivary-dev/vivary/releases' },
    ],
    cli:
      'The original Vivary command-line tools, which scaffold typed memory for agent workspaces, are preserved as @vivary/create on npm and create-vivary on PyPI. They are not the desktop app.',
    cliLinks: [
      { label: '@vivary/create', href: 'https://www.npmjs.com/package/@vivary/create' },
      { label: 'create-vivary', href: 'https://pypi.org/project/create-vivary/' },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// About, Contact, 404 (SPEC 8)

export const ABOUT_PAGE = {
  h1: 'About',
  lede:
    "The Little AI Company is my independent software studio. I'm Jeff Kazzee, and I build small tools for people who use AI and intend to stay in charge of it.",
  position: {
    heading: 'The position',
    paragraphs: [
      "Most AI products are built to take work off your hands. Some of that is useful. Past a point it takes your judgment with it, and you end up trusting output you can't inspect from a system you can't stop.",
      // The middle of this paragraph may be reworded as long as it keeps these ends.
      { startsWith: 'I build the other kind. A tool of mine ', endsWith: 'It should leave you sharper than it found you.' },
      "That's the whole company. Everything I ship is open source and runs on your machine.",
    ],
  },
  dont: {
    heading: "What I don't do",
    lanes: [
      { term: 'No hosted memory', detail: "I don't keep your data on my servers. I don't have servers." },
      { term: 'No telemetry', detail: "My tools don't phone home, and neither does this site." },
      { term: 'No autopilot', detail: 'Nothing ships that acts on your behalf without a gate you can see.' },
      {
        term: 'Guides',
        detail: 'My guides and workshop notes on second brains and Zo Computer live on my own account at github.com/Jeff-Kazzee.',
      },
    ],
    link: { label: 'github.com/Jeff-Kazzee', href: 'https://github.com/Jeff-Kazzee' },
  },
} as const;

export const CONTACT_PAGE = {
  h1: 'Contact',
  lede: "One person answers this. That's me. Expect a reply within a few days.",
  lanes: [
    { term: 'Email', detail: 'jeff@littleaicompany.com', links: [{ label: 'jeff@littleaicompany.com', href: 'mailto:jeff@littleaicompany.com' }] },
    {
      term: 'Bugs',
      detail: "Open an issue on the tool's repository: Callout or Vivary.",
      links: [
        { label: 'Callout', href: 'https://github.com/The-Little-AI-Company/callout/issues' },
        { label: 'Vivary', href: 'https://github.com/vivary-dev/vivary/issues' },
      ],
    },
    {
      term: 'Security',
      detail: `Email the address above with "security" in the subject. Don't open a public issue for a vulnerability.`,
      links: [],
    },
    {
      term: 'Elsewhere',
      detail: 'GitHub, X, and Bluesky.',
      links: [
        { label: 'GitHub', href: 'https://github.com/The-Little-AI-Company' },
        { label: 'X', href: 'https://x.com/JeffKazzee' },
        { label: 'Bluesky', href: 'https://bsky.app/profile/jeffkazzee.bsky.social' },
      ],
    },
  ],
} as const;

export const NOT_FOUND_PAGE = {
  h1: 'Page not found',
  lede: "That address doesn't lead anywhere on this site.",
  buttons: [
    { label: 'Go to the home page', href: '/', variant: 'primary' },
    { label: 'Contact', href: '/contact/', variant: 'secondary' },
  ],
} as const;

// ---------------------------------------------------------------------------
// Data (SPEC 9)

export const TOOLS_EXPECTED = {
  callout: {
    fallback: 'v0.2.0',
    summary:
      'Press a hotkey over anything you are reading. A small popover tells you whether the text is trying to manipulate you, and whether its claims hold up against sources it fetched.',
    repo: 'https://github.com/The-Little-AI-Company/callout',
    primary: { label: 'Download for Windows', href: CALLOUT_PAGE.buttons[0].href },
  },
  vivary: {
    status: 'Unsigned Windows preview · Sept 22, 2026',
    primary: { label: 'Visit vivaryagent.xyz', href: 'https://vivaryagent.xyz' },
    repo: 'https://github.com/vivary-dev/vivary',
    queue: 'https://github.com/vivary-dev/vivary/milestone/1',
  },
} as const;

// ---------------------------------------------------------------------------
// Voice (SPEC 7)

/** All-caps words that are allowed in visible text. Roman numerals and ZIP are spec-forced, see copy-rules.test.ts. */
export const CAPS_ALLOWLIST: ReadonlySet<string> = new Set(['AI', 'MIT', 'API', 'APIs', 'LLM', 'HTML', 'CSS', 'CLI', 'V1', 'OS']);

export const BANNED_WORDS = ['unlock', 'empower', 'seamless', 'robust', 'revolutionary', 'game-changing', 'elevate'] as const;

/** Case-sensitive. Carried over from the old test suite. */
export const RETIRED_NAMES = ['Wazoo', 'Hoolio', 'Bellamente', 'HarnessMax', 'Agent Relay', 'Starter Kit', 'beta', 'Beta', 'Two tools'] as const;

/** Dates the copy may contain. Anything else would be invented. */
export const KNOWN_DATES = ['Sept 22, 2026', 'Oct 3, 2026', 'Oct 8, 2026'] as const;

/** Redirects from astro.config.mjs that must keep working. */
export const RETIRED_PAGES = ['services', 'club', 'start-here', 'projects', 'brand', 'pages'] as const;
export const GUIDE_REDIRECT_TARGET = 'https://github.com/Jeff-Kazzee';
export const GUIDE_PAGES = [
  'guides',
  'guides/first-useful-thing',
  'guides/is-ai-wrong',
  'guides/prompt-anatomy',
  'guides/use-case-menu',
  'guides/make-it-better',
  'guides/what-not-to-paste',
  'guides/ai-good-and-bad',
] as const;

export const TOKENS = {
  fonts: {
    '--font-display': '"Instrument Serif", Georgia, serif',
    '--font-display-italic': '"Instrument Serif Italic", Georgia, serif',
    '--font-text': '"Instrument Sans", system-ui, sans-serif',
    '--font-mono': 'ui-monospace, Consolas, Menlo, monospace',
  },
  motion: { '--ease': 'cubic-bezier(.22, 1, .36, 1)', '--dur': '.18s' },
} as const;

/** design/tokens.json is a verbatim copy of the design system's tokens.json. */
export const TOKENS_JSON_SHA256 = '352231586dbdf01b171c7b185291ecb1afdf67942e9edf7dadb07a183a46aeb9';
