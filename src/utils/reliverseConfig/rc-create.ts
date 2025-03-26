/* ------------------------------------------------------------------
 * Creating or Updating a Config
 * ------------------------------------------------------------------
 */

import { relinka, confirmPrompt } from "@reliverse/prompts";
import { PROJECT_ROOT, cliDomainDocs } from "@reliverse/relidler-sdk";
import { Value } from "@sinclair/typebox/value";
import { execaCommand } from "execa";
import fs from "fs-extra";
import { addDevDependency } from "nypm";
import path from "pathe";

import type { ReliverseConfig } from "~/libs/cfg/cfg-main.js";
import type { DeploymentService } from "~/types.js";

import {
  reliverseConfigSchema,
  UNKNOWN_VALUE,
  cliName,
  DEFAULT_DOMAIN,
  RELIVERSE_SCHEMA_DEV,
} from "~/libs/cfg/cfg-main.js";

import { DEFAULT_CONFIG } from "./rc-const.js";
import {
  generateDefaultRulesForProject,
  getDefaultReliverseConfig,
} from "./rc-default.js";
import { getPackageJson, detectFeatures } from "./rc-detect.js";
import { injectSectionComments } from "./rc-inject.js";
import { getReliverseConfigPath } from "./rc-path.js";
import { readReliverseConfig } from "./rc-read.js";
import {
  objectToCodeString,
  atomicWriteFile,
  cleanGitHubUrl,
  getBackupAndTempPaths,
  updateTsConfigInclude,
} from "./rc-utils.js";

/**
 * Writes the given ReliverseConfig to the specified config file (TypeScript or JSONC).
 * Performs an atomic write (using a temp file) and creates a backup of any existing config.
 * In dev mode, automatically builds a relative path to `cfg-main.js`.
 */
export async function writeReliverseConfig(
  configPath: string,
  config: ReliverseConfig,
  isDev: boolean,
  skipInstallPrompt = false,
  customPathToTypes?: string,
): Promise<void> {
  // TypeScript branch
  if (configPath.endsWith(".ts")) {
    const { backupPath, tempPath } = getBackupAndTempPaths(configPath);

    try {
      if (await fs.pathExists(configPath)) {
        await fs.copy(configPath, backupPath);
      }

      // Convert the config object to a TypeScript-friendly string
      const objectLiteral = objectToCodeString(config, 0);
      const objectLiteralWithComments = injectSectionComments(objectLiteral);

      // Build the import path for dev or production
      // - If dev is true, create a relative path to src/libs/cfg/cfg-main.js
      // - Otherwise default to "@reliverse/cli-cfg"
      let importPath: string;
      if (customPathToTypes) {
        importPath = customPathToTypes;
      } else if (isDev) {
        const relativeDir = path.dirname(configPath);
        const absoluteMainJs = path.join(
          PROJECT_ROOT,
          "src",
          "libs",
          "cfg",
          "cfg-main.js",
        );
        const relativeMainJs = path
          .relative(relativeDir, absoluteMainJs)
          .replace(/\\/g, "/");
        importPath = relativeMainJs.startsWith(".")
          ? relativeMainJs
          : `./${relativeMainJs}`;
      } else {
        importPath = "@reliverse/cli-cfg";
      }

      // Produce TypeScript config file content
      const fileContent = `import { defineConfig } from "${importPath}";

export default defineConfig(${objectLiteralWithComments});
`;

      // Atomic file write, plus optional backup restoration on failure
      await atomicWriteFile(configPath, fileContent, backupPath, tempPath);

      // Ensure tsconfig.json includes this config
      await updateTsConfigInclude(path.dirname(configPath));

      // Optionally add devDependency and prompt for install if not dev
      if (!isDev && !skipInstallPrompt) {
        await addDevDependency("@reliverse/cli-cfg", {
          cwd: path.dirname(configPath),
        });
        relinka("success-verbose", "TS config written successfully");

        const shouldRunInstall = await confirmPrompt({
          title: "Run `bun install` now to install '@reliverse/cli-cfg'?",
          defaultValue: true,
        });
        if (shouldRunInstall) {
          await execaCommand("bun install", {
            cwd: path.dirname(configPath),
            stdio: "inherit",
          });
        } else {
          relinka(
            "success",
            "Please run `bun install` later, then use `reliverse cli` again to continue.",
          );
          process.exit(0);
        }
      } else {
        relinka("success-verbose", "TS config written successfully");
      }

      return;
    } catch (error) {
      relinka("error", "Failed to write TS config:", String(error));

      // Attempt to restore from backup if write failed
      if (
        (await fs.pathExists(backupPath)) &&
        !(await fs.pathExists(configPath))
      ) {
        try {
          await fs.copy(backupPath, configPath);
          relinka("warn", "Restored TS config from backup after failed write");
        } catch (restoreError) {
          relinka(
            "error",
            "Failed to restore TS config from backup:",
            String(restoreError),
          );
        }
      }
      if (await fs.pathExists(tempPath)) {
        await fs.remove(tempPath);
      }
      throw error;
    }
  }

  // JSONC branch
  if (!Value.Check(reliverseConfigSchema, config)) {
    const issues = [...Value.Errors(reliverseConfigSchema, config)].map(
      (err) => `Path "${err.path}": ${err.message}`,
    );
    relinka("error", "Invalid config:", issues.join("; "));
    throw new Error(`Invalid config: ${issues.join("; ")}`);
  }

  let fileContent = JSON.stringify(config, null, 2);
  fileContent = injectSectionComments(fileContent);

  const { backupPath, tempPath } = getBackupAndTempPaths(configPath);
  if (await fs.pathExists(configPath)) {
    await fs.copy(configPath, backupPath);
  }
  await atomicWriteFile(configPath, fileContent, backupPath, tempPath);

  relinka("success-verbose", "Config written successfully");
}

