import { logger } from "@reliverse/dler-logger";
import { askQuestion, multiselectPrompt } from "@reliverse/dler-prompt";
import { DEFAULT_LICENSE, DEFAULT_VERSION, WORKSPACES } from "./config";
import {
  listIntegrations,
  validateIntegrationNames,
} from "./integrations/registry";
import type {
  DetectedPackageInfo,
  IntegrationConfig,
  IntegrationTarget,
  MonorepoConfig,
  PackageInfo,
} from "./types";
import { createFullPath, fileExists, getWorkspaceScope } from "./utils";
import {
  validateMonorepoName,
  validatePackageName,
  validateVersion,
} from "./validators";

export const promptMonorepoConfig = async (): Promise<MonorepoConfig> => {
  logger.info("🚀 Bun Monorepo Bootstrapper\n");

  // Try to read existing root package.json to avoid re-asking known values
  const rootPath = process.cwd();
  const rootPackageJsonPath = createFullPath(rootPath, "package.json");
  const hasRootPackageJson = await fileExists(rootPackageJsonPath);
  const existingRoot: Record<string, unknown> | null = hasRootPackageJson
    ? await Bun.file(rootPackageJsonPath)
        .json()
        .catch(() => null)
    : null;

  let name = "";
  let isValidName = false;

  if (existingRoot && typeof existingRoot.name === "string") {
    name = existingRoot.name;
    isValidName = true;
  } else {
    while (!isValidName) {
      name = await askQuestion("Monorepo name", "my-monorepo");
      const validation = validateMonorepoName(name);

      if (!validation.valid) {
        logger.error(`❌ ${validation.error}`);
        continue;
      }

      isValidName = true;
    }
  }

  const description =
    existingRoot && typeof existingRoot.description === "string"
      ? (existingRoot.description as string)
      : await askQuestion("Description", "A Bun monorepo project");

  let version = "";
  let isValidVersion = false;

  if (existingRoot && typeof existingRoot.version === "string") {
    version = existingRoot.version;
    isValidVersion = true;
  } else {
    while (!isValidVersion) {
      version = await askQuestion("Version", DEFAULT_VERSION);
      const validation = validateVersion(version);

      if (!validation.valid) {
        logger.error(`❌ ${validation.error}`);
        continue;
      }

      isValidVersion = true;
    }
  }

  const author =
    existingRoot && typeof (existingRoot as any).author === "string"
      ? ((existingRoot as any).author as string)
      : await askQuestion("Author", "");
  const license =
    existingRoot && typeof (existingRoot as any).license === "string"
      ? ((existingRoot as any).license as string)
      : await askQuestion("License", DEFAULT_LICENSE);

  const packages = await promptPackages();

  return {
    name,
    description,
    version,
    author,
    license,
    packages,
    rootPath,
  };
};

const promptPackages = async (): Promise<PackageInfo[]> => {
  const packages: PackageInfo[] = [];

  logger.info("\n📦 Package Configuration");
  logger.info(
    "Enter package names (one per prompt). Press Enter with empty input to finish.\n",
  );

  let continueAdding = true;
  let packageIndex = 1;

  while (continueAdding) {
    const packageName = await askQuestion(
      `Package ${packageIndex} name (or press Enter to finish)`,
    );

    if (!packageName) {
      continueAdding = false;
      continue;
    }

    const validation = validatePackageName(packageName);

    if (!validation.valid) {
      logger.error(`❌ ${validation.error}`);
      continue;
    }

    const workspace = await askQuestion(
      "Workspace directory",
      WORKSPACES.PACKAGES,
    );
    const scope = getWorkspaceScope(workspace);

    packages.push({
      name: packageName,
      workspace,
      scope,
    });

    logger.success(`✅ Added ${scope}${packageName}\n`);
    packageIndex++;
  }

  return packages;
};

export const promptIntegrations = async (
  integrationsArg?: string,
): Promise<string[]> => {
  const availableIntegrations = listIntegrations();

  if (integrationsArg) {
    // Parse comma-separated integration names
    const integrationNames = integrationsArg
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (integrationNames.length === 0) {
      logger.warn("No valid integrations specified in --x argument");
      return [];
    }

    // Validate integration names
    const { valid, invalid } = validateIntegrationNames(integrationNames);

    if (invalid.length > 0) {
      logger.error(`❌ Invalid integrations: ${invalid.join(", ")}`);
      logger.info(`Available integrations: ${valid.join(", ")}`);
      return [];
    }

    return valid;
  }

  // Interactive mode - prompt user to select integrations
  logger.info("\n🔌 Integration Selection");
  logger.info("Select integrations to install (optional)\n");

  const options = availableIntegrations.map((name) => ({
    value: name,
    label: name,
  }));

  const multiselectResult = await multiselectPrompt({
    title: "Select integrations to install:",
    options,
    footerText:
      "Space: toggle, Enter: confirm (or press Enter with none selected to skip)",
  });

  if (multiselectResult.error) {
    logger.info("Integration selection cancelled, skipping integrations");
    return [];
  }

  if (multiselectResult.selectedIndices.length === 0) {
    logger.info("No integrations selected, skipping");
    return [];
  }

  const selectedIntegrations = multiselectResult.selectedIndices
    .map((idx) => options[idx]?.value)
    .filter((value): value is string => value !== undefined);

  return selectedIntegrations;
};

export const promptIntegrationTargets = async (
  integrationNames: string[],
  rootPath: string,
  _packages: PackageInfo[],
  detectedPackages: DetectedPackageInfo[],
): Promise<IntegrationConfig> => {
  const targets: IntegrationTarget[] = [];
  const availableTargets: Array<{
    value: string;
    label: string;
    path: string;
    isRoot: boolean;
  }> = [
    {
      value: "root",
      label: "Root (monorepo root)",
      path: rootPath,
      isRoot: true,
    },
  ];

  // Add detected packages as targets
  for (const pkg of detectedPackages) {
    availableTargets.push({
      value: pkg.name,
      label: pkg.name,
      path: pkg.path,
      isRoot: false,
    });
  }

  // If only one target (root), assign all integrations to it
  if (availableTargets.length === 1) {
    for (const integrationName of integrationNames) {
      targets.push({
        integrationName,
        targetPath: rootPath,
        isRoot: true,
      });
    }
    return { integrations: integrationNames, targets };
  }

  // Prompt for each integration
  logger.info("\n🎯 Integration Target Selection");
  logger.info("Select where to install each integration\n");

  for (const integrationName of integrationNames) {
    logger.info(`\n📍 ${integrationName} integration:`);

    const targetOptions = availableTargets.map((target) => ({
      value: target.value,
      label: target.label,
    }));

    const multiselectResult = await multiselectPrompt({
      title: `Select target(s) for ${integrationName}:`,
      options: targetOptions,
      footerText: "Space: toggle, Enter: confirm",
    });

    if (
      multiselectResult.error ||
      multiselectResult.selectedIndices.length === 0
    ) {
      logger.warn(`⚠️ No targets selected for ${integrationName}, skipping`);
      continue;
    }

    const selectedTargets = multiselectResult.selectedIndices
      .map((idx) => availableTargets[idx])
      .filter(
        (target): target is (typeof availableTargets)[0] =>
          target !== undefined,
      );

    for (const target of selectedTargets) {
      targets.push({
        integrationName,
        targetPath: target.path,
        packageName: target.isRoot ? undefined : target.value,
        isRoot: target.isRoot,
      });
    }
  }

  return { integrations: integrationNames, targets };
};
