import type { Static } from "@sinclair/typebox";

import type { rseSchema } from "./cfg-schema";

export type RseConfig = Static<typeof rseSchema>;

export type ProjectCategory = Exclude<RseConfig["projectCategory"], undefined>;

export type ProjectSubcategory = Exclude<
  RseConfig["projectSubcategory"],
  undefined
>;

export type ProjectFramework = Exclude<
  RseConfig["projectFramework"],
  undefined
>;

export type ProjectArchitecture = Exclude<
  RseConfig["projectArchitecture"],
  undefined
>;

export type RelinterConfirm = Exclude<RseConfig["relinterConfirm"], undefined>;

export type IterableError = Iterable<{
  schema: unknown;
  path: string;
  value: unknown;
  message: string;
}>;

export interface DetectedProject {
  name: string;
  path: string;
  config: RseConfig;
  gitStatus?: {
    uncommittedChanges: number;
    unpushedCommits: number;
  };
  needsDepsInstall?: boolean;
  hasGit?: boolean;
}

export type BiomeConfigResult = {
  lineWidth?: number;
  indentStyle?: "space" | "tab";
  indentWidth?: 2 | 4 | 8;
  quoteMark?: "single" | "double";
  semicolons?: boolean;
  trailingComma?: boolean;
} | null;

export interface BaseConfig {
  version: string;
  generatedAt: string;
}

export type BiomeConfig = BaseConfig & {
  $schema: string;
  organizeImports: {
    enabled: boolean;
  };
  formatter: {
    enabled: boolean;
    lineWidth?: number;
    indentStyle?: "space" | "tab";
    indentWidth?: 2 | 4 | 8;
  };
  linter: {
    enabled: boolean;
    rules?: {
      recommended?: boolean;
    };
  };
  javascript?: {
    formatter: {
      trailingComma?: "all" | "es5" | "none";
      quoteStyle?: "single" | "double";
      semicolons?: "always" | "never";
    };
  };
};

export type DeploymentService =
  | "vercel"
  | "deno"
  | "netlify"
  | "railway"
  | "none";

export interface VSCodeSettings {
  "editor.formatOnSave"?: boolean;
  "editor.defaultFormatter"?: string;
  "editor.codeActionsOnSave"?: Record<string, string>;
  "eslint.ignoreUntitled"?: boolean;
  "eslint.rules.customizations"?: { rule: string; severity: string }[];
  "markdownlint.config"?: Record<string, boolean>;
  "typescript.enablePromptUseWorkspaceTsdk"?: boolean;
}
