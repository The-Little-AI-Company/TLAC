export const statusLabels = {
  planned: "Planned",
  "in-progress": "In progress",
  live: "Live",
  paused: "Paused",
} as const;

export const statusOrder = ["live", "in-progress", "planned", "paused"] as const;
