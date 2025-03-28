import type { GetProjectsResponseBody } from "@vercel/sdk/models/getprojectsop.js";

import {
  multiselectPrompt,
  selectPrompt,
  confirmPrompt,
} from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import { projectsDeleteProject } from "@vercel/sdk/funcs/projectsDeleteProject.js";
import { projectsGetProjects } from "@vercel/sdk/funcs/projectsGetProjects.js";

import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { withRateLimit } from "~/libs/sdk/init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-api.js";
import { getPrimaryVercelTeam } from "~/libs/sdk/init/use-template/cp-modules/git-deploy-prompts/vercel/vercel-team.js";
import {
  initVercelSDK,
  type InstanceVercel,
} from "~/libs/sdk/utils/instanceVercel.js";
import { getMaxHeightSize, sleep } from "~/libs/sdk/utils/microHelpers.js";

/**
 * Initializes Vercel tools and routes the selected option.
 * @param memory - Memory object used for Vercel SDK initialization.
 */
export async function openVercelTools(memory: ReliverseMemory) {
  // Initialize Vercel SDK.
  const result = await initVercelSDK(memory, true);
  if (!result) {
    throw new Error(
      "Failed to initialize Vercel SDK. Please notify the @reliverse/cli developers if the problem persists.",
    );
  }
  const [token, vercel] = result;

  // Prompt the user to select a Vercel tool.
  const choice = await selectPrompt({
    title: "Vercel Tools",
    options: [{ label: "Delete projects", value: "delete-projects" }],
  });

  // Determine the project limit based on terminal height.
  const maxItems = getMaxHeightSize().toString();

  if (choice === "delete-projects") {
    await deleteVercelProjects(vercel, memory, maxItems, token);
  }
}

/**
 * Retrieves the Vercel projects.
 * @param vercelInstance - Instance of the Vercel SDK.
 * @param maxItems - Maximum number of projects to retrieve.
 * @param team - Optional team details.
 * @returns A promise resolving to the list of projects.
 */
async function getVercelProjects(
  vercelInstance: InstanceVercel,
  maxItems: string,
  team?: { id: string; slug: string },
): Promise<GetProjectsResponseBody["projects"]> {
  const res = await withRateLimit(async () => {
    return await projectsGetProjects(vercelInstance, {
      teamId: team?.id,
      slug: team?.slug,
      limit: maxItems,
    });
  });

  if (!res.ok) {
    throw res.error;
  }

  return res.value.projects;
}

/**
 * Deletes selected Vercel projects.
 * @param vercelInstance - Instance of the Vercel SDK.
 * @param memory - Memory object for team retrieval.
 * @param maxItems - Maximum number of projects to retrieve (as a string).
 * @param token - Vercel token.
 */
async function deleteVercelProjects(
  vercelInstance: InstanceVercel,
  memory: ReliverseMemory,
  maxItems: string,
  token: string,
) {
  if (!token) {
    throw new Error("No Vercel token provided");
  }

  // Get the primary team details.
  const team = await getPrimaryVercelTeam(vercelInstance, memory);
  const allProjects = await getVercelProjects(vercelInstance, maxItems, team);

  // Define projects that should not be deleted.
  const protectedNames = [
    "relivator",
    "reliverse",
    "relidocs",
    "versator",
    "bleverse",
    "mfpiano",
    "blefnk",
  ];

  // Filter out the protected projects.
  const projects = allProjects.filter(
    (p) => !protectedNames.includes(p.name.toLowerCase()),
  );

  // Map project IDs to names.
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  const info = `If you do not see some projects, restart the CLI with a higher terminal height (current: ${maxItems})`;
  const excludedProjectsInfo =
    protectedNames.length > 0
      ? `${info}\nIntentionally excluded projects: ${protectedNames.join(", ")}`
      : info;

  // Prompt the user to select projects to delete.
  const projectsToDelete = await multiselectPrompt({
    title: "Delete Vercel projects (ctrl+c to exit)",
    content: excludedProjectsInfo,
    options: projects.map((project, index) => ({
      label: `${index + 1}. ${project.name}`,
      value: project.id,
    })),
  });

  if (projectsToDelete.length === 0) {
    relinka("info", "No projects selected for deletion.");
    return;
  }

  // Confirm deletion with the user.
  const selectedNames = projectsToDelete
    .map((id) => projectNames.get(id) ?? id)
    .join(", ");
  const confirmed = await confirmPrompt({
    title: "Are you sure you want to delete these projects?",
    content: selectedNames,
    defaultValue: false,
  });

  if (!confirmed) {
    relinka("info", "Operation cancelled.");
    return;
  }

  // Delete each selected project.
  for (const projectId of projectsToDelete) {
    const projectName = projectNames.get(projectId) ?? projectId;
    try {
      relinka("info-verbose", `Deleting project ${projectName}...`);
      const res = await withRateLimit(async () => {
        return await projectsDeleteProject(vercelInstance, {
          idOrName: projectId,
          teamId: team?.id,
          slug: team?.slug,
        });
      });

      if (!res.ok) {
        throw res.error;
      }

      relinka("success", `Successfully deleted project ${projectName}`);
      await sleep(2000);
    } catch (error) {
      relinka(
        "error",
        `Failed to delete project ${projectName}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
