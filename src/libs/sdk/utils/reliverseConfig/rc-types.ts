import type { ReliverseConfig } from "~/libs/cfg/cfg-main.js";

export type IterableError = Iterable<{
  schema: unknown;
  path: string;
  value: unknown;
  message: string;
}>;

export type DetectedProject = {
  name: string;
  path: string;
  config: ReliverseConfig;
  gitStatus?: {
    uncommittedChanges: number;
    unpushedCommits: number;
  };
  needsDepsInstall?: boolean;
  hasGit?: boolean;
};
