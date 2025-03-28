// ----------------------
// Type Definitions
// ----------------------

export type UnghRepoResponse = {
  repo?: {
    pushedAt: string;
  };
};

export type RuleRepo = {
  id: string;
  author: string;
  name: string;
  description: string;
  branch?: string;
  tags?: string[];
  category?: string;
  website?: string;
  isOfficial?: boolean;
  isCommunity?: boolean;
  communityPath?: string;
};
