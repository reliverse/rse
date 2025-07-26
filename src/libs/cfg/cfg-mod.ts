// AUTO-GENERATED AGGREGATOR START (via `dler agg`)
export { getBiomeConfig } from "./cfg-impl/cfg-biome.js";
export { injectSectionComments } from "./cfg-impl/cfg-comments.js";
export {
  PROJECT_ROOT,
  rseName,
  tsconfigJson,
  cliConfigJsonc,
  cliConfigJsoncTmp,
  cliConfigJsoncBak,
  cliConfigTs,
  cliConfigTsTmp,
  cliConfigTsBak,
  rseOrg,
  rseOrgBase,
  cliDomainRoot,
  cliDomainDocs,
  cliDomainEnv,
  homeDir,
  cliHomeDir,
  cliHomeTmp,
  cliHomeRepos,
  memoryPath,
  cliJsrPath,
  useLocalhost,
  DEFAULT_CLI_USERNAME,
  endTitle,
  UNKNOWN_VALUE,
  DEFAULT_DOMAIN,
  RSE_SCHEMA_DEV,
  RSE_SCHEMA_URL,
  FALLBACK_ENV_EXAMPLE_URL,
  CONFIG_CATEGORIES,
} from "./cfg-impl/cfg-consts.js";
export type { RequiredProjectContent } from "./cfg-impl/cfg-content.js";
export { getProjectContent } from "./cfg-impl/cfg-content.js";
export { getOrCreateRseConfig } from "./cfg-impl/cfg-core.js";
export {
  writeRseConfig,
  createRseConfig,
  generateRseConfig,
} from "./cfg-impl/cfg-create.js";
export {
  getDefaultRseConfig,
  generateDefaultRulesForProject,
} from "./cfg-impl/cfg-def-utils.js";
export {
  DEFAULT_CONFIG_RSE,
  PROJECT_FRAMEWORK_FILES,
} from "./cfg-impl/cfg-default.js";
export { defineConfig } from "./cfg-impl/cfg-define.js";
export {
  detectProjectFramework,
  getPackageJson,
  getPackageJsonSafe,
  detectProject,
  detectProjectsWithRseConfig,
  detectFeatures,
} from "./cfg-impl/cfg-detect.js";
export {
  generateConfigFiles,
  generateProjectConfigs,
} from "./cfg-impl/cfg-gen-cfg.js";
export { migrateRseConfig } from "./cfg-impl/cfg-migrate.js";
export { getRseConfigPath } from "./cfg-impl/cfg-path.js";
export { askRseConfigType } from "./cfg-impl/cfg-prompts.js";
export { readRseTs, readRseConfig } from "./cfg-impl/cfg-read.js";
export {
  repairAndParseJSON,
  fixLineByLine,
  parseAndFixRseConfig,
} from "./cfg-impl/cfg-repair.js";
export {
  rseSchema,
  generateJsonSchema,
  generateSchemaFile,
} from "./cfg-impl/cfg-schema.js";
export type {
  RseConfig,
  ProjectCategory,
  ProjectSubcategory,
  ProjectFramework,
  ProjectArchitecture,
  RelinterConfirm,
  IterableError,
  DetectedProject,
  BiomeConfigResult,
  BaseConfig,
  BiomeConfig,
  DeploymentService,
  VSCodeSettings,
} from "./cfg-impl/cfg-types.js";
export { loadrse, watchrse } from "./cfg-impl/cfg-unstable.js";
export { updateRseConfig, mergeWithDefaults } from "./cfg-impl/cfg-update.js";
export {
  cleanGitHubUrl,
  objectToCodeString,
  updateTsConfigInclude,
  getBackupAndTempPaths,
  atomicWriteFile,
} from "./cfg-impl/cfg-utils.js";
// AUTO-GENERATED AGGREGATOR END
