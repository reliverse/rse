import path from "node:path";
import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import {
  cancel,
  defineCommand,
  intro,
  isCancel,
  outro,
  selectPrompt,
  spinner,
} from "@reliverse/rempts";
import { DEFAULT_CONFIG } from "./better-t-stack/constants";
import { createProject } from "./better-t-stack/helpers/project-generation/create-project";
import { gatherConfig } from "./better-t-stack/prompts/config-prompts";
import { getProjectName } from "./better-t-stack/prompts/project-name";
import type { CreateInput, ProjectConfig } from "./better-t-stack/types";
import { trackProjectCreation } from "./better-t-stack/utils/analytics";
import { displayConfig } from "./better-t-stack/utils/display-config";
import { generateReproducibleCommand } from "./better-t-stack/utils/generate-reproducible-command";
import { getLatestCLIVersion } from "./better-t-stack/utils/get-latest-cli-version";
import { renderTitle } from "./better-t-stack/utils/render-title";
import { getProvidedFlags, processAndValidateFlags } from "./better-t-stack/validation";

async function handleDirectoryConflict(currentPathInput: string): Promise<{
  finalPathInput: string;
  shouldClearDirectory: boolean;
}> {
  while (true) {
    const resolvedPath = path.resolve(process.cwd(), currentPathInput);
    const dirExists = fs.pathExistsSync(resolvedPath);
    const dirIsNotEmpty = dirExists && fs.readdirSync(resolvedPath).length > 0;

    if (!dirIsNotEmpty) {
      return { finalPathInput: currentPathInput, shouldClearDirectory: false };
    }

    relinka("warn", `Directory "${re.yellow(currentPathInput)}" already exists and is not empty.`);

    const action = await selectPrompt<"overwrite" | "merge" | "rename" | "cancel">({
      title: "What would you like to do?",
      options: [
        {
          value: "overwrite",
          label: "Overwrite",
          hint: "Empty the directory and create the project",
        },
        {
          value: "merge",
          label: "Merge",
          hint: "Create project files inside, potentially overwriting conflicts",
        },
        {
          value: "rename",
          label: "Choose a different name/path",
          hint: "Keep the existing directory and create a new one",
        },
        { value: "cancel", label: "Cancel", hint: "Abort the process" },
      ],
      defaultValue: "rename",
    });

    if (isCancel(action)) {
      cancel(re.red("Operation cancelled."));
      process.exit(0);
    }

    switch (action) {
      case "overwrite":
        return { finalPathInput: currentPathInput, shouldClearDirectory: true };
      case "merge":
        relinka(
          "info",
          `Proceeding into existing directory "${re.yellow(
            currentPathInput,
          )}". Files may be overwritten.`,
        );
        return {
          finalPathInput: currentPathInput,
          shouldClearDirectory: false,
        };
      case "rename": {
        relinka("info", "Please choose a different project name or path.");
        const newPathInput = await getProjectName(undefined);
        return await handleDirectoryConflict(newPathInput);
      }
      case "cancel":
        cancel(re.red("Operation cancelled."));
        process.exit(0);
    }
  }
}

async function setupProjectDirectory(
  finalPathInput: string,
  shouldClearDirectory: boolean,
): Promise<{ finalResolvedPath: string; finalBaseName: string }> {
  let finalResolvedPath: string;
  let finalBaseName: string;

  if (finalPathInput === ".") {
    finalResolvedPath = process.cwd();
    finalBaseName = path.basename(finalResolvedPath);
  } else {
    finalResolvedPath = path.resolve(process.cwd(), finalPathInput);
    finalBaseName = path.basename(finalResolvedPath);
  }

  if (shouldClearDirectory) {
    const s = spinner({
      text: `Clearing directory "${finalResolvedPath}"...`,
    });
    s.start(`Clearing directory "${finalResolvedPath}"...`);
    try {
      await fs.emptyDir(finalResolvedPath);
      s.stop(`Directory "${finalResolvedPath}" cleared.`);
    } catch (error) {
      s.stop(re.red(`Failed to clear directory "${finalResolvedPath}".`));
      relinka("error", String(error));
      process.exit(1);
    }
  } else {
    await fs.ensureDir(finalResolvedPath);
  }

  return { finalResolvedPath, finalBaseName };
}

