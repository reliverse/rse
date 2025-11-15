// apps/rse/src/cmds/init/integrations/base.ts

import { logger } from "@reliverse/dler-logger";
import type { Integration, IntegrationContext } from "../types";

export abstract class BaseIntegration implements Integration {
  abstract name: string;
  abstract description: string;
  abstract dependencies: string[];
  abstract devDependencies: string[];

  async validate(_context: IntegrationContext): Promise<boolean> {
    logger.debug(`🔍 Validating ${this.name} integration...`);

    // Check if already installed
    if (await this.isAlreadyInstalled(_context)) {
      logger.warn(
        `⚠️ ${this.name} appears to be already installed. Skipping...`,
      );
      return false;
    }

    return true;
  }

  abstract install(context: IntegrationContext): Promise<void>;
  abstract configure(context: IntegrationContext): Promise<void>;

  async postInstall(_context: IntegrationContext): Promise<void> {
    logger.debug(`🔧 Running post-install for ${this.name}...`);
    // Default implementation - can be overridden
  }

  protected async isAlreadyInstalled(
    context: IntegrationContext,
  ): Promise<boolean> {
    // Default implementation - check if dependencies exist in package.json
    try {
      const packageJsonPath = `${context.targetPath}/package.json`;
      const packageJson = await Bun.file(packageJsonPath).json();

      const allDeps = [...this.dependencies, ...this.devDependencies];
      return allDeps.some(
        (dep) =>
          packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep],
      );
    } catch {
      return false;
    }
  }

  protected async installDependencies(
    context: IntegrationContext,
  ): Promise<void> {
    const { targetPath } = context;

    if (this.dependencies.length > 0) {
      logger.info(`📦 Installing ${this.name} dependencies...`);
      const deps = this.dependencies.join(" ");
      await Bun.$`bun add ${deps}`.cwd(targetPath).quiet();
    }

    if (this.devDependencies.length > 0) {
      logger.info(`📦 Installing ${this.name} dev dependencies...`);
      const devDeps = this.devDependencies.join(" ");
      await Bun.$`bun add -D ${devDeps}`.cwd(targetPath).quiet();
    }
  }
}
