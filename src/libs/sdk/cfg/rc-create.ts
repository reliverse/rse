/* ------------------------------------------------------------------
 * Creating or Updating a Config
 * ------------------------------------------------------------------
 */

import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { confirmPrompt } from "@reliverse/rempts";
import { Value } from "@sinclair/typebox/value";
import { execaCommand } from "execa";
import { addDevDependency } from "nypm";

import type { DeploymentService } from "~/libs/sdk/sdk-types";

import { cliDomainDocs } from "~/libs/sdk/constants";
import {
  UNKNOWN_VALUE,
  cliName,
  DEFAULT_DOMAIN,
  RSE_SCHEMA_DEV,
} from "~/libs/sdk/constants";

import type { RseConfig } from "./cfg-types";

import { DEFAULT_CONFIG } from "./default";
import {
  generateDefaultRulesForProject,
  getDefaultRseConfig,
} from "./rc-default";
import { getPackageJson, detectFeatures } from "./rc-detect";
import { injectSectionComments } from "./rc-inject";
import { getRseConfigPath } from "./rc-path";
import { readRseConfig } from "./rc-read";
import { rseSchema } from "./rc-schema";
import {
  objectToCodeString,
  atomicWriteFile,
  cleanGitHubUrl,
  getBackupAndTempPaths,
  updateTsConfigInclude,
} from "./rc-utils";

/**
 * Writes the given rseConfig to the specified config file (TypeScript or JSONC).
 * Performs an atomic write (using a temp file) and creates a backup of any existing config.
 * In dev mode, automatically builds a relative path to `sdk-mod.ts`.
 */
export async function writeRseConfig(
  configPath: string,
  config: RseConfig,
  isDev: boolean,
  skipInstallPrompt = false,
  customPathToTypes?: string,
): Promise<void> {
  // If file exists, skip writing and continue
  if (await fs.pathExists(configPath)) {
    relinka(
      "verbose",
      `Config file already exists at ${configPath}, skipping creation`,
    );
    return;
  }

  // Ensure .config directory exists
  const configDir = path.dirname(configPath);
  if (!(await fs.pathExists(configDir))) {
    await fs.mkdir(configDir, { recursive: true });
  }

  // TypeScript branch
  if (configPath.endsWith(".ts")) {
    const { backupPath, tempPath } = getBackupAndTempPaths(configPath);

    try {
      relinka("verbose", `Starting config write process for: ${configPath}`);
      relinka("verbose", `Backup path: ${backupPath}`);
      relinka("verbose", `Temp path: ${tempPath}`);

      // Remove existing backup and temp files if they exist
      for (const file of [backupPath, tempPath]) {
        if (await fs.pathExists(file)) {
          relinka("verbose", `Removing existing file: ${file}`);
          await fs.remove(file);
        }
      }

      if (await fs.pathExists(configPath)) {
        relinka(
          "verbose",
          `Creating backup of existing config at: ${backupPath}`,
        );
        await fs.copy(configPath, backupPath);
      } else {
        relinka(
          "verbose",
          "No existing config found, skipping backup creation",
        );
      }

      // Convert the config object to a TypeScript-friendly string
      const objectLiteral = objectToCodeString(config, 0);
      const objectLiteralWithComments = injectSectionComments(objectLiteral);

      // Build the import path for dev or production
      // - If dev is true, create an alias path to ~/libs/sdk/sdk-mod.js
      // - Otherwise default to "@reliverse/rse"
      let importPath: string;
      if (customPathToTypes) {
        importPath = customPathToTypes;
      } else if (isDev) {
        importPath = "~/mod";
      } else {
        importPath = "@reliverse/rse";
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
        await addDevDependency("@reliverse/rse", {
          cwd: path.dirname(configPath),
        });
        relinka("verbose", "TS config written successfully");

        const shouldRunInstall = await confirmPrompt({
          title: "Run `bun install` now to install '@reliverse/rse'?",
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
            "Please run `bun install` later, then use `rse cli` again to continue.",
          );
          process.exit(0);
        }
      } else {
        relinka("verbose", "TS config written successfully");
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
  if (!Value.Check(rseSchema, config)) {
    const issues = [...Value.Errors(rseSchema, config)].map(
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

  relinka("verbose", "Config written successfully");
}

/**
 * rse Config Creation (wrapper around config generator and fixer)
 */
export async function createRseConfig(
  projectPath: string,
  githubUsername: string,
  isDev: boolean,
  overrides: Partial<RseConfig>,
): Promise<void> {
  const defaultRules = await generateDefaultRulesForProject(projectPath, isDev);
  const effectiveProjectName =
    defaultRules?.projectName ?? path.basename(projectPath);
  let effectiveAuthorName = defaultRules?.projectAuthor ?? UNKNOWN_VALUE;
  const effectiveDomain =
    defaultRules?.projectDomain ??
    (effectiveProjectName === cliName ? cliDomainDocs : DEFAULT_DOMAIN);

  if (effectiveAuthorName === "blefnk" && isDev) {
    effectiveAuthorName = "rse";
  }

  await generateRseConfig({
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
    "verbose",
    defaultRules
      ? "Created config based on detected project settings."
      : "Created initial config. Please review and adjust as needed.",
  );
}

/**
 * Generates a rse config (rseConfig) by merging defaults, existing config, and overrides.
 * Writes the resulting config to disk (TypeScript or JSONC), optionally skipping install prompts in non-dev mode.
 */
export async function generateRseConfig({
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
  overrides: Partial<RseConfig>;
}): Promise<void> {
  // Read the project's package.json if available
  const packageJson = await getPackageJson(projectPath);

  // In dev mode, override blefnk with "rse" for the frontend username
  if (frontendUsername === "blefnk" && isDev) {
    frontendUsername = "rse";
  }

  // Load the default config for this project
  const defaultConfig = await getDefaultRseConfig(
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
      (await getRseConfigPath(projectPath, isDev, skipInstallPrompt));
    effectiveConfigPath = configPathInfo.configPath;
  }

  // If not overwriting, attempt to read any existing config
  let existingContent: RseConfig | null = null;
  if (!overwrite && (await fs.pathExists(effectiveConfigPath))) {
    try {
      existingContent = await readRseConfig(effectiveConfigPath, isDev);
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
    effectiveConfig.$schema = RSE_SCHEMA_DEV;
  }

  // Write the final config to disk
  await writeRseConfig(
    effectiveConfigPath,
    effectiveConfig,
    isDev,
    skipInstallPrompt,
    customPathToTypes,
  );
}
