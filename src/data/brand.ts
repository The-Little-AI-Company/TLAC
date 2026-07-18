export interface BrandPose {
  slug: string;
  label: string;
  family: 'Welcome' | 'Build' | 'Knowledge' | 'Trust' | 'Movement';
  use: string;
}

export const brandPoses: BrandPose[] = [
  { slug: 'welcome', label: 'Welcome', family: 'Welcome', use: 'Introductions and invitations' },
  { slug: 'coffee', label: 'Coffee', family: 'Welcome', use: 'Company voice and informal notes' },
  { slug: 'celebrating', label: 'Celebrating', family: 'Welcome', use: 'Launches and milestones' },
  { slug: 'building', label: 'Building', family: 'Build', use: 'Product implementation' },
  { slug: 'planning', label: 'Planning', family: 'Build', use: 'Roadmaps and work orders' },
  { slug: 'debugging', label: 'Debugging', family: 'Build', use: 'Engineering and fixes' },
  { slug: 'testing', label: 'Testing', family: 'Build', use: 'Verification and proof' },
  { slug: 'writing', label: 'Writing', family: 'Knowledge', use: 'Documentation and notes' },
  { slug: 'research', label: 'Research', family: 'Knowledge', use: 'Investigation and discovery' },
  { slug: 'teaching', label: 'Teaching', family: 'Knowledge', use: 'Guides and workshops' },
  { slug: 'presenting', label: 'Presenting', family: 'Knowledge', use: 'Demos and explanations' },
  { slug: 'checking', label: 'Checking', family: 'Trust', use: 'Review and judgment' },
  { slug: 'protecting', label: 'Protecting', family: 'Trust', use: 'Privacy and security' },
  { slug: 'filing', label: 'Filing', family: 'Trust', use: 'Organization and recall' },
  { slug: 'memory', label: 'Memory', family: 'Trust', use: 'Durable agent memory' },
  { slug: 'relay', label: 'Relay', family: 'Movement', use: 'Handoffs and ownership' },
  { slug: 'connecting', label: 'Connecting', family: 'Movement', use: 'Integrations and systems' },
  { slug: 'shipping', label: 'Shipping', family: 'Movement', use: 'Releases and delivery' },
];

