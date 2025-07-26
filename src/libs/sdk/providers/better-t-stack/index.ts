import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import {
  cancel,
  createCli,
  defineCommand,
  intro,
  isCancel,
  outro,
  selectPrompt,
  spinner,
} from "@reliverse/rempts";
import { trpcServer, zod as z } from "@reliverse/rempts";
import path from "node:path";

import type { CreateInput, ProjectConfig } from "./types";

import { DEFAULT_CONFIG } from "./constants";
import { createProject } from "./helpers/project-generation/create-project";
import { gatherConfig } from "./prompts/config-prompts";
import { getProjectName } from "./prompts/project-name";
import {
  APISchema,
  AddonsSchema,
  BackendSchema,
  DatabaseSchema,
  DatabaseSetupSchema,
  ExamplesSchema,
  FrontendSchema,
  ORMSchema,
  PackageManagerSchema,
  ProjectNameSchema,
  RuntimeSchema,
} from "./types";
import { trackProjectCreation } from "./utils/analytics";
import { displayConfig } from "./utils/display-config";
import { generateReproducibleCommand } from "./utils/generate-reproducible-command";
import { getLatestCLIVersion } from "./utils/get-latest-cli-version";
import { openUrl } from "./utils/open-url";
import { renderTitle } from "./utils/render-title";
import { displaySponsors, fetchSponsors } from "./utils/sponsors";
import { getProvidedFlags, processAndValidateFlags } from "./validation";

const t = trpcServer.initTRPC.create();

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

    relinka(
      "warn",
      `Directory "${re.yellow(
        currentPathInput,
      )}" already exists and is not empty.`,
    );

    const action = await selectPrompt<
      "overwrite" | "merge" | "rename" | "cancel"
    >({
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
    const s = spinner();
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

async function createProjectHandler(
  input: CreateInput & { projectName?: string },
) {
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
    const flagConfig = processAndValidateFlags(
      cliInput,
      providedFlags,
      finalBaseName,
    );
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

      relinka(
        "info",
        re.yellow("Using default/flag options (config prompts skipped):"),
      );
      relinka("log", displayConfig(config));
      relinka("log", "");
    } else {
      config = await gatherConfig(
        flagConfig,
        finalBaseName,
        finalResolvedPath,
        finalPathInput,
      );
    }

    await createProject(config);

    const reproducibleCommand = generateReproducibleCommand(config);
    relinka(
      "success",
      re.blue(
        `You can reproduce this setup with the following command:\n${reproducibleCommand}`,
      ),
    );

    await trackProjectCreation(config);

    const elapsedTimeInSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    outro(
      re.magenta(
        `Project created successfully in ${re.bold(
          elapsedTimeInSeconds,
        )} seconds!`,
      ),
    );
  } catch (error) {
    relinka("error", String(error));
    process.exit(1);
  }
}

const router = t.router({
  init: t.procedure
    .meta({
      description: "Create a new Better-T Stack project",
      default: true,
    })
    .input(
      z.tuple([
        ProjectNameSchema.optional(),
        z
          .object({
            yes: z
              .boolean()
              .optional()
              .default(false)
              .describe("Use default configuration"),
            database: DatabaseSchema.optional(),
            orm: ORMSchema.optional(),
            auth: z.boolean().optional(),
            frontend: z.array(FrontendSchema).optional(),
            addons: z.array(AddonsSchema).optional(),
            examples: z.array(ExamplesSchema).optional(),
            git: z.boolean().optional(),
            packageManager: PackageManagerSchema.optional(),
            install: z.boolean().optional(),
            dbSetup: DatabaseSetupSchema.optional(),
            backend: BackendSchema.optional(),
            runtime: RuntimeSchema.optional(),
            api: APISchema.optional(),
          })
          .optional()
          .default({ yes: false }),
      ]),
    )
    .mutation(async ({ input }) => {
      const [projectName, options] = input;
      const combinedInput = {
        projectName,
        ...options,
      };
      await createProjectHandler(combinedInput);
    }),
  sponsors: t.procedure
    .meta({ description: "Show Better-T Stack sponsors" })
    .mutation(async () => {
      try {
        renderTitle();
        intro(re.magenta("Better-T Stack Sponsors"));
        const sponsors = await fetchSponsors();
        displaySponsors(sponsors);
      } catch (error) {
        relinka("error", String(error));
        process.exit(1);
      }
    }),
  docs: t.procedure
    .meta({ description: "Open Better-T Stack documentation" })
    .mutation(async () => {
      const DOCS_URL = "https://better-t-stack.dev/docs";
      try {
        await openUrl(DOCS_URL);
        relinka("success", re.blue("Opened docs in your default browser."));
      } catch {
        relinka("log", `Please visit ${DOCS_URL}`);
      }
    }),
  builder: t.procedure
    .meta({ description: "Open the web-based stack builder" })
    .mutation(async () => {
      const BUILDER_URL = "https://better-t-stack.dev/new";
      try {
        await openUrl(BUILDER_URL);
        relinka("success", re.blue("Opened builder in your default browser."));
      } catch {
        relinka("log", `Please visit ${BUILDER_URL}`);
      }
    }),
});

export default defineCommand({
  router,
  run() {
    console.log("hello, world");
  },
});

// createCli({
//   router,
//   name: "create-better-t-stack",
//   version: getLatestCLIVersion(),
// }).run();

createCli({
  name: "create-better-t-stack",
  version: getLatestCLIVersion(),
  rpc: {
    router,
  },
}).run();
