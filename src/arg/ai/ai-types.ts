export const AGENTS = ["relinter"] as const;
export type Agent = (typeof AGENTS)[number];
