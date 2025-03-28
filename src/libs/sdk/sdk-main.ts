export { useORPC } from "./add/add-local/api/orpc.js";
export { useTRPC } from "./add/add-local/api/trpc.js";
export { useBetterAuth } from "./add/add-local/auth/better-auth.js";
export { useClerkAuth } from "./add/add-local/auth/clerk-auth.js";
export { useNextAuth } from "./add/add-local/auth/next-auth.js";
export { checkMissingDependencies } from "./add/add-local/core/deps.js";
export { getPromptContent } from "./add/add-local/core/prompts.js";
export type { TemplateUpdateInfo } from "./add/add-local/core/templates.js";
export {
  checkForTemplateUpdate,
  updateProjectTemplateDate,
  getTemplateUpdateInfo,
} from "./add/add-local/core/templates.js";
export type { ShowMenuResult } from "./add/add-local/core/types.js";
export { useDrizzleORM } from "./add/add-local/db/drizzle.js";
export { usePrismaORM } from "./add/add-local/db/prisma.js";
export { useUploadthing } from "./add/add-local/files/uploadthing.js";
export { useReactHookForm } from "./add/add-local/form/react-hook-form.js";
export { useTanstackForm } from "./add/add-local/form/tanstack-form.js";
export { usePlasmoBrowserExtFramework } from "./add/add-local/fws/browser/plasmo.js";
export { useWxtBrowserExtFramework } from "./add/add-local/fws/browser/wxt.js";
export { useEslintConfig } from "./add/add-local/fws/configs/eslint-config.js";
export { useLynxNativeFramework } from "./add/add-local/fws/native/lynx.js";
export { useReactNativeFramework } from "./add/add-local/fws/native/react.js";
export { useEslintPlugin } from "./add/add-local/fws/plugins/eslint-plugin.js";
export { useVscodeExtFramework } from "./add/add-local/fws/vscode/vscode-ext.js";
export { useAstroWebFramework } from "./add/add-local/fws/web/astro.js";
export { useJStackWebFramework } from "./add/add-local/fws/web/jstack.js";
export { useNextJsWebFramework } from "./add/add-local/fws/web/next.js";
export { useTanstackStartWebFramework } from "./add/add-local/fws/web/start.js";
export { useViteWebFramework } from "./add/add-local/fws/web/vite.js";
export { useGtLibs } from "./add/add-local/i18n/gt-libs.js";
export { useLanguine } from "./add/add-local/i18n/languine.js";
export { useNextIntl } from "./add/add-local/i18n/next-intl.js";
export { useVercelAI } from "./add/add-local/llm/vercel.js";
export { useResendMail } from "./add/add-local/mail/resend.js";
export { usePolarPayments } from "./add/add-local/pay/polar.js";
export { useStripePayments } from "./add/add-local/pay/stripe.js";
export { useBiomeTool } from "./add/add-local/tool/biome.js";
export { useEslintTool } from "./add/add-local/tool/eslint.js";
export { useOxlintTool } from "./add/add-local/tool/oxlint.js";
export { use21stUI } from "./add/add-local/ui/21st.js";
export { useShadcnUI } from "./add/add-local/ui/shadcn.js";
export { useTailwindCSS } from "./add/add-local/ui/tailwind.js";
export {
  CACHE_ROOT_DIR,
  DEFAULT_BRANCH,
  RULE_FILE_EXTENSION,
  getRepoCacheDir,
  RULES_REPOS,
} from "./add/add-rule/add-rule-const.js";
export {
  handleDirectRules,
  showRulesMenu,
} from "./add/add-rule/add-rule-impl.js";
export type {
  UnghRepoResponse,
  RuleRepo,
} from "./add/add-rule/add-rule-types.js";
export {
  convertTsToMdc,
  hasCursorRulesDir,
  hasInstalledRules,
  checkRulesRepoUpdate,
  checkForRuleUpdates,
  downloadRules,
  installRules,
  handleRuleUpdates,
} from "./add/add-rule/add-rule-utils.js";
export { ensureOpenAIKey } from "./ai/ai-impl/ai-auth.js";
export { aiChat } from "./ai/ai-impl/ai-chat.js";
export {
  AGENT_NAMES,
  MODEL,
  MODEL_NAME,
  MAX_TOKENS,
  CIRCULAR_TRIGGERS,
  EXIT_KEYWORDS,
} from "./ai/ai-impl/ai-const.js";
export { aiAgenticTool } from "./ai/ai-impl/ai-tools.js";
export type {
  CircularTrigger,
  AiSdkAgent,
  AIAgentOptions,
} from "./ai/ai-impl/ai-types.js";
export { aiCodeCommand } from "./ai/ai-impl/code/code-mod.js";
export { handleMcpCommand } from "./ai/ai-impl/mcp/mcp-mod.js";
export type { LintSuggestion } from "./ai/ai-impl/relinter/relinter.js";
export {
  agentRelinter,
  collectLintableFiles,
  gatherLintSuggestions,
  writeSuggestionsToFile,
} from "./ai/ai-impl/relinter/relinter.js";
export { aiMenu } from "./ai/ai-menu.js";
export { useFirecrawl } from "./clone/firecrawl/firecrawl-mod.js";
export { runCodemods } from "./cmod/cmod-impl.js";
export { envArgImpl } from "./env/env-impl.js";
export { showManualBuilderMenu } from "./init/init-impl.js";
export type { ProjectSelectionResult } from "./init/init-utils.js";
export {
  handleProjectSelectionMenu,
  initMinimalReliverseProject,
  showExistingProjectMenu,
  determineProjectStatus,
  handleNewProject,
  handleExistingProject,
  handleIncompleteProject,
} from "./init/init-utils.js";
export { COLUMN_TYPES } from "./init/manual-mode/deprecated/drizzle/manageDrizzleConstants.js";
export { manageDrizzleSchema } from "./init/manual-mode/deprecated/drizzle/manageDrizzleSchema.js";
export {
  detectDatabaseProvider,
  setupDrizzle,
  getAvailableTables,
  addNewTable,
  removeTable,
  renameTable,
  manageRelations,
  generateTableFile,
  updateSchemaIndex,
  appendTableToSchema,
  removeFromSchemaIndex,
  removeTableFromSchema,
  renameTableInSchema,
  updateTableNameInIndex,
  addColumnToTable,
} from "./init/manual-mode/deprecated/drizzle/manageDrizzleSchemaUtils.js";
export { handleIntegrations } from "./init/manual-mode/deprecated/editor-impl.js";
export { handleOpenProjectMenu } from "./init/manual-mode/deprecated/editor-menu.js";
export {
  updatePackageJson,
  installIntegration,
  removeIntegration,
} from "./init/manual-mode/deprecated/editor-mod.js";
export { INTEGRATION_CONFIGS } from "./init/manual-mode/deprecated/feature-add.js";
export { REMOVAL_CONFIGS } from "./init/manual-mode/deprecated/feature-rm.js";
export { manageShadcn } from "./init/manual-mode/deprecated/shadcn/shadcn-mod.js";
export {
  initializeProjectConfig,
  setupI18nSupport,
  shouldInstallDependencies,
  handleDependencies,
  showSuccessAndNextSteps,
  handleNextActions,
  handleNextAction,
} from "./init/use-template/cp-impl.js";
export {
  createWebProject,
  createMobileProject,
} from "./init/use-template/cp-mod.js";
export type { MainMenuChoice } from "./init/use-template/cp-modules/cli-main-modules/cli-menu-items/getMainMenuOptions.js";
export { getMainMenuOptions } from "./init/use-template/cp-modules/cli-main-modules/cli-menu-items/getMainMenuOptions.js";
export { showCloneProjectMenu } from "./init/use-template/cp-modules/cli-main-modules/cli-menu-items/showCloneProjectMenu.js";
export { showAnykeyPrompt } from "./init/use-template/cp-modules/cli-main-modules/modules/showAnykeyPrompt.js";
export {
  showStartPrompt,
  showEndPrompt,
} from "./init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt.js";
export {
  ensureExampleExists,
  ensureEnvExists,
  getMissingKeys,
  copyFromExisting,
  getEnvPath,
  fetchEnvExampleContent,
  promptAndSetMissingValues,
  saveLastEnvFilePath,
  getLastEnvFilePath,
} from "./init/use-template/cp-modules/compose-env-file/cef-impl.js";
export type {
  KeyType,
  KnownService,
} from "./init/use-template/cp-modules/compose-env-file/cef-keys.js";
export {
  keyTypeSchema,
  keyVarsSchema,
  defaultValues,
  serviceKeySchema,
  dashboards,
  knownServiceSchema,
  KNOWN_SERVICES,
} from "./init/use-template/cp-modules/compose-env-file/cef-keys.js";
export { composeEnvFile } from "./init/use-template/cp-modules/compose-env-file/cef-mod.js";
export {
  selectDeploymentService,
  deployProject,
} from "./init/use-template/cp-modules/git-deploy-prompts/deploy.js";
export {
  handleGitInit,
  configureGithubRepo,
  promptGitDeploy,
} from "./init/use-template/cp-modules/git-deploy-prompts/gdp-mod.js";
export {
  initializeGitRepo,
  initGitDir,
  createCommit,
  handleGithubRepo,
  pushGitCommits,
} from "./init/use-template/cp-modules/git-deploy-prompts/git.js";
export {
  checkGithubRepoOwnership,
  createGithubRepo,
} from "./init/use-template/cp-modules/git-deploy-prompts/github.js";
export { isSpecialDomain } from "./init/use-template/cp-modules/git-deploy-prompts/helpers/domainHelpers.js";
export { ensureDbInitialized } from "./init/use-template/cp-modules/git-deploy-prompts/helpers/handlePkgJsonScripts.js";
export { promptForDomain } from "./init/use-template/cp-modules/git-deploy-prompts/helpers/promptForDomain.js";
export {
  isDirHasGit,
  setupGitRemote,
} from "./init/use-template/cp-modules/git-deploy-prompts/utils-git-github.js";
export {
  archiveExistingRepoContent,
  handleExistingRepoContent,
} from "./init/use-template/cp-modules/git-deploy-prompts/utils-private-repo.js";
export { handleExistingRepo } from "./init/use-template/cp-modules/git-deploy-prompts/utils-repo-exists.js";
export {
  getVercelEnvVar,
  withRateLimit,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-api.js";
export { checkVercelDeployment } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-check.js";
export type { ConfigurationOptions } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-config.js";
export {
  updateProject,
  enableAnalytics,
  configureBranchProtection,
  configureResources,
  getConfigurationOptions,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-config.js";
export {
  createVercelProject,
  prepareVercelProjectCreation,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-create.js";
export {
  monitorDeployment,
  createInitialVercelDeployment,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-deploy.js";
export { getVercelProjectDomain } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-domain.js";
export { addEnvVarsToVercelProject } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-env.js";
export type { VercelTeam } from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-team.js";
export {
  getPrimaryVercelTeam,
  verifyTeam,
  getVercelTeams,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-team.js";
export type {
  VercelFramework,
  VercelDeploymentConfig,
  DeploymentLogType,
  DeploymentLog,
  EnvVar,
  DeploymentOptions,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-types.js";
export {
  saveVercelToken,
  getEnvVars,
  detectFramework,
  verifyDomain,
} from "./init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-utils.js";
export { auth, authCheck } from "./login/login-impl.js";
export { deleteMemory } from "./logout/logout-impl.js";
export type { GenCfg, GenCfgJsonc } from "./multireli/multireli-impl.js";
export {
  multireliVerbose,
  logVerbose,
  getEnvCacheDir,
  ensureEnvCacheDir,
  getEnvCachePath,
  downloadFileFromGitHub,
} from "./multireli/multireli-impl.js";
export {
  rmTestsRuntime,
  downloadRepoOption,
  showDevToolsMenu,
} from "./toolbox/toolbox-impl.js";
export { openVercelTools } from "./toolbox/toolbox-vercel.js";
export type {
  AppParams,
  ParamsOmitSkipPN,
  ParamsOmitReli,
  ProjectConfigReturn,
  GitModParams,
} from "./types/types-mod.js";
export type { UploadFile } from "./upload/providers/providers-mod.js";
export {
  uploadToProvider,
  getMimeType,
  readFilesFromPaths,
} from "./upload/providers/providers-mod.js";
export type { UploadedUCFile } from "./upload/providers/uploadcare.js";
export { uploadToUploadcare } from "./upload/providers/uploadcare.js";
export type { UploadedFile } from "./upload/providers/uploadthing.js";
export { uploadToUploadthing } from "./upload/providers/uploadthing.js";
export { formatBytes } from "./upload/upload-utils.js";
export { recommended, experimental } from "./utils/badgeNotifiers.js";
export { convertCjsToEsm } from "./utils/codemods/convertCjsToEsm.js";
export {
  convertPrismaToDrizzle,
  convertDatabaseProvider,
} from "./utils/codemods/convertDatabase.js";
export { convertTypeDefinitions } from "./utils/codemods/convertDefinitions.js";
export { convertImportStyle } from "./utils/codemods/convertImportStyle.js";
export { convertJsToTs } from "./utils/codemods/convertJsToTs.js";
export { convertQuoteStyle } from "./utils/codemods/convertQuoteStyle.js";
export { convertRuntime } from "./utils/codemods/convertRuntime.js";
export { convertToMonorepo } from "./utils/codemods/convertToMonorepo.js";
export { removeComments } from "./utils/codemods/removeComments.js";
export { getUnusedDependencies } from "./utils/codemods/removeUnusedDeps.js";
export { replaceImportSymbol } from "./utils/codemods/replaceImportSymbol.js";
export { replaceWithModern } from "./utils/codemods/replaceWithModern.js";
export { getBiomeConfig } from "./utils/configHandler.js";
export { createPackageJSON } from "./utils/createPackageJSON.js";
export { createTSConfig } from "./utils/createTSConfig.js";
export { decide } from "./utils/decideHelper.js";
export type {
  PackageManager,
  DetectionSource,
  PkgManagerInfo,
  DetectOptions,
} from "./utils/dependencies/getUserPkgManager.js";
export {
  getUserPkgManager,
  getAllPkgManagers,
} from "./utils/dependencies/getUserPkgManager.js";

// TODO: make relidler don't detect `export` when it is in `` (template literal)
// export { setupI18nFiles, generateMetadata, generateStaticParams, languages, defaultLanguage, languageNames } from "./utils/downloading/downloadI18nFiles.js";

export { setupI18nFiles } from "./utils/downloading/downloadI18nFiles.js";
export type { DownloadResult } from "./utils/downloading/downloadRepo.js";
export { downloadRepo } from "./utils/downloading/downloadRepo.js";
export { handleDownload } from "./utils/downloading/handleDownload.js";
export {
  setHiddenAttributeOnWindows,
  isHidden,
  isDirectoryEmpty,
  rmEnsureDir,
} from "./utils/filesysHelpers.js";
export { getEffectiveDir } from "./utils/getEffectiveDir.js";
export { pm } from "./utils/getPackageManager.js";
export type { RequiredProjectContent } from "./utils/getProjectContent.js";
export { getProjectContent } from "./utils/getProjectContent.js";
export { uninstallDependencies } from "./utils/handlers/dependencies.js";
export {
  generateConfigFiles,
  generateProjectConfigs,
} from "./utils/handlers/generateProjectConfigs.js";
export { handleCleanup } from "./utils/handlers/handleCleanup.js";
export { handleCodemods } from "./utils/handlers/handleCodemods.js";
export { isVSCodeInstalled } from "./utils/handlers/isAppInstalled.js";
export type { ScriptStatus } from "./utils/handlers/promptPackageJsonScripts.js";
export { promptPackageJsonScripts } from "./utils/handlers/promptPackageJsonScripts.js";
export {
  readShadcnConfig,
  getInstalledComponents,
  installComponent,
  updateComponent,
  removeComponent,
  applyTheme,
  AVAILABLE_COMPONENTS,
  selectSidebarPrompt,
  selectChartsPrompt,
} from "./utils/handlers/shadcn.js";
export { hasOnlyReliverseConfig } from "./utils/hasOnlyReliverse.js";
export type { InstanceGithub } from "./utils/instanceGithub.js";
export {
  OctokitWithRest,
  octokitUserAgent,
  ensureGithubToken,
  initGithubSDK,
} from "./utils/instanceGithub.js";
export type { InstanceVercel } from "./utils/instanceVercel.js";
export { askVercelToken, initVercelSDK } from "./utils/instanceVercel.js";
export { getMaxHeightSize, sleep } from "./utils/microHelpers.js";
export {
  hasConfigFiles,
  isMultireliProject,
} from "./utils/multireliHelpers.js";
export { downloadJsrDist } from "./utils/native-cli/nc-impl.js";
export { showNativeCliMenu } from "./utils/native-cli/nc-mod.js";
export { checkScriptExists } from "./utils/pkgJsonHelpers.js";
export type {
  RepoFromSchema,
  CategoryFromSchema,
  CloneOrTemplateRepo,
  RepoOption,
} from "./utils/projectRepository.js";
export {
  REPO_TEMPLATES,
  getRepoInfo,
  saveRepoToDevice,
  TEMP_FULLSTACK_WEBSITE_TEMPLATE_OPTIONS,
  TEMP_SEPARATED_WEBSITE_TEMPLATE_OPTIONS,
  TEMP_VSCODE_TEMPLATE_OPTIONS,
  TEMP_BROWSER_TEMPLATE_OPTIONS,
} from "./utils/projectRepository.js";
export { askAppOrLib } from "./utils/prompts/askAppOrLib.js";
export { askInstallDeps } from "./utils/prompts/askInstallDeps.js";
export { askOpenInIDE } from "./utils/prompts/askOpenInIDE.js";
export { askProjectName } from "./utils/prompts/askProjectName.js";
export { askReliverseConfigType } from "./utils/prompts/askReliverseConfigType.js";
export { askUsernameFrontend } from "./utils/prompts/askUsernameFrontend.js";
export { askUsernameGithub } from "./utils/prompts/askUsernameGithub.js";
export { shouldInitGit } from "./utils/prompts/shouldInitGit.js";
export {
  DEFAULT_CONFIG,
  PROJECT_FRAMEWORK_FILES,
} from "./utils/reliverseConfig/rc-const.js";
export {
  writeReliverseConfig,
  createReliverseConfig,
  generateReliverseConfig,
} from "./utils/reliverseConfig/rc-create.js";
export {
  getDefaultReliverseConfig,
  generateDefaultRulesForProject,
} from "./utils/reliverseConfig/rc-default.js";
export {
  detectProjectFramework,
  getPackageJson,
  getPackageJsonSafe,
  detectProject,
  detectProjectsWithReliverse,
  detectFeatures,
} from "./utils/reliverseConfig/rc-detect.js";
export { injectSectionComments } from "./utils/reliverseConfig/rc-inject.js";
export { migrateReliverseConfig } from "./utils/reliverseConfig/rc-migrate.js";
export { getReliverseConfig } from "./utils/reliverseConfig/rc-mod.js";
export { getReliverseConfigPath } from "./utils/reliverseConfig/rc-path.js";
export {
  readReliverseConfigTs,
  readReliverseConfig,
} from "./utils/reliverseConfig/rc-read.js";
export {
  repairAndParseJSON,
  fixLineByLine,
  parseAndFixReliverseConfig,
} from "./utils/reliverseConfig/rc-repair.js";
export type {
  IterableError,
  DetectedProject,
} from "./utils/reliverseConfig/rc-types.js";
export {
  loadReliverseConfig,
  watchReliverseConfig,
} from "./utils/reliverseConfig/rc-unstable.js";
export {
  updateReliverseConfig,
  mergeWithDefaults,
} from "./utils/reliverseConfig/rc-update.js";
export {
  cleanGitHubUrl,
  objectToCodeString,
  updateTsConfigInclude,
  getBackupAndTempPaths,
  atomicWriteFile,
} from "./utils/reliverseConfig/rc-utils.js";
export {
  getReliverseMemory,
  updateReliverseMemory,
} from "./utils/reliverseMemory.js";
export type { ReplaceConfig } from "./utils/replacements/reps-impl.js";
export {
  extractRepoInfo,
  replaceStringsInFiles,
} from "./utils/replacements/reps-impl.js";
export type { Hardcoded, UrlPatterns } from "./utils/replacements/reps-keys.js";
export {
  hardcodedSchema,
  urlPatternsSchema,
  HardcodedStrings,
  CommonPatterns,
} from "./utils/replacements/reps-keys.js";
export { handleReplacements } from "./utils/replacements/reps-mod.js";
export type {
  ReliverseMemory,
  EncryptedDataMemory,
  UserDataMemory,
} from "./utils/schemaMemory.js";
export { memorySchema } from "./utils/schemaMemory.js";
export type { RepoInfo, ReposConfig } from "./utils/schemaTemplate.js";
export {
  repoInfoSchema,
  reposSchema,
  DEFAULT_REPOS_CONFIG,
  generateReposJsonSchema,
  shouldRegenerateSchema,
} from "./utils/schemaTemplate.js";
export {
  handleError,
  cd,
  pwd,
  rm,
  getCurrentWorkingDirectory,
} from "./utils/terminalHelpers.js";
export { setupDevModeIfNeeded } from "./utils/testsRuntime.js";
export { findTsconfigUp } from "./utils/tsconfigHelpers.js";