/**
 * Reliverse Config Creation (wrapper around config generator and fixer)
 */
export async function createReliverseConfig(
  projectPath: string,
  githubUsername: string,
  isDev: boolean,
  overrides: Partial<ReliverseConfig>,
): Promise<void> {
  const defaultRules = await generateDefaultRulesForProject(projectPath, isDev);
  const effectiveProjectName =
    defaultRules?.projectName ?? path.basename(projectPath);
  let effectiveAuthorName = defaultRules?.projectAuthor ?? UNKNOWN_VALUE;
  const effectiveDomain =
    defaultRules?.projectDomain ??
    (effectiveProjectName === cliName ? cliDomainDocs : DEFAULT_DOMAIN);

  if (effectiveAuthorName === "blefnk" && isDev) {
    effectiveAuthorName = "reliverse";
  }

  await generateReliverseConfig({
    projectName: effectiveProjectName,
    frontendUsername: effectiveAuthorName,
    deployService: "vercel",
    primaryDomain: effectiveDomain,
    projectPath,
    githubUsername,
    isDev,
    overrides,
  });

  relinka(
    "info-verbose",
    defaultRules
      ? "Created config based on detected project settings."
      : "Created initial config. Please review and adjust as needed.",
  );
}

/**
 * Generates a Reliverse config (ReliverseConfig) by merging defaults, existing config, and overrides.
 * Writes the resulting config to disk (TypeScript or JSONC), optionally skipping install prompts in non-dev mode.
 */
