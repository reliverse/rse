import { cancel, group } from "@clack/prompts";
import pc from "picocolors";
import type {
  ProjectAddons,
  ProjectApi,
  ProjectBackend,
  ProjectConfig,
  ProjectDBSetup,
  ProjectDatabase,
  ProjectExamples,
  ProjectFrontend,
  ProjectOrm,
  ProjectPackageManager,
  ProjectRuntime,
} from "../types.js";
import { getAddonsChoice } from "./addons.js";
import { getApiChoice } from "./api.js";
import { getAuthChoice } from "./auth.js";
import { getBackendFrameworkChoice } from "./backend-framework.js";
import { getDatabaseChoice } from "./database.js";
import { getDBSetupChoice } from "./db-setup.js";
import { getExamplesChoice } from "./examples.js";
import { getFrontendChoice } from "./frontend-option.js";
import { getGitChoice } from "./git.js";
import { getinstallChoice } from "./install.js";
import { getORMChoice } from "./orm.js";
import { getPackageManagerChoice } from "./package-manager.js";
import { getProjectName } from "./project-name.js";
import { getRuntimeChoice } from "./runtime.js";

type PromptGroupResults = {
  projectName: string;
  frontend: ProjectFrontend[];
  backend: ProjectBackend;
  runtime: ProjectRuntime;
  database: ProjectDatabase;
  orm: ProjectOrm;
  api: ProjectApi;
  auth: boolean;
  addons: ProjectAddons[];
  examples: ProjectExamples[];
  dbSetup: ProjectDBSetup;
  git: boolean;
  packageManager: ProjectPackageManager;
  install: boolean;
};

export async function gatherConfig(
  flags: Partial<ProjectConfig>,
): Promise<ProjectConfig> {
  const result = await group<PromptGroupResults>(
    {
      projectName: async () => {
        return getProjectName(flags.projectName);
      },
      frontend: () => getFrontendChoice(flags.frontend),
      backend: () => getBackendFrameworkChoice(flags.backend),
      runtime: ({ results }) =>
        getRuntimeChoice(flags.runtime, results.backend),
      database: ({ results }) =>
        getDatabaseChoice(flags.database, results.backend),
      orm: ({ results }) =>
        getORMChoice(
          flags.orm,
          results.database !== "none",
          results.database,
          results.backend,
        ),
      api: ({ results }) =>
        getApiChoice(flags.api, results.frontend, results.backend),
      auth: ({ results }) =>
        getAuthChoice(flags.auth, results.database !== "none", results.backend),
      addons: ({ results }) => getAddonsChoice(flags.addons, results.frontend),
      examples: ({ results }) =>
        getExamplesChoice(
          flags.examples,
          results.database,
          results.frontend,
          results.backend,
        ),
      dbSetup: ({ results }) =>
        getDBSetupChoice(
          results.database ?? "none",
          flags.dbSetup,
          results.orm,
          results.backend,
        ),
      git: () => getGitChoice(flags.git),
      packageManager: () => getPackageManagerChoice(flags.packageManager),
      install: () => getinstallChoice(flags.install),
    },
    {
      onCancel: () => {
        cancel(pc.red("Operation cancelled"));
        process.exit(0);
      },
    },
  );

  if (result.backend === "convex") {
    result.runtime = "none";
    result.database = "none";
    result.orm = "none";
    result.api = "none";
    result.auth = false;
    result.dbSetup = "none";
  }

  return {
    projectName: result.projectName,
    frontend: result.frontend,
    backend: result.backend,
    runtime: result.runtime,
    database: result.database,
    orm: result.orm,
    auth: result.auth,
    addons: result.addons,
    examples: result.examples,
    git: result.git,
    packageManager: result.packageManager,
    install: result.install,
    dbSetup: result.dbSetup,
    api: result.api,
  };
}
