export type HomepageProject = {
  title: string;
  status: string;
  category: string;
  summary: string;
  proof: string;
  links: {
    label: string;
    href: string;
  }[];
  palette: ("blue" | "amber" | "green" | "red")[];
};

export const featuredProject: HomepageProject = {
  title: "Obscura",
  status: "In progress",
  category: "Creative AI tool",
  summary:
    "A focused creative studio for practical AI-assisted making, kept in the TLAC lane when the work is useful, legible, and public-facing.",
  proof:
    "Shows the kind of product TLAC exists to hold: real tools, clear boundaries, honest status, and visible craft.",
  links: [],
  palette: ["blue", "amber", "green", "red"],
};