export async function generateReliverseConfig({
  projectName,
  frontendUsername,
  deployService,
  primaryDomain,
  projectPath,
  githubUsername,
  enableI18n = false,
  overwrite = false,
  isDev,
  configInfo,
  customOutputPath,
  customFilename,
  skipInstallPrompt = false,
  customPathToTypes,
  overrides,
}: {
  projectName: string;
  frontendUsername: string;
  deployService: DeploymentService;
  primaryDomain: string;
  projectPath: string;
  githubUsername: string;
  enableI18n?: boolean;
  overwrite?: boolean;
  isDev: boolean;
  configInfo?: { configPath: string; isTS: boolean };
  customOutputPath?: string;
  customFilename?: string;
  skipInstallPrompt?: boolean;
  customPathToTypes?: string;
  overrides: Partial<ReliverseConfig>;
}): Promise<void> {
  // Read the project's package.json if available
  const packageJson = await getPackageJson(projectPath);

  // In dev mode, override blefnk with "reliverse" for the frontend username
  if (frontendUsername === "blefnk" && isDev) {
    frontendUsername = "reliverse";
  }

  // Load the default config for this project
  const defaultConfig = await getDefaultReliverseConfig(
    projectPath,
    isDev,
    projectName,
    frontendUsername,
  );

  // Update some base fields in the default config
  defaultConfig.projectName = projectName;
  defaultConfig.projectAuthor = frontendUsername;
  defaultConfig.projectDescription =
    packageJson?.description ??
    defaultConfig.projectDescription ??
    UNKNOWN_VALUE;
  defaultConfig.version = packageJson?.version ?? defaultConfig.version;
  defaultConfig.projectLicense =
    packageJson?.license ?? defaultConfig.projectLicense;

  // Derive a repository URL based on package.json or a fallback
  const projectNameWithoutAt = projectName?.replace("@", "");
  defaultConfig.projectRepository = packageJson?.repository
    ? typeof packageJson.repository === "string"
      ? cleanGitHubUrl(packageJson.repository)
      : cleanGitHubUrl(packageJson.repository.url)
    : githubUsername && projectName
      ? `https://github.com/${projectNameWithoutAt}`
      : DEFAULT_DOMAIN;

  defaultConfig.projectGitService = "github";
  defaultConfig.projectDeployService = deployService;
  defaultConfig.projectDomain = primaryDomain
    ? `https://${primaryDomain.replace(/^https?:\/\//, "")}`
    : projectName
      ? `https://${projectName}.vercel.app`
      : UNKNOWN_VALUE;

  // Detect project features
  defaultConfig.features = await detectFeatures(projectPath, packageJson);
  defaultConfig.features.i18n = enableI18n ?? false;

  // Various behavior defaults
  defaultConfig.multipleRepoCloneMode = false;
  defaultConfig.customUserFocusedRepos = [];
  defaultConfig.customDevsFocusedRepos = [];
  defaultConfig.hideRepoSuggestions = false;
  defaultConfig.customReposOnNewProject = false;
  defaultConfig.envComposerOpenBrowser = true;
  defaultConfig.gitBehavior = "prompt";
  defaultConfig.deployBehavior = "prompt";
  defaultConfig.depsBehavior = "prompt";
  defaultConfig.i18nBehavior = "prompt";
  defaultConfig.scriptsBehavior = "prompt";
  defaultConfig.skipPromptsUseAutoBehavior = false;

  // Code style defaults
  defaultConfig.codeStyle = {
    ...defaultConfig.codeStyle,
    dontRemoveComments: true,
    shouldAddComments: true,
    typeOrInterface: "type",
    importOrRequire: "import",
    quoteMark: "double",
    semicolons: true,
    lineWidth: 80,
    indentStyle: "space",
    indentSize: 2,
    importSymbol: "~",
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    tabWidth: 2,
    jsToTs: false,
    cjsToEsm: false,
    modernize: {
      replaceFs: false,
      replacePath: false,
      replaceHttp: false,
      replaceProcess: false,
      replaceConsole: false,
      replaceEvents: false,
    },
  };

  // Decide where to write the config file
  let effectiveConfigPath: string;
  if (customOutputPath && customFilename) {
    effectiveConfigPath = path.join(customOutputPath, customFilename);
  } else {
    // Use standard logic to figure out TS or JSONC, unless configInfo is already provided
    const configPathInfo =
      configInfo ??
      (await getReliverseConfigPath(projectPath, isDev, skipInstallPrompt));
    effectiveConfigPath = configPathInfo.configPath;
  }

  // If not overwriting, attempt to read any existing config
  let existingContent: ReliverseConfig | null = null;
  if (!overwrite && (await fs.pathExists(effectiveConfigPath))) {
    try {
      existingContent = await readReliverseConfig(effectiveConfigPath, isDev);
    } catch {
      // fallback if reading fails
    }
  }

  // Final merge: default config, existing config, newly derived config, then user overrides
  const effectiveConfig = {
    ...DEFAULT_CONFIG,
    ...existingContent,
    ...defaultConfig,
    ...overrides,
  };

  // If dev mode, attach local dev schema reference
  if (isDev) {
    effectiveConfig.$schema = RELIVERSE_SCHEMA_DEV;
  }

  // Write the final config to disk
  await writeReliverseConfig(
    effectiveConfigPath,
    effectiveConfig,
    isDev,
    skipInstallPrompt,
    customPathToTypes,
  );
}