async function createProjectHandler(input: CreateInput & { projectName?: string }) {
  const startTime = Date.now();

  try {
    renderTitle();
    intro(re.magenta("Creating a new Better-T Stack project"));

    let currentPathInput: string;
    if (input.yes && input.projectName) {
      currentPathInput = input.projectName;
    } else if (input.yes) {
      let defaultName = DEFAULT_CONFIG.relativePath;
      let counter = 1;
      while (
        fs.pathExistsSync(path.resolve(process.cwd(), defaultName)) &&
        fs.readdirSync(path.resolve(process.cwd(), defaultName)).length > 0
      ) {
        defaultName = `${DEFAULT_CONFIG.projectName}-${counter}`;
        counter++;
      }
      currentPathInput = defaultName;
    } else {
      currentPathInput = await getProjectName(input.projectName);
    }

    const { finalPathInput, shouldClearDirectory } =
      await handleDirectoryConflict(currentPathInput);

    const { finalResolvedPath, finalBaseName } = await setupProjectDirectory(
      finalPathInput,
      shouldClearDirectory,
    );

    const cliInput = {
      ...input,
      projectDirectory: input.projectName,
    };

    const providedFlags = getProvidedFlags(cliInput);
    const flagConfig = processAndValidateFlags(cliInput, providedFlags, finalBaseName);
    const { projectName: _projectNameFromFlags, ...otherFlags } = flagConfig;

    if (!input.yes && Object.keys(otherFlags).length > 0) {
      relinka("info", re.yellow("Using these pre-selected options:"));
      relinka("log", displayConfig(otherFlags));
      relinka("log", "");
    }

    let config: ProjectConfig;
    if (input.yes) {
      config = {
        ...DEFAULT_CONFIG,
        ...flagConfig,
        projectName: finalBaseName,
        projectDir: finalResolvedPath,
        relativePath: finalPathInput,
      };

      if (config.backend === "convex") {
        relinka(
          "info",
          "Due to '--backend convex' flag, the following options have been automatically set: auth=false, database=none, orm=none, api=none, runtime=none, dbSetup=none, examples=todo",
        );
      } else if (config.backend === "none") {
        relinka(
          "info",
          "Due to '--backend none', the following options have been automatically set: --auth=false, --database=none, --orm=none, --api=none, --runtime=none, --db-setup=none, --examples=none",
        );
      }

      relinka("info", re.yellow("Using default/flag options (config prompts skipped):"));
      relinka("log", displayConfig(config));
      relinka("log", "");
    } else {
      config = await gatherConfig(flagConfig, finalBaseName, finalResolvedPath, finalPathInput);
    }

    await createProject(config);

    const reproducibleCommand = generateReproducibleCommand(config);
    relinka(
      "success",
      re.blue(`You can reproduce this setup with the following command:\n${reproducibleCommand}`),
    );

    await trackProjectCreation(config);

    const elapsedTimeInSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    outro(re.magenta(`Project created successfully in ${re.bold(elapsedTimeInSeconds)} seconds!`));
  } catch (error) {
    relinka("error", String(error));
    process.exit(1);
  }
}

export default defineCommand({
  meta: {
    name: "create-better-t-stack",
    version: getLatestCLIVersion(),
    description: "Create a new Better-T Stack project",
  },
  args: {
    projectName: {
      type: "string",
      description: "Project name or path",
    },
    yes: {
      type: "boolean",
      description: "Use default configuration",
      default: false,
    },
    database: {
      type: "string",
      description: "Database type",
      allowed: ["none", "sqlite", "postgres", "mysql", "mongodb"],
    },
    orm: {
      type: "string",
      description: "ORM type",
      allowed: ["drizzle", "prisma", "mongoose", "none"],
    },
    auth: {
      type: "boolean",
      description: "Enable authentication",
    },
    frontend: {
      type: "array",
      description: "Frontend frameworks",
      allowed: [
        "tanstack-router",
        "react-router",
        "tanstack-start",
        "next",
        "nuxt",
        "native-nativewind",
        "native-unistyles",
        "svelte",
        "solid",
        "none",
      ],
    },
    addons: {
      type: "array",
      description: "Additional addons",
      allowed: ["pwa", "tauri", "starlight", "biome", "husky", "turborepo", "none"],
    },
    examples: {
      type: "array",
      description: "Example templates",
      allowed: ["todo", "ai", "none"],
    },
    git: {
      type: "boolean",
      description: "Initialize git repository",
    },
    packageManager: {
      type: "string",
      description: "Package manager",
      allowed: ["npm", "pnpm", "bun"],
    },
    install: {
      type: "boolean",
      description: "Install dependencies",
    },
    dbSetup: {
      type: "string",
      description: "Database setup",
      allowed: ["turso", "neon", "prisma-postgres", "mongodb-atlas", "supabase", "none"],
    },
    backend: {
      type: "string",
      description: "Backend framework",
      allowed: ["hono", "express", "fastify", "next", "elysia", "convex", "none"],
    },
    runtime: {
      type: "string",
      description: "Runtime environment",
      allowed: ["bun", "node", "workers", "none"],
    },
    api: {
      type: "string",
      description: "API type",
      allowed: ["trpc", "orpc", "none"],
    },
  },
  async run({ args }) {
    const input: CreateInput & { projectName?: string } = {
      projectName: args.projectName,
      yes: args.yes,
      database: args.database as any,
      orm: args.orm as any,
      auth: args.auth,
      frontend: args.frontend as any,
      addons: args.addons as any,
      examples: args.examples as any,
      git: args.git,
      packageManager: args.packageManager as any,
      install: args.install,
      dbSetup: args.dbSetup as any,
      backend: args.backend as any,
      runtime: args.runtime as any,
      api: args.api as any,
    };
    await createProjectHandler(input);
  },
});
