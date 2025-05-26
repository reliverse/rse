import type { RseConfig } from "~/libs/sdk/utils/rseConfig/cfg-types";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

export type {
  RepoFromSchema,
  CategoryFromSchema,
  CloneOrTemplateRepo,
  RepoOption,
} from "./utils/projectRepository.js";
export type { InstanceVercel } from "./utils/instanceVercel.js";
export type { InstanceGithub } from "./utils/instanceGithub.js";
export type { RequiredProjectContent } from "./utils/getProjectContent.js";
export type { DownloadResult } from "./utils/downloading/downloadRepo.js";
export type {
  IterableError,
  DetectedProject,
} from "./utils/rseConfig/rc-types.js";
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
} from "./utils/rseConfig/cfg-types.js";
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
export type { GenCfg, GenCfgJsonc } from "./multireli/multireli-impl.js";
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
export type { ProjectSelectionResult } from "./init/init-utils.js";

export type AppParams = {
  projectName: string;
  cwd: string;
  isDev: boolean;
  memory: ReliverseMemory;
  config: RseConfig;
  multireli: RseConfig[];
  skipPrompts: boolean;
};

export type ParamsOmitSkipPN = Omit<AppParams, "skipPrompts" | "projectName">;
export type ParamsOmitReli = Omit<AppParams, "multireli">;

/**
 * Minimal object describing essential project info after initialization
 */
export type ProjectConfigReturn = {
  frontendUsername: string;
  projectName: string;
  primaryDomain: string;
};

export type GitModParams = {
  cwd: string;
  isDev: boolean;
  projectPath: string;
  projectName: string;
};
