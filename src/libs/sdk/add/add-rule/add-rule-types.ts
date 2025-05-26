// ----------------------
// Type Definitions
// ----------------------

export interface UnghRepoResponse {
  repo?: {
    pushedAt: string;
  };
}

export interface RuleRepo {
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
}
