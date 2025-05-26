import type { RseConfig } from "./cfg-types";

export type IterableError = Iterable<{
  schema: unknown;
  path: string;
  value: unknown;
  message: string;
}>;

export type DetectedProject = {
  name: string;
  path: string;
  config: RseConfig;
  gitStatus?: {
    uncommittedChanges: number;
    unpushedCommits: number;
  };
  needsDepsInstall?: boolean;
  hasGit?: boolean;
};
