import { logger } from "@reliverse/dler-logger";
import { getIntegration } from "./integrations/registry";
import type {
  IntegrationContext,
  IntegrationTarget,
  TempDirectory,
} from "./types";
import { createTempDirectory } from "./utils/temp";

interface IntegrationResult {
  name: string;
  success: boolean;
  error?: string;
}

export const runIntegrationForTarget = async (
  integrationName: string,
  target: IntegrationTarget,
  monorepoRoot: string,
  isMonorepo: boolean,
  verbose: boolean,
  tempDir: TempDirectory,
): Promise<IntegrationResult> => {
  try {
    logger.info(
      `\n🔧 Processing ${integrationName} integration for ${target.isRoot ? "root" : target.packageName}...`,
    );

    const integration = getIntegration(integrationName);
    if (!integration) {
      return {
        name: integrationName,
        success: false,
        error: "Integration not found",
      };
    }

    // Create integration context
    const integrationContext: IntegrationContext = {
      targetPath: target.targetPath,
      isMonorepo,
      monorepoRoot: isMonorepo ? monorepoRoot : undefined,
      packageName: target.packageName,
      verbose,
      tempDir,
    };

    // Validate integration
    const isValid = await integration.validate(integrationContext);
    if (!isValid) {
      return {
        name: integrationName,
        success: true,
        error: "Already installed, skipped",
      };
    }

    // Install integration
    await integration.install(integrationContext);

    // Configure integration
    await integration.configure(integrationContext);

    // Run post-install hooks
    await integration.postInstall(integrationContext);

    logger.success(
      `✅ ${integrationName} integration completed for ${target.isRoot ? "root" : target.packageName}`,
    );

    return { name: integrationName, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `❌ ${integrationName} integration failed for ${target.isRoot ? "root" : target.packageName}: ${errorMessage}`,
    );
    return { name: integrationName, success: false, error: errorMessage };
  }
};

export const runIntegrations = async (
  targets: IntegrationTarget[],
  monorepoRoot: string,
  isMonorepo: boolean,
  verbose: boolean,
): Promise<IntegrationResult[]> => {
  const results: IntegrationResult[] = [];
  const tempDir = await createTempDirectory();

  try {
    // Group targets by integration name for better logging
    const targetsByIntegration = new Map<string, IntegrationTarget[]>();
    for (const target of targets) {
      const existing = targetsByIntegration.get(target.integrationName) || [];
      existing.push(target);
      targetsByIntegration.set(target.integrationName, existing);
    }

    // Run integrations for each target
    for (const target of targets) {
      const result = await runIntegrationForTarget(
        target.integrationName,
        target,
        monorepoRoot,
        isMonorepo,
        verbose,
        tempDir,
      );
      results.push(result);
    }

    // Install dependencies for each unique target path
    const uniqueTargetPaths = new Set(targets.map((t) => t.targetPath));
    for (const targetPath of uniqueTargetPaths) {
      logger.info(`📦 Installing dependencies for ${targetPath}...`);
      await Bun.$`bun install`.cwd(targetPath).quiet();
    }

    return results;
  } finally {
    // Clean up temp directory
    await tempDir.cleanup();
  }
};
