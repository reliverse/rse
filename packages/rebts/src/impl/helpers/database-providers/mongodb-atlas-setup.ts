// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/helpers/database-providers/mongodb-atlas-setup.ts

import { re } from "@reliverse/dler-colors";
import fs from "@reliverse/dler-fs-utils";
import { logger } from "@reliverse/dler-logger";
import path from "@reliverse/dler-pathkit";
import {
  cancel,
  inputPrompt,
  isCancel,
  selectPrompt,
} from "@reliverse/dler-prompt";
import { execa } from "execa";
import type { ProjectConfig } from "../../types";
import { commandExists } from "../../utils/command-exists";
import { exitCancelled } from "../../utils/errors";
import { addEnvVariablesToFile, type EnvVariable } from "../core/env-setup";

type MongoDBConfig = {
  connectionString: string;
};

async function checkAtlasCLI() {
  try {
    const exists = await commandExists("atlas");
    if (exists) {
      logger.info("MongoDB Atlas CLI found");
    } else {
      logger.warn(re.yellow("MongoDB Atlas CLI not found"));
    }
    return exists;
  } catch (_error) {
    logger.error(re.red("Error checking MongoDB Atlas CLI"));
    return false;
  }
}

async function initMongoDBAtlas(serverDir: string) {
  try {
    const hasAtlas = await checkAtlasCLI();

    if (!hasAtlas) {
      logger.error(re.red("MongoDB Atlas CLI not found."));
      logger.info(
        re.yellow(
          "Please install it from: https://www.mongodb.com/docs/atlas/cli/current/install-atlas-cli/",
        ),
      );
      return null;
    }

    logger.info("Running MongoDB Atlas setup...");

    await execa("atlas", ["deployments", "setup"], {
      cwd: serverDir,
      shell: true,
      stdio: "inherit",
    });

    logger.success("MongoDB Atlas deployment ready");

    const connectionString = await inputPrompt({
      message: "Enter your MongoDB connection string:",
      validate(value) {
        if (!value) return "Please enter a connection string";
        if (!value.startsWith("mongodb")) {
          return "URL should start with mongodb:// or mongodb+srv://";
        }
      },
    });

    if (isCancel(connectionString)) {
      cancel("MongoDB setup cancelled");
      return null;
    }

    return {
      connectionString: connectionString as string,
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(re.red(error.message));
    }
    return null;
  }
}

async function writeEnvFile(
  projectDir: string,
  backend: ProjectConfig["backend"],
  config?: MongoDBConfig,
) {
  try {
    const targetApp = backend === "self" ? "apps/web" : "apps/server";
    const envPath = path.join(projectDir, targetApp, ".env");
    const variables: EnvVariable[] = [
      {
        key: "DATABASE_URL",
        value: config?.connectionString ?? "mongodb://localhost:27017/mydb",
        condition: true,
      },
    ];
    await addEnvVariablesToFile(envPath, variables);
  } catch (_error) {
    logger.error("Failed to update environment configuration");
  }
}

function displayManualSetupInstructions() {
  logger.info(`
${re.green("MongoDB Atlas Manual Setup Instructions:")}

1. Install Atlas CLI:
   ${re.blue(
     "https://www.mongodb.com/docs/atlas/cli/stable/install-atlas-cli/",
   )}

2. Run the following command and follow the prompts:
   ${re.blue("atlas deployments setup")}

3. Get your connection string from the Atlas dashboard:
   Format: ${re.dim(
     "mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME",
   )}

4. Add the connection string to your .env file:
   ${re.dim('DATABASE_URL="your_connection_string"')}
`);
}

export async function setupMongoDBAtlas(
  config: ProjectConfig,
  cliInput?: { manualDb?: boolean },
) {
  const { projectDir, backend } = config;
  const manualDb = cliInput?.manualDb ?? false;

  const serverDir = path.join(projectDir, "packages/db");
  try {
    await fs.ensureDir(serverDir);

    if (manualDb) {
      logger.info("MongoDB Atlas manual setup selected");
      await writeEnvFile(projectDir, backend);
      displayManualSetupInstructions();
      return;
    }

    const mode = await selectPrompt({
      message: "MongoDB Atlas setup: choose mode",
      options: [
        {
          label: "Automatic",
          value: "auto",
          hint: "Automated setup with provider CLI, sets .env",
        },
        {
          label: "Manual",
          value: "manual",
          hint: "Manual setup, add env vars yourself",
        },
      ],
    });

    if (isCancel(mode)) return exitCancelled("Operation cancelled");

    if (mode === "manual") {
      logger.info("MongoDB Atlas manual setup selected");
      await writeEnvFile(projectDir, backend);
      displayManualSetupInstructions();
      return;
    }

    const config = await initMongoDBAtlas(serverDir);

    if (config) {
      await writeEnvFile(projectDir, backend, config);
      logger.success(
        re.green(
          "MongoDB Atlas setup complete! Connection saved to .env file.",
        ),
      );
    } else {
      logger.warn(re.yellow("Falling back to local MongoDB configuration"));
      await writeEnvFile(projectDir, backend);
      displayManualSetupInstructions();
    }
  } catch (error) {
    logger.error(
      re.red(
        `Error during MongoDB Atlas setup: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );

    try {
      await writeEnvFile(projectDir, backend);
      displayManualSetupInstructions();
    } catch {}
  }
}
