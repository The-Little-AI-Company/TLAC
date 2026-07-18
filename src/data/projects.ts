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
    name: 'Bellamente',
    status: 'Early release · open source',
    description: 'Long-term memory for AI agents that stays on your machine.',
    detail:
      'Bellamente gives agents durable, inspectable memory with semantic recall, versioned corrections, reversible forgetting, and a full audit trail.',
    image: '/brand/mascot/tlac-owl-filing.webp',
    productUrl: 'https://the-little-ai-company.github.io/bellamente/',
    repositoryUrl: 'https://github.com/The-Little-AI-Company/bellamente',
    productLabel: 'Explore Bellamente',
  },
  {
    name: 'Agent Relay',
    status: 'Open source · local-first',
    description: 'A visible handoff layer for people and AI agents.',
    detail:
      'Agent Relay moves work between agents, tools, queues, and humans without losing the source, limits, status, or receipt.',
    image: '/brand/mascot/tlac-owl-relay.webp',
    productUrl: 'https://the-little-ai-company.github.io/agent-relay-site/',
    repositoryUrl: 'https://github.com/The-Little-AI-Company/open-work-relay',
    productLabel: 'Explore Agent Relay',
  },
];
