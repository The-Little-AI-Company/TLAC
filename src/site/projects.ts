export const statusLabels = {
  planned: "Planned",
  "in-progress": "In progress",
  live: "Live",
  paused: "Paused",
  research: "Research",
} as const;

export const statusOrder = ["live", "in-progress", "planned", "research", "paused"] as const;
