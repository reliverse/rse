import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";

import { cliConfigJsonc, cliConfigTs } from "./cfg-consts";

// Define a type that matches the boolean-based structure of requiredContent
export interface RequiredProjectContent {
  fileRseConfig: boolean;
  filePackageJson: boolean;
}

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

  const fileRseConfig =
    (await fs.pathExists(configJSONC)) || (await fs.pathExists(configTS));

  const filePackageJson = await fs.pathExists(
    path.join(projectPath, "package.json"),
  );

  const dirNodeModules = await fs.pathExists(
    path.join(projectPath, "node_modules"),
  );

  const dirGit = await fs.pathExists(path.join(projectPath, ".git"));

  return {
    requiredContent: { fileRseConfig, filePackageJson },
    optionalContent: { dirNodeModules, dirGit },
  };
}
