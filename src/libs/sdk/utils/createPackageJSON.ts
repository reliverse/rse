import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { definePackageJSON, writePackageJSON } from "pkg-types";

/**
 * Creates a package.json file for a new project using pkg-types
 * @param projectPath Path where the package.json should be created
 * @param projectName Name of the project
 */
export async function createPackageJSON(
  projectPath: string,
  projectName: string,
  isLib: boolean,
): Promise<void> {
  const packageJson = definePackageJSON({
    name: projectName,
    version: "0.1.0",
    description: `${projectName} is built with ❤️ by @rse`,
    type: "module",
    ...(isLib ? {} : { private: true }),
  });
  const filename = "package.json";
  const packageJsonPath = path.join(projectPath, filename);
  await writePackageJSON(packageJsonPath, packageJson);

  // Format the package.json file with proper indentation
  const content = await fs.readFile(packageJsonPath, "utf-8");
  const formatted = JSON.stringify(JSON.parse(content), null, 2);
  await fs.writeFile(packageJsonPath, formatted, "utf-8");

  relinka(
    "verbose",
    `Created ${filename} with ${isLib ? "library" : "application"} configuration`,
  );
}
