import type { RseConfig } from "@reliverse/cfg";

import { migrateRseConfig } from "@reliverse/cfg";
import { relinka } from "@reliverse/relinka";
import { simpleGit } from "simple-git";

import type { GitModParams } from "~/libs/sdk/sdk-types";
import type { RepoOption } from "~/libs/sdk/utils/projectRepository";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import { cliName } from "~/libs/sdk/constants";
import { getEffectiveDir } from "~/libs/sdk/utils/getEffectiveDir";
import { handleReplacements } from "~/libs/sdk/utils/replacements/reps-mod";

import { handleExistingRepoContent } from "./utils-private-repo";

export async function handleExistingRepo(
  params: GitModParams & {
    memory: ReliverseMemory;
    config: RseConfig;
    githubUsername: string;
    selectedTemplate: RepoOption;
  },
  shouldCommitAndPush: boolean,
  isDev: boolean,
): Promise<boolean> {
  const effectiveDir = getEffectiveDir(params);

  relinka(
    "info",
    `Using existing repo: ${params.githubUsername}/${params.projectName}`,
  );

  const { success: repoSuccess, externalRseConfig } =
    await handleExistingRepoContent(
      params.memory,
      params.githubUsername,
      params.projectName,
      effectiveDir,
    );

  if (!repoSuccess) {
    throw new Error("Failed to handle existing repository content");
  }

  // If we have a rsesonc file, migrate its data
  if (externalRseConfig) {
    await migrateRseConfig(externalRseConfig, effectiveDir, isDev);
  }

  // Run replacements after rsesonc
  // migration (even if migration failed)
  await handleReplacements(
    effectiveDir,
    params.selectedTemplate,
    "",
    {
      ...params.config,
      projectName: params.projectName,
      frontendUsername: params.githubUsername,
      primaryDomain: `${params.projectName}.com`,
    },
    true,
    false,
    false,
  );

  if (shouldCommitAndPush) {
    // Create Octokit instance with GitHub token
    if (!params.memory.githubKey) {
      throw new Error("GitHub token not found");
    }

    // Add and commit all files in the working directory
    const git = simpleGit({ baseDir: effectiveDir });
    await git.add(".");
    await git.commit(`Update by ${cliName}`);

    // Get the latest commit details
    const latestCommit = await git.log({ maxCount: 1 });
    if (!latestCommit.latest) {
      throw new Error("Failed to get latest commit");
    }

    // Push the commit
    try {
      await git.push("origin", "main");
      relinka("success", "Created and pushed new commit with changes");
      return true;
    } catch (error) {
      relinka(
        "error",
        "Failed to push commit:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }
  return true;
}
