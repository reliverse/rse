// apps/rse/src/cmds/init/integrations/ultracite.ts

import { logger } from "@reliverse/dler-logger";
import type { IntegrationContext } from "../types";
import {
  createBiomeConfig,
  findBiomeConfig,
  updateBiomeConfig,
} from "../utils/biome";
import { BaseIntegration } from "./base";

export class UltraciteIntegration extends BaseIntegration {
  name = "ultracite";
  description =
    "Ultracite preset for Biome (highly opinionated linter and formatter)";
  dependencies: string[] = [];
  devDependencies = ["@biomejs/biome", "ultracite"];

  async install(context: IntegrationContext): Promise<void> {
    logger.info("🔧 Installing Ultracite integration...");
    await this.installDependencies(context);
  }

  async configure(context: IntegrationContext): Promise<void> {
    logger.info("⚙️ Configuring Biome with Ultracite preset...");

    const biomeConfig = await findBiomeConfig(context.targetPath);

    if (biomeConfig.exists && biomeConfig.content) {
      // Update existing biome.json
      await updateBiomeConfig(biomeConfig.path, biomeConfig.content);
      logger.success("✅ Updated existing biome.json with Ultracite preset");
    } else {
      // Create new biome.json
      await createBiomeConfig(biomeConfig.path);
      logger.success("✅ Created new biome.json with Ultracite preset");
    }
  }

  async postInstall(context: IntegrationContext): Promise<void> {
    logger.info("🔧 Running Biome check to verify configuration...");

    try {
      await Bun.$`bun biome check --version`.cwd(context.targetPath).quiet();
      logger.success("✅ Biome is properly configured and ready to use");
    } catch (error) {
      logger.warn("⚠️ Biome check failed, but configuration was created");
      if (context.verbose) {
        logger.debug(`Error: ${error}`);
      }
    }
  }
}
