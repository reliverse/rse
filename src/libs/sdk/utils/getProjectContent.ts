import fs from "fs-extra";
import path from "pathe";

import { cliConfigJsonc, cliConfigTs } from "~/libs/cfg/cfg-main.js";

// Define a type that matches the boolean-based structure of requiredContent
export type RequiredProjectContent = {
  fileReliverse: boolean;
  filePackageJson: boolean;
};

/**
 * Gets information about the project content, separating required and optional elements.
 */
export async function getProjectContent(projectPath: string): Promise<{
  requiredContent: RequiredProjectContent;
  optionalContent: {
    dirNodeModules: boolean;
    dirGit: boolean;
  };
}> {
  const configJSONC = path.join(projectPath, cliConfigJsonc);
  const configTS = path.join(projectPath, cliConfigTs);

  const fileReliverse =
    (await fs.pathExists(configJSONC)) || (await fs.pathExists(configTS));

  const filePackageJson = await fs.pathExists(
    path.join(projectPath, "package.json"),
  );

  const dirNodeModules = await fs.pathExists(
    path.join(projectPath, "node_modules"),
  );

  const dirGit = await fs.pathExists(path.join(projectPath, ".git"));

  return {
    requiredContent: { fileReliverse, filePackageJson },
    optionalContent: { dirNodeModules, dirGit },
  };
}
