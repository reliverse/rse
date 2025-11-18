import { re } from "@reliverse/dler-colors";
import { defineArgs, defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import {
  generateAllPackages,
  generateRootFiles,
  generateRootPackageJson,
  promptMonorepoConfig,
} from "@reliverse/rse-addons";
import {
  add as btsAdd,
  builder as btsBuilder,
  docs as btsDocs,
  init as btsInit,
  sponsors as btsSponsors,
} from "@reliverse/rse-rebts";
import { $ } from "bun";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize a new web/native project or modify existing one",
    examples: [
      "rse init",
      "rse init my-project",
      "rse init --yes",
      "rse init --backend hono --database sqlite --orm drizzle",
      "rse init --frontend next --backend hono --yes",
      "rse init --init-monorepo",
      "rse init --add --addons biome,husky",
      "rse init --sponsors",
      "rse init --docs",
      "rse init --builder",
      "",
      "# Better-T-Stack options:",
      "# --name: Project name",
      "# --yes: Use default configuration",
      "# --backend: Backend framework (hono, express, fastify, elysia, convex, self, none)",
      "# --frontend: Frontend framework(s), comma-separated",
      "# --database: Database type (none, sqlite, postgres, mysql, mongodb)",
      "# --orm: ORM type (drizzle, prisma, mongoose, none)",
      "# --auth: Authentication provider",
      "# --runtime: Runtime (bun, node, workers, none)",
      "# --packageManager: Package manager (npm, pnpm, yarn, bun)",
      "# --install: Install dependencies after creation",
      "",
      "# Better-T-Stack subcommands:",
      "# --add: Add addons or deployment configurations to existing project",
      "# --sponsors: Show Better-T-Stack sponsors",
      "# --docs: Open Better-T-Stack documentation",
      "# --builder: Open the web-based stack builder",
      "",
      "# RSE options:",
      "# --init-monorepo: Initialize RSE monorepo structure (mutually exclusive with Better-T-Stack setup)",
    ],
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "Project name (Better-T-Stack project directory name)",
    },
    yes: {
      type: "boolean",
      description: "Use default configuration",
    },
    yolo: {
      type: "boolean",
      description:
        "(WARNING - NOT RECOMMENDED) Bypass validations and compatibility checks",
    },
    verbose: {
      type: "boolean",
      description: "Show detailed result information",
    },
    database: {
      type: "string",
      description: "Database type (none, sqlite, postgres, mysql, mongodb)",
    },
    orm: {
      type: "string",
      description: "ORM type (drizzle, prisma, mongoose, none)",
    },
    auth: {
      type: "string",
      description: "Authentication provider",
    },
    payments: {
      type: "string",
      description: "Payments provider",
    },
    frontend: {
      type: "string",
      description:
        "Frontend framework(s), comma-separated (tanstack-router, react-router, tanstack-start, next, nuxt, native-bare, native-uniwind, native-unistyles, svelte, solid, none)",
    },
    addons: {
      type: "string",
      description:
        "Addon(s), comma-separated (pwa, tauri, starlight, biome, husky, ruler, turborepo, fumadocs, ultracite)",
    },
    examples: {
      type: "string",
      description: "Example(s), comma-separated",
    },
    git: {
      type: "boolean",
      description: "Initialize git repository",
    },
    packageManager: {
      type: "string",
      description: "Package manager (npm, pnpm, yarn, bun)",
    },
    install: {
      type: "boolean",
      description: "Install dependencies after creation",
    },
    dbSetup: {
      type: "string",
      description: "Database setup method",
    },
    backend: {
      type: "string",
      description:
        "Backend framework (hono, express, fastify, elysia, convex, self, none)",
    },
    runtime: {
      type: "string",
      description: "Runtime environment (bun, node, workers, none)",
    },
    api: {
      type: "string",
      description: "API type",
    },
    webDeploy: {
      type: "string",
      description: "Web deployment target",
    },
    serverDeploy: {
      type: "string",
      description: "Server deployment target",
    },
    directoryConflict: {
      type: "string",
      description: "Directory conflict resolution strategy",
    },
    renderTitle: {
      type: "boolean",
      description: "Render Better-T-Stack title",
    },
    disableAnalytics: {
      type: "boolean",
      description: "Disable analytics",
    },
    manualDb: {
      type: "boolean",
      description:
        "Skip automatic/manual database setup prompt and use manual setup",
    },
    initMonorepo: {
      type: "boolean",
      description:
        "Initialize RSE monorepo structure (mutually exclusive with Better-T-Stack setup)",
    },
    add: {
      type: "boolean",
      description:
        "Add addons or deployment configurations to existing project",
    },
    sponsors: {
      type: "boolean",
      description: "Show Better-T-Stack sponsors",
    },
    docs: {
      type: "boolean",
      description: "Open Better-T-Stack documentation",
    },
    builder: {
      type: "boolean",
      description: "Open the web-based stack builder",
    },
    ci: {
      type: "boolean",
      description: "CI mode - skip interactive prompts",
    },
  }),
  run: async ({ args }) => {
    try {
      // Check if running in Bun
      if (typeof process.versions.bun === "undefined") {
        logger.error("❌ This command requires Bun runtime. Sorry.");
        process.exit(1);
      }

      // CI mode: if --init-monorepo is not specified, proceed with BTS (default)

      // Show interactive menu if no action flags are specified and not in CI mode
      // Check for action flags (flags that determine what action to take)
      const hasAnyActionFlag =
        args.add === true ||
        args.sponsors === true ||
        args.docs === true ||
        args.builder === true ||
        args.initMonorepo === true;

      let selectedAction: "bts" | "monorepo" | null = null;

      // Always show selectPrompt when no action flags are provided (0 flags) and not in CI mode
      if (!hasAnyActionFlag && !args.ci) {
        logger.box(`🤖  Hi, it's nice to meet you!`);
        logger.success(
          `I'm your assistant for creating new web/native/cli projects, integrating new features, and making advanced codebase modifications.`,
        );
        logger.success(
          "I'm constantly evolving, with even more features soon! Let's get started! By the way, my name is Rse, I'm from Reliverse universe.",
        );

        const response = await selectPrompt<"bts" | "monorepo" | "exit">({
          message: "What would you like to do?",
          options: [
            {
              value: "bts",
              label: "Create/modify project using Better-T-Stack",
              hint: "Initialize or modify a Better-T-Stack project",
            },
            {
              value: "monorepo",
              label: "Create/modify monorepo related things",
              hint: "Initialize or modify RSE monorepo structure",
            },
            {
              value: "exit",
              label: "Exit",
              hint: "Exit the command",
            },
          ],
        });

        if (isCancel(response) || response === "exit") {
          logger.info("");
          logger.info("👋 Goodbye!");
          logger.info("");
          return;
        }

        selectedAction = response;
      }

      // Handle subcommands first
      if (args.add) {
        // Add addons/deployment command
        const addOptions: Record<string, unknown> = {};

        if (args.addons) {
          addOptions.addons = args.addons
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a);
        }
        if (args.webDeploy) addOptions.webDeploy = args.webDeploy;
        if (args.serverDeploy) addOptions.serverDeploy = args.serverDeploy;
        if (args.packageManager)
          addOptions.packageManager = args.packageManager;
        if (args.install !== undefined) addOptions.install = args.install;

        logger.info("");
        logger.info("🔧 Adding addons or deployment configurations...");
        logger.info("");
        await btsAdd(addOptions);
        logger.info("");
        logger.success("✅ Add command completed successfully!");
        logger.info("");
        return;
      }

      if (args.sponsors) {
        logger.info("");
        await btsSponsors();
        logger.info("");
        return;
      }

      if (args.docs) {
        logger.info("");
        await btsDocs();
        logger.info("");
        return;
      }

      if (args.builder) {
        logger.info("");
        await btsBuilder();
        logger.info("");
        return;
      }

      // Handle RSE monorepo setup or Better-T-Stack setup (mutually exclusive)
      if (args.initMonorepo || selectedAction === "monorepo") {
        // RSE monorepo setup only
        const config = await promptMonorepoConfig();

        logger.info("");
        logger.info("🔨 Generating monorepo structure...");
        logger.info("");

        await generateRootPackageJson(config);
        await generateRootFiles(config);
        await generateAllPackages(config);

        logger.info("");
        logger.info("📦 Installing dependencies...");
        logger.info("");

        await $`bun install`.cwd(config.rootPath);

        logger.info("");
        logger.success("✅ Monorepo created successfully!");

        logger.info("");
        logger.success(`📁 Location: ${config.rootPath}`);
        logger.info("");
        logger.success("To get started:");
        logger.log(`  cd ${config.rootPath}`);
        logger.log("  bun --filter '*' dev");
        logger.info("");
        // Exit after monorepo setup is complete
        return;
      } else {
        // Better-T-Stack setup (default behavior)
        // Prepare Better-T-Stack options
        const btsOptions: Record<string, unknown> = {};

        if (args.verbose !== undefined) btsOptions.verbose = args.verbose;
        if (args.yes !== undefined) btsOptions.yes = args.yes;
        if (args.yolo !== undefined) btsOptions.yolo = args.yolo;
        if (args.database) btsOptions.database = args.database;
        if (args.orm) btsOptions.orm = args.orm;
        if (args.auth) btsOptions.auth = args.auth;
        if (args.payments) btsOptions.payments = args.payments;
        if (args.frontend) {
          btsOptions.frontend = args.frontend
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f);
        }
        if (args.addons) {
          btsOptions.addons = args.addons
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a);
        }
        if (args.examples) {
          btsOptions.examples = args.examples
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e);
        }
        if (args.git !== undefined) btsOptions.git = args.git;
        if (args.packageManager)
          btsOptions.packageManager = args.packageManager;
        if (args.install !== undefined) btsOptions.install = args.install;
        if (args.dbSetup) btsOptions.dbSetup = args.dbSetup;
        if (args.backend) btsOptions.backend = args.backend;
        if (args.runtime) btsOptions.runtime = args.runtime;
        if (args.api) btsOptions.api = args.api;
        if (args.webDeploy) btsOptions.webDeploy = args.webDeploy;
        if (args.serverDeploy) btsOptions.serverDeploy = args.serverDeploy;
        if (args.directoryConflict)
          btsOptions.directoryConflict = args.directoryConflict;
        if (args.renderTitle !== undefined)
          btsOptions.renderTitle = args.renderTitle;
        if (args.disableAnalytics !== undefined)
          btsOptions.disableAnalytics = args.disableAnalytics;
        if (args.manualDb !== undefined) btsOptions.manualDb = args.manualDb;

        logger.info("");
        logger.info("🚀 Initializing Better-T-Stack project...");
        logger.info("");
        const btsResult = await btsInit(args.name, btsOptions);

        if (!btsResult || !btsResult.success) {
          logger.error("❌ Failed to initialize Better-T-Stack project");
          process.exit(1);
        }

        logger.info("");
        logger.success("✅ Better-T-Stack project initialized successfully!");

        logger.info("");
        if (btsResult.projectDirectory) {
          logger.success(
            `📁 Better-T-Stack project location: ${btsResult.projectDirectory}`,
          );
        }
        logger.info("");
      }
    } catch (error) {
      logger.info("");
      logger.error("❌ Error during initialization:");

      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(String(error));
      }

      process.exit(1);
    }
  },
});
