import { defineArgs, defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import {
  detectCreatedPackages,
  generateAllPackages,
  generateRootFiles,
  generateRootPackageJson,
  promptIntegrations,
  promptIntegrationTargets,
  promptMonorepoConfig,
  runIntegrations,
} from "@reliverse/rse-addons";
import { $ } from "bun";

function getCurrentWorkingDirectory() {
  return process.cwd();
}

export default defineCommand({
  meta: {
    name: "init",
    description:
      "Initialize a new monorepo and optionally install integrations (Next.js, Ultracite)",
    examples: [
      "rse init",
      "rse init --x nextjs",
      "rse init --x ultracite",
      "rse init --x nextjs,ultracite",
      "rse init --x nextjs --verbose",
      "",
      "# Available integrations:",
      "# - nextjs: Next.js React framework with App Router, TypeScript, and Tailwind CSS",
      "# - ultracite: Ultracite preset for Biome (highly opinionated linter and formatter)",
      "",
      "# During initialization, you'll be prompted to select:",
      "# - Which integrations to install (if --x is not provided)",
      "# - Which packages/root should receive each integration",
    ],
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "Current working directory",
      default: getCurrentWorkingDirectory(),
    },
    x: {
      type: "string",
      description:
        "Integration(s) to install (comma-separated, e.g., 'nextjs,ultracite')",
    },
    verbose: {
      type: "boolean",
      description: "Verbose mode for detailed logging (default: false)",
    },
  }),
  run: async ({ args }) => {
    try {
      // Check if running in Bun
      if (typeof process.versions.bun === "undefined") {
        logger.error("❌ This command requires Bun runtime. Sorry.");
        process.exit(1);
      }

      const config = await promptMonorepoConfig();

      logger.info("\n🔨 Generating monorepo structure...\n");

      await generateRootPackageJson(config);
      await generateRootFiles(config);
      await generateAllPackages(config);

      logger.info("\n📦 Installing dependencies...\n");

      await $`bun install`.cwd(config.rootPath);

      logger.success("\n✅ Monorepo created successfully!");

      // Handle integrations
      const integrationNames = await promptIntegrations(args.x);
      if (integrationNames.length > 0) {
        // Detect created packages
        const detectedPackages = await detectCreatedPackages(config.rootPath);

        // Prompt for integration targets
        const integrationConfig = await promptIntegrationTargets(
          integrationNames,
          config.rootPath,
          config.packages,
          detectedPackages,
        );

        if (integrationConfig.targets.length > 0) {
          logger.info("\n🔧 Installing integrations...\n");

          const results = await runIntegrations(
            integrationConfig.targets,
            config.rootPath,
            true, // isMonorepo
            args.verbose || false,
          );

          // Report results
          const successful = results.filter((r) => r.success);
          const failed = results.filter((r) => !r.success);

          if (successful.length > 0) {
            logger.success(
              `\n✅ Successfully integrated: ${successful.map((r) => r.name).join(", ")}`,
            );
          }

          if (failed.length > 0) {
            logger.error(
              `\n❌ Failed integrations: ${failed.map((r) => r.name).join(", ")}`,
            );
            process.exit(1);
          }

          logger.success("\n🎉 All integrations completed successfully!");
        }
      }

      logger.success(`\n📁 Location: ${config.rootPath}`);
      logger.success("\nTo get started:");
      logger.log(`  cd ${config.rootPath}`);
      logger.log("  bun --filter '*' dev\n");
    } catch (error) {
      logger.error("\n❌ Error creating monorepo:");

      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }

      process.exit(1);
    }
  },
});
