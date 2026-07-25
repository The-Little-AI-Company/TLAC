export interface Project {
  name: string;
  status: string;
  description: string;
  detail: string;
  image: string;
  productUrl: string;
  repositoryUrl: string;
  productLabel: string;
}

export const projects: Project[] = [
  {
    name: 'Vivary',
    status: 'Open source · active development',
    description: 'Shared project context and proof for people working with AI agents.',
    detail:
      'Vivary keeps project memory, current state, useful instructions, and proof organized so people and agents can continue work without losing what matters.',
    image: '/brand/mascot/tlac-owl-memory.webp',
    productUrl: 'https://vivary.vercel.app/',
    repositoryUrl: 'https://github.com/vivary-dev/vivary',
    productLabel: 'Explore Vivary',
  },
  {
    name: 'Bellamente',
    status: 'Early release · open source',
    description: 'Long-term memory for AI agents that stays on your machine.',
    detail:
      'Bellamente helps an agent remember useful context over time while keeping corrections, forgetting, and the history of changes visible to the user.',
    image: '/brand/mascot/tlac-owl-filing.webp',
    productUrl: 'https://the-little-ai-company.github.io/bellamente/',
    repositoryUrl: 'https://github.com/The-Little-AI-Company/bellamente',
    productLabel: 'Explore Bellamente',
  },
  {
    name: 'Agent Relay',
    status: 'Early release · open source',
    description: 'A visible handoff layer for people and AI agents.',
    detail:
      'Agent Relay moves work between agents, tools, queues, and humans without losing the source, limits, status, or receipt.',
    image: '/brand/mascot/tlac-owl-relay.webp',
    productUrl: 'https://the-little-ai-company.github.io/agent-relay-site/',
    repositoryUrl: 'https://github.com/The-Little-AI-Company/open-work-relay',
    productLabel: 'Explore Agent Relay',
  },
];
