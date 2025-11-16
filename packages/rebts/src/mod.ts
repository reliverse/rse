import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import {
  addAddonsHandler,
  createProjectHandler,
} from "./impl/helpers/core/command-handlers";
import type {
  AddInput,
  Addons,
  API,
  Backend,
  BetterTStackConfig,
  CreateInput,
  Database,
  DatabaseSetup,
  DirectoryConflict,
  Examples,
  Frontend,
  InitResult,
  ORM,
  PackageManager,
  ProjectConfig,
  Runtime,
  ServerDeploy,
  WebDeploy,
} from "./impl/types";
import { handleError } from "./impl/utils/errors";
import { openUrl } from "./impl/utils/open-url";
import { renderTitle } from "./impl/utils/render-title";
import { displaySponsors, fetchSponsors } from "./impl/utils/sponsors";

/**
 * Initialize a new Better-T-Stack project
 *
 * @example CLI usage:
 * ```bash
 * npx create-better-t-stack my-app --yes
 * ```
 *
 * @example Programmatic usage (always returns structured data):
 * ```typescript
 *  *
 * const result = await init("my-app", {
 *   yes: true,
 *   frontend: ["tanstack-router"],
 *   backend: "hono",
 *   database: "sqlite",
 *   orm: "drizzle",
 *   auth: "better-auth",
 *   addons: ["biome", "turborepo"],
 *   packageManager: "bun",
 *   install: false,
 *   directoryConflict: "increment", // auto-handle conflicts
 *   disableAnalytics: true, // disable analytics
 * });
 *
 * if (result.success) {
 *   console.log(`Project created at: ${result.projectDirectory}`);
 *   console.log(`Reproducible command: ${result.reproducibleCommand}`);
 *   console.log(`Time taken: ${result.elapsedTimeMs}ms`);
 * }
 * ```
 */
export async function init(projectName?: string, options?: CreateInput) {
  const opts = (options ?? {}) as CreateInput;
  const combinedInput = {
    projectName,
    ...opts,
  };
  const result = await createProjectHandler(combinedInput);
  return result as InitResult;
}

export async function add(options?: AddInput) {
  await addAddonsHandler(options ?? {});
}

export async function sponsors() {
  try {
    renderTitle();
    logger.info(re.magenta("Better-T-Stack Sponsors"));
    const sponsors = await fetchSponsors();
    displaySponsors(sponsors);
  } catch (error) {
    handleError(error, "Failed to display sponsors");
  }
}

export async function docs() {
  const DOCS_URL = "https://better-t-stack.dev/docs";
  try {
    await openUrl(DOCS_URL);
    logger.success(re.blue("Opened docs in your default browser."));
  } catch {
    logger.log(`Please visit ${DOCS_URL}`);
  }
}

export async function builder() {
  const BUILDER_URL = "https://better-t-stack.dev/new";
  try {
    await openUrl(BUILDER_URL);
    logger.success(re.blue("Opened builder in your default browser."));
  } catch {
    logger.log(`Please visit ${BUILDER_URL}`);
  }
}

export type {
  Database,
  ORM,
  Backend,
  Runtime,
  Frontend,
  Addons,
  Examples,
  PackageManager,
  DatabaseSetup,
  API,
  WebDeploy,
  ServerDeploy,
  DirectoryConflict,
  CreateInput,
  AddInput,
  ProjectConfig,
  BetterTStackConfig,
  InitResult,
};
