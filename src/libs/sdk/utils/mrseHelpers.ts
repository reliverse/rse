import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";

// Check if the directory contains any .jsonc or .ts files (excluding mrse.{ts,jsonc})
export async function hasConfigFiles(projectPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(projectPath);
    return files.some(
      (file) =>
        (file.endsWith(".jsonc") || file.endsWith(".ts")) &&
        !file.includes("mrse."),
    );
  } catch (_err) {
    return false;
  }
}

/**
 * Checks if the given project path is a Mrse project
 * @param projectPath The path to the project to check
 */
export async function isMrseProject(projectPath: string): Promise<boolean> {
  const configPath = path.join(projectPath, ".config");
  const mrseFolderPath = path.join(projectPath, ".config", "mrse");

  // Check for mrse.{ts,jsonc} in .config
  const hasMrseConfig = await Promise.all([
    fs.pathExists(path.join(configPath, "mrse.ts")),
    fs.pathExists(path.join(configPath, "mrse.jsonc")),
  ]).then(([hasTs, hasJsonc]) => hasTs || hasJsonc);

  return (
    hasMrseConfig &&
    (await fs.pathExists(mrseFolderPath)) &&
    (await hasConfigFiles(mrseFolderPath))
  );
}
