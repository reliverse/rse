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

/**
 * Adds @reliverse/cfg as a devDependency to the nearest package.json in the given cwd.
 */
async function addDevDependency(
  pkgName: string,
  opts: { cwd: string },
): Promise<void> {
  const pkgPath = path.join(opts.cwd, "package.json");
  let pkg: any;
  try {
    // Try to use pkg-types if available
    const { readPackageJSON } = await import("pkg-types");
    pkg = await readPackageJSON(pkgPath);
  } catch {
    // Fallback to fs
    if (await fs.pathExists(pkgPath)) {
      pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    } else {
      pkg = {};
    }
  }
  if (!pkg.devDependencies) pkg.devDependencies = {};
  if (!pkg.devDependencies[pkgName]) {
    pkg.devDependencies[pkgName] = "latest";
    await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    relinka("log", `Added ${pkgName} to devDependencies in ${pkgPath}`);
  } else {
    relinka(
      "log",
      `${pkgName} already present in devDependencies in ${pkgPath}`,
    );
  }
}

import type { DeploymentService } from "./cfg-types";
import type { RseConfig } from "./cfg-types";

import { injectSectionComments } from "./cfg-comments";
import { cliDomainDocs } from "./cfg-consts";
import {
  UNKNOWN_VALUE,
  rseName,
  DEFAULT_DOMAIN,
  RSE_SCHEMA_DEV,
} from "./cfg-consts";
import {
  generateDefaultRulesForProject,
  getDefaultRseConfig,
} from "./cfg-def-utils";
import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import { getPackageJson, detectFeatures } from "./cfg-detect";
import { getRseConfigPath } from "./cfg-path";
import { readRseConfig } from "./cfg-read";
import { rseSchema } from "./cfg-schema";
import {
  objectToCodeString,
  atomicWriteFile,
  cleanGitHubUrl,
  getBackupAndTempPaths,
  updateTsConfigInclude,
} from "./cfg-utils";

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
      // - Otherwise default to "@reliverse/cfg"
      let importPath: string;
      if (customPathToTypes) {
        importPath = customPathToTypes;
      } else if (isDev) {
        importPath = "~/libs/cfg/cfg-impl/cfg-define";
      } else {
        importPath = "@reliverse/rse-cfg";
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
        await addDevDependency("@reliverse/cfg", {
          cwd: path.dirname(configPath),
        });
        relinka("verbose", "TS config written successfully");

        const shouldRunInstall = await confirmPrompt({
          title: "Run `bun install` now to install '@reliverse/cfg'?",
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
    (effectiveProjectName === rseName ? cliDomainDocs : DEFAULT_DOMAIN);

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
    ...DEFAULT_CONFIG_RSE,
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
