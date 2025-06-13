import type { RseConfig } from "@reliverse/cfg";

import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

export type {
  RepoFromSchema,
  CategoryFromSchema,
  CloneOrTemplateRepo,
  RepoOption,
} from "./utils/projectRepository.js";
export type { InstanceVercel } from "./utils/instanceVercel.js";
export type { InstanceGithub } from "./utils/instanceGithub.js";
export type { RequiredProjectContent } from "@reliverse/cfg";
export type { DownloadResult } from "./utils/downloading/downloadRepo.js";
export type {
  IterableError,
  DetectedProject,
} from "@reliverse/cfg";
export type { ReliverseMemory } from "./utils/schemaMemory.js";
export type {
  PackageManager,
  DetectionSource,
  PkgManagerInfo,
  DetectOptions,
} from "./utils/dependencies/getUserPkgManager.js";
export type { ScriptStatus } from "./utils/handlers/promptPackageJsonScripts.js";
export type { ReplaceConfig } from "./utils/replacements/reps-impl.js";
export type { Hardcoded, UrlPatterns } from "./utils/replacements/reps-keys.js";
export { handleReplacements } from "./utils/replacements/reps-mod.js";
export type {
  EncryptedDataMemory,
  UserDataMemory,
} from "./utils/schemaMemory.js";
export type { RepoInfo, ReposConfig } from "./utils/schemaTemplate.js";
export type {
  RseConfig,
  ProjectCategory,
  ProjectSubcategory,
  ProjectFramework,
  ProjectArchitecture,
  RelinterConfirm,
} from "@reliverse/cfg";
export type { TemplateUpdateInfo } from "./add/add-local/core/templates.js";
export type { ShowMenuResult } from "./add/add-local/core/types.js";
export type { UploadFile } from "./upload/providers/providers-mod.js";
export type { UploadedUCFile } from "./upload/providers/uploadcare.js";
export type { UploadedFile } from "./upload/providers/uploadthing.js";
export type { VercelTeam } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-team.js";
export type {
  VercelFramework,
  VercelDeploymentConfig,
  DeploymentLogType,
  DeploymentLog,
  EnvVar,
  DeploymentOptions,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-types.js";
export type { GenCfg, GenCfgJsonc } from "./mrse/mrse-impl.js";
export type { ConfigurationOptions } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-config.js";
export type {
  KeyType,
  KnownService,
} from "./init/use-template/cp-modules/compose-env-file/cef-keys.js";
export type { MainMenuChoice } from "./init/use-template/cp-modules/cli-main-modules/cli-menu-items/getMainMenuOptions.js";
export type { LintSuggestion } from "./ai/ai-impl/relinter/relinter.js";
export type {
  UnghRepoResponse,
  RuleRepo,
} from "./add/add-rule/add-rule-types.js";
export type {
  CircularTrigger,
  AiSdkAgent,
  AIAgentOptions,
} from "./ai/ai-impl/ai-types.js";

/**
 * Defines what is returned when selecting or creating a project.
 */
export interface ProjectSelectionResult {
  projectPath: string;
  wasNewlyCreated: boolean;
}

export interface AppParams {
  projectName: string;
  cwd: string;
  isDev: boolean;
  memory: ReliverseMemory;
  config: RseConfig;
  mrse: RseConfig[];
  skipPrompts: boolean;
}

export type ParamsOmitSkipPN = Omit<AppParams, "skipPrompts" | "projectName">;
export type ParamsOmitReli = Omit<AppParams, "mrse">;

/**
 * Minimal object describing essential project info after initialization
 */
export interface ProjectConfigReturn {
  frontendUsername: string;
  projectName: string;
  primaryDomain: string;
}

export interface GitModParams {
  cwd: string;
  isDev: boolean;
  projectPath: string;
  projectName: string;
}

export type Behavior = "prompt" | "autoYes" | "autoNo";

export type DatabasePostgresProvider = "neon" | "railway" | "vercel";

export type DatabaseProvider = "postgres" | "sqlite" | "mysql";

export interface ColumnType {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  unique?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  name: string;
  columns: ColumnType[];
}

export interface SubOption {
  label: string;
  value: string;
  providers?: DatabasePostgresProvider[];
}

export interface IntegrationOption {
  label: string;
  value: string;
  subOptions?: SubOption[];
}

export type IntegrationCategory =
  | "database"
  | "payments"
  | "auth"
  | "email"
  | "styling"
  | "testing"
  | "i18n";

export type IntegrationOptions = Record<string, IntegrationOption[]>;

export type DeploymentService =
  | "vercel"
  | "deno"
  | "netlify"
  | "railway"
  | "none";

export type MonorepoType =
  | "turborepo"
  | "moonrepo"
  | "bun-workspaces"
  | "pnpm-workspaces";

export interface IntegrationConfig {
  name: string;
  dependencies: string[];
  devDependencies?: string[];
  files: { path: string; content: string }[];
  scripts?: Record<string, string>;
  envVars?: Record<string, string>;
  postInstall?: (cwd: string) => Promise<void>;
}

export interface RemovalConfig {
  name: string;
  dependencies: string[];
  devDependencies: string[];
  files: string[];
  directories: string[];
  scripts: string[];
  envVars: string[];
}

export interface NavigationEntry {
  items?: Record<string, NavigationEntry>;
  label?: string;
  link?: string;
}

export interface ShadcnConfig {
  style: string;
  rsc: boolean;
  tsx: boolean;
  tailwind: {
    config: string;
    css: string;
    baseColor: string;
    cssVariables: boolean;
    prefix: string;
  };
  aliases: {
    components: string;
    utils: string;
    ui: string;
    lib: string;
    hooks: string;
  };
  iconLibrary: string;
}

export interface Theme {
  name: string;
  colors: Record<string, string>;
}

export type CamelCase<T extends string> = T extends `${infer U}${infer V}`
  ? `${Uppercase<U>}${V}`
  : T;

export type HyphenatedStringToCamelCase<S extends string> =
  S extends `${infer T}-${infer U}`
    ? `${T}${HyphenatedStringToCamelCase<CamelCase<U>>}`
    : CamelCase<S>;

export type IconName =
  | "billing"
  | "dollarSign"
  | "laptop"
  | "settings"
  | "store"
  | "terminal"
  | "user";

export interface NavItem {
  description?: string;
  disabled?: boolean;
  external?: boolean;
  href: string;
  icon?: IconName;
  label?: string;
  title: string;
}

export type NavItemWithChildren = {
  items: NavItemWithChildren[];
} & NavItem;

export interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
  attributes: Record<string, any>;
}

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
}

export interface ModernReplacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}
